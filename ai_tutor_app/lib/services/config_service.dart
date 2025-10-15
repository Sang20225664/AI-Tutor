import 'package:flutter/foundation.dart';
import 'dart:io';

class ConfigService {
  static String get backendUrl {
    // In Docker container, backend is accessible via service name
    if (kIsWeb) {
      // For web, use the same host but different port
      return 'http://localhost:5000';
    }
    if (!kIsWeb && Platform.isAndroid) {
      // For mobile emulator
      return 'http://10.0.2.2:5000';
    }
    return 'http://localhost:5000';
  }

  static bool get isDebugMode => kDebugMode;
  static bool get isWeb => kIsWeb;
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;

  static const Duration defaultTimeout = Duration(seconds: 30);
  static const String appName = 'AI Tutor';
  static const String version = '1.0.0';
}
