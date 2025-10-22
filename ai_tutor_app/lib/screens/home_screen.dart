import 'package:flutter/material.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
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
    final gridColumns = Responsive.getGridColumns(
      context,
      mobile: 2,
      tablet: 3,
      desktop: 4,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'AI Tutor',
          style: TextStyle(
            fontSize: Responsive.getScaledFontSize(context, 28),
            fontWeight: FontWeight.bold,
          ),
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
      body: Responsive.constrainedContent(
        context,
        SingleChildScrollView(
          padding: Responsive.getScreenPadding(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Chào mừng bạn đến với AI Tutor',
                style: TextStyle(
                  fontSize: Responsive.getScaledFontSize(context, 22),
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Hôm nay bạn muốn học gì?',
                style: TextStyle(
                  fontSize: Responsive.getScaledFontSize(context, 16),
                ),
              ),
              SizedBox(
                height: Responsive.getValue(
                  context,
                  mobile: 24,
                  tablet: 32,
                  desktop: 40,
                ),
              ),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
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
                  mobile: 1.0,
                  tablet: 1.1,
                  desktop: 1.2,
                ),
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
            ],
          ),
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
    final iconSize = Responsive.getValue(
      context,
      mobile: 40.0,
      tablet: 48.0,
      desktop: 56.0,
    );
    final fontSize = Responsive.getScaledFontSize(context, 16);

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
            Icon(icon, size: iconSize, color: Colors.white),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                label,
                style: TextStyle(fontSize: fontSize, color: Colors.white),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
