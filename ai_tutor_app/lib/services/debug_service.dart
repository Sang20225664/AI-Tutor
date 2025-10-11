import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/services/config_service.dart';

class DebugService {
  static Future<void> testBackendConnection() async {
    print('=== BACKEND CONNECTION TEST ===');
    print('Backend URL: ${ConfigService.backendUrl}');
    print('Platform: ${ConfigService.isWeb ? 'Web' : 'Mobile'}');

    try {
      // Test ping endpoint
      print('Testing ping endpoint...');
      final pingResponse = await ApiService.get('api/ping');
      print('Ping result: ${pingResponse['success'] ? '✅' : '❌'}');

      if (!pingResponse['success']) {
        print('Ping error: ${pingResponse['message']}');
      }

      // Test Gemini endpoint
      print('Testing Gemini endpoint...');
      final geminiResponse = await ApiService.sendChatMessage('test');
      print('Gemini result: ${geminiResponse['success'] ? '✅' : '❌'}');

      if (!geminiResponse['success']) {
        print('Gemini error: ${geminiResponse['message']}');
      }
    } catch (e) {
      print('❌ Connection test failed: $e');
    }

    print('================================');
  }
}
