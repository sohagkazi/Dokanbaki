import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';

class AddPaymentScreen extends StatefulWidget {
  static const routeName = '/add-payment';

  const AddPaymentScreen({super.key});

  @override
  State<AddPaymentScreen> createState() => _AddPaymentScreenState();
}

class _AddPaymentScreenState extends State<AddPaymentScreen> {
  final _amountController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  List<Map<String, dynamic>> _customers = [];
  List<Map<String, dynamic>> _filteredCustomers = [];
  String? _selectedCustomerName;
  String? _selectedMobile;
  double _currentDue = 0;
  String _searchQuery = '';

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
            'netDue': 0.0,
          };
        }
        final c = customerMap[tx.customerName]!;
        if (tx.type == 'DUE') c['netDue'] += tx.amount;
        else if (tx.type == 'PAYMENT') c['netDue'] -= tx.amount;
        if (tx.mobileNumber != null) c['mobile'] = tx.mobileNumber;
      }
      
      if (mounted) {
        setState(() {
          _customers = customerMap.values.toList();
          _customers.sort((a, b) => a['name'].toString().compareTo(b['name'].toString()));
          _filteredCustomers = _customers;
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
    if (args != null && _selectedCustomerName == null) {
      if (args['customerName'] != null) {
        setState(() {
          _selectedCustomerName = args['customerName'];
          _selectedMobile = args['mobile'];
        });
      }
    }
  }

  void _filterCustomers(String query) {
    setState(() {
      _searchQuery = query;
      _filteredCustomers = _customers.where((c) {
        final name = c['name'].toString().toLowerCase();
        final mobile = c['mobile']?.toString().toLowerCase() ?? '';
        final q = query.toLowerCase();
        return name.contains(q) || mobile.contains(q);
      }).toList();
    });
  }

  Future<void> _submit() async {
    if (_selectedCustomerName == null || _amountController.text.isEmpty) return;
    
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      await _apiService.addTransaction(
        auth.currentShop!.id,
        _selectedCustomerName!,
        double.parse(_amountController.text),
        'PAYMENT',
        DateTime.now().toIso8601String().split('T')[0],
        _selectedMobile,
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
            backgroundColor: const Color(0xFF16A34A), // green-600
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF16A34A), Color(0xFF22C55E)], // green-600 to green-500
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
                      Text('Add Payment', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text('Record a payment from a customer.', style: TextStyle(color: Colors.white70)),
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
                child: _selectedCustomerName == null 
                  ? _buildCustomerSelection() 
                  : _buildPaymentForm(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Select Customer', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 12),
        TextField(
          onChanged: _filterCustomers,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.search, color: Colors.grey),
            hintText: 'Search name or mobile...',
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.all(16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.green)),
          ),
        ),
        const SizedBox(height: 16),
        _filteredCustomers.isEmpty
          ? const Padding(padding: EdgeInsets.all(32), child: Center(child: Text("No customers found.", style: TextStyle(color: Colors.grey))))
          : ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredCustomers.length,
              itemBuilder: (ctx, i) {
                final c = _filteredCustomers[i];
                final double due = c['netDue'];
                return InkWell(
                  onTap: () {
                    setState(() {
                      _selectedCustomerName = c['name'];
                      _selectedMobile = c['mobile'];
                      _currentDue = due;
                    });
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                    decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey.withOpacity(0.1)))),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            if (c['mobile'] != null) Text(c['mobile'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ]
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: due > 0 ? Colors.red[50] : Colors.grey[100], borderRadius: BorderRadius.circular(8)),
                          child: Text(due > 0 ? 'Due: ৳${due.toStringAsFixed(0)}' : 'No Due', style: TextStyle(fontSize: 12, color: due > 0 ? Colors.red : Colors.grey)),
                        )
                      ],
                    ),
                  ),
                );
              },
            )
      ],
    );
  }

  Widget _buildPaymentForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green.withOpacity(0.2))),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CircleAvatar(backgroundColor: Colors.green[50], child: const Icon(Icons.person, color: Colors.green)),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_selectedCustomerName!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(_selectedMobile ?? 'No Phone', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.grey),
                onPressed: () => setState(() => _selectedCustomerName = null),
              )
            ],
          ),
        ),
        const SizedBox(height: 24),
        _buildInputField('Payment Amount (৳)', Icons.money, _amountController, isNumber: true),
        const SizedBox(height: 8),
        Text('Current Due: ৳${_currentDue.toStringAsFixed(0)}', style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 32),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF16A34A),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 4,
          ),
          onPressed: _isLoading ? null : _submit,
          child: _isLoading 
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Confirm Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildInputField(String label, IconData icon, TextEditingController controller, {bool isNumber = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          autofocus: true,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: Colors.grey, size: 28),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.all(20),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Colors.green, width: 2)),
          ),
        ),
      ],
    );
  }
}
