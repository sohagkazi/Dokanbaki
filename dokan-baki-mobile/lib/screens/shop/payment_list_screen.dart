import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/transaction_model.dart';
import '../../utils/app_theme.dart';

class PaymentListScreen extends StatefulWidget {
  const PaymentListScreen({super.key});

  @override
  State<PaymentListScreen> createState() => _PaymentListScreenState();
}

class _PaymentListScreenState extends State<PaymentListScreen> {
  final ApiService _apiService = ApiService();
  List<TransactionModel> _payments = [];
  bool _isLoading = true;
  double _totalCollected = 0;

  @override
  void initState() {
    super.initState();
    _fetchPayments();
  }

  Future<void> _fetchPayments() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.currentShop == null) return;

    try {
      final transactions = await _apiService.getTransactions(auth.currentShop!.id);
      
      final payments = transactions.where((t) => t.type == 'PAYMENT').toList();
      // Sort primarily by Date (desc), secondarily by createdAt (desc)
      payments.sort((a, b) {
         int cmp = b.date.compareTo(a.date);
         if (cmp != 0) return cmp;
         if (b.createdAt != null && a.createdAt != null) {
            return b.createdAt!.compareTo(a.createdAt!);
         }
         return 0;
      });

      double total = 0;
      for (var p in payments) {
        total += p.amount;
      }

      if (mounted) {
        setState(() {
          _payments = payments;
          _totalCollected = total;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

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
            automaticallyImplyLeading: false, // Inside Bottom Nav
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF16A34A), Color(0xFF22C55E)], // green-600 to green-500
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 20.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('Payment List', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                                SizedBox(height: 4),
                                Text('History of all received payments.', style: TextStyle(color: Colors.white70, fontSize: 13)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text('TOTAL COLLECTED', style: TextStyle(color: Color(0xFFF0FDF4), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                Text('৳ ${_totalCollected.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          )
                        ],
                      ),
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
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                child: _payments.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          children: const [
                            Icon(Icons.description, size: 60, color: Colors.grey),
                            SizedBox(height: 16),
                            Text('No Payments Yet!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87)),
                            SizedBox(height: 8),
                            Text('You haven\'t recorded any payments yet.', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
                          ],
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _payments.length,
                        separatorBuilder: (ctx, i) => Divider(color: Colors.grey.withOpacity(0.1), height: 1),
                        itemBuilder: (ctx, i) {
                          final tx = _payments[i];
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            leading: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                              decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(8)),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.calendar_today, size: 14, color: Colors.green),
                                  const SizedBox(height: 4),
                                  Text(
                                    tx.date.split('-').sublist(1).join('/'), // Simplistic date like MM/DD
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                                  )
                                ],
                              ),
                            ),
                            title: Text(tx.customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: tx.mobileNumber != null ? Text(tx.mobileNumber!, style: const TextStyle(fontSize: 12)) : null,
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.green[50],
                                border: Border.all(color: Colors.green.withOpacity(0.1)),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '+ ৳ ${tx.amount.toStringAsFixed(0)}',
                                style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ),
          ),
          const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
        ],
      ),
    );
  }
}
