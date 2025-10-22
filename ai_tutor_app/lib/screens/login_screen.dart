import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ai_tutor_app/services/api_service.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final response = await ApiService.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );

      if (response['success']) {
        await _handleSuccessfulLogin(response);
      } else {
        _showErrorDialog(response['message'] ?? 'Đăng nhập thất bại');
      }
    } catch (e) {
      _showErrorDialog('Lỗi kết nối: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loginAsGuest() async {
    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', true);
      await prefs.setBool('isGuest', true);

      _navigateBasedOnGradeSelection();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    _showFeatureNotAvailableDialog(
      'Đăng nhập Google',
      'Tính năng đăng nhập bằng Google sẽ được cập nhật trong phiên bản tới.',
    );
  }

  Future<void> _handleSuccessfulLogin(Map<String, dynamic> response) async {
    final prefs = await SharedPreferences.getInstance();

    // Save login status
    await prefs.setBool('isLoggedIn', true);

    // Save token if available
    if (response['token'] != null) {
      await ApiService.saveToken(response['token']);
    }

    // Save user info if available
    if (response['user'] != null) {
      final user = response['user'];
      await prefs.setString('username', user['username'] ?? '');
      await prefs.setString('email', user['email'] ?? '');
    }

    _navigateBasedOnGradeSelection();
  }

  void _navigateBasedOnGradeSelection() async {
    final prefs = await SharedPreferences.getInstance();
    final hasSelectedGrade = prefs.containsKey('selectedGrade');

    if (hasSelectedGrade) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      Navigator.of(context).pushReplacementNamed('/select-grade');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Lỗi'),
            content: Text(message),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
    );
  }

  void _showFeatureNotAvailableDialog(String feature, String message) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(feature),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.info_outline,
                  size: 48,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(height: 16),
                Text(message),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Đã hiểu'),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          final formArea = Responsive.constrainedContent(
            context,
            SingleChildScrollView(
              padding: Responsive.getScreenPadding(context),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SizedBox(
                      height: Responsive.getValue(
                        context,
                        mobile: 40,
                        tablet: 60,
                        desktop: 80,
                      ),
                    ),
                    // Logo/Title
                    Icon(
                      Icons.school,
                      size: Responsive.getValue(
                        context,
                        mobile: 80,
                        tablet: 100,
                        desktop: 120,
                      ),
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'AI Tutor',
                      style: TextStyle(
                        fontSize: Responsive.getScaledFontSize(context, 32),
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Trợ lý học tập cá nhân của bạn',
                      style: TextStyle(
                        fontSize: Responsive.getScaledFontSize(context, 16),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),

                    // Username field
                    TextFormField(
                      controller: _usernameController,
                      decoration: const InputDecoration(
                        labelText: 'Tên người dùng',
                        prefixIcon: Icon(Icons.person),
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Hãy nhập tên người dùng của bạn';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Mật khẩu',
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility
                                : Icons.visibility_off,
                          ),
                          onPressed:
                              () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                        ),
                        border: const OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Hãy nhập mật khẩu của bạn';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Login button
                    ElevatedButton(
                      onPressed: _isLoading ? null : _login,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child:
                          _isLoading
                              ? const CircularProgressIndicator()
                              : const Text('Đăng nhập'),
                    ),
                    const SizedBox(height: 16),

                    // Google Sign In Button (with coming soon indicator)
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : _signInWithGoogle,
                        icon: const Icon(
                          Icons.account_circle,
                          color: Colors.grey,
                        ),
                        label: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text('Đăng nhập bằng Google'),
                            SizedBox(width: 8),
                            Text(
                              '(Sắp có)',
                              style: TextStyle(
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.grey),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Guest button
                    OutlinedButton(
                      onPressed: _isLoading ? null : _loginAsGuest,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Tiếp tục mà không cần đăng nhập'),
                    ),
                    const SizedBox(height: 24),

                    // Register link
                    TextButton(
                      onPressed:
                          () => Navigator.of(context).pushNamed('/register'),
                      child: const Text('Chưa có tài khoản? Đăng ký ngay'),
                    ),
                  ],
                ),
              ),
            ),
            maxWidth: 480,
          );

          if (Responsive.isDesktop(context)) {
            return Row(
              children: [
                Expanded(
                  child: Container(
                    padding: EdgeInsets.all(
                      Responsive.getValue(
                        context,
                        mobile: 32,
                        tablet: 48,
                        desktop: 64,
                      ),
                    ),
                    color: Theme.of(
                      context,
                    ).colorScheme.primaryContainer.withOpacity(0.3),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.auto_stories,
                          size: 120,
                          color: Theme.of(context).primaryColor,
                        ),
                        const SizedBox(height: 32),
                        Text(
                          'Học tập thông minh\nvới AI Tutor',
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Trợ lý học tập cá nhân được hỗ trợ bởi trí tuệ nhân tạo',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Expanded(child: formArea),
              ],
            );
          }

          return formArea;
        },
      ),
    );
  }
}
