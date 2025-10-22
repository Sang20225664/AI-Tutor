import 'package:ai_tutor_app/screens/select_grade_screen.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  final Function toggleDarkMode;
  final bool isDarkMode;

  const ProfileScreen({
    super.key,
    required this.toggleDarkMode,
    required this.isDarkMode,
  });

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int? _selectedGrade;
  String _username = '';
  String _email = '';
  bool _isGuest = false;
  String _avatarUrl = '';

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _selectedGrade = prefs.getInt('selectedGrade');
      _isGuest = prefs.getBool('isGuest') ?? false;

      // Load user data from preferences or set defaults
      if (_isGuest) {
        _username = 'Khách';
        _email = 'Chế độ khách';
        _avatarUrl = '';
      } else {
        _username = prefs.getString('username') ?? 'Người dùng';
        _email = prefs.getString('email') ?? 'Chưa có email';
        _avatarUrl = prefs.getString('avatarUrl') ?? '';
      }
    });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();

    // Clear all user data
    await prefs.remove('isLoggedIn');
    await prefs.remove('isGuest');
    await prefs.remove('username');
    await prefs.remove('email');
    await prefs.remove('avatarUrl');
    await ApiService.removeToken();

    // Navigate to login screen
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => LoginScreen()),
      (route) => false,
    );

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Đăng xuất thành công')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tài khoản'), centerTitle: true),
      body: Responsive.constrainedContent(
        context,
        ListView(
          children: [
            // Header người dùng
            Container(
              padding: Responsive.getScreenPadding(context),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.deepPurple, Colors.blue],
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: Responsive.getValue(
                      context,
                      mobile: 30,
                      tablet: 40,
                      desktop: 50,
                    ),
                    backgroundColor: Colors.grey[300],
                    backgroundImage:
                        _avatarUrl.isNotEmpty ? NetworkImage(_avatarUrl) : null,
                    child:
                        _avatarUrl.isEmpty
                            ? Icon(
                              _isGuest ? Icons.person_outline : Icons.person,
                              size: Responsive.getValue(
                                context,
                                mobile: 35,
                                tablet: 45,
                                desktop: 55,
                              ),
                              color: Colors.grey[600],
                            )
                            : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _username,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: Responsive.getScaledFontSize(context, 20),
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          _email,
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: Responsive.getScaledFontSize(context, 14),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (_isGuest)
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Khách',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Nhóm: Hồ sơ & học tập
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: Responsive.getValue(
                  context,
                  mobile: 16,
                  tablet: 24,
                  desktop: 32,
                ),
                vertical: 8,
              ),
              child: Text(
                'Hồ sơ & học tập',
                style: TextStyle(
                  fontSize: Responsive.getScaledFontSize(context, 16),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            if (!_isGuest) ...[
              _buildTile(
                Icons.person,
                'Chỉnh sửa thông tin cá nhân',
                () => _showEditProfileDialog(),
              ),
            ],

            _buildTile(
              Icons.school,
              'Trình độ',
              () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => SelectGradeScreen()),
                );
                _loadUserData();
              },
              subtitle:
                  _selectedGrade != null ? 'Lớp $_selectedGrade' : 'Chưa chọn',
            ),

            _buildTile(Icons.history, 'Lịch sử học tập', () {}),
            _buildTile(
              Icons.star,
              _isGuest
                  ? 'Đăng nhập để sử dụng đầy đủ tính năng'
                  : 'Gói học tập: Miễn phí',
              () {},
            ),

            if (!_isGuest) _buildTile(Icons.upgrade, 'Nâng cấp Premium', () {}),

            const Divider(),

            // Nhóm: Cài đặt
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: Responsive.getValue(
                  context,
                  mobile: 16,
                  tablet: 24,
                  desktop: 32,
                ),
                vertical: 8,
              ),
              child: Text(
                'Cài đặt & trợ giúp',
                style: TextStyle(
                  fontSize: Responsive.getScaledFontSize(context, 16),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            _buildTile(Icons.settings, 'Cài đặt', () {}),
            _buildTile(Icons.info, 'Thông tin ứng dụng', () {}),

            // Dark mode toggle
            Container(
              margin: EdgeInsets.symmetric(
                horizontal: Responsive.getValue(
                  context,
                  mobile: 16,
                  tablet: 24,
                  desktop: 32,
                ),
                vertical: 8,
              ),
              child: SwitchListTile(
                title: const Text('Chế độ tối'),
                subtitle: Text(widget.isDarkMode ? 'Đang bật' : 'Đang tắt'),
                value: widget.isDarkMode,
                onChanged: (value) {
                  widget.toggleDarkMode();
                },
                secondary: Icon(
                  widget.isDarkMode ? Icons.dark_mode : Icons.light_mode,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Nút đăng xuất
            Center(
              child: TextButton.icon(
                onPressed: () => _showLogoutDialog(),
                icon: const Icon(Icons.logout, color: Colors.red),
                label: Text(
                  _isGuest ? 'Đăng nhập' : 'Đăng xuất',
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            ),
          ],
        ),
        maxWidth: 800,
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

  void _showEditProfileDialog() {
    final usernameController = TextEditingController(text: _username);
    final emailController = TextEditingController(text: _email);

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Chỉnh sửa thông tin'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: usernameController,
                  decoration: const InputDecoration(
                    labelText: 'Tên người dùng',
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Hủy'),
              ),
              TextButton(
                onPressed: () async {
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setString('username', usernameController.text);
                  await prefs.setString('email', emailController.text);

                  setState(() {
                    _username = usernameController.text;
                    _email = emailController.text;
                  });

                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Cập nhật thông tin thành công'),
                    ),
                  );
                },
                child: const Text('Lưu'),
              ),
            ],
          ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(_isGuest ? 'Đăng nhập' : 'Xác nhận đăng xuất'),
            content: Text(
              _isGuest
                  ? 'Bạn có muốn đăng nhập để sử dụng đầy đủ tính năng?'
                  : 'Bạn có chắc chắn muốn đăng xuất?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Hủy'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _logout();
                },
                child: Text(
                  _isGuest ? 'Đăng nhập' : 'Đăng xuất',
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
    );
  }
}
