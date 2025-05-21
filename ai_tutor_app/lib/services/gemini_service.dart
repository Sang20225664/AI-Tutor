import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:ai_tutor_app/services/api_service.dart';

class GeminiService {
  static const String _baseGeminiUrl = 'https://generativelanguage.googleapis.com/v1beta';

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
    final url = Uri.parse('$_baseGeminiUrl/models/gemini-pro:generateContent?key=$apiKey');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'contents': [{
          'parts': [{'text': prompt}]
        }]
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
    if (error is Map<String, dynamic>) return error['message'] ?? error.toString();
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
    final body = jsonEncode({
      'prompt': prompt,
      'subject': subject,
    });

    final request = http.Request('POST', uri)
      ..headers.addAll(headers)
      ..body = body;

    final client = http.Client();
    return client.send(request);
  }
}