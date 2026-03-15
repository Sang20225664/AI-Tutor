import 'package:flutter/material.dart';
import 'package:ai_tutor_app/models/lesson.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import '../flashcard/flashcard_screen.dart';
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
            if (lesson.id != null) ...[
              const SizedBox(height: 24),
              const Row(
                children: [
                  Icon(Icons.auto_awesome, color: Colors.purple, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'AI Personalization',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.purple),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _AiActionButtons(lesson: lesson),
            ]
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

class _AiActionButtons extends StatefulWidget {
  final Lesson lesson;

  const _AiActionButtons({required this.lesson});

  @override
  State<_AiActionButtons> createState() => _AiActionButtonsState();
}

class _AiActionButtonsState extends State<_AiActionButtons> {
  bool _isLoadingQuiz = false;
  bool _isLoadingAdaptive = false;
  bool _isLoadingFlashcards = false;
  bool _isLoadingSummary = false;

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _generateQuiz() async {
    setState(() => _isLoadingQuiz = true);
    try {
      final response = await ApiService.generateQuiz(lessonId: widget.lesson.id!);
      if (!mounted) return;
      if (response['success'] == true && response['data'] != null) {
        final quizId = response['data']['_id'];
        if (quizId != null) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => QuizScreen(quizId: quizId)),
          );
        }
      } else {
        _showError(response['message'] ?? 'Lỗi khi tạo quiz AI');
      }
    } catch (e) {
      _showError('Có lỗi xảy ra: $e');
    } finally {
      if (mounted) setState(() => _isLoadingQuiz = false);
    }
  }

  Future<void> _generateAdaptiveQuiz() async {
    setState(() => _isLoadingAdaptive = true);
    try {
      final response = await ApiService.generateAdaptiveQuiz();
      if (!mounted) return;
      
      if (response['success'] == true && response['data'] != null) {
        // If data is empty list, it means no weak topics
        if (response['data'] is List && (response['data'] as List).isEmpty) {
          _showError(response['message'] ?? 'Bạn đang rất tốt, không có chủ đề yếu nào!');
          return;
        }

        final quizId = response['data']['_id'];
        if (quizId != null) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => QuizScreen(quizId: quizId)),
          );
        }
      } else {
        _showError(response['message'] ?? 'Lỗi khi tạo adaptive quiz AI');
      }
    } catch (e) {
      _showError('Có lỗi xảy ra: $e');
    } finally {
      if (mounted) setState(() => _isLoadingAdaptive = false);
    }
  }

  Future<void> _generateFlashcards() async {
    setState(() => _isLoadingFlashcards = true);
    try {
      final response = await ApiService.generateFlashcards(lessonId: widget.lesson.id!);
      if (!mounted) return;
      
      if (response['success'] == true && response['data'] != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => FlashcardScreen(
              lesson: widget.lesson,
              flashcardsData: response['data'],
            ),
          ),
        );
      } else {
        _showError(response['message'] ?? 'Lỗi khi tạo flashcards');
      }
    } catch (e) {
      _showError('Có lỗi xảy ra: $e');
    } finally {
      if (mounted) setState(() => _isLoadingFlashcards = false);
    }
  }

  Future<void> _generateSummary() async {
    setState(() => _isLoadingSummary = true);
    try {
      final response = await ApiService.summarizeLesson(lessonId: widget.lesson.id!);
      if (!mounted) return;
      
      if (response['success'] == true && response['data'] != null) {
        final summaryList = List<String>.from(response['data']['summary'] ?? []);
        _showSummaryBottomSheet(summaryList);
      } else {
        _showError(response['message'] ?? 'Lỗi khi tóm tắt');
      }
    } catch (e) {
      _showError('Có lỗi xảy ra: $e');
    } finally {
      if (mounted) setState(() => _isLoadingSummary = false);
    }
  }

  void _showSummaryBottomSheet(List<String> summaryPoints) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: Colors.purple),
                    const SizedBox(width: 8),
                    const Text('AI Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView.separated(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: summaryPoints.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('•', style: TextStyle(fontSize: 18, color: Colors.purple, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            summaryPoints[index],
                            style: const TextStyle(fontSize: 15, height: 1.5),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required String title,
    required IconData icon,
    required VoidCallback onPressed,
    required bool isLoading,
    required Color color,
  }) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: isLoading ? null : onPressed,
        icon: isLoading
            ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: color))
            : Icon(icon, color: color),
        label: Text(
          isLoading ? 'Đang xử lý...' : title,
          style: TextStyle(color: color, fontWeight: FontWeight.bold),
        ),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          side: BorderSide(color: color.withOpacity(0.5)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: color.withOpacity(0.05),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildActionButton(
          title: 'Tạo Quiz AI',
          icon: Icons.quiz,
          isLoading: _isLoadingQuiz,
          color: Colors.blue[700]!,
          onPressed: _generateQuiz,
        ),
        const SizedBox(height: 12),
        _buildActionButton(
          title: 'Luyện tập phần yếu',
          icon: Icons.fitness_center,
          isLoading: _isLoadingAdaptive,
          color: Colors.orange[700]!,
          onPressed: _generateAdaptiveQuiz,
        ),
        const SizedBox(height: 12),
        _buildActionButton(
          title: 'Flashcards',
          icon: Icons.style,
          isLoading: _isLoadingFlashcards,
          color: Colors.green[700]!,
          onPressed: _generateFlashcards,
        ),
        const SizedBox(height: 12),
        _buildActionButton(
          title: 'Tóm tắt bài học',
          icon: Icons.summarize,
          isLoading: _isLoadingSummary,
          color: Colors.purple[700]!,
          onPressed: _generateSummary,
        ),
      ],
    );
  }
}
