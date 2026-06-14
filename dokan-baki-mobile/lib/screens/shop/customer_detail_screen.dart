import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/transaction_model.dart';
import '../../utils/app_theme.dart';

class CustomerDetailScreen extends StatefulWidget {
  static const routeName = '/customer-detail';
  
  const CustomerDetailScreen({super.key});

  @override
  State<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends State<CustomerDetailScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<TransactionModel> _transactions = [];
  String? _customerName;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_customerName == null) {
      _customerName = ModalRoute.of(context)!.settings.arguments as String;
      _fetchCustomerData();
    }
  }

  Future<void> _fetchCustomerData() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.currentShop == null || _customerName == null) return;

    try {
      final allTransactions = await _apiService.getTransactions(auth.currentShop!.id);
      
      // Filter for this specific customer
      final customerTxs = allTransactions.where((tx) => tx.customerName == _customerName).toList();
      customerTxs.sort((a, b) => b.createdAt.compareTo(a.createdAt)); // Newest first

      if (mounted) {
        setState(() {
          _transactions = customerTxs;
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

  Future<void> _deleteCustomer() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.currentShop == null || _customerName == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Customer', style: TextStyle(color: Colors.red)),
        content: const Text('Are you sure you want to delete this customer and ALL of their transaction history? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete All'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      try {
        await _apiService.deleteCustomerTransactions(auth.currentShop!.id, _customerName!);
        if (mounted) {
          Navigator.of(context).pop(true); // Pop back and pass true to signal refresh needed
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
        }
      }
    }
  }

  Future<void> _deleteTransaction(TransactionModel tx) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Transaction'),
        content: const Text('Are you sure you want to delete this specific record?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      try {
        await _apiService.deleteTransaction(tx.id);
        _fetchCustomerData(); // Refresh history
      } catch (e) {
        if (mounted) {
           setState(() => _isLoading = false);
           ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    double netDue = 0;
    for (var tx in _transactions) {
      if (tx.type == 'DUE') netDue += tx.amount;
      else if (tx.type == 'PAYMENT') netDue -= tx.amount;
    }

    final isOwing = netDue > 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(_customerName ?? 'Customer Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.red),
            onPressed: _deleteCustomer,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: (isOwing ? Colors.orange : Colors.green).withOpacity(0.1),
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      Text(
                        'Net ${isOwing ? 'Due' : 'Advance'}',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '৳${netDue.abs().toStringAsFixed(0)}',
                        style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: isOwing ? Colors.orange[800] : Colors.green[800],
                        ),
                      ),
                    ],
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    'Transaction History',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                ),
                Expanded(
                  child: _transactions.isEmpty
                      ? const Center(child: Text('No transaction history found.'))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _transactions.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, index) {
                            final tx = _transactions[index];
                            final isDue = tx.type == 'DUE';
                            return GlassCard(
                              padding: const EdgeInsets.all(0),
                              child: ListTile(
                                leading: Icon(
                                  isDue ? Icons.arrow_upward : Icons.arrow_downward,
                                  color: isDue ? Colors.orange : Colors.green,
                                ),
                                title: Text(tx.date, style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text(tx.mobileNumber ?? ''),
                                trailing: IconButton(
                                  icon: const Icon(Icons.delete, color: Colors.grey, size: 20),
                                  onPressed: () => _deleteTransaction(tx),
                                ),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
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
