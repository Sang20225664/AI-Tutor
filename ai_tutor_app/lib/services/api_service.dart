import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'package:ai_tutor_app/services/config_service.dart';

class ApiService {
  // Dynamic base URL based on platform
  static String get baseUrl => ConfigService.backendUrl;

  static const String tokenKey = 'auth_token';

  // New token management methods
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(tokenKey, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(tokenKey);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(tokenKey);
  }

  static final Map<String, String> _defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Updated to use stored token
  static Future<Map<String, String>> _getHeadersWithAuth() async {
    final token = await getToken();
    return {
      ..._defaultHeaders,
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Generic HTTP Methods
  static Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    try {
      final authHeaders = headers ?? await _getHeadersWithAuth();
      final response = await http.get(
        _buildUri(endpoint),
        headers: authHeaders,
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
      final authHeaders = headers ?? await _getHeadersWithAuth();

      // Add more headers for web compatibility
      if (kIsWeb) {
        authHeaders.addAll({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        });
      }

      final response = await http
          .post(
            _buildUri(endpoint),
            headers: authHeaders,
            body: jsonEncode(body),
          )
          .timeout(ConfigService.defaultTimeout);

      return _handleResponse(response);
    } catch (e) {
      if (ConfigService.isDebugMode) print('API Error: $e');
      return _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> patch(
    String endpoint,
    Map<String, dynamic> body, {
    Map<String, String>? headers,
  }) async {
    try {
      final authHeaders = headers ?? await _getHeadersWithAuth();
      final response = await http.patch(
        _buildUri(endpoint),
        headers: authHeaders,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> delete(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    try {
      final authHeaders = headers ?? await _getHeadersWithAuth();
      final response = await http.delete(
        _buildUri(endpoint),
        headers: authHeaders,
      );
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // Auth APIs
  static Future<Map<String, dynamic>> login(
    String username,
    String password,
  ) async {
    return post('users/login', {
      'username': username,
      'password': password,
    });
  }

  static Future<Map<String, dynamic>> register(
    String username,
    String password,
  ) async {
    return post('users/register', {
      'username': username,
      'password': password,
    });
  }

  // Chat APIs
  static Future<Map<String, dynamic>> sendChatMessage(String message) async {
    return post('gemini/chat', {'message': message});
  }

  // Chat method with optional greeting support
  static Future<Map<String, dynamic>> chat({
    String? message,
    String? prompt,
    String? subject,
    bool greet = false,
  }) async {
    final body = {
      if (message != null) 'message': message,
      if (prompt != null) 'prompt': prompt,
      if (subject != null) 'subject': subject,
      if (greet) 'greet': true,
    };

    return post('gemini/chat', body);
  }

  // Legacy methods for backward compatibility
  static Future<Map<String, dynamic>> generateGeminiResponse(
    String prompt,
  ) async {
    return sendChatMessage(prompt);
  }

  static Future<Map<String, dynamic>> getChatHistories() async {
    return get('chats');
  }

  static Future<Map<String, dynamic>> updateChatHistory(
    String chatId,
    List<Map<String, dynamic>> messages,
  ) async {
    return patch('chats/$chatId', {'messages': messages});
  }

  static Future<Map<String, dynamic>> deleteChatHistory(String chatId) async {
    return delete('chats/$chatId');
  }

  // Subject APIs
  static Future<Map<String, dynamic>> getSubjects({int? grade}) async {
    final endpoint = grade != null ? 'subjects?grade=$grade' : 'subjects';
    return get(endpoint);
  }

  static Future<Map<String, dynamic>> getSubjectById(String id) async {
    return get('subjects/$id');
  }

  // Quiz APIs
  static Future<Map<String, dynamic>> getQuizzes({
    int? grade,
    String? subjectName,
    String? difficulty,
  }) async {
    final params = <String>[];
    if (grade != null) params.add('grade=$grade');
    if (subjectName != null) {
      params.add('subjectName=${Uri.encodeComponent(subjectName)}');
    }
    if (difficulty != null) params.add('difficulty=$difficulty');

    final query = params.isEmpty ? '' : '?${params.join('&')}';
    return get('quizzes$query');
  }

  static Future<Map<String, dynamic>> getQuizById(String id) async {
    return get('quizzes/$id');
  }

  // Lesson APIs
  static Future<Map<String, dynamic>> getLessons({
    int? grade,
    String? subjectName,
    String? difficulty,
    List<String>? topics,
  }) async {
    final params = <String>[];
    if (grade != null) params.add('grade=$grade');
    if (subjectName != null) {
      params.add('subjectName=${Uri.encodeComponent(subjectName)}');
    }
    if (difficulty != null) params.add('difficulty=$difficulty');
    if (topics != null && topics.isNotEmpty) {
      params.add(
        'topics=${topics.map((t) => Uri.encodeComponent(t)).join(',')}',
      );
    }

    final query = params.isEmpty ? '' : '?${params.join('&')}';
    return get('lessons$query');
  }

  static Future<Map<String, dynamic>> getLessonById(String id) async {
    return get('lessons/$id');
  }

  static Future<Map<String, dynamic>> getLessonsBySubject(
    String subjectId, {
    int? grade,
    String? difficulty,
  }) async {
    final params = <String>[];
    if (grade != null) params.add('grade=$grade');
    if (difficulty != null) params.add('difficulty=$difficulty');

    final query = params.isEmpty ? '' : '?${params.join('&')}';
    return get('lessons/subject/$subjectId$query');
  }

  // Lesson Suggestion APIs
  static Future<Map<String, dynamic>> getLessonSuggestions({
    required int grade,
    String? subjectName,
    String? difficulty,
  }) async {
    final params = <String>['grade=$grade'];
    if (subjectName != null) {
      params.add('subjectName=${Uri.encodeComponent(subjectName)}');
    }
    if (difficulty != null) params.add('difficulty=$difficulty');

    final query = params.join('&');
    return get('lesson-suggestions?$query');
  }

  static Future<Map<String, dynamic>> getLessonSuggestionById(String id) async {
    return get('lesson-suggestions/$id');
  }

  // Helper Methods
  static Uri _buildUri(String endpoint) {
    final cleanEndpoint =
        endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return Uri.parse('$baseUrl/$cleanEndpoint');
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    try {
      final data = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, ...data};
      }

      return {
        'success': false,
        'message': data['message'] ??
            data['error'] ??
            'Request failed with status ${response.statusCode}',
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
        'message':
            'Network error: Cannot connect to server. Please check if backend is running.',
      };
    }

    if (error is http.ClientException) {
      return {
        'success': false,
        'message':
            'CORS error: ${error.message}. Backend may not be accessible from web.',
      };
    }

    return {'success': false, 'message': 'Network error: $error'};
  }
}
