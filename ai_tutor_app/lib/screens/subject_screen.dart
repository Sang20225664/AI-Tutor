import 'package:flutter/material.dart';

import '../data/subject_data.dart';
import '../models/subject.dart';

class SubjectSelectionScreen extends StatelessWidget {
  const SubjectSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chọn Môn Học'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.builder(
          itemCount: subjects.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2, // Số cột trong lưới
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.0, // Tỷ lệ khung hình của mỗi thẻ
          ),
          itemBuilder: (context, index) {
            final subject = subjects[index];
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => SubjectDetailScreen(subject: subject),
                  ),
                );
              },
              child: Container(
                decoration: BoxDecoration(
                  color: subject.color.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(subject.icon, size: 48, color: Colors.white),
                    const SizedBox(height: 12),
                    Text(
                      subject.name,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class SubjectDetailScreen extends StatelessWidget {
  final Subject subject;

  const SubjectDetailScreen({super.key, required this.subject});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(subject.name),
      ),
      body: Center(
        child: Text(
          'Chi tiết về môn học ${subject.name}',
          style: const TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}