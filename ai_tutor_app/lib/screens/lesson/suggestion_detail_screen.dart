import 'package:flutter/material.dart';
import 'package:ai_tutor_app/models/lesson_suggestion.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

class SuggestionDetailScreen extends StatelessWidget {
  final LessonSuggestion suggestion;

  const SuggestionDetailScreen({super.key, required this.suggestion});

  @override
  Widget build(BuildContext context) {
    final themeColor = suggestion.backgroundColor;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết gợi ý'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Responsive.constrainedContent(
        context,
        SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      themeColor.withOpacity(0.15),
                      themeColor.withOpacity(0.05),
                    ],
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: themeColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        _getIconData(suggestion.icon),
                        size: 48,
                        color: themeColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      suggestion.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      suggestion.subjectName,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Info chips
              Row(
                children: [
                  Expanded(
                    child: _buildInfoCard(
                      Icons.signal_cellular_alt,
                      'Độ khó',
                      suggestion.difficultyText,
                      _getDifficultyColor(suggestion.difficulty),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildInfoCard(
                      Icons.access_time,
                      'Thời lượng',
                      '${suggestion.duration} phút',
                      Colors.blue.shade50,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Description
              const Text(
                'Mô tả',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Text(
                  suggestion.description,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.grey[800],
                    height: 1.6,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Topics
              if (suggestion.topics.isNotEmpty) ...[
                const Text(
                  'Chủ đề liên quan',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: suggestion.topics.map((topic) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: themeColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: themeColor.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.circle, size: 8, color: themeColor),
                          const SizedBox(width: 8),
                          Text(
                            topic,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[800],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 32),
              ],

              // AI badge
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.purple.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.auto_awesome, size: 18, color: Colors.purple[400]),
                    const SizedBox(width: 8),
                    Text(
                      'Gợi ý được tạo bởi AI dựa trên kết quả học tập của bạn',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.purple[600],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(
      IconData icon, String label, String value, Color bgColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 28, color: Colors.grey[700]),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'calculate':
        return Icons.calculate;
      case 'book':
        return Icons.book;
      case 'language':
        return Icons.language;
      case 'public':
        return Icons.public;
      case 'history':
        return Icons.history_edu;
      case 'science':
        return Icons.science;
      case 'computer':
        return Icons.computer;
      case 'favorite':
        return Icons.favorite;
      case 'star':
        return Icons.star;
      case 'school':
        return Icons.school;
      default:
        return Icons.lightbulb;
    }
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty) {
      case 'beginner':
        return Colors.green.shade50;
      case 'intermediate':
        return Colors.orange.shade50;
      case 'advanced':
        return Colors.red.shade50;
      default:
        return Colors.grey.shade50;
    }
  }
}
