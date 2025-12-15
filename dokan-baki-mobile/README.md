# Dokan Baki Mobile App

This project wraps your Dokan Baki web application into a native Android app using Flutter.

## Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.
- Android Studio installed.

## Setup Instructions

1.  **Initialize Flutter Project**:
    Since this folder was created manually, you might need to initialize the full structure if you haven't already.
    ```bash
    flutter create .
    ```
    *If it asks to overwrite `lib/main.dart`, choose NO or backup `lib/main.dart` first.*

2.  **Update URL**:
    Open `lib/main.dart` and find:
    ```dart
    final String appUrl = 'https://dokan-baki.vercel.app';
    ```
    Replace `https://dokan-baki.vercel.app` with your **actual live website URL** (e.g. Vercel deployment).

3.  **Run Locally**:
    ```bash
    flutter run
    ```

4.  **Build for Play Store**:
    To generate the `.aab` file for Google Play Console:
    ```bash
    flutter build appbundle
    ```
    The file will be in `build/app/outputs/bundle/release/app-release.aab`.

## PWA Features
Your web app is also a PWA!
- It works offline (caches pages).
- It can be installed directly from the browser ("Add to Home Screen").
