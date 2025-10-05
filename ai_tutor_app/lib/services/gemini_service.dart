import 'package:ai_tutor_app/services/api_service.dart';

class GeminiService {
  /// Test backend connection
  static Future<bool> testBackendConnection() async {
    try {
      print('DEBUG: Testing backend connection...');
      final response = await ApiService.get('api/ping');

      if (response['success'] == true) {
        print('DEBUG: Backend connection SUCCESS');
        return true;
      } else {
        print('DEBUG: Backend connection FAILED: ${response['message']}');
        return false;
      }
    } catch (e) {
      print('DEBUG: Backend connection ERROR: $e');
      return false;
    }
  }

  /// Generate content using backend proxy only
  static Future<String> generateContent({required String prompt}) async {
    return _generateViaBackend(prompt);
  }

  /// Generate content via backend proxy
  static Future<String> _generateViaBackend(String prompt) async {
    try {
      print('DEBUG: Using backend proxy');
      print('DEBUG: URL: ${ApiService.baseUrl}/api/gemini/chat');
      print('DEBUG: Message: $prompt');

      final response = await ApiService.post('api/gemini/chat', {
        'message': prompt,
      });

      print('DEBUG: Backend response: $response');

      if (response['success'] == true) {
        final responseText = response['response'] ?? 'No response text';
        print(
          'DEBUG: Backend SUCCESS - Response length: ${responseText.length}',
        );
        return responseText;
      } else {
        throw Exception(response['message'] ?? 'Backend error');
      }
    } catch (e) {
      print('DEBUG: Backend error: $e');
      throw Exception('Backend error: $e');
    }
  }

  /// Chat with AI using streaming response
  static Stream<String> chatWithAI({
    required String prompt,
    required String subject,
  }) async* {
    try {
      final response = await ApiService.post('api/gemini/chat', {
        'message': prompt,
        'subject': subject,
      });

      if (response['success'] == true) {
        yield response['response'] ?? 'No response';
      } else {
        throw Exception(response['message'] ?? 'Chat failed');
      }
    } catch (e) {
      throw Exception('Chat error: $e');
    }
  }
}
