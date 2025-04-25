import 'dart:convert';

import 'package:http/http.dart' as http;

class ChatService {
  static const String baseUrl = 'http://10.0.2.2:5000/api/chats';

  static Future<Map<String, dynamic>> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'reply': data['reply'] ?? 'Không nhận được phản hồi'
        };
      } else {
        return {
          'success': false,
          'message': 'Lỗi server: ${response.statusCode}'
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Lỗi kết nối API: $e'
      };
    }
  }
}
