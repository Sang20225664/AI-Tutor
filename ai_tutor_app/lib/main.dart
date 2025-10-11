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

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: isDarkMode ? ThemeData.dark() : ThemeData.light(),
      initialRoute: widget.initialRoute,
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
