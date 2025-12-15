import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  runApp(const MaterialApp(
    debugShowCheckedModeBanner: false,
    home: DokanBakiApp(),
  ));
}

class DokanBakiApp extends StatefulWidget {
  const DokanBakiApp({super.key});

  @override
  State<DokanBakiApp> createState() => _DokanBakiAppState();
}

class _DokanBakiAppState extends State<DokanBakiApp> {
  late final WebViewController controller;
  // TODO: Replace with your actual deployed URL
  final String appUrl = 'https://dokan-baki.vercel.app'; 

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar.
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
        ),
      )
      ..loadRequest(Uri.parse(appUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}
