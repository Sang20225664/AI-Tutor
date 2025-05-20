import 'package:ai_tutor_app/screens/profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ai_tutor_app/screens/home_screen.dart';
import 'package:ai_tutor_app/screens/select_grade_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final hasSelectedGrade = prefs.containsKey('selectedGrade');
  final isDarkMode = prefs.getBool('isDarkMode') ?? false;

  runApp(
    MyApp(
      initialRoute: hasSelectedGrade ? '/home' : '/select-grade',
      isDarkMode: isDarkMode,
    ),
  );
}

class MyApp extends StatefulWidget {
  final String initialRoute;
  final bool isDarkMode;
  MyApp({required this.initialRoute, required this.isDarkMode});

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
    prefs.setBool('isDarkMode', isDarkMode);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: isDarkMode ? ThemeData.dark() : ThemeData.light(),
      initialRoute: widget.initialRoute,
      routes: {
        '/home': (context) => HomeScreen(),
        '/select-grade': (context) => SelectGradeScreen(),
        '/profile': (context) => ProfileScreen(toggleDarkMode: toggleDarkMode),
      },
    );
  }
}
