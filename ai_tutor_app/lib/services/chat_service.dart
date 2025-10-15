import 'package:ai_tutor_app/services/gemini_service.dart';

class ChatService {
  static Future<Map<String, dynamic>> sendMessage(String message) async {
    try {
      if (!(await GeminiService.isAvailable())) {
        throw Exception('Backend not available');
      }

      final response = await GeminiService.generateContent(prompt: message);
      return {'success': true, 'reply': response};
    } catch (e) {
      return {'success': false, 'message': 'Chat error: $e'};
    }
  }
}
