import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';

class AddDueScreen extends StatefulWidget {
  static const routeName = '/add-due';

  const AddDueScreen({super.key});

  @override
  State<AddDueScreen> createState() => _AddDueScreenState();
}

class _AddDueScreenState extends State<AddDueScreen> {
  final _customerController = TextEditingController();
  final _mobileController = TextEditingController();
  final _amountController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  List<Map<String, dynamic>> _customers = [];

  @override
  void initState() {
    super.initState();
    _fetchCustomers();
  }

  Future<void> _fetchCustomers() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.currentShop == null) return;

    try {
      final transactions = await _apiService.getTransactions(auth.currentShop!.id);
      final customerMap = <String, Map<String, dynamic>>{};
      
      for (var tx in transactions) {
        if (!customerMap.containsKey(tx.customerName)) {
          customerMap[tx.customerName] = {
            'name': tx.customerName,
            'mobile': tx.mobileNumber,
          };
        }
        if (tx.mobileNumber != null) {
          customerMap[tx.customerName]!['mobile'] = tx.mobileNumber;
        }
      }
      
      if (mounted) {
        setState(() {
          _customers = customerMap.values.toList();
        });
      }
    } catch (e) {
      // Ignored for UI simplicity
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null) {
      if (args['customerName'] != null) {
        _customerController.text = args['customerName'];
      }
      if (args['mobile'] != null) {
        _mobileController.text = args['mobile'];
      }
    }
  }

  Future<void> _submit() async {
    if (_customerController.text.isEmpty || _amountController.text.isEmpty) return;
    
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      await _apiService.addTransaction(
        auth.currentShop!.id,
        _customerController.text,
        double.parse(_amountController.text),
        'DUE',
        DateTime.now().toIso8601String().split('T')[0],
        _mobileController.text.isNotEmpty ? _mobileController.text : null,
      );
      if (mounted) {
        Navigator.pop(context, true); // Return true to signal success
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 180.0,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF1F2937), // gray-800 equivalent
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1F2937), Color(0xFF374151)], // gray-800 to gray-700
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Padding(
                  padding: EdgeInsets.only(left: 16.0, bottom: 24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Add New Due', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text('Record a new credit transaction.', style: TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Transform.translate(
              offset: const Offset(0, -20),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildCustomerAutocomplete(),
                    const SizedBox(height: 16),
                    _buildInputField('Mobile (Optional)', Icons.phone_outlined, _mobileController, isPhone: true),
                    const SizedBox(height: 16),
                    _buildInputField('Amount (৳)', Icons.money, _amountController, isNumber: true, isAutofocus: true),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1F2937),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _isLoading ? null : _submit,
                      child: _isLoading 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Save Due', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerAutocomplete() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Customer Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        Autocomplete<Map<String, dynamic>>(
          initialValue: TextEditingValue(text: _customerController.text),
          optionsBuilder: (TextEditingValue textEditingValue) {
            if (textEditingValue.text.isEmpty) {
              return const Iterable<Map<String, dynamic>>.empty();
            }
            return _customers.where((c) => c['name'].toString().toLowerCase().contains(textEditingValue.text.toLowerCase()));
          },
          displayStringForOption: (option) => option['name'],
          onSelected: (Map<String, dynamic> selection) {
            _customerController.text = selection['name'];
            if (selection['mobile'] != null) {
              _mobileController.text = selection['mobile'];
            }
          },
          fieldViewBuilder: (context, fieldTextEditingController, focusNode, onFieldSubmitted) {
            // Sync with our main controller if it changes manually
            fieldTextEditingController.addListener(() {
              _customerController.text = fieldTextEditingController.text;
            });
            // If already set by argument, pre-fill it once
            if (_customerController.text.isNotEmpty && fieldTextEditingController.text.isEmpty) {
               fieldTextEditingController.text = _customerController.text;
            }
            
            return TextField(
              controller: fieldTextEditingController,
              focusNode: focusNode,
              readOnly: _customerController.text.isNotEmpty && ModalRoute.of(context)?.settings.arguments != null,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.person_outline, color: Colors.grey),
                filled: true,
                fillColor: (_customerController.text.isNotEmpty && ModalRoute.of(context)?.settings.arguments != null) ? Colors.grey[100] : Colors.white,
                contentPadding: const EdgeInsets.all(16),
                hintText: 'e.g. Rahim Store',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.blue)),
              ),
            );
          },
          optionsViewBuilder: (context, onSelected, options) {
            return Align(
              alignment: Alignment.topLeft,
              child: Material(
                elevation: 4.0,
                borderRadius: BorderRadius.circular(12),
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxHeight: 200, maxWidth: MediaQuery.of(context).size.width - 32),
                  child: ListView.builder(
                    padding: EdgeInsets.zero,
                    itemCount: options.length,
                    itemBuilder: (BuildContext context, int index) {
                      final Map<String, dynamic> option = options.elementAt(index);
                      return ListTile(
                        title: Text(option['name']),
                        subtitle: option['mobile'] != null ? Text(option['mobile']) : null,
                        onTap: () {
                          onSelected(option);
                        },
                      );
                    },
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildInputField(String label, IconData icon, TextEditingController controller, {bool isNumber = false, bool isPhone = false, bool isReadOnly = false, bool isAutofocus = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : (isPhone ? TextInputType.phone : TextInputType.text),
          readOnly: isReadOnly,
          autofocus: isAutofocus,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: Colors.grey),
            filled: true,
            fillColor: isReadOnly ? Colors.grey[100] : Colors.white,
            contentPadding: const EdgeInsets.all(16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.blue)),
          ),
        ),
      ],
    );
  }
}
