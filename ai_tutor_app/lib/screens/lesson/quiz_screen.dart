import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/models/quiz.dart';

class QuizScreen extends StatefulWidget {
  final String? quizId; // nếu truyền vào thì load thẳng quiz đó

  const QuizScreen({super.key, this.quizId});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int? selectedQuizIndex;
  Map<int, int> selectedAnswers = {}; // question index -> selected option index
  List<Quiz> _quizzes = [];
  List<Quiz> _filteredQuizzes = [];
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _errorMessage;
  DateTime? _quizStartTime;

  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }

  Future<void> _loadQuizzes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Nếu có quizId cụ thể → load thẳng 1 quiz
      if (widget.quizId != null) {
        final response = await ApiService.getQuizById(widget.quizId!);
        if (response['success'] == true && response['data'] != null) {
          final quiz = Quiz.fromJson(response['data'] as Map<String, dynamic>);
          setState(() {
            _quizzes = [quiz];
            _filteredQuizzes = [quiz];
            selectedQuizIndex = 0; // tự động chọn quiz duy nhất
            _isLoading = false;
          });
        } else {
          setState(() {
            _errorMessage =
                response['message'] ?? 'Không tải được bài kiểm tra';
            _isLoading = false;
          });
        }
        return;
      }

      final response = await ApiService.getQuizzes();

      if (response['success'] == true && response['data'] != null) {
        // data is now { quizzes: [...], count: N }
        final dataMap = response['data'] as Map<String, dynamic>;
        final quizzesData = dataMap['quizzes'] as List;

        // Đọc grade đã chọn từ SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        final selectedGrade = prefs.getInt('selectedGrade');

        setState(() {
          _quizzes = quizzesData.map((json) => Quiz.fromJson(json)).toList();
          // Lọc theo grade đã chọn, nếu không có thì lấy tất cả
          _filteredQuizzes = selectedGrade != null
              ? _quizzes
                  .where((quiz) => quiz.grade.contains(selectedGrade))
                  .toList()
              : _quizzes;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to load quizzes';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading quizzes: $e';
        _isLoading = false;
      });
    }
  }

  void _onOptionSelected(int questionIdx, int optionIdx) {
    setState(() {
      selectedAnswers[questionIdx] = optionIdx;
    });
  }

  void _showResultDialog(int correct, int total,
      {int? score, String? serverMessage}) {
    final displayScore =
        score ?? (total > 0 ? (correct / total * 100).round() : 0);
    final msg = serverMessage?.isNotEmpty == true
        ? serverMessage!
        : (correct == total ? 'Xuất sắc!' : 'Cố gắng thêm nhé!');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text(
          'Kết quả',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              displayScore >= 70 ? Icons.emoji_events : Icons.check_circle,
              color: displayScore >= 70 ? Colors.amber : Colors.green,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text(
              'Điểm: $displayScore%',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Đúng $correct/$total câu',
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              msg,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bài tập luyện tập'),
        actions: [
          if (selectedQuizIndex != null)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                setState(() {
                  selectedQuizIndex = null;
                  selectedAnswers.clear();
                });
              },
            ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadQuizzes),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline,
                          size: 64, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadQuizzes,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : _filteredQuizzes.isEmpty
                  ? const Center(
                      child: Text(
                        'Không có bài tập nào cho lớp này',
                        style: TextStyle(fontSize: 18),
                      ),
                    )
                  : selectedQuizIndex == null
                      ? ListView.builder(
                          itemCount: _filteredQuizzes
                              .length, // Sử dụng _filteredQuizzes
                          itemBuilder: (context, index) {
                            final quiz = _filteredQuizzes[
                                index]; // Sử dụng _filteredQuizzes
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              child: ListTile(
                                title: Text(
                                  quiz.title,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(quiz.description),
                                    const SizedBox(height: 4),
                                    Wrap(
                                      spacing: 8,
                                      children: [
                                        Chip(
                                          label: Text(quiz.subjectName),
                                          labelStyle:
                                              const TextStyle(fontSize: 12),
                                          materialTapTargetSize:
                                              MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        Chip(
                                          label: Text(
                                              '${quiz.questions.length} câu'),
                                          labelStyle:
                                              const TextStyle(fontSize: 12),
                                          materialTapTargetSize:
                                              MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        Chip(
                                          label: Text(
                                            _getDifficultyText(quiz.difficulty),
                                          ),
                                          labelStyle:
                                              const TextStyle(fontSize: 12),
                                          backgroundColor: _getDifficultyColor(
                                            quiz.difficulty,
                                          ),
                                          materialTapTargetSize:
                                              MaterialTapTargetSize.shrinkWrap,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                trailing: const Icon(Icons.arrow_forward_ios,
                                    size: 16),
                                onTap: () {
                                  setState(() {
                                    selectedQuizIndex = index;
                                    selectedAnswers.clear();
                                    _quizStartTime = DateTime.now();
                                  });
                                },
                              ),
                            );
                          },
                        )
                      : _buildQuizDetail(
                          context,
                          _filteredQuizzes[selectedQuizIndex!],
                        ), // Sử dụng _filteredQuizzes
    );
  }

  String _getDifficultyText(String difficulty) {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty) {
      case 'easy':
        return Colors.green.shade100;
      case 'medium':
        return Colors.orange.shade100;
      case 'hard':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  Widget _buildQuizDetail(BuildContext context, Quiz quiz) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                quiz.title,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                quiz.description,
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: quiz.questions.length,
            itemBuilder: (context, idx) {
              final q = quiz.questions[idx];
              final selected = selectedAnswers[idx];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListTile(
                      title: Text(
                        'Câu ${idx + 1}: ${q.question}',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                    ...List.generate(q.options.length, (optIdx) {
                      return RadioListTile<int>(
                        title: Text(q.options[optIdx]),
                        value: optIdx,
                        groupValue: selected,
                        onChanged: (val) {
                          _onOptionSelected(idx, optIdx);
                        },
                      );
                    }),
                    if (q.explanation != null && selected != null)
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.info_outline, color: Colors.blue[700]),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  q.explanation!,
                                  style: TextStyle(color: Colors.blue[900]),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : () => _submitQuiz(quiz),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Nộp bài'),
                ),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    selectedQuizIndex = null;
                    selectedAnswers.clear();
                  });
                },
                child: const Text('Quay lại'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Future<void> _submitQuiz(Quiz quiz) async {
    setState(() => _isSubmitting = true);

    final timeSpent = _quizStartTime != null
        ? DateTime.now().difference(_quizStartTime!).inSeconds
        : 0;

    // Build answers payload for backend
    final answers = selectedAnswers.entries
        .map((e) => {'questionIndex': e.key, 'selectedAnswer': e.value})
        .toList();

    if (answers.isEmpty) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Hãy chọn ít nhất một đáp án trước khi nộp bài')),
      );
      return;
    }

    final quizId = quiz.id;
    if (quizId == null) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không thể nộp bài: quiz ID bị thiếu')),
      );
      return;
    }

    final response = await ApiService.submitQuiz(
      quizId,
      answers: answers,
      timeSpent: timeSpent,
    );

    setState(() => _isSubmitting = false);

    if (!mounted) return;

    if (response['success'] == true && response['data'] != null) {
      final data = response['data'] as Map<String, dynamic>;
      final score = data['score'] as int? ?? 0;
      final correctCount = data['correctCount'] as int? ?? 0;
      final totalQuestions =
          data['totalQuestions'] as int? ?? quiz.questions.length;
      final message = data['message'] as String? ?? '';
      _showResultDialog(correctCount, totalQuestions,
          score: score, serverMessage: message);
    } else {
      // Fallback: local scoring (e.g. unauthenticated)
      int correct = 0;
      for (int i = 0; i < quiz.questions.length; i++) {
        if (selectedAnswers[i] == quiz.questions[i].answer) correct++;
      }
      _showResultDialog(correct, quiz.questions.length);
    }
  }
}
