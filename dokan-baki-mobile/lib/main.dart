import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/dashboard/home_screen.dart';
import 'screens/shop/customer_detail_screen.dart';
import 'screens/shop/add_due_screen.dart';
import 'screens/shop/add_payment_screen.dart';
import 'screens/shop/shop_layout.dart';
import 'screens/shop/shop_selection_screen.dart';
import 'screens/dashboard/user_dashboard_screen.dart';
import 'utils/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const DokanBakiApp());
}

class DokanBakiApp extends StatelessWidget {
  const DokanBakiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (ctx) => AuthProvider()),
      ],
      child: MaterialApp(
        title: 'Dokan Baki',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: Consumer<AuthProvider>(
          builder: (ctx, auth, _) {
            if (auth.isAuthenticated) {
              return const ShopSelectionScreen();
            }
            return FutureBuilder(
              future: auth.tryAutoLogin(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Scaffold(body: Center(child: CircularProgressIndicator()));
                }
                return const LoginScreen();
              },
            );
          },
        ),
        routes: {
          LoginScreen.routeName: (ctx) => const LoginScreen(),
          RegisterScreen.routeName: (ctx) => const RegisterScreen(),
          UserDashboardScreen.routeName: (ctx) => const UserDashboardScreen(),
          ShopSelectionScreen.routeName: (ctx) => const ShopSelectionScreen(),
          ShopLayout.routeName: (ctx) => const ShopLayout(),
          HomeScreen.routeName: (ctx) => const HomeScreen(),
          CustomerDetailScreen.routeName: (ctx) => const CustomerDetailScreen(),
          AddDueScreen.routeName: (ctx) => const AddDueScreen(),
          AddPaymentScreen.routeName: (ctx) => const AddPaymentScreen(),
        },
      ),
    );
  }
}
