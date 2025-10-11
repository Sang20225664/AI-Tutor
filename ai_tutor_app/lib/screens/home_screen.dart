import 'package:flutter/material.dart';
import 'notification_screen.dart';
import 'chat/chat_screen.dart';
import 'lesson/lesson_screen.dart';
import 'chat/history_screen.dart';
import 'lesson/quiz_screen.dart';
import 'profile_screen.dart';
import 'subject/subject_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _navigate(BuildContext context, Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'AI Tutor',
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Chào mừng bạn đến với AI Tutor',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Hôm nay bạn muốn học gì?',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildMenuCard(
                    context,
                    icon: Icons.chat,
                    label: 'Chat với Gia sư',
                    color: Colors.indigo,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => ChatScreen()),
                      );
                    },
                  ),
                  _buildMenuCard(
                    context,
                    icon: Icons.menu_book,
                    label: 'Gợi ý bài học',
                    color: Colors.orange,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => LessonSuggestionScreen(),
                        ),
                      );
                    },
                  ),
                  _buildMenuCard(
                    context,
                    icon: Icons.history,
                    label: 'Lịch sử hội thoại',
                    color: Colors.orange,
                    onTap: () {
                      // TODO: Lấy userId động nếu có hệ thống đăng nhập
                      _navigate(context, HistoryScreen());
                    },
                  ),
                  _buildMenuCard(
                    context,
                    icon: Icons.quiz,
                    label: 'Bài tập luyện tập',
                    color: Colors.teal,
                    onTap: () {
                      _navigate(context, const QuizScreen());
                    },
                  ),
                  _buildMenuCard(
                    context,
                    icon: Icons.menu_book,
                    label: 'Chọn Môn Học',
                    color: Colors.brown,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const SubjectsScreen(),
                        ),
                      );
                    },
                  ),
                  _buildMenuCard(
                    context,
                    icon: Icons.person,
                    label: 'Hồ sơ cá nhân',
                    color: Colors.deepPurple,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (_) => ProfileScreen(
                                toggleDarkMode: () {},
                                isDarkMode: false,
                              ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.white),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(fontSize: 16, color: Colors.white),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
