import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import '../models/user.dart' as model_user;
import '../models/shop.dart';
import '../models/transaction_model.dart';

class ApiService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<Map<String, dynamic>> login(String mobile, String password) async {
    final query = await _db.collection('users').where('mobile', isEqualTo: mobile).limit(1).get();
    
    if (query.docs.isEmpty) {
      throw Exception('User not found');
    }
    
    final userData = Map<String, dynamic>.from(query.docs.first.data());
    if (userData['password'] != password) {
      throw Exception('Invalid password');
    }
    
    userData['id'] = query.docs.first.id;
    return {
      'user': userData,
      'token': query.docs.first.id, 
    };
  }

  Future<Map<String, dynamic>> register(String name, String mobile, String password, String? email) async {
    final existingCheck = await _db.collection('users').where('mobile', isEqualTo: mobile).get();
    if (existingCheck.docs.isNotEmpty) {
      throw Exception('Mobile number already registered');
    }

    final docRef = await _db.collection('users').add({
      'name': name,
      'mobile': mobile,
      'password': password,
      'email': email ?? '',
      'subscriptionPlan': 'FREE',
      'smsBalance': 0,
      'createdAt': DateTime.now().toIso8601String(),
    });

    final userData = {
      'id': docRef.id,
      'name': name,
      'mobile': mobile,
      'email': email ?? '',
    };

    return {
      'user': userData,
      'token': docRef.id,
    };
  }

  Future<List<Shop>> getShops(String userId) async {
    final query = await _db.collection('shops').where('ownerId', isEqualTo: userId).get();
    return query.docs.map((doc) {
      final data = Map<String, dynamic>.from(doc.data());
      data['id'] = doc.id;
      return Shop.fromJson(data);
    }).toList();
  }

  Future<Shop> createShop(String userId, String name, String? mobile) async {
    final shopData = {
      'ownerId': userId,
      'name': name,
      'mobile': mobile ?? '',
      'createdAt': DateTime.now().toIso8601String(),
      'theme': null,
    };
    
    final docRef = await _db.collection('shops').add(shopData);
    shopData['id'] = docRef.id;
    return Shop.fromJson(shopData);
  }

  Future<List<TransactionModel>> getTransactions(String shopId) async {
    final query = await _db.collection('transactions').where('shopId', isEqualTo: shopId).get();
    return query.docs.map((doc) {
      final data = Map<String, dynamic>.from(doc.data());
      data['id'] = doc.id;
      return TransactionModel.fromJson(data);
    }).toList();
  }

  Future<void> addTransaction(String shopId, String customerName, double amount, String type, String date, String? mobile) async {
    await _db.collection('transactions').add({
      'shopId': shopId,
      'customerName': customerName,
      'amount': amount,
      'type': type,
      'date': date,
      'mobileNumber': mobile ?? '',
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> deleteTransaction(String transactionId) async {
    await _db.collection('transactions').doc(transactionId).delete();
  }

  Future<void> deleteCustomerTransactions(String shopId, String customerName) async {
    final query = await _db
        .collection('transactions')
        .where('shopId', isEqualTo: shopId)
        .where('customerName', isEqualTo: customerName)
        .get();

    final batch = _db.batch();
    for (var doc in query.docs) {
      batch.delete(doc.reference);
    }
    await batch.commit();
  }
  Future<String> uploadUserProfileImage(String userId, File imageFile) async {
    final storageRef = FirebaseStorage.instance.ref().child('user_profiles').child('$userId.jpg');
    final uploadTask = await storageRef.putFile(imageFile);
    final downloadUrl = await uploadTask.ref.getDownloadURL();
    
    await _db.collection('users').doc(userId).update({
      'image': downloadUrl,
    });
    
    return downloadUrl;
  }
}
