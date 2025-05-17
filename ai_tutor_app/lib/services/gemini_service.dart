
import 'dart:convert';

import 'package:http/http.dart';
import 'package:http/http.dart' as http;

class GeminiService {
  static const String _baseUrl = 'https://your-backend-domain.com/api';
  final _client = http.Client();

  Future<StreamedResponse> chatWithAI({
    required String prompt,
    required String subject,
    required String token,
  }) async {
    final request = http.Request(
      'POST',
      Uri.parse('$_baseUrl/chat'),
    )..headers.addAll({
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    })..body = jsonEncode({
      'prompt': prompt,
      'subject': subject,
    });

    return _client.send(request);
  }
}