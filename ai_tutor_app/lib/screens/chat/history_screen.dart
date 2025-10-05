import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../services/api_service.dart';
import 'chat_detail_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<dynamic> _chatSessions = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchChatHistory();
  }

  Future<void> _fetchChatHistory() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiService.getChatHistories();

      if (!mounted) return;

      if (response['success'] == true) {
        setState(() {
          _chatSessions = response['data'] ?? [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = response['message'] ?? 'Failed to load chat history';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteChat(String chatId) async {
    try {
      setState(() {
        _isLoading = true;
      });

      final response = await ApiService.deleteChatHistory(chatId);

      if (!mounted) return;

      if (response['success'] == true) {
        // Làm mới danh sách sau khi xóa
        await _fetchChatHistory();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to delete chat'),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting chat: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _navigateToChatDetail(
    BuildContext context,
    Map<String, dynamic> chatSession,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => ChatDetailScreen(
              chatId: chatSession['_id'],
              initialMessages:
                  (chatSession['messages'] as List)
                      .map(
                        (msg) => {
                          'role': msg['role'],
                          'content': msg['content'],
                          'timestamp': msg['timestamp'],
                        },
                      )
                      .toList(),
              chatTitle: chatSession['title'] ?? 'Chat',
            ),
      ),
    );
  }

  String _formatTimestamp(String? timestamp) {
    if (timestamp == null) return 'Unknown date';
    try {
      final dateTime = DateTime.parse(timestamp).toLocal();
      return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
    } catch (e) {
      return timestamp;
    }
  }

  String _getChatSubtitle(List<dynamic> messages) {
    if (messages.isEmpty) return 'No messages';

    final lastMessage = messages.last;
    final content = lastMessage['content']?.toString() ?? '';

    return content.length > 50 ? '${content.substring(0, 50)}...' : content;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _fetchChatHistory,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              _error!,
              style: const TextStyle(color: Colors.red, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchChatHistory,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_chatSessions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.history, size: 48, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              'No chat history available',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchChatHistory,
              child: const Text('Refresh'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchChatHistory,
      child: ListView.builder(
        itemCount: _chatSessions.length,
        itemBuilder: (context, index) {
          final chat = _chatSessions[index];
          final chatId = chat['_id'];
          final title = chat['title'] ?? 'Chat ${index + 1}';
          final messages = chat['messages'] ?? [];
          final timestamp = _formatTimestamp(
            chat['updatedAt'] ?? chat['createdAt'],
          );

          return Dismissible(
            key: Key(chatId),
            background: Container(color: Colors.red),
            confirmDismiss: (direction) async {
              return await showDialog(
                context: context,
                builder:
                    (context) => AlertDialog(
                      title: const Text('Delete Chat'),
                      content: const Text(
                        'Are you sure you want to delete this chat?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(true),
                          child: const Text(
                            'Delete',
                            style: TextStyle(color: Colors.red),
                          ),
                        ),
                      ],
                    ),
              );
            },
            onDismissed: (direction) => _deleteChat(chatId),
            child: Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: ListTile(
                title: Text(title),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_getChatSubtitle(messages)),
                    const SizedBox(height: 4),
                    Text(
                      timestamp,
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _navigateToChatDetail(context, chat),
              ),
            ),
          );
        },
      ),
    );
  }
}
