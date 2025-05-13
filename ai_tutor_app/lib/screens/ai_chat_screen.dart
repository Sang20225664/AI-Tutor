import 'package:flutter/material.dart';

import '../models/subject.dart';

class AIChatScreen extends StatefulWidget {
  final Subject subject;

  AIChatScreen({required this.subject});

  @override
  _AIChatScreenState createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final _controller = TextEditingController();
  final _messages = <ChatMessage>[];

  void _sendMessage() async {
    final message = _controller.text;
    setState(() {
      _messages.add(ChatMessage(text: message, isUser: true, timestamp: DateTime.now()));
      _controller.clear();
    });

    // Mock API call
    final response = await AIService.getTutorResponse(
      subject: widget.subject.name,
      question: message,
    );

    setState(() {
      _messages.add(ChatMessage(text: response, isUser: false, timestamp: DateTime.now()));
    });
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

class AIService {
  static Future<String> getTutorResponse({required String subject, required String question}) async {
    // Mock response
    await Future.delayed(const Duration(seconds: 1));
    return "This is a response for the question: '$question' in subject: '$subject'.";
  }
}