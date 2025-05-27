import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000';

  static final Map<String, String> _defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Generic HTTP Methods
  static Future<Map<String, dynamic>> get(String endpoint, {Map<String, String>? headers}) async {
    try {
      final response = await http.get(
        _buildUri(endpoint),
        headers: headers ?? _defaultHeaders,
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> post(
      String endpoint,
      Map<String, dynamic> body, {
        Map<String, String>? headers,
      }) async {
    try {
      final response = await http.post(
        _buildUri(endpoint),
        headers: headers ?? _defaultHeaders,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // Auth APIs
  static Future<Map<String, dynamic>> login(String username, String password) async {
    return post('api/users/login', {
      'username': username,
      'password': password,
    });
  }

  static Future<Map<String, dynamic>> register(String username, String email, String password) async {
    return post('api/users/register', {
      'username': username,
      'email': email,
      'password': password,
    });
  }

  static Future<Map<String, dynamic>> loginWithGoogle() async {
    return post('api/users/login/google', {});
  }

  static Future<Map<String, dynamic>> loginWithFacebook() async {
    return post('api/users/login/facebook', {});
  }

  // Chat APIs
  static Future<Map<String, dynamic>> sendMessage(String message) async {
    return post('api/chats', {'message': message});
  }

  static Future<Map<String, dynamic>> generateGeminiResponse(String prompt) async {
    return post('api/gemini/generate', {'prompt': prompt});
  }

  // Helper Methods
  static Uri _buildUri(String endpoint) {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return Uri.parse('$baseUrl/$cleanEndpoint');
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    try {
      final data = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          ...data,
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? data['error'] ?? 'Request failed with status ${response.statusCode}',
        'statusCode': response.statusCode,
      };
    } on FormatException catch (e) {
      return {
        'success': false,
        'message': 'Failed to parse response: $e',
        'statusCode': response.statusCode,
      };
    }
  }

  static Map<String, dynamic> _handleError(dynamic error) {
    if (error is SocketException) {
      return {
        'success': false,
        'message': 'Connection error: Could not connect to the server.',
      };
    }

    if (error is http.ClientException) {
      return {
        'success': false,
        'message': 'Network error: ${error.message}',
      };
    }

    return {
      'success': false,
      'message': 'An unexpected error occurred: $error',
    };
  }
}