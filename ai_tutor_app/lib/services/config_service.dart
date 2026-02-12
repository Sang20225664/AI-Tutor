import 'package:flutter/foundation.dart';
import 'dart:io';

class ConfigService {
  static String get backendUrl {
    // In Docker container, backend is accessible via service name
    if (kIsWeb) {
      // Local development on Web: Point to localhost:5000 directly
      if (kDebugMode) {
        return 'http://localhost:5000/api';
      }
      // Production Web (behind Nginx): Use relative path
      return '/api';
    }
    if (!kIsWeb && Platform.isAndroid) {
      // For mobile emulator
      return 'http://10.0.2.2:5000/api';
    }
    // Default for iOS emulator or local testing
    return 'http://localhost:5000/api';
  }

  static bool get isDebugMode => kDebugMode;
  static bool get isWeb => kIsWeb;
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;

  static const Duration defaultTimeout = Duration(seconds: 30);
  static const String appName = 'AI Tutor';
  static const String version = '1.0.0';
}
