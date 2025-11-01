import 'package:flutter/material.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/models/lesson_suggestion.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LessonSuggestionScreen extends StatefulWidget {
  const LessonSuggestionScreen({super.key});

  @override
  State<LessonSuggestionScreen> createState() => _LessonSuggestionScreenState();
}

class _LessonSuggestionScreenState extends State<LessonSuggestionScreen> {
  List<LessonSuggestion> _suggestions = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _selectedGrade = 5; // Default grade

  @override
  void initState() {
    super.initState();
    _loadSelectedGrade();
  }

  Future<void> _loadSelectedGrade() async {
    final prefs = await SharedPreferences.getInstance();
    final grade = prefs.getInt('selectedGrade') ?? 5;
    setState(() {
      _selectedGrade = grade;
    });
    _loadSuggestions();
  }

  Future<void> _loadSuggestions() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await ApiService.getLessonSuggestions(
        grade: _selectedGrade,
      );

      if (response['success'] == true && response['data'] != null) {
        final suggestionsData = response['data'] as List;
        setState(() {
          _suggestions =
              suggestionsData
                  .map((json) => LessonSuggestion.fromJson(json))
                  .toList();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to load suggestions';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading suggestions: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Gợi ý bài học - Lớp $_selectedGrade'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSuggestions,
          ),
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
                      onPressed: _loadSuggestions,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Thử lại'),
                    ),
                  ],
                ),
              )
              : _suggestions.isEmpty
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.lightbulb_outline,
                      size: 64,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Chưa có gợi ý bài học cho lớp $_selectedGrade',
                      style: const TextStyle(fontSize: 18),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
              : Responsive.constrainedContent(
                context,
                ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _suggestions.length,
                  itemBuilder: (context, index) {
                    final suggestion = _suggestions[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {
                          // TODO: Navigate to suggestion detail or lessons
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Chi tiết: ${suggestion.title}'),
                            ),
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                suggestion.backgroundColor.withOpacity(0.1),
                                suggestion.backgroundColor.withOpacity(0.05),
                              ],
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: suggestion.backgroundColor
                                            .withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        _getIconData(suggestion.icon),
                                        size: 28,
                                        color: suggestion.backgroundColor,
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            suggestion.title,
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            suggestion.subjectName,
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  suggestion.description,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[700],
                                    height: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    _buildChip(
                                      Icons.signal_cellular_alt,
                                      suggestion.difficultyText,
                                      _getDifficultyColor(
                                        suggestion.difficulty,
                                      ),
                                    ),
                                    _buildChip(
                                      Icons.access_time,
                                      '${suggestion.duration} phút',
                                      Colors.blue.shade100,
                                    ),
                                    if (suggestion.topics.isNotEmpty)
                                      _buildChip(
                                        Icons.topic,
                                        '${suggestion.topics.length} chủ đề',
                                        Colors.purple.shade100,
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
    );
  }

  Widget _buildChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[700]),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[800],
              fontWeight: FontWeight.w500,
            ),
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
