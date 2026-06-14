import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/shop.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  
  Shop? _currentShop;
  List<Shop> _shops = [];

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  Shop? get currentShop => _currentShop;
  List<Shop> get shops => _shops;

  Future<void> login(String mobile, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _apiService.login(mobile, password);
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
      await _saveUserToPrefs(_user!);
      await fetchShops(); 
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String name, String mobile, String password, String? email) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _apiService.register(name, mobile, password, email);
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
      await _saveUserToPrefs(_user!);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchShops() async {
    if (_user == null) return;
    try {
      _shops = await _apiService.getShops(_user!.id);
      if (_shops.isNotEmpty && _currentShop == null) {
        _currentShop = _shops.first;
      }
      notifyListeners();
    } catch (e) {
      print(e);
    }
  }

  Future<void> createShop(String name, String? mobile) async {
    if (_user == null) return;
    try {
      final newShop = await _apiService.createShop(_user!.id, name, mobile);
      _shops.add(newShop);
      _currentShop = newShop;
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  void selectShop(Shop shop) {
    _currentShop = shop;
    notifyListeners();
  }

  Future<void> logout() async {
    _user = null;
    _shops = [];
    _currentShop = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }

  Future<void> updateProfileImage(File imageFile) async {
    if (_user == null) return;
    _isLoading = true;
    notifyListeners();

    try {
      final downloadUrl = await _apiService.uploadUserProfileImage(_user!.id, imageFile);
      
      // Update user object with new photoUrl
      _user = User(
        id: _user!.id,
        name: _user!.name,
        mobile: _user!.mobile,
        email: _user!.email,
        subscriptionPlan: _user!.subscriptionPlan,
        photoUrl: downloadUrl,
      );
      
      await _saveUserToPrefs(_user!);
    } catch (e) {
      print("Error uploading image: $e");
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('userData')) return;

    final extractedUserData = json.decode(prefs.getString('userData')!) as Map<String, dynamic>;
    _user = User.fromJson(extractedUserData);
    await fetchShops();
    notifyListeners();
  }

  Future<void> _saveUserToPrefs(User user) async {
    final prefs = await SharedPreferences.getInstance();
    final userData = json.encode({
      'id': user.id,
      'name': user.name,
      'mobile': user.mobile,
      'email': user.email,
      'subscriptionPlan': user.subscriptionPlan,
      'photoUrl': user.photoUrl,
    });
    await prefs.setString('userData', userData);
  }
}
