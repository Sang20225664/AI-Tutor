import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../models/subject.dart';
import '../../models/lesson.dart';
import '../../models/quiz.dart';
import '../../services/api_service.dart';
import '../lesson/lesson_detail_screen.dart';
import '../lesson/quiz_screen.dart';
import '../chat/ai_chat_screen.dart';

class SubjectDetailScreen extends StatefulWidget {
  final Subject subject;

  const SubjectDetailScreen({super.key, required this.subject});

  @override
  State<SubjectDetailScreen> createState() => _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends State<SubjectDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  List<Lesson> _lessons = [];
  List<Quiz> _quizzes = [];
  bool _isLoadingLessons = true;
  bool _isLoadingQuizzes = true;
  String? _lessonError;
  String? _quizError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadLessons();
    _loadQuizzes();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadLessons() async {
    setState(() {
      _isLoadingLessons = true;
      _lessonError = null;
    });
    try {
      final response =
          await ApiService.getLessons(subjectId: widget.subject.id);
      if (response['success'] == true && response['data'] != null) {
        final data = response['data'];
        final List raw =
            data is Map ? (data['lessons'] ?? data) : data as List;
        setState(() {
          _lessons = raw
              .map((j) => Lesson.fromJson(j as Map<String, dynamic>))
              .toList();
          _isLoadingLessons = false;
        });
      } else {
        setState(() {
          _lessonError = response['message'] ?? 'Không tải được bài học';
          _isLoadingLessons = false;
        });
      }
    } catch (e) {
      setState(() {
        _lessonError = 'Lỗi: $e';
        _isLoadingLessons = false;
      });
    }
  }

  Future<void> _loadQuizzes() async {
    setState(() {
      _isLoadingQuizzes = true;
      _quizError = null;
    });
    try {
      final response =
          await ApiService.getQuizzes(subjectId: widget.subject.id);
      if (response['success'] == true && response['data'] != null) {
        final data = response['data'];
        final List raw =
            data is Map ? (data['quizzes'] ?? data) : data as List;
        setState(() {
          _quizzes = raw
              .map((j) => Quiz.fromJson(j as Map<String, dynamic>))
              .toList();
          _isLoadingQuizzes = false;
        });
      } else {
        setState(() {
          _quizError = response['message'] ?? 'Không tải được bài kiểm tra';
          _isLoadingQuizzes = false;
        });
      }
    } catch (e) {
      setState(() {
        _quizError = 'Lỗi: $e';
        _isLoadingQuizzes = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.subject.color;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.subject.name),
        backgroundColor: color,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light.copyWith(
          statusBarColor: color,
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: [
            Tab(
              icon: const Icon(Icons.menu_book),
              text: 'Bài học (${_isLoadingLessons ? "..." : _lessons.length})',
            ),
            Tab(
              icon: const Icon(Icons.quiz),
              text: 'Kiểm tra (${_isLoadingQuizzes ? "..." : _quizzes.length})',
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.smart_toy_outlined),
            tooltip: 'Chat với AI',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => AIChatScreen(subject: widget.subject),
                ),
              );
            },
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLessonsTab(color),
          _buildQuizzesTab(color),
        ],
      ),
    );
  }

  Widget _buildLessonsTab(Color color) {
    if (_isLoadingLessons) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_lessonError != null) {
      return _buildError(_lessonError!, _loadLessons, color);
    }
    if (_lessons.isEmpty) {
      return _buildEmpty('Chưa có bài học nào', Icons.menu_book_outlined);
    }

    return RefreshIndicator(
      onRefresh: _loadLessons,
      color: color,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        itemCount: _lessons.length,
        itemBuilder: (context, index) {
          final lesson = _lessons[index];
          return _LessonCard(
            lesson: lesson,
            color: color,
            index: index + 1,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => LessonDetailScreen(lesson: lesson),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildQuizzesTab(Color color) {
    if (_isLoadingQuizzes) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_quizError != null) {
      return _buildError(_quizError!, _loadQuizzes, color);
    }
    if (_quizzes.isEmpty) {
      return _buildEmpty('Chưa có bài kiểm tra nào', Icons.quiz_outlined);
    }

    return RefreshIndicator(
      onRefresh: _loadQuizzes,
      color: color,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        itemCount: _quizzes.length,
        itemBuilder: (context, index) {
          final quiz = _quizzes[index];
          return _QuizCard(
            quiz: quiz,
            color: color,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => QuizScreen(quizId: quiz.id!),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildError(String msg, VoidCallback retry, Color color) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 60, color: Colors.red[300]),
          const SizedBox(height: 12),
          Text(msg, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: retry,
            icon: const Icon(Icons.refresh),
            label: const Text('Thử lại'),
            style: ElevatedButton.styleFrom(backgroundColor: color),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(String msg, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 60, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(msg, style: const TextStyle(fontSize: 16, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _LessonCard extends StatelessWidget {
  final Lesson lesson;
  final Color color;
  final int index;
  final VoidCallback onTap;

  const _LessonCard({
    required this.lesson,
    required this.color,
    required this.index,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 5),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '$index',
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lesson.title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _MiniChip(
                          label: lesson.difficultyText,
                          color: _difficultyColor(lesson.difficulty),
                        ),
                        const SizedBox(width: 6),
                        _MiniChip(
                          label: '${lesson.duration} phút',
                          color: Colors.blueGrey,
                          icon: Icons.access_time,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }

  Color _difficultyColor(String d) {
    switch (d) {
      case 'beginner':
        return Colors.green;
      case 'intermediate':
        return Colors.orange;
      case 'advanced':
        return Colors.red;
      default:
        return Colors.blueGrey;
    }
  }
}

class _QuizCard extends StatelessWidget {
  final Quiz quiz;
  final Color color;
  final VoidCallback onTap;

  const _QuizCard({
    required this.quiz,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 5),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.quiz, color: color, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quiz.title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _MiniChip(
                          label: '${quiz.questions.length} câu',
                          color: Colors.blueGrey,
                          icon: Icons.help_outline,
                        ),
                        const SizedBox(width: 6),
                        _MiniChip(
                          label: _difficultyText(quiz.difficulty),
                          color: _difficultyColor(quiz.difficulty),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Icon(Icons.play_circle_outline, color: color, size: 28),
            ],
          ),
        ),
      ),
    );
  }

  String _difficultyText(String d) {
    switch (d) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return d;
    }
  }

  Color _difficultyColor(String d) {
    switch (d) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      default:
        return Colors.blueGrey;
    }
  }
}

class _MiniChip extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;

  const _MiniChip({required this.label, required this.color, this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
