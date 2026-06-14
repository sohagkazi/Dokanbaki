class TransactionModel {
  final String id;
  final String shopId;
  final String customerName;
  final double amount;
  final String type; // DUE, PAYMENT
  final String date;
  final String? mobileNumber;
  final String createdAt;

  TransactionModel({
    required this.id,
    required this.shopId,
    required this.customerName,
    required this.amount,
    required this.type,
    required this.date,
    this.mobileNumber,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id']?.toString() ?? '',
      shopId: json['shopId']?.toString() ?? '',
      customerName: json['customerName']?.toString() ?? '',
      amount: (json['amount'] as num).toDouble(),
      type: json['type']?.toString() ?? 'DUE',
      date: json['date']?.toString() ?? '',
      mobileNumber: json['mobileNumber']?.toString(),
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }
}
