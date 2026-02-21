import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/screens/chat/ai_chat_screen.dart';

import '../../models/subject.dart';
import 'subject_detail_screen.dart';

class SubjectsScreen extends StatefulWidget {
  const SubjectsScreen({super.key});

  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  final Map<String, bool> _selectedSubjects = {};
  List<Subject> _subjects = [];
  bool _isLoading = true;
  String? _errorMessage;
  int? _selectedGrade;

  @override
  void initState() {
    super.initState();
    _loadSubjects();
  }

  Future<void> _loadSubjects() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Đọc grade đã chọn từ SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final grade = prefs.getInt('selectedGrade');
      _selectedGrade = grade;

      // Gọi API với grade filter
      final response = await ApiService.getSubjects(grade: grade);

      if (response['success'] == true && response['data'] != null) {
        final subjectsData = response['data'] as List;
        setState(() {
          _subjects =
              subjectsData.map((json) => Subject.fromJson(json)).toList();
          for (var subject in _subjects) {
            _selectedSubjects[subject.name] = false;
          }
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to load subjects';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading subjects: $e';
        _isLoading = false;
      });
    }
  }

  void _onSubjectSelected(Subject subject, BuildContext context) {
    setState(() {
      _selectedSubjects[subject.name] = true;
    });

    // Hiệu ứng và chuyển màn hình
    SchedulerBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 300), () {
        Navigator.push(
          context,
          PageRouteBuilder(
            transitionDuration: const Duration(milliseconds: 500),
            pageBuilder: (_, __, ___) => SubjectDetailScreen(subject: subject),
            transitionsBuilder: (_, animation, __, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        ).then((_) {
          setState(() {
            _selectedSubjects[subject.name] = false;
          });
        });
      });
    });
  }

  void _openChat(Subject subject, BuildContext context) {
    setState(() {
      _selectedSubjects[subject.name] = true;
    });

    SchedulerBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 300), () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => AIChatScreen(subject: subject), // pass full Subject
          ),
        ).then((_) {
          setState(() {
            _selectedSubjects[subject.name] = false;
          });
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final gridColumns = Responsive.getGridColumns(
      context,
      mobile: 2,
      tablet: 3,
      desktop: 4,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedGrade != null
            ? 'Môn Học Lớp $_selectedGrade'
            : 'Chọn Môn Học'),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _subjects.isEmpty
                ? null
                : () {
                    showSearch(
                      context: context,
                      delegate: SubjectSearchDelegate(subjects: _subjects),
                    );
                  },
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadSubjects),
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
                        onPressed: _loadSubjects,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : _subjects.isEmpty
                  ? Center(
                      child: Text(
                        _selectedGrade != null
                            ? 'Không có môn học nào cho lớp $_selectedGrade'
                            : 'Không có môn học nào',
                        style: const TextStyle(fontSize: 18),
                      ),
                    )
                  : Responsive.constrainedContent(
                      context,
                      Padding(
                        padding: Responsive.getScreenPadding(context),
                        child: GridView.builder(
                          itemCount: _subjects.length,
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: gridColumns,
                            crossAxisSpacing: Responsive.getValue(
                              context,
                              mobile: 16,
                              tablet: 20,
                              desktop: 24,
                            ),
                            mainAxisSpacing: Responsive.getValue(
                              context,
                              mobile: 16,
                              tablet: 20,
                              desktop: 24,
                            ),
                            childAspectRatio: Responsive.getValue(
                              context,
                              mobile: 1.2,
                              tablet: 1.25,
                              desktop: 1.3,
                            ),
                          ),
                          itemBuilder: (context, index) {
                            final subject = _subjects[index];
                            final isSelected =
                                _selectedSubjects[subject.name] ?? false;

                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              transform: Matrix4.identity()
                                ..scale(isSelected ? 0.95 : 1.0),
                              child: Card(
                                elevation: 4,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  side: isSelected
                                      ? BorderSide(
                                          color: subject.color, width: 3)
                                      : BorderSide.none,
                                ),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: () =>
                                      _onSubjectSelected(subject, context),
                                  splashColor: subject.color.withOpacity(0.2),
                                  highlightColor:
                                      subject.color.withOpacity(0.1),
                                  child: Stack(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.all(12.0),
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                Icon(
                                                  subject.icon,
                                                  size: Responsive.getValue(
                                                    context,
                                                    mobile: 48,
                                                    tablet: 56,
                                                    desktop: 64,
                                                  ),
                                                  color: subject.color,
                                                ),
                                                if (isSelected)
                                                  const Positioned(
                                                    right: 0,
                                                    top: 0,
                                                    child: Icon(
                                                      Icons.check_circle,
                                                      color: Colors.green,
                                                      size: 24,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 12),
                                            Text(
                                              subject.name,
                                              style: TextStyle(
                                                fontSize: Responsive
                                                    .getScaledFontSize(
                                                  context,
                                                  18,
                                                ),
                                                fontWeight: FontWeight.bold,
                                                color: Colors.black87,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          ],
                                        ),
                                      ),
                                      // Chat button (top-right) - opens ChatScreen with greeting
                                      Positioned(
                                        right: 6,
                                        top: 6,
                                        child: Material(
                                          color: Colors.transparent,
                                          child: IconButton(
                                            icon: const Icon(
                                              Icons.chat_bubble_outline,
                                            ),
                                            color: Colors.black54,
                                            tooltip: 'Chat với gia sư',
                                            onPressed: () =>
                                                _openChat(subject, context),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
    );
  }
}

class SubjectSearchDelegate extends SearchDelegate {
  final List<Subject> subjects;

  SubjectSearchDelegate({required this.subjects});

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
        },
      ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    return _buildSearchResults();
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return _buildSearchResults();
  }

  Widget _buildSearchResults() {
    final filteredSubjects = subjects.where((subject) {
      return subject.name.toLowerCase().contains(query.toLowerCase());
    }).toList();

    return ListView.builder(
      itemCount: filteredSubjects.length,
      itemBuilder: (context, index) {
        final subject = filteredSubjects[index];
        return ListTile(
          leading: Icon(subject.icon, color: subject.color),
          title: Text(subject.name),
          onTap: () {
            close(context, null);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => SubjectDetailScreen(subject: subject),
              ),
            );
          },
        );
      },
    );
  }
}
