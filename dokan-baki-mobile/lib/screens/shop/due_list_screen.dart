import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';
import 'package:intl/intl.dart';

class DueListScreen extends StatefulWidget {
  const DueListScreen({super.key});

  @override
  State<DueListScreen> createState() => _DueListScreenState();
}

class _DueListScreenState extends State<DueListScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _dueCustomers = [];
  bool _isLoading = true;
  double _totalOutstanding = 0;

  @override
  void initState() {
    super.initState();
    _fetchDueList();
  }

  Future<void> _fetchDueList() async {
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
            'lastDate': tx.date,
          };
        }
        final c = customerMap[tx.customerName]!;
        if (tx.type == 'DUE') c['netDue'] += tx.amount;
        else if (tx.type == 'PAYMENT') c['netDue'] -= tx.amount;
        if (tx.mobileNumber != null) c['mobile'] = tx.mobileNumber;
        if (tx.date.compareTo(c['lastDate']) > 0) c['lastDate'] = tx.date;
      }
      
      final dues = customerMap.values.where((c) => c['netDue'] > 0).toList();
      double total = 0;
      for (var d in dues) {
        total += (d['netDue'] as double);
      }

      if (mounted) {
        setState(() {
          _dueCustomers = dues;
          _totalOutstanding = total;
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
            backgroundColor: const Color(0xFFEA580C), // orange-600
            iconTheme: const IconThemeData(color: Colors.white),
            automaticallyImplyLeading: false, // Inside bottom nav
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFEA580C), Color(0xFFF97316)], // orange-600 to orange-500
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
                                Text('Current Due List', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                                SizedBox(height: 4),
                                Text('Customers with outstanding payments.', style: TextStyle(color: Colors.white70, fontSize: 13)),
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
                                const Text('TOTAL OUTSTANDING', style: TextStyle(color: Color(0xFFFFF7ED), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                Text('৳ ${_totalOutstanding.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
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
                child: _dueCustomers.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          children: const [
                            Icon(Icons.description, size: 60, color: Colors.grey),
                            SizedBox(height: 16),
                            Text('No Dues Found!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87)),
                            SizedBox(height: 8),
                            Text('Everyone has paid their dues. Great job!', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
                          ],
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _dueCustomers.length,
                        separatorBuilder: (ctx, i) => Divider(color: Colors.grey.withOpacity(0.1), height: 1),
                        itemBuilder: (ctx, i) {
                          final c = _dueCustomers[i];
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            leading: CircleAvatar(
                              backgroundColor: Colors.orange[50],
                              child: const Icon(Icons.person, color: Colors.orange),
                            ),
                            title: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (c['mobile'] != null) Text(c['mobile'], style: const TextStyle(fontSize: 12)),
                                Text('Last: ${c['lastDate']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.red[50],
                                border: Border.all(color: Colors.red.withOpacity(0.1)),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '৳ ${c['netDue'].toStringAsFixed(0)}',
                                style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold, fontSize: 14),
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
