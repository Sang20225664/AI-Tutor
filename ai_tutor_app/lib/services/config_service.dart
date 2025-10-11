import 'package:flutter/foundation.dart';
import 'dart:io';

class ConfigService {
  static String get backendUrl {
    if (kIsWeb) return 'http://127.0.0.1:5000';
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:5000';
    return 'http://localhost:5000';
  }

  static bool get isDebugMode => kDebugMode;
  static bool get isWeb => kIsWeb;
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;

  static const Duration defaultTimeout = Duration(seconds: 30);
  static const String appName = 'AI Tutor';
  static const String version = '1.0.0';
}
