import 'package:flutter/material.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/models/quiz.dart';

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int? selectedQuizIndex;
  Map<int, int> selectedAnswers = {}; // question index -> selected option index
  List<Quiz> _quizzes = [];
  List<Quiz> _filteredQuizzes = []; // Thêm danh sách đã lọc
  bool _isLoading = true;
  String? _errorMessage;

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
      final response = await ApiService.getQuizzes();

      if (response['success'] == true && response['data'] != null) {
        final quizzesData = response['data'] as List;
        setState(() {
          _quizzes = quizzesData.map((json) => Quiz.fromJson(json)).toList();
          // Lọc chỉ lấy quizzes có grade chứa 5
          _filteredQuizzes =
              _quizzes.where((quiz) => quiz.grade.contains(5)).toList();
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

  void _showResultDialog(int correct, int total) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
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
                  correct == total ? Icons.emoji_events : Icons.check_circle,
                  color: correct == total ? Colors.amber : Colors.green,
                  size: 48,
                ),
                const SizedBox(height: 16),
                Text(
                  'Bạn trả lời đúng $correct/$total câu hỏi!',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                  ),
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
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
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
              : _filteredQuizzes
                  .isEmpty // Sử dụng _filteredQuizzes
              ? const Center(
                child: Text(
                  'Không có bài tập nào cho lớp 5',
                  style: TextStyle(fontSize: 18),
                ),
              )
              : selectedQuizIndex == null
              ? ListView.builder(
                itemCount: _filteredQuizzes.length, // Sử dụng _filteredQuizzes
                itemBuilder: (context, index) {
                  final quiz =
                      _filteredQuizzes[index]; // Sử dụng _filteredQuizzes
                  return Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: ListTile(
                      title: Text(
                        quiz.title,
                        style: const TextStyle(fontWeight: FontWeight.bold),
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
                                labelStyle: const TextStyle(fontSize: 12),
                                materialTapTargetSize:
                                    MaterialTapTargetSize.shrinkWrap,
                              ),
                              Chip(
                                label: Text('${quiz.questions.length} câu'),
                                labelStyle: const TextStyle(fontSize: 12),
                                materialTapTargetSize:
                                    MaterialTapTargetSize.shrinkWrap,
                              ),
                              Chip(
                                label: Text(
                                  _getDifficultyText(quiz.difficulty),
                                ),
                                labelStyle: const TextStyle(fontSize: 12),
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
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () {
                        setState(() {
                          selectedQuizIndex = index;
                          selectedAnswers.clear();
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
    int totalQuestions = quiz.questions.length;
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
                  onPressed: () {
                    int correct = 0;
                    for (int i = 0; i < totalQuestions; i++) {
                      if (selectedAnswers[i] != null &&
                          selectedAnswers[i] == quiz.questions[i].answer) {
                        correct++;
                      }
                    }
                    _showResultDialog(correct, totalQuestions);
                  },
                  child: const Text('Nộp bài'),
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
}
