import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/transaction_model.dart';
import '../../utils/app_theme.dart';
import 'customer_detail_screen.dart';

class CustomerListScreen extends StatefulWidget {
  const CustomerListScreen({super.key});

  @override
  State<CustomerListScreen> createState() => _CustomerListScreenState();
}

class CustomerSummary {
  final String name;
  String mobile;
  double netDue; // Positive means user owes money, negative means extra paid
  String lastActivity;
  int transactionCount;

  CustomerSummary({
    required this.name,
    required this.mobile,
    required this.netDue,
    required this.lastActivity,
    required this.transactionCount,
  });
}

class _CustomerListScreenState extends State<CustomerListScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<CustomerSummary> _customers = [];
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
      
      // Group by customerName
      Map<String, CustomerSummary> group = {};
      for (var tx in transactions) {
        if (!group.containsKey(tx.customerName)) {
          group[tx.customerName] = CustomerSummary(
            name: tx.customerName,
            mobile: tx.mobileNumber ?? '',
            netDue: 0,
            lastActivity: tx.date,
            transactionCount: 0,
          );
        }
        
        final summary = group[tx.customerName]!;
        if (tx.type == 'DUE') {
          summary.netDue += tx.amount;
        } else if (tx.type == 'PAYMENT') {
          summary.netDue -= tx.amount;
        }
        
        summary.transactionCount += 1;
        if (tx.mobileNumber != null && tx.mobileNumber!.isNotEmpty) {
          summary.mobile = tx.mobileNumber!;
        }
      }

      var result = group.values.toList();
      result.sort((a, b) => b.netDue.compareTo(a.netDue));

      if (mounted) {
        setState(() {
          _customers = result;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _addTransaction(String type, String customerName, String? mobile) async {
    final route = type == 'DUE' ? '/add-due' : '/add-payment';
    final result = await Navigator.pushNamed(
      context, 
      route, 
      arguments: {'customerName': customerName, 'mobile': mobile}
    );
    if (result == true) {
      _fetchCustomers(); // Refresh
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filter by search query
    final filtered = _customers.where((c) {
      return c.name.toLowerCase().contains(_searchQuery.toLowerCase()) || 
             c.mobile.contains(_searchQuery);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer Dues'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchCustomers),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    decoration: const InputDecoration(
                      labelText: 'Search Customer',
                      prefixIcon: Icon(Icons.search),
                    ),
                    onChanged: (val) {
                      setState(() {
                        _searchQuery = val;
                      });
                    },
                  ),
                ),
                Expanded(
                  child: filtered.isEmpty
                      ? const Center(child: Text('No customers found.'))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (ctx, index) {
                            final c = filtered[index];
                            final isOwing = c.netDue > 0;
                            return GlassCard(
                              onTap: () async {
                                final result = await Navigator.pushNamed(
                                  context, 
                                  CustomerDetailScreen.routeName, 
                                  arguments: c.name,
                                );
                                if (result == true) {
                                  _fetchCustomers(); // Refresh if data changed
                                }
                              },
                              padding: const EdgeInsets.all(0),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: isOwing ? Colors.orange[50] : Colors.green[50],
                                      child: Text(
                                        c.name.substring(0, 1).toUpperCase(),
                                        style: TextStyle(
                                          color: isOwing ? Colors.orange[800] : Colors.green[800],
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(c.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                          Text(
                                            c.mobile.isEmpty ? 'No mobile' : c.mobile,
                                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        const Text('Due', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                        Text(
                                          '৳${c.netDue.abs().toStringAsFixed(0)}',
                                          style: TextStyle(
                                            color: isOwing ? Colors.red : Colors.green,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            InkWell(
                                              onTap: () => _addTransaction('DUE', c.name, c.mobile),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.withOpacity(0.2))),
                                                child: const Text('+ Due', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            InkWell(
                                              onTap: () => _addTransaction('PAYMENT', c.name, c.mobile),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green.withOpacity(0.2))),
                                                child: const Text('+ Pay', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
