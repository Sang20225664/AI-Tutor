import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:ai_tutor_app/models/lesson.dart';

import 'package:flutter/services.dart';

class FlashcardScreen extends StatefulWidget {
  final Lesson lesson;
  final Map<String, dynamic> flashcardsData;

  const FlashcardScreen({
    super.key,
    required this.lesson,
    required this.flashcardsData,
  });

  @override
  State<FlashcardScreen> createState() => _FlashcardScreenState();
}

class _FlashcardScreenState extends State<FlashcardScreen> {
  late PageController _pageController;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.85);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _nextCard() {
    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _previousCard() {
    _pageController.previousPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<dynamic> cards = widget.flashcardsData['flashcards'] ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Text('Flashcards: ${widget.lesson.title}', 
            style: const TextStyle(fontSize: 16)),
        backgroundColor: Colors.green[700],
        foregroundColor: Colors.white,
      ),
      body: cards.isEmpty
          ? const Center(child: Text('Không có flashcard nào.'))
          : RawKeyboardListener(
              focusNode: _focusNode,
              autofocus: true,
              onKey: (RawKeyEvent event) {
                if (event is RawKeyDownEvent) {
                  if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
                    _previousCard();
                  } else if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
                    _nextCard();
                  }
                }
              },
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 600),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      const Text(
                        'Vuốt ngang, bấm nút mũi tên hoặc phím ⬅ ➡ để đổi thẻ.',
                        style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: PageView.builder(
                          itemCount: cards.length,
                          controller: _pageController,
                          itemBuilder: (context, index) {
                            final card = cards[index];
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 16.0),
                              child: _FlipCard(
                                front: card['front'] ?? '',
                                back: card['back'] ?? '',
                                index: index + 1,
                                total: cards.length,
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          OutlinedButton.icon(
                            onPressed: _previousCard,
                            icon: const Icon(Icons.arrow_back),
                            label: const Text('Trước'),
                          ),
                          const SizedBox(width: 32),
                          OutlinedButton.icon(
                            onPressed: _nextCard,
                            icon: const Icon(Icons.arrow_forward),
                            label: const Text('Sau'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}


class _FlipCard extends StatefulWidget {
  final String front;
  final String back;
  final int index;
  final int total;

  const _FlipCard({
    required this.front,
    required this.back,
    required this.index,
    required this.total,
  });

  @override
  State<_FlipCard> createState() => _FlipCardState();
}

class _FlipCardState extends State<_FlipCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _isFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 300));
    _animation = Tween<double>(begin: 0, end: 1).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleCard() {
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    _isFront = !_isFront;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggleCard,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final isUnder = _animation.value > 0.5;
          final transform = Matrix4.identity()
            ..setEntry(3, 2, 0.001) // perspective
            ..rotateY(_animation.value * math.pi);

          return Transform(
            transform: transform,
            alignment: Alignment.center,
            child: isUnder
                ? Transform(
                    transform: Matrix4.identity()..rotateY(math.pi),
                    alignment: Alignment.center,
                    child: _buildSide(widget.back, isFront: false),
                  )
                : _buildSide(widget.front, isFront: true),
          );
        },
      ),
    );
  }

  Widget _buildSide(String text, {required bool isFront}) {
    return Card(
      elevation: 8,
      shadowColor: Colors.black26,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      color: isFront ? Colors.white : Colors.green.shade50,
      child: Stack(
        children: [
          Positioned(
            top: 16,
            left: 16,
            child: Text(
              '${widget.index}/${widget.total}',
              style: TextStyle(
                  color: Colors.grey.shade600, fontWeight: FontWeight.bold),
            ),
          ),
          Positioned(
            top: 16,
            right: 16,
            child: Icon(
              isFront ? Icons.help_outline : Icons.lightbulb_outline,
              color: isFront ? Colors.grey.shade400 : Colors.amber.shade400,
            ),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
              child: SingleChildScrollView(
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: isFront ? FontWeight.bold : FontWeight.w500,
                    color: Colors.black87,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Text(
              isFront ? 'Chạm để xem đáp án' : 'Chạm để quay lại',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 14,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
