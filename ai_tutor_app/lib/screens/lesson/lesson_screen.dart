import 'package:flutter/material.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/models/lesson_suggestion.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
import 'package:ai_tutor_app/screens/lesson/suggestion_detail_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LessonSuggestionScreen extends StatefulWidget {
  const LessonSuggestionScreen({super.key});

  @override
  State<LessonSuggestionScreen> createState() => _LessonSuggestionScreenState();
}

class _LessonSuggestionScreenState extends State<LessonSuggestionScreen> {
  List<LessonSuggestion> _staticSuggestions = [];
  List<LessonSuggestion> _aiSuggestions = [];
  bool _isLoading = true;
  bool _isGeneratingAI = false;
  String? _errorMessage;
  int _selectedGrade = 5;

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
    _loadAllSuggestions();
  }

  Future<void> _loadAllSuggestions() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Load static suggestions and saved AI suggestions in parallel
      final results = await Future.wait([
        ApiService.getLessonSuggestions(grade: _selectedGrade),
        ApiService.getAiSuggestions(),
      ]);

      final staticResponse = results[0];
      final aiResponse = results[1];

      List<LessonSuggestion> staticList = [];
      List<LessonSuggestion> aiList = [];

      if (staticResponse['success'] == true && staticResponse['data'] != null) {
        staticList = (staticResponse['data'] as List)
            .map((json) => LessonSuggestion.fromJson(json))
            .toList();
      }

      if (aiResponse['success'] == true && aiResponse['data'] != null) {
        aiList = (aiResponse['data'] as List)
            .map((json) => LessonSuggestion.fromJson(json))
            .toList();
      }

      setState(() {
        _staticSuggestions = staticList;
        _aiSuggestions = aiList;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading suggestions: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _generateAISuggestions() async {
    setState(() {
      _isGeneratingAI = true;
      _errorMessage = null;
    });

    try {
      final response = await ApiService.suggestLessons(
        grade: _selectedGrade,
      );

      if (response['success'] == true && response['data'] != null) {
        final newSuggestions = (response['data'] as List)
            .map((json) => LessonSuggestion.fromJson(json))
            .toList();
        setState(() {
          // Prepend new suggestions to the top
          _aiSuggestions = [...newSuggestions, ..._aiSuggestions];
          _isGeneratingAI = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đã tạo ${newSuggestions.length} gợi ý mới từ AI!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Lỗi khi tạo từ AI';
          _isGeneratingAI = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối AI: $e';
        _isGeneratingAI = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final allSuggestions = [..._aiSuggestions, ..._staticSuggestions];

    return Scaffold(
      appBar: AppBar(
        title: Text('Gợi ý bài học - Lớp $_selectedGrade'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAllSuggestions,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null && allSuggestions.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline,
                          size: 64, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadAllSuggestions,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : allSuggestions.isEmpty
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
                            'Chưa có gợi ý bài học cho lớp $_selectedGrade\nBấm nút bên dưới để AI tạo gợi ý cho bạn!',
                            style: const TextStyle(fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  : Responsive.constrainedContent(
                      context,
                      _buildSuggestionList(allSuggestions),
                    ),
      floatingActionButton: _isLoading
          ? null
          : _isGeneratingAI
              ? FloatingActionButton.extended(
                  onPressed: null,
                  icon: const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  ),
                  label: const Text('Đang tạo...'),
                  backgroundColor: Colors.grey,
                  foregroundColor: Colors.white,
                )
              : FloatingActionButton.extended(
                  onPressed: _generateAISuggestions,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('AI Gợi ý Cá nhân'),
                  backgroundColor: Colors.purple,
                  foregroundColor: Colors.white,
                ),
    );
  }

  Widget _buildSuggestionList(List<LessonSuggestion> suggestions) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: suggestions.length + (_aiSuggestions.isNotEmpty && _staticSuggestions.isNotEmpty ? 2 : (_aiSuggestions.isNotEmpty || _staticSuggestions.isNotEmpty ? 1 : 0)),
      itemBuilder: (context, index) {
        // Section headers
        if (_aiSuggestions.isNotEmpty && index == 0) {
          return _buildSectionHeader('✨ Gợi ý từ AI', Colors.purple);
        }

        int aiOffset = _aiSuggestions.isNotEmpty ? 1 : 0;
        if (index < _aiSuggestions.length + aiOffset) {
          return _buildSuggestionCard(suggestions[index - aiOffset], isAi: true);
        }

        if (_staticSuggestions.isNotEmpty && index == _aiSuggestions.length + aiOffset) {
          return _buildSectionHeader('📚 Gợi ý có sẵn', Colors.blue);
        }

        int staticOffset = aiOffset + (_staticSuggestions.isNotEmpty ? 1 : 0);
        int suggestionIndex = index - staticOffset;
        if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
          return _buildSuggestionCard(suggestions[suggestionIndex]);
        }

        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 4),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 24,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionCard(LessonSuggestion suggestion, {bool isAi = false}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  SuggestionDetailScreen(suggestion: suggestion),
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
                        color: suggestion.backgroundColor.withOpacity(0.2),
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
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  suggestion.title,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              if (isAi)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.purple.shade100,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'AI',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.purple,
                                    ),
                                  ),
                                ),
                            ],
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
                    const Icon(Icons.chevron_right, color: Colors.grey),
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
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildChip(
                      Icons.signal_cellular_alt,
                      suggestion.difficultyText,
                      _getDifficultyColor(suggestion.difficulty),
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
