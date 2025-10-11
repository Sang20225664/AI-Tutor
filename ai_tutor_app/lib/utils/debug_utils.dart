import 'package:ai_tutor_app/services/config_service.dart';
import 'package:ai_tutor_app/services/connection_service.dart';
import 'package:ai_tutor_app/services/api_service.dart';

class DebugUtils {
  static Future<void> testAllConnections() async {
    if (!ConfigService.isDebugMode) return;

    print('=== AI Tutor Debug Test ===');
    print('Backend URL: ${ConfigService.backendUrl}');
    print('Platform: ${ConfigService.isWeb ? 'Web' : 'Mobile'}');

    // Test connection
    final connectionTest = await ConnectionService.testConnection();
    print('Connection: ${connectionTest['success'] ? '✅' : '❌'}');
    if (connectionTest['responseTime'] != null) {
      print('Response time: ${connectionTest['responseTime']}ms');
    }

    // Test auth endpoints
    try {
      final pingResponse = await ApiService.get('api/ping');
      print('Ping: ${pingResponse['success'] ? '✅' : '❌'}');
    } catch (e) {
      print('Ping: ❌ $e');
    }

    print('=========================');
  }
}
