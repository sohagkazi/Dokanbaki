import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_theme.dart';
import '../shop/shop_layout.dart';
import '../shop/shop_selection_screen.dart';

class UserDashboardScreen extends StatelessWidget {
  static const routeName = '/user-dashboard';
  final bool isTab;
  const UserDashboardScreen({super.key, this.isTab = false});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final shop = auth.currentShop;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Profile & Check', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        leading: isTab ? null : IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else if (shop != null) {
              Navigator.of(context).pushNamedAndRemoveUntil(ShopLayout.routeName, (route) => false);
            }
          },
        ),
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Profile Card
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.grey[200],
                          child: const Icon(Icons.person, color: Colors.grey, size: 36),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user.name.toUpperCase(),
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                user.mobile,
                                style: const TextStyle(color: Colors.grey, fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.edit, color: Colors.blue, size: 16),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Shop Status Card
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.storefront, color: Colors.grey, size: 32),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          shop == null ? 'No Shop Selected' : shop.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          shop == null ? "You haven't selected a shop yet." : "You are currently managing this shop.",
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () {
                             Navigator.of(context).pushNamed(ShopSelectionScreen.routeName);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue[600],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            elevation: 0,
                          ),
                          child: Text(shop == null ? 'Select or Create Shop' : 'Switch Shop', style: const TextStyle(fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Settings Section
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.withOpacity(0.1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 16, top: 20, bottom: 8),
                          child: Text('SETTINGS', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                        ),
                        _buildSettingItem(Icons.storefront, Colors.orange, 'Switch Shop', onTap: () => Navigator.of(context).pushNamed(ShopSelectionScreen.routeName)),
                        const Divider(height: 1, indent: 56, color: Color(0xFFF3F4F6)),
                        _buildSettingItem(Icons.share, Colors.green, 'Share App'),
                        const Divider(height: 1, indent: 56, color: Color(0xFFF3F4F6)),
                        _buildSettingItem(Icons.help_outline, Colors.purple, 'Help & Support'),
                        const Divider(height: 1, indent: 56, color: Color(0xFFF3F4F6)),
                        _buildSettingItem(Icons.shield_outlined, Colors.cyan, 'Privacy Policy'),
                        const SizedBox(height: 8),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Log out Card
                  InkWell(
                    onTap: () {
                      auth.logout();
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.red.withOpacity(0.1)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.logout, color: Colors.red, size: 20),
                          ),
                          const SizedBox(width: 16),
                          const Text('Log Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 15)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _buildSettingItem(IconData icon, Color color, String title, {VoidCallback? onTap}) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Colors.black87)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
    );
  }

}
