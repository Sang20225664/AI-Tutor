import 'package:flutter/material.dart';
import 'package:ai_tutor_app/models/lesson.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'leson_theory_screen.dart';
import 'quiz_screen.dart';

class LessonDetailScreen extends StatelessWidget {
  final Lesson lesson;

  const LessonDetailScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(lesson.title)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.book, color: Colors.blue[700]),
                        const SizedBox(width: 8),
                        Text(
                          lesson.subjectName,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue[700],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      children: [
                        _InfoChip(
                          icon: Icons.signal_cellular_alt,
                          label: lesson.difficultyText,
                          color: _getDifficultyColor(lesson.difficulty),
                        ),
                        const SizedBox(width: 8),
                        _InfoChip(
                          icon: Icons.access_time,
                          label: '${lesson.duration} phút',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (lesson.topics.isNotEmpty) ...[
              const Text(
                'Chủ đề:',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: lesson.topics.map((topic) {
                  return Chip(
                    label: Text(topic),
                    backgroundColor: Colors.blue.shade50,
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],
            const Text(
              'Nội dung:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: MarkdownWidget(
                  data: lesson.content.length > 400
                      ? '${lesson.content.substring(0, 400)}...'
                      : lesson.content,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  config: MarkdownConfig(
                    configs: [
                      PConfig(textStyle: TextStyle(fontSize: 15, height: 1.5)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LessonTheoryScreen(lesson: lesson),
                    ),
                  );
                },
                icon: const Icon(Icons.play_arrow),
                label: const Text('Bắt đầu bài học'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (lesson.id != null)
              SizedBox(
                width: double.infinity,
                child: _GenerateQuizButton(lessonId: lesson.id!),
              ),
          ],
        ),
      ),
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty) {
      case 'beginner':
        return Colors.green.shade100;
      case 'intermediate':
        return Colors.orange.shade100;
      case 'advanced':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;

  const _InfoChip({required this.icon, required this.label, this.color});

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(label),
      backgroundColor: color ?? Colors.grey.shade100,
      labelStyle: const TextStyle(fontSize: 13),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}

class _GenerateQuizButton extends StatefulWidget {
  final String lessonId;

  const _GenerateQuizButton({required this.lessonId});

  @override
  State<_GenerateQuizButton> createState() => _GenerateQuizButtonState();
}

class _GenerateQuizButtonState extends State<_GenerateQuizButton> {
  bool _isLoading = false;

  Future<void> _generateQuiz() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.generateQuiz(
        lessonId: widget.lessonId,
        difficulty: 'medium',
        questionCount: 5,
      );

      if (!mounted) return;

      if (response['success'] == true && response['data'] != null) {
        final quizId = response['data']['_id'];
        if (quizId != null) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => QuizScreen(quizId: quizId),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? 'Lỗi khi tạo quiz AI')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Có lỗi xảy ra: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: _isLoading ? null : _generateQuiz,
      icon: _isLoading
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.auto_awesome),
      label: Text(
          _isLoading ? 'Gợi ý: đang tạo bằng Gemini AI...' : 'Tạo Quiz AI'),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.all(16),
        foregroundColor: Colors.purple[700],
        side: BorderSide(color: Colors.purple[300]!),
      ),
    );
  }
}
