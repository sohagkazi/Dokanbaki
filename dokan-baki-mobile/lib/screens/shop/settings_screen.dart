import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final shop = auth.currentShop;
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (shop != null) ...[
              const Text(
                'Shop Profile',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 12),
              GlassCard(
                padding: const EdgeInsets.all(0),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.storefront, color: AppTheme.primary),
                      title: const Text('Shop Name'),
                      subtitle: Text(shop.name),
                      trailing: const Icon(Icons.edit, size: 20, color: AppTheme.textSecondary),
                      onTap: () {
                        // TODO: Implement shop name editing
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.phone, color: AppTheme.primary),
                      title: const Text('Contact Number'),
                      subtitle: Text(shop.mobile ?? 'Not set'),
                      trailing: const Icon(Icons.edit, size: 20, color: AppTheme.textSecondary),
                      onTap: () {
                         // TODO: Implement shop mobile editing
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ],
            
            const Text(
              'My Account',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 12),
            GlassCard(
              padding: const EdgeInsets.all(0),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.person, color: AppTheme.primary),
                    title: const Text('Name'),
                    subtitle: Text(user?.name ?? ''),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.phone_android, color: AppTheme.primary),
                    title: const Text('Mobile'),
                    subtitle: Text(user?.mobile ?? ''),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.star, color: AppTheme.primary),
                    title: const Text('Subscription'),
                    subtitle: Text(user?.subscriptionPlan ?? 'FREE'),
                    trailing: TextButton(
                      onPressed: () {},
                      child: const Text('Upgrade'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                auth.logout();
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              icon: const Icon(Icons.logout),
              label: const Text('Log Out'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[50],
                foregroundColor: Colors.red,
                side: BorderSide(color: Colors.red.withOpacity(0.2)),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
