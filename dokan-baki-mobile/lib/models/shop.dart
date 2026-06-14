class Shop {
  final String id;
  final String name;
  final String ownerId;
  final String? mobile;

  Shop({
    required this.id,
    required this.name,
    required this.ownerId,
    this.mobile,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      ownerId: json['ownerId']?.toString() ?? '',
      mobile: json['mobile']?.toString(),
    );
  }
}
