import 'package:flutter/material.dart';

import 'leson_theory_screen.dart';

class LessonDetailScreen extends StatelessWidget {
  final Map<String, String> lesson;

  const LessonDetailScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(lesson['title'] ?? 'Chi tiết bài học')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.network(lesson['image'] ?? '', fit: BoxFit.cover),
            const SizedBox(height: 16),
            Text(
              lesson['title'] ?? '',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(lesson['description'] ?? '', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => LessonTheoryScreen(lesson: lesson)),
                );
              },
              child: const Text('Bat đầu bài học'),
            )
          ],

        ),
      ),
    );
  }
}
