import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiService {
  static const String baseUrl = 'http://10.0.2.2:5000';

  // Initialize with the API key from backend
  static late final String _apiKey;

  static void initialize(String apiKey) {
    _apiKey = apiKey;
  }

  /// Generate content using Gemini API
  static Future<String> generateContent({
    required String prompt,
    bool useBackendProxy = true,
  }) async {
    if (useBackendProxy) {
      return _generateViaBackend(prompt);
    } else {
      if (_apiKey.isEmpty) {
        throw Exception('Gemini API Key is not configured');
      }
      return _generateViaSDK(prompt);
    }
  }

  /// Generate content via backend proxy
  static Future<String> _generateViaBackend(String prompt) async {
    try {
      final response = await ApiService.post(
        'api/gemini/generate',
        {'prompt': prompt},
      );

      if (response['success']) {
        return response['response'];
      }
      throw Exception(response['message'] ?? 'Unknown error occurred');
    } catch (e) {
      throw Exception('Backend error: $e');
    }
  }

  /// Generate content directly via Gemini SDK
  static Future<String> _generateViaSDK(String prompt) async {
    try {
      final model = GenerativeModel(
        model: 'gemini-1.5-flash',
        apiKey: _apiKey,
      );

      final response = await model.generateContent([
        Content.text(prompt)
      ]);

      if (response.text != null) {
        return response.text!;
      }

      throw Exception(
          response.promptFeedback?.blockReasonMessage ??
              'No content generated'
      );
    } on GenerativeAIException catch (e) {
      throw Exception('Gemini API error: ${e.message}');
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  /// Chat with AI using streaming response
  static Stream<String> chatWithAI({
    required String prompt,
    required String subject,
  }) async* {
    try {
      final response = await ApiService.post(
        'api/chats',
        {
          'message': prompt,
          'subject': subject,
        },
      );

      if (response['success']) {
        yield response['response'];
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      throw Exception('Chat error: $e');
    }
  }
}