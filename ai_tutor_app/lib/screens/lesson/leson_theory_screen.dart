import 'package:flutter/material.dart';
import 'quiz_screen.dart'; // màn quiz sau lý thuyết

class LessonTheoryScreen extends StatelessWidget {
  final Map<String, String> lesson;

  const LessonTheoryScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Lý thuyết: ${lesson['title']}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lesson['title'] ?? '',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const SingleChildScrollView(
              child: Text(
                'Đây là nội dung lý thuyết mẫu cho bài học. ',
                style: TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 24),
            Center(
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const QuizScreen()),
                  );
                },
                icon: const Icon(Icons.quiz),
                label: const Text('Làm bài tập'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}