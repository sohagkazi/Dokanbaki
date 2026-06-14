class User {
  final String id;
  final String name;
  final String mobile;
  final String? email;
  final String? subscriptionPlan;

  User({
    required this.id,
    required this.name,
    required this.mobile,
    this.email,
    this.subscriptionPlan,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      mobile: json['mobile']?.toString() ?? '',
      email: json['email']?.toString(),
      subscriptionPlan: json['subscriptionPlan']?.toString(),
    );
  }
}
