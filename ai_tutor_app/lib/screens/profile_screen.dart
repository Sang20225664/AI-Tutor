import 'package:ai_tutor_app/screens/select_grade_screen.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  final Function toggleDarkMode;

  const ProfileScreen({Key? key, required this.toggleDarkMode})
    : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int? _selectedGrade;

  bool isDarkMode = false;
  @override
  void initState() {
    super.initState();
    _loadPreferences();
    _loadSelectedGrade();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _selectedGrade = prefs.getInt('selectedGrade');
      isDarkMode = prefs.getBool('isDarkMode') ?? false;
    });
  }

  Future<void> _toggleDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isDarkMode = !isDarkMode;
    });
    prefs.setBool('isDarkMode', isDarkMode);
  }

  @override
  Future<void> _loadSelectedGrade() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _selectedGrade = prefs.getInt('selectedGrade');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tài khoản'), centerTitle: true),
      body: ListView(
        children: [
          // Header người dùng
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.deepPurple, Colors.blue],
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundImage: NetworkImage(
                    'https://lh3.googleusercontent.com/a/ACg8ocI4tu8e47diztqeaz7XsuNhJn5o8fQjBx556SL9WdC9dIXo5w=s360-c-no',
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Nguyễn Đức Tấn Sang',
                      style: TextStyle(color: Colors.white, fontSize: 20),
                    ),
                    Text(
                      'sanga4k48@gmail.com',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Nhóm: Hồ sơ & học tập
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Hồ sơ & học tập',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          _buildTile(Icons.person, 'Chỉnh sửa thông tin cá nhân', () {}),
          _buildTile(
            Icons.school,
            'Trình độ',
            () {
              // Chuyển đến màn hình chỉnh sửa trình độ
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SelectGradeScreen()),
              ).then((_) => _loadSelectedGrade());
            },
            subtitle:
                _selectedGrade != null ? 'Lớp $_selectedGrade' : 'Chưa chọn',
          ),

          _buildTile(Icons.history, 'Lịch sử học tập', () {}),
          _buildTile(Icons.star, 'Gói học tập: Miễn phí', () {}),
          _buildTile(Icons.upgrade, 'Nâng cấp Premium', () {}),

          const Divider(),

          // Nhóm: Cài đặt
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Cài đặt & trợ giúp',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          _buildTile(Icons.settings, 'Cài đặt', () {}),

          _buildTile(Icons.info, 'Thông tin ứng dụng', () {}),

          // Nút bật/tắt Dark Mode
          ElevatedButton.icon(
            onPressed: () {
              widget.toggleDarkMode();
              _toggleDarkMode();
            },
            icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode),
            label: Text(isDarkMode ? 'Tắt chế độ tối' : 'Bật chế độ tối'),
          ),

          const SizedBox(height: 20),

          // Nút đăng xuất
          Center(
            child: TextButton.icon(
              onPressed: () async {
                // Hiển thị dialog xác nhận đăng xuất
                final shouldLogout = await showDialog(
                  context: context,
                  builder:
                      (context) => AlertDialog(
                        title: const Text('Xác nhận đăng xuất'),
                        content: const Text('Bạn có chắc chắn muốn đăng xuất?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text('Hủy'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: const Text(
                              'Đăng xuất',
                              style: TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                );

                if (shouldLogout == true) {
                  // Đóng tất cả màn hình và chuyển đến LoginScreen
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false, // Xóa toàn bộ stack navigation
                  );

                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đăng xuất thành công')),
                  );
                }
              },
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text(
                'Đăng xuất',
                style: TextStyle(color: Colors.red),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTile(
    IconData icon,
    String title,
    VoidCallback onTap, {
    String? subtitle,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.indigo),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }
}
