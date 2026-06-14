import 'package:flutter/material.dart';
import '../../utils/app_theme.dart';

class SmsScreen extends StatelessWidget {
  const SmsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SMS Marketing'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            GlassCard(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Icon(Icons.sms, size: 48, color: AppTheme.primary),
                  const SizedBox(height: 16),
                  const Text(
                    'SMS Balance',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '150',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {
                      // Handle buy more
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Recharge integration coming soon!')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.secondary,
                    ),
                    child: const Text('Recharge Balance'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Send Bulk SMS',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Select Target Group',
                hintText: 'e.g. All Customers with Due > 500',
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Message Body',
                hintText: 'Dear customer, your due is...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Message Queued!')),
                );
              },
              icon: const Icon(Icons.send),
              label: const Text('Send SMS'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
