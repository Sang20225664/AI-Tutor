import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000';

  static final Map<String, String> _defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Thêm token vào headers nếu có
  static Map<String, String> _getHeadersWithAuth() {
    // Thêm logic lấy token từ storage nếu cần
    return {
      ..._defaultHeaders,
      // 'Authorization': 'Bearer $token',
    };
  }

  // Generic HTTP Methods
  static Future<Map<String, dynamic>> get(String endpoint, {Map<String, String>? headers}) async {
    try {
      final response = await http.get(
        _buildUri(endpoint),
        headers: headers ?? _getHeadersWithAuth(),
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
        headers: headers ?? _getHeadersWithAuth(),
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> patch(
      String endpoint,
      Map<String, dynamic> body, {
        Map<String, String>? headers,
      }) async {
    try {
      final response = await http.patch(
        _buildUri(endpoint),
        headers: headers ?? _getHeadersWithAuth(),
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> delete(String endpoint, {Map<String, String>? headers}) async {
    try {
      final response = await http.delete(
        _buildUri(endpoint),
        headers: headers ?? _getHeadersWithAuth(),
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // Auth APIs (giữ nguyên)
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

  // Chat APIs (đã cập nhật)
  static Future<Map<String, dynamic>> sendMessage(String chatId, String message) async {
    return post('api/chats/$chatId/messages', {
      'message': message,
    });
  }

  static Future<Map<String, dynamic>> generateGeminiResponse(String prompt) async {
    return post('api/gemini/generate', {'prompt': prompt});
  }

  // History APIs (mới)
  static Future<Map<String, dynamic>> getChatHistories() async {
    return get('api/chats');
  }

  static Future<Map<String, dynamic>> createChatHistory() async {
    return post('api/chats', {
      'title': 'New Chat',
      'messages': [],
    });
  }

  static Future<Map<String, dynamic>> getChatHistory(String chatId) async {
    return get('api/chats/$chatId');
  }

  static Future<Map<String, dynamic>> updateChatHistory(String chatId, List<Map<String, dynamic>> messages) async {
    return patch('api/chats/$chatId', {
      'messages': messages,
    });
  }

  static Future<Map<String, dynamic>> deleteChatHistory(String chatId) async {
    return delete('api/chats/$chatId');
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