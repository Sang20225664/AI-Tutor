import 'package:flutter/material.dart';
import 'package:ai_tutor_app/models/lesson.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'quiz_screen.dart';

class LessonTheoryScreen extends StatelessWidget {
  final Lesson lesson;

  const LessonTheoryScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: Text('Lý thuyết: ${lesson.title}')),
      body: Column(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: MarkdownWidget(
                data: '# ${lesson.title}\n\n'
                    '*Môn: ${lesson.subjectName} • ${lesson.difficultyText} • ${lesson.duration} phút*\n\n'
                    '---\n\n'
                    '${lesson.content}',
                config: MarkdownConfig(
                  configs: [
                    const PreConfig(),
                    const PConfig(
                        textStyle: TextStyle(fontSize: 16, height: 1.7)),
                    H1Config(
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary,
                      ),
                    ),
                    H2Config(
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: colorScheme.primary,
                      ),
                    ),
                    H3Config(
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
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
