import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../models/subject.dart';
import '../ai_chat_screen.dart';


class SubjectDetailScreen extends StatelessWidget {
  final Subject subject;

  const SubjectDetailScreen({super.key, required this.subject});

  @override
  Widget build(BuildContext context) {
    final List<String> topics = _getTopicsForSubject(subject);
    final String description = _getSubjectDescription(subject);

    return Scaffold(
      appBar: AppBar(
        title: Text(subject.name),
        backgroundColor: subject.color,
        foregroundColor: Colors.white,
        systemOverlayStyle: SystemUiOverlayStyle.light.copyWith(
          statusBarColor: subject.color,
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header với icon
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: subject.color.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        subject.icon,
                        size: 60,
                        color: subject.color,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Mô tả môn học
                  Text(
                    'Giới thiệu',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: subject.color,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: const TextStyle(fontSize: 16, height: 1.5),
                  ),
                  const SizedBox(height: 24),

                  // Các chuyên đề
                  Text(
                    'Chuyên đề chính',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: subject.color,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: topics.map((topic) {
                      return Chip(
                        label: Text(topic),
                        backgroundColor: subject.color.withOpacity(0.1),
                        labelStyle: TextStyle(
                          color: subject.color,
                          fontWeight: FontWeight.w500,
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Lộ trình học
                  Text(
                    'Lộ trình học',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: subject.color,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildLearningPath(),
                ],
              ),
            ),
          ),

          // Nút bắt đầu học
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: subject.color,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 4,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AIChatScreen(subject: subject),
                    ),
                  );
                },
                child: const Text(
                  'Bắt đầu học với AI',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLearningPath() {
    return Column(
      children: [
        _buildPathStep('1. Kiến thức cơ bản', Icons.school, subject.color),
        _buildPathStep('2. Bài tập thực hành', Icons.assignment, subject.color),
        _buildPathStep('3. Kiểm tra đánh giá', Icons.quiz, subject.color),
        _buildPathStep('4. Nâng cao chuyên sâu', Icons.star, subject.color),
      ],
    );
  }

  Widget _buildPathStep(String title, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: const TextStyle(fontSize: 16),
          ),
        ],
      ),
    );
  }

  List<String> _getTopicsForSubject(Subject subject) {
    switch (subject.name) {
      case 'Toán học':
        return ['Đại số', 'Hình học', 'Giải tích', 'Xác suất thống kê'];
      case 'Vật lý':
        return ['Cơ học', 'Điện từ', 'Quang học', 'Vật lý hiện đại'];
      case 'Hóa học':
        return ['Hóa vô cơ', 'Hóa hữu cơ', 'Hóa phân tích', 'Hóa lý'];
      case 'Ngữ văn':
        return ['Văn học', 'Tiếng Việt', 'Làm văn', 'Phê bình văn học'];
      case 'Tiếng Anh':
        return ['Ngữ pháp', 'Từ vựng', 'Giao tiếp', 'Luyện thi'];
      case 'Sinh học':
        return ['Di truyền', 'Tiến hóa', 'Sinh thái', 'Tế bào'];
      case 'Lịch sử':
        return ['Lịch sử Việt Nam', 'Lịch sử thế giới', 'Cổ đại', 'Hiện đại'];
      case 'Địa lý':
        return ['Địa lý tự nhiên', 'Địa lý kinh tế', 'Địa lý Việt Nam'];
      default:
        return ['Chuyên đề 1', 'Chuyên đề 2', 'Chuyên đề 3'];
    }
  }

  String _getSubjectDescription(Subject subject) {
    switch (subject.name) {
      case 'Toán học':
        return 'Môn Toán phát triển tư duy logic, khả năng giải quyết vấn đề thông qua các khái niệm số học, đại số, hình học và phân tích. Toán học là nền tảng cho nhiều ngành khoa học khác.';
      case 'Vật lý':
        return 'Vật lý nghiên cứu về vật chất, năng lượng và sự tương tác giữa chúng. Từ cơ học cổ điển đến vật lý lượng tử, môn học này giúp hiểu bản chất vũ trụ.';
      case 'Hóa học':
        return 'Hóa học khám phá thành phần, cấu trúc, tính chất và sự biến đổi của chất. Môn học này có ứng dụng rộng rãi trong đời sống và công nghiệp.';
      case 'Ngữ văn':
        return 'Ngữ văn phát triển kỹ năng ngôn ngữ, cảm thụ văn học và tư duy phê phán. Môn học giúp hiểu về văn hóa, lịch sử và con người qua ngôn từ.';
      case 'Tiếng Anh':
        return 'Tiếng Anh là ngôn ngữ toàn cầu, công cụ quan trọng trong giao tiếp quốc tế, học thuật và nghề nghiệp. Thành thạo tiếng Anh mở ra nhiều cơ hội mới.';
      case 'Sinh học':
        return 'Sinh học nghiên cứu về sự sống từ cấp độ phân tử đến hệ sinh thái. Môn học giúp hiểu về cơ thể sống, môi trường và các quá trình sinh học.';
      case 'Lịch sử':
        return 'Lịch sử cung cấp kiến thức về quá khứ, giúp hiểu hiện tại và định hướng tương lai. Môn học rèn luyện tư duy phân tích và bài học kinh nghiệm.';
      case 'Địa lý':
        return 'Địa lý nghiên cứu về Trái Đất, môi trường tự nhiên và tác động của con người. Môn học giúp hiểu về không gian sống và các vấn đề toàn cầu.';
      default:
        return 'Môn học này cung cấp kiến thức và kỹ năng quan trọng trong nhiều lĩnh vực của đời sống và khoa học.';
    }
  }
}