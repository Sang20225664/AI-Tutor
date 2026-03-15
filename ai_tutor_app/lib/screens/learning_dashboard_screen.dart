import 'package:flutter/material.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:intl/intl.dart';
import 'lesson/quiz_screen.dart';

class LearningDashboardScreen extends StatefulWidget {
  const LearningDashboardScreen({super.key});

  @override
  State<LearningDashboardScreen> createState() =>
      _LearningDashboardScreenState();
}

class _LearningDashboardScreenState extends State<LearningDashboardScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  Map<String, dynamic>? _progressSummary;
  List<dynamic> _quizHistory = [];
  List<dynamic> _weakTopics = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final futures = await Future.wait([
        ApiService.getProgressSummary(),
        ApiService.getQuizHistory(page: 1, limit: 10),
        ApiService.getWeakTopics(),
      ]);

      final progressData = futures[0];
      final historyData = futures[1];
      final weakTopicsData = futures[2];

      if (progressData['success'] == true && historyData['success'] == true) {
        setState(() {
          _progressSummary = progressData['data'];
          _quizHistory = historyData['data'] ?? [];
          _weakTopics = (weakTopicsData['success'] == true) 
              ? (weakTopicsData['data'] ?? []) 
              : [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = progressData['message'] ??
              historyData['message'] ??
              'Lỗi khi tải dữ liệu';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Đã xảy ra lỗi: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bảng điểm học tập'),
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
                      Text(_errorMessage!),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadDashboardData,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadDashboardData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildOverviewCards(),
                        const SizedBox(height: 24),
                        if (_weakTopics.isNotEmpty) ...[
                          const Text(
                            'Chủ đề cần cải thiện',
                            style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          _buildWeakTopics(),
                          const SizedBox(height: 24),
                        ],
                        const Text(
                          'Lịch sử làm bài',
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        _buildHistoryList(),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildOverviewCards() {
    if (_progressSummary == null) return const SizedBox();
    final overview = _progressSummary!['overview'];

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard('Bài đã học', overview['completedLessons'].toString(),
            Icons.check_circle, Colors.green),
        _buildStatCard('Đang học', overview['inProgressLessons'].toString(),
            Icons.pending, Colors.orange),
        _buildStatCard('Điểm TB', '${overview['averageScore']}%', Icons.score,
            Colors.blue),
        _buildStatCard('Tiến độ', '${overview['completionRate']}%',
            Icons.trending_up, Colors.purple),
      ],
    );
  }

  Widget _buildWeakTopics() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _weakTopics.length,
      itemBuilder: (context, index) {
        final topic = _weakTopics[index];
        final accuracy = (topic['accuracy'] as num).toDouble();
        
        return Card(
          elevation: 1,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.orange.shade200)),
          child: ListTile(
            leading: const Icon(Icons.warning_amber_rounded, color: Colors.orange),
            title: Text(
              topic['lessonTitle'] ?? 'Chủ đề',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${accuracy.toStringAsFixed(0)}%',
                style: TextStyle(
                  color: Colors.red.shade700,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 20, color: color),
                const SizedBox(width: 8),
                Text(title,
                    style: TextStyle(fontSize: 14, color: Colors.grey[700])),
              ],
            ),
            const SizedBox(height: 8),
            Text(value,
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryList() {
    if (_quizHistory.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Center(
            child: Text('Bạn chưa làm bài kiểm tra nào.'),
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _quizHistory.length,
      itemBuilder: (context, index) {
        final attempt = _quizHistory[index];
        final score = attempt['score'];
        final title = attempt['quizTitle'] ?? 'Bài kiểm tra';
        final subject = attempt['subjectName'] ?? 'Không rõ';
        final date = DateTime.parse(attempt['createdAt']).toLocal();
        final dateStr = DateFormat('dd/MM/yyyy HH:mm').format(date);

        final isPass = score >= 70;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: isPass ? Colors.green[100] : Colors.orange[100],
              child: Text(
                '$score',
                style: TextStyle(
                  color: isPass ? Colors.green[800] : Colors.orange[800],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            title: Text(title,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('$subject • $dateStr'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => QuizScreen(quizId: attempt['quizId']),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
