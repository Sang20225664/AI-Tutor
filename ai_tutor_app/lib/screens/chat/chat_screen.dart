// lib/screens/chat_screen.dart
import 'package:flutter/material.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

import '../../services/gemini_service.dart';
import '../../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final String? subject; // <-- new optional subject
  const ChatScreen({super.key, this.subject});

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<ChatMessage> _messages = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  String initialSystemMessage = '';

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _sendGreetingIfNeeded();
  }

  Future<void> _sendGreetingIfNeeded() async {
    try {
      final resp = await ApiService.chat(
        greet: true,
        subject: widget.subject,
      ); // pass subject
      if (resp['success'] == true && resp['response'] != null) {
        final greeting = resp['response'] as String;
        setState(() {
          initialSystemMessage = greeting;
          // add greeting as a bot message so it appears in the chat list immediately
          _messages.add(ChatMessage(text: greeting, isUser: false));
        });
      }
    } catch (e) {
      // optional: handle error / fallback
    } finally {
      // finished
    }
  }

  void _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true));
      _isLoading = true;
      _controller.clear();
    });

    try {
      final response = await GeminiService.generateContent(prompt: text);

      setState(() {
        _messages.add(ChatMessage(text: response, isUser: false));
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
      setState(() {
        _messages.add(
          ChatMessage(
            text: "Sorry, I couldn't process that request.",
            isUser: false,
          ),
        );
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } finally {
      setState(() => _isLoading = false);
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
      appBar: AppBar(title: const Text('Chat with AI Tutor')),
      body: Responsive.constrainedContent(
        context,
        Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                itemCount: _messages.length,
                padding: Responsive.getScreenPadding(context),
                itemBuilder: (context, index) {
                  final message = _messages[index];
                  return ChatBubble(message: message);
                },
              ),
            ),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.all(8.0),
                child: CircularProgressIndicator(),
              ),
            if (initialSystemMessage.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(
                  initialSystemMessage,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            Container(
              padding: Responsive.getScreenPadding(context),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'Nhập câu hỏi của bạn...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _isLoading ? null : _sendMessage,
                  ),
                ],
              ),
            ),
          ],
        ),
        maxWidth: 900,
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;

  ChatMessage({required this.text, required this.isUser});
}

class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: message.isUser ? Colors.blue : Colors.grey.shade300,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: message.isUser ? Colors.transparent : Colors.grey.shade200,
          ),
        ),
        child: Text(
          message.text,
          style: TextStyle(color: message.isUser ? Colors.white : Colors.black),
        ),
      ),
    );
  }
}
