import 'package:flutter/material.dart';
import 'package:ai_tutor_app/services/gemini_service.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
import 'package:markdown_widget/markdown_widget.dart';
import '../../models/subject.dart';

class AIChatScreen extends StatefulWidget {
  final Subject subject;

  const AIChatScreen({super.key, required this.subject});

  @override
  _AIChatScreenState createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final _controller = TextEditingController();
  final _messages = <ChatMessage>[];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() async {
    final messageText = _controller.text;
    if (messageText.isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(text: messageText, isUser: true, timestamp: DateTime.now()),
      );
      _isLoading = true;
    });

    _controller.clear();

    try {
      final response = await GeminiService.generateContent(prompt: messageText);

      setState(() {
        _isLoading = false;
        _messages.add(
          ChatMessage(text: response, isUser: false, timestamp: DateTime.now()),
        );
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } catch (e) {
      setState(() {
        _isLoading = false;
        _messages.add(
          ChatMessage(
            text: 'Error: ${e.toString()}',
            isUser: false,
            timestamp: DateTime.now(),
          ),
        );
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    }
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position.maxScrollExtent;
    _scrollController.animateTo(
      position,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.subject.name), elevation: 1),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final chatBody = Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1100),
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 24,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Render chat messages
                          for (final msg in _messages) ...[
                            ChatBubble(message: msg),
                            const SizedBox(height: 8),
                          ],
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                    child: Align(
                      alignment: Alignment.center,
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 900),
                        child: _buildMessageComposer(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );

          if (Responsive.isDesktop(context)) {
            return Row(
              children: [
                SizedBox(width: 280, child: _buildConversationSidebar()),
                Expanded(child: chatBody),
              ],
            );
          }

          return chatBody;
        },
      ),
    );
  }

  Widget _buildConversationSidebar() {
    // TODO: render danh sách hội thoại hoặc gợi ý nhanh
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ...existing quick actions (nếu có)...
          const SizedBox(height: 16),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // ...existing history list / suggestion cards...
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageComposer() {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, -1),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: "Ask about ${widget.subject.name}...",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey[100],
                contentPadding: const EdgeInsets.all(12),
              ),
              maxLines: null,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: _isLoading ? null : _sendMessage,
            color: Theme.of(context).primaryColor,
          ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime? timestamp;

  const ChatMessage({required this.text, required this.isUser, this.timestamp});

  ChatMessage copyWith({String? text, bool? isUser, DateTime? timestamp}) {
    return ChatMessage(
      text: text ?? this.text,
      isUser: isUser ?? this.isUser,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}

class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: message.isUser
              ? Theme.of(context).primaryColor
              : Colors.grey.shade300,
          borderRadius: BorderRadius.circular(20.0),
          border: Border.all(
            color: message.isUser ? Colors.transparent : Colors.grey.shade200,
          ),
        ),
        child: message.isUser
            ? Text(
                message.text,
                style: const TextStyle(color: Colors.white),
              )
            : MarkdownWidget(
                data: message.text,
                shrinkWrap: true,
                config: MarkdownConfig(
                  configs: [
                    const PConfig(textStyle: TextStyle(color: Colors.black87)),
                  ],
                ),
              ),
      ),
    );
  }
}
