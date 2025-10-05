import 'package:ai_tutor_app/services/gemini_service.dart';

class ChatService {
  static Future<Map<String, dynamic>> sendMessage(String message) async {
    try {
      print('=== CHAT SERVICE DEBUG ===');

      // Test backend connection first
      final isBackendConnected = await GeminiService.testBackendConnection();

      if (isBackendConnected) {
        print('✅ Using backend connection');

        // Remove useBackendProxy parameter since it's no longer needed
        final response = await GeminiService.generateContent(prompt: message);

        return {'success': true, 'reply': response, 'source': 'backend'};
      } else {
        throw Exception('Backend not available');
      }
    } catch (e) {
      print('DEBUG: ChatService error: $e');
      return {'success': false, 'message': 'Lỗi kết nối backend: $e'};
    }
  }
}
