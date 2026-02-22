import 'package:ai_tutor_app/screens/profile_screen.dart';
import 'package:ai_tutor_app/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ai_tutor_app/screens/home_screen.dart';
import 'package:ai_tutor_app/screens/select_grade_screen.dart';
import 'package:ai_tutor_app/screens/register_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();

  // Check authentication status
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
  final hasSelectedGrade = prefs.containsKey('selectedGrade');
  final isDarkMode = prefs.getBool('isDarkMode') ?? false;

  // Determine initial route based on auth and grade selection
  String initialRoute;
  if (!isLoggedIn) {
    initialRoute = '/login';
  } else if (!hasSelectedGrade) {
    initialRoute = '/select-grade';
  } else {
    initialRoute = '/home';
  }

  runApp(MyApp(initialRoute: initialRoute, isDarkMode: isDarkMode));
}

class MyApp extends StatefulWidget {
  final String initialRoute;
  final bool isDarkMode;
  const MyApp({
    super.key,
    required this.initialRoute,
    required this.isDarkMode,
  });

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late bool isDarkMode;

  @override
  void initState() {
    super.initState();
    isDarkMode = widget.isDarkMode;
  }

  void toggleDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isDarkMode = !isDarkMode;
    });
    await prefs.setBool('isDarkMode', isDarkMode);
  }

  ThemeData _buildLightTheme() {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: const Color(0xFFF7F9FC),
      appBarTheme: base.appBarTheme.copyWith(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        centerTitle: true,
      ),
      cardTheme: base.cardTheme.copyWith(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(12),
      ),
    );
  }

  ThemeData _buildDarkTheme() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: const Color(0xFF0F172A),
      cardTheme: base.cardTheme.copyWith(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(12),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _buildLightTheme(),
      darkTheme: _buildDarkTheme(),
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      initialRoute: widget.initialRoute,
      // Bọc toàn bộ app trong SelectionArea để user có thể select/copy text
      builder: (context, child) => SelectionArea(child: child ?? const SizedBox()),
      routes: {
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
        '/select-grade': (context) => SelectGradeScreen(),
        '/home': (context) => HomeScreen(),
        '/profile':
            (context) => ProfileScreen(
              toggleDarkMode: toggleDarkMode,
              isDarkMode: isDarkMode,
            ),
      },
    );
  }
}
