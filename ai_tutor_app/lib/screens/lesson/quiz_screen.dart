import 'package:flutter/material.dart';
import 'package:ai_tutor_app/data/quiz_data.dart'; // Import your quiz data

class QuizScreen extends StatefulWidget {
  const QuizScreen({Key? key}) : super(key: key);

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int? selectedQuizIndex;
  Map<int, int> selectedAnswers = {}; // question index -> selected option index

  void _onOptionSelected(int questionIdx, int optionIdx) {
    setState(() {
      selectedAnswers[questionIdx] = optionIdx;
    });
  }

  void _showResultDialog(int correct, int total) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Kết quả', style: TextStyle(fontWeight: FontWeight.bold)),
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
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
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
      ),
      body: selectedQuizIndex == null
          ? ListView.builder(
              itemCount: quizList.length,
              itemBuilder: (context, index) {
                final quiz = quizList[index];
                return Card(
                  child: ListTile(
                    title: Text(quiz['title'] ?? ''),
                    subtitle: Text(quiz['description'] ?? ''),
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
          : _buildQuizDetail(context, quizList[selectedQuizIndex!]),
    );
  }

  Widget _buildQuizDetail(BuildContext context, Map<String, dynamic> quiz) {
    int totalQuestions = quiz['questions'].length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            quiz['title'] ?? '',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: quiz['questions'].length,
            itemBuilder: (context, idx) {
              final q = quiz['questions'][idx];
              final selected = selectedAnswers[idx];
              return Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListTile(
                      title: Text(q['question'] ?? ''),
                    ),
                    ...List.generate(q['options'].length, (optIdx) {
                      return RadioListTile<int>(
                        title: Text(q['options'][optIdx]),
                        value: optIdx,
                        groupValue: selected,
                        onChanged: (val) {
                          _onOptionSelected(idx, optIdx);
                        },
                      );
                    }),
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
                      if (selectedAnswers[i] != null && selectedAnswers[i] == quiz['questions'][i]['answer']) {
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

