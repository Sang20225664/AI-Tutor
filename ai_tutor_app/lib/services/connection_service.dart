import 'package:ai_tutor_app/services/api_service.dart';

class ConnectionService {
  // Quick health check
  static Future<bool> isBackendReachable() async {
    try {
      final response = await ApiService.get('api/ping');
      return response['success'] == true;
    } catch (e) {
      return false;
    }
  }

  // Detailed connection test
  static Future<Map<String, dynamic>> testConnection() async {
    try {
      final startTime = DateTime.now();
      final response = await ApiService.get('api/ping');
      final responseTime = DateTime.now().difference(startTime).inMilliseconds;

      return {
        'success': response['success'] == true,
        'responseTime': responseTime,
        'backendUrl': ApiService.baseUrl,
        'timestamp': response['timestamp'],
      };
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
        'backendUrl': ApiService.baseUrl,
      };
    }
  }
}
