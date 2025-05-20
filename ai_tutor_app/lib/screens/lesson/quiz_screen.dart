import 'package:flutter/material.dart';

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _selectedIndex = -1;
  bool _submitted = false;
  final int _correctIndex = 2; // Đáp án đúng (ví dụ)

  final List<String> _answers = [
    'Hệ điều hành',
    'Cấu trúc dữ liệu',
    'Trí tuệ nhân tạo',
    'Lập trình hướng đối tượng',
  ];

  void _submitAnswer() {
    if (_selectedIndex == -1) return;

    setState(() {
      _submitted = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bài tập trắc nghiệm')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Câu hỏi: Lĩnh vực nào liên quan đến việc mô phỏng tư duy con người?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            for (int i = 0; i < _answers.length; i++)
              ListTile(
                title: Text(_answers[i]),
                leading: Radio<int>(
                  value: i,
                  groupValue: _selectedIndex,
                  onChanged: _submitted
                      ? null
                      : (value) {
                    setState(() {
                      _selectedIndex = value!;
                    });
                  },
                ),
              ),
            const SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                onPressed: _submitted ? null : _submitAnswer,
                child: const Text('Nộp bài'),
              ),
            ),
            const SizedBox(height: 16),
            if (_submitted)
              Center(
                child: Text(
                  _selectedIndex == _correctIndex
                      ? '✅ Chính xác!'
                      : '❌ Sai rồi. Đáp án đúng là: ${_answers[_correctIndex]}',
                  style: TextStyle(
                    fontSize: 20,
                    color: _selectedIndex == _correctIndex ? Colors.green : Colors.red,
                  ),
                ),
              )
          ],
        ),
      ),
    );
  }
}
