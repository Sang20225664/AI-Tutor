import 'package:flutter/material.dart';
import 'package:ai_tutor_app/models/lesson.dart';
import 'quiz_screen.dart';

class LessonTheoryScreen extends StatelessWidget {
  final Lesson lesson;

  const LessonTheoryScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Lý thuyết: ${lesson.title}')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lesson.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Môn: ${lesson.subjectName} • ${lesson.difficultyText} • ${lesson.duration} phút',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                  const Divider(height: 32),
                  Text(
                    lesson.content,
                    style: const TextStyle(fontSize: 16, height: 1.6),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const QuizScreen()),
                    );
                  },
                  icon: const Icon(Icons.quiz),
                  label: const Text('Làm bài tập'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
