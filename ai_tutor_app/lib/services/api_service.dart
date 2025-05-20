import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Sử dụng const cho baseUrl để tránh khai báo nhiều lần
  static const String baseUrl = 'http://10.0.2.2:5000'; // Android emulator
  // static const String baseUrl = 'http://<your-real-ip>:5000'; // Cho thiết bị thật

  // Common headers
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
  };

  // Xử lý response tập trung
  static Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {'success': true, ...data};
    } else {
      return {
        'success': false,
        'message': data['message'] ?? 'Request failed with status ${response.statusCode}'
      };
    }
  }

  // Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/users/login'),
        headers: headers,
        body: jsonEncode({'email': email, 'password': password}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // Register
  static Future<Map<String, dynamic>> register(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/users/register'),
        headers: headers,
        body: jsonEncode({'email': email, 'password': password}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // Send Message
  static Future<Map<String, dynamic>> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/chats'),
        headers: headers,
        body: jsonEncode({'message': message}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }
}