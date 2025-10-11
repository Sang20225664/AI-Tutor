import 'package:ai_tutor_app/services/api_service.dart';

class GeminiService {
  static Future<String> generateContent({required String prompt}) async {
    try {
      final response = await ApiService.sendChatMessage(prompt);

      if (response['success'] == true) {
        return response['response'] ?? 'No response';
      }
      throw Exception(response['message'] ?? 'Gemini error');
    } catch (e) {
      throw Exception('Failed to generate content: $e');
    }
  }

  static Future<bool> isAvailable() async {
    try {
      final response = await ApiService.get('api/ping');
      return response['success'] == true;
    } catch (e) {
      return false;
    }
  }
}
