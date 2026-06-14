import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/transaction_model.dart';
import '../../utils/app_theme.dart';
import 'user_dashboard_screen.dart';
import '../shop/shop_selection_screen.dart';

class HomeScreen extends StatefulWidget {
  static const routeName = '/home';
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = false;
  List<TransactionModel> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.currentShop == null) return;

    setState(() => _isLoading = true);
    try {
      final transactions = await ApiService().getTransactions(auth.currentShop!.id);
      setState(() => _transactions = transactions);
    } catch (e) {
      // Handle error
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _addTransaction(String type) async {
    final route = type == 'DUE' ? '/add-due' : '/add-payment';
    final result = await Navigator.pushNamed(context, route);
    if (result == true) {
      _fetchData(); // Refresh if transaction added
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final shop = auth.currentShop;

    final Map<String, double> customerBalances = {};
    double todaysCollection = 0;
    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    final activeCustomerSet = <String>{};

    for (var tx in _transactions) {
      final currentBal = customerBalances[tx.customerName] ?? 0.0;
      if (tx.type == 'DUE') {
        customerBalances[tx.customerName] = currentBal + tx.amount;
      } else if (tx.type == 'PAYMENT') {
        customerBalances[tx.customerName] = currentBal - tx.amount;
        if (tx.date == todayStr) {
          todaysCollection += tx.amount;
        }
      }
      activeCustomerSet.add(tx.customerName);
    }
    
    double totalDue = 0;
    customerBalances.forEach((customer, balance) {
      if (balance > 0) {
        totalDue += balance;
      }
    });
    
    final int activeCustomersCount = activeCustomerSet.length;

    return Scaffold(
      appBar: AppBar(
        title: Text(shop?.name ?? 'Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchData,
          ),
          IconButton(
            icon: const Icon(Icons.exit_to_app, color: Colors.red),
            tooltip: 'Exit Shop',
            onPressed: () {
              Navigator.of(context).pushNamedAndRemoveUntil(
                ShopSelectionScreen.routeName,
                (route) => false,
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: shop == null
          ? const Center(child: Text('Select a shop to view dashboard.'))
          : _isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _fetchData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Main Stats Card (Web Parity)
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppTheme.primary, Color(0xFF4338CA)], // blue to indigo
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(color: AppTheme.primary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'TOTAL OUTSTANDING',
                                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                                    ),
                                  ),
                                  Icon(Icons.trending_up, color: Colors.white.withOpacity(0.5), size: 18),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '৳ ${totalDue.toStringAsFixed(0)}',
                                style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: -1),
                              ),
                              const SizedBox(height: 24),
                              Container(
                                padding: const EdgeInsets.only(top: 16),
                                decoration: BoxDecoration(
                                  border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text("Today's Collection", style: TextStyle(color: Colors.blueAccent, fontSize: 12, fontWeight: FontWeight.w500)),
                                        const SizedBox(height: 4),
                                        Text('+ ৳ ${todaysCollection.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        const Text("Active Customers", style: TextStyle(color: Colors.blueAccent, fontSize: 12, fontWeight: FontWeight.w500)),
                                        const SizedBox(height: 4),
                                        Text('$activeCustomersCount', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                      ],
                                    )
                                  ]
                                )
                              )
                            ]
                          )
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                onTap: () => _addTransaction('DUE'),
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Colors.red.withOpacity(0.1)),
                                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(12)),
                                        child: const Icon(Icons.remove, color: Colors.red, size: 24),
                                      ),
                                      const SizedBox(height: 16),
                                      const Text('Add Due', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      const Text('Given to Customer', style: TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                               child: InkWell(
                                onTap: () => _addTransaction('PAYMENT'),
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Colors.green.withOpacity(0.1)),
                                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(12)),
                                        child: const Icon(Icons.add, color: Colors.green, size: 24),
                                      ),
                                      const SizedBox(height: 16),
                                      const Text('Add Payment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      const Text('Received Cash', style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 4),
                          child: Text('MENU', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2)),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.withOpacity(0.1))),
                                  child: Column(
                                    children: [
                                      CircleAvatar(backgroundColor: Colors.blue[50], child: const Icon(Icons.people, color: Colors.blue, size: 20)),
                                      const SizedBox(height: 8),
                                      const Text('Customers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                    ]
                                  ),
                                ),
                              )
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: InkWell(
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.withOpacity(0.1))),
                                  child: Column(
                                    children: [
                                      CircleAvatar(backgroundColor: Colors.orange[50], child: const Icon(Icons.receipt_long, color: Colors.orange, size: 20)),
                                      const SizedBox(height: 8),
                                      const Text('Due List', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                    ]
                                  ),
                                ),
                              )
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: InkWell(
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.withOpacity(0.1))),
                                  child: Column(
                                    children: [
                                      CircleAvatar(backgroundColor: Colors.purple[50], child: const Icon(Icons.check_circle_outline, color: Colors.purple, size: 20)),
                                      const SizedBox(height: 8),
                                      const Text('Payments', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                    ]
                                  ),
                                ),
                              )
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Recent Activity',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                            ),
                            TextButton(
                              onPressed: () {
                                // Will be handled by the bottom nav tab
                              },
                              child: const Text('View All'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        _transactions.isEmpty
                            ? const Padding(
                                padding: EdgeInsets.all(24.0),
                                child: Text('No recent activity.', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSecondary)),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _transactions.length > 5 ? 5 : _transactions.length, // Show only latest 5
                                separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                                itemBuilder: (ctx, i) {
                                  final tx = _transactions[i];
                                  final isDue = tx.type == 'DUE';
                                  return GlassCard(
                                    onLongPress: () async {
                                      final confirm = await showDialog<bool>(
                                        context: context,
                                        builder: (ctx) => AlertDialog(
                                          title: const Text('Delete Transaction'),
                                          content: const Text('Do you want to delete this recent activity?'),
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
                                        try {
                                          await ApiService().deleteTransaction(tx.id);
                                          _fetchData(); // Refresh list
                                        } catch(e) {
                                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
                                        }
                                      }
                                    },
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: isDue ? Colors.red[50] : Colors.green[50],
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(
                                            isDue ? Icons.arrow_upward : Icons.arrow_downward,
                                            color: isDue ? Colors.red : Colors.green,
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(tx.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                              Text(tx.date, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                            ],
                                          ),
                                        ),
                                        Text(
                                          '৳${tx.amount.toStringAsFixed(0)}',
                                          style: TextStyle(
                                            color: isDue ? Colors.red : Colors.green,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                      ],
                    ),
                  ),
                ),
    );
  }


}
