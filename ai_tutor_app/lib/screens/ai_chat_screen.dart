import 'dart:convert';

import 'package:ai_tutor_app/services/gemini_service.dart';
import 'package:flutter/material.dart';

import '../models/subject.dart';
import '../services/api_service.dart';

class AIChatScreen extends StatefulWidget {
  final Subject subject;

  AIChatScreen({required this.subject});

  @override
  _AIChatScreenState createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final _controller = TextEditingController();
  final _messages = <ChatMessage>[];
  bool _isLoading = false;

  void _sendMessage() async {
    if (_controller.text.isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(
        text: _controller.text,
        isUser: true,
      ));
      _isLoading = true;
    });

    try {
      final response = await GeminiService().chatWithAI(
        prompt: _controller.text,
        subject: widget.subject.name,
        token: await SecureStorage.getToken(),
      );

      _controller.clear();
      String fullResponse = '';

      response.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen((chunk) {
        if (chunk.startsWith('data:')) {
          final data = jsonDecode(chunk.substring(5));
          setState(() {
            _isLoading = false;
            fullResponse += data['text'];

            if (_messages.last.isUser) {
              _messages.add(ChatMessage(
                text: fullResponse,
                isUser: false,
              ));
            } else {
              _messages.last = _messages.last.copyWith(text: fullResponse);
            }
          });
        }
      });
    } catch (e) {
      // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.subject.name)),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (ctx, i) => ChatBubble(
                message: _messages[i],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(hintText: "Ask about ${widget.subject.name}..."),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
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

  ChatMessage({required this.text, required this.isUser, this.timestamp});

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

  const ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
        padding: const EdgeInsets.all(12.0),
        decoration: BoxDecoration(
          color: message.isUser ? Colors.blue : Colors.grey[300],
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Text(
          message.text,
          style: TextStyle(color: message.isUser ? Colors.white : Colors.black),
        ),
      ),
    );
  }
}

class SecureStorage {
  static Future<String> getToken() async {
    // Mock implementation
    await Future.delayed(const Duration(milliseconds: 500));
    return "mock_token";
  }
}