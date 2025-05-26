import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:ai_tutor_app/services/api_service.dart';

class GeminiService {
  static const String _baseGeminiUrl =
      'https://generativelanguage.googleapis.com/v1beta';
  static const String baseUrl = 'http://10.0.2.2:5000'; // For Android emulator

  static get token => null;

  /// Gửi prompt tới Gemini API và nhận response
  /// [prompt]: Nội dung câu hỏi/yêu cầu
  /// [isBackendProxy]: True = gọi qua backend của bạn, False = gọi trực tiếp
  static Future<String> generateContent({
    required String prompt,
    bool isBackendProxy = true, // Mặc định dùng backend proxy
  }) async {
    try {
      if (isBackendProxy) {
        // Gọi qua backend Node.js của bạn
        final response = await _callViaBackend(prompt);
        return response;
      } else {
        // Gọi trực tiếp tới Gemini (chỉ dùng khi test)
        final response = await _callDirect(prompt);
        return response;
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Gọi qua backend proxy
  static Future<String> _callViaBackend(String prompt) async {
    try {
      final response = await ApiService.post(
        'gemini/generate',
        {'prompt': prompt},
        headers: {
          // Add headers here
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      print('Raw API Response: $response'); // Debug response

      if (response['success'] == true) {
        return response['response'] as String; // Explicit cast
      } else {
        throw Exception(response['message'] ?? 'Unknown backend error');
      }
    } catch (e) {
      print('API Call Error: $e');
      rethrow;
    }
  }

  /// Gọi trực tiếp tới Gemini API (chỉ dùng khi phát triển)
  static Future<String> _callDirect(String prompt) async {
    const apiKey = 'YOUR_DIRECT_API_KEY'; // Chỉ dùng khi test
    final url = Uri.parse(
      '$_baseGeminiUrl/models/gemini-pro:generateContent?key=$apiKey',
    );

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để tránh redirect
      },
      body: jsonEncode({
        'prompt': 'Yêu cầu đề bài toán phép cộng lớp 2',
        'subject': 'Toán học',
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['candidates'][0]['content']['parts'][0]['text'];
    } else {
      throw Exception('Gemini API Error: ${response.statusCode}');
    }
  }

  /// Xử lý lỗi tập trung
  static String _handleError(dynamic error) {
    if (error is String) return error;
    if (error is Map<String, dynamic>)
      return error['message'] ?? error.toString();
    return error.toString();
  }

  Future<http.StreamedResponse> chatWithAI({
    required String prompt,
    required String subject,
    required String token,
  }) async {
    final uri = Uri.parse('https://api.example.com/chat');
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
    final body = jsonEncode({'prompt': prompt, 'subject': subject});

    final request =
        http.Request('POST', uri)
          ..headers.addAll(headers)
          ..body = body;

    final client = http.Client();
    return client.send(request);
  }

  static Future<String> generateContentViaChatApi({
    required String prompt,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/chats'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': prompt}),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['reply'] != null) {
          return data['reply'];
        }
        throw Exception(data['error'] ?? 'Unknown error');
      } else {
        throw Exception('Failed to get AI response');
      }
    } catch (e) {
      throw Exception('Connection error: $e');
    }
  }
}
