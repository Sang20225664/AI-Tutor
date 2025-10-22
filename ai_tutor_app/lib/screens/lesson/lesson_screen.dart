import 'package:flutter/material.dart';
import 'lesson_detail_screen.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

class LessonSuggestionScreen extends StatelessWidget {
  final List<Map<String, String>> lessons = [
    {
      'title': 'Giới thiệu về Trí tuệ nhân tạo',
      'image':
          'https://cdn.tgdd.vn/hoi-dap/1216572/tri-tue-nhan-tao-ai-la-gi-cac-ung-dung-va-tiem-nan-10-800x450.jpg',
      'description': 'Tìm hiểu cơ bản về AI và các ứng dụng thực tế.',
    },
    {
      'title': 'Các mô hình ngôn ngữ lớn (LLM)',
      'image':
          'https://askany.com/_next/image?url=https%3A%2F%2Fd2czqxs5dso3qv.cloudfront.net%2Fimages%2Fd12931ac-597f-4aa4-aa41-6e444b7a2d8e.png&w=1920&q=75',
      'description': 'Khám phá GPT, Gemini, Claude,...',
    },
    {
      'title': 'Ứng dụng AI trong học tập',
      'image':
          'https://fpt.ai/wp-content/uploads/2024/11/ung-dung-ai-trong-giao-duc-7.jpg',
      'description': 'Cách AI có thể giúp học tập hiệu quả hơn.',
    },
  ];

  LessonSuggestionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gợi ý bài học')),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final lessonContent = Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1100),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 32,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 24),
                    if (Responsive.isDesktop(context))
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // ...existing left column widgets...
                              ],
                            ),
                          ),
                          const SizedBox(width: 24),
                          SizedBox(
                            width: 320,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // ...existing sidebar widgets (progress, tips, etc.)...
                              ],
                            ),
                          ),
                        ],
                      )
                    else
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // ...existing lesson widgets rendered sequentially for mobile...
                        ],
                      ),
                  ],
                ),
              ),
            ),
          );

          return lessonContent;
        },
      ),
    );
  }
}
