import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';
import 'package:markdown_widget/markdown_widget.dart';

import '../../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final String? subject; 
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
  String? _sessionId;
  String _currentChatTitle = 'Chat with AI Tutor';

  // History state
  List<dynamic> _chatSessions = [];
  bool _isLoadingHistory = false;

  @override
  void initState() {
    super.initState();
    _fetchChatHistory();
    _sendGreetingIfNeeded();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchChatHistory() async {
    setState(() => _isLoadingHistory = true);
    try {
      final response = await ApiService.getChatHistories();
      if (response['success'] == true) {
        setState(() {
          _chatSessions = response['data'] ?? [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Lỗi tải lịch sử chat: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoadingHistory = false);
    }
  }

  Future<void> _sendGreetingIfNeeded() async {
    try {
      final resp = await ApiService.chat(
        greet: true,
        subject: widget.subject,
      );
      if (resp['success'] == true && resp['response'] != null) {
        if (resp['data'] != null && resp['data']['conversationId'] != null) {
          _sessionId = resp['data']['conversationId'];
        }
        final greeting = resp['response'] as String;
        setState(() {
          initialSystemMessage = greeting;
          _messages.add(ChatMessage(text: greeting, isUser: false));
        });
      }
    } catch (e) {}
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
      final resp = await ApiService.chat(
        message: text,
        subject: widget.subject,
        sessionId: _sessionId,
      );

      if (resp['success'] == true && resp['response'] != null) {
        bool wasNewChat = _sessionId == null;
        if (resp['data'] != null && resp['data']['conversationId'] != null) {
          _sessionId = resp['data']['conversationId'];
        }
        final response = resp['response'] as String;
        setState(() {
          _messages.add(ChatMessage(text: response, isUser: false));
        });

        if (wasNewChat) {
          _fetchChatHistory(); // refresh history to show newly created chat
        }
      } else {
        throw Exception(resp['message'] ?? 'AI đang gặp sự cố');
      }

      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
      setState(() {
        _messages.add(
          ChatMessage(
            text: "Xin lỗi, AI đang gặp sự cố. Vui lòng thử lại sau.",
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

  // --- DRAWER ACTIONS ---
  Future<void> _createNewChat() async {
    setState(() {
      _sessionId = null;
      _messages.clear();
      _currentChatTitle = 'Chat with AI Tutor';
    });
    Navigator.pop(context); // close drawer
    await _sendGreetingIfNeeded();
  }

  void _loadChat(dynamic chat) {
    setState(() {
      _sessionId = chat['_id'];
      _currentChatTitle = chat['title'] ?? 'Chat';
      _messages.clear();
      if (chat['messages'] != null) {
        for (var msg in chat['messages']) {
           _messages.add(ChatMessage(
              text: msg['content'],
              isUser: msg['role'] == 'user'
           ));
        }
      }
    });
    Navigator.pop(context); // close drawer
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  Future<void> _deleteChat(String chatId) async {
      try {
        final response = await ApiService.deleteChatHistory(chatId);
        if (response['success'] == true) {
           if (_sessionId == chatId) {
              _createNewChat(); // Active chat deleted, reset
           } else {
              _fetchChatHistory();
           }
        }
      } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Lỗi xóa: $e")));
      }
  }

  Future<void> _togglePin(String chatId) async {
      try {
         await ApiService.toggleChatPin(chatId);
         _fetchChatHistory();
      } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Lỗi ghim: $e")));
      }
  }

  String _formatTimestamp(String? timestamp) {
    if (timestamp == null) return '';
    try {
      final dateTime = DateTime.parse(timestamp).toLocal();
      return DateFormat('dd/MM HH:mm').format(dateTime);
    } catch (e) {
      return '';
    }
  }
  
  String _getChatSubtitle(List<dynamic> messages) {
    if (messages.isEmpty) return 'No messages';
    final lastMessage = messages.last;
    final content = lastMessage['content']?.toString() ?? '';
    return content.length > 50 ? '${content.substring(0, 50)}...' : content;
  }

  Widget _buildDrawer() {
     final pinnedChats = _chatSessions.where((c) => c['isPinned'] == true).toList();
     final recentChats = _chatSessions.where((c) => c['isPinned'] != true).toList();

     return Drawer(
        child: Column(
           children: [
             DrawerHeader(
               decoration: BoxDecoration(color: Colors.blue),
               child: Center(
                  child: Text(
                     "Lịch sử Trò chuyện",
                     style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)
                  )
               ),
             ),
             Padding(
                padding: const EdgeInsets.all(8.0),
                child: ElevatedButton.icon(
                   onPressed: _createNewChat,
                   icon: Icon(Icons.add),
                   label: Text("Cuộc trò chuyện mới"),
                   style: ElevatedButton.styleFrom(
                      minimumSize: Size.fromHeight(45)
                   )
                ),
             ),
             Expanded(
               child: RefreshIndicator(
                 onRefresh: _fetchChatHistory,
                 child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                       if (pinnedChats.isNotEmpty) ...[
                          _buildSectionHeader("Đã ghim", Icons.push_pin),
                          ...pinnedChats.map((c) => _buildChatItem(c)).toList(),
                          Divider(),
                       ],
                       if (recentChats.isNotEmpty) ...[
                          _buildSectionHeader("Gần đây", Icons.history),
                          ...recentChats.map((c) => _buildChatItem(c)).toList(),
                       ],
                       if (_chatSessions.isEmpty && !_isLoadingHistory)
                          Padding(
                             padding: EdgeInsets.all(20),
                             child: Center(child: Text("Bạn chưa có lịch sử trò chuyện nào.", style: TextStyle(color: Colors.grey))),
                          )
                    ],
                 ),
               ),
             )
           ],
        )
     );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
     return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
           children: [
              Icon(icon, size: 18, color: Colors.grey[700]),
              SizedBox(width: 8),
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[800])),
           ]
        ),
     );
  }

  Widget _buildChatItem(dynamic chat) {
      final chatId = chat['_id'];
      final messages = chat['messages'] ?? [];
      final timestamp = _formatTimestamp(chat['updatedAt'] ?? chat['createdAt']);
      final isPinned = chat['isPinned'] == true;
      final isActive = _sessionId == chatId;

      return Dismissible(
         key: Key(chatId),
         background: Container(
            color: Colors.red,
            alignment: Alignment.centerRight,
            padding: EdgeInsets.only(right: 20),
            child: Icon(Icons.delete, color: Colors.white),
         ),
         direction: DismissDirection.endToStart,
         confirmDismiss: (direction) async {
            return await showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Xóa Trò Chuyện'),
                content: const Text('Bạn có chắc chắn muốn xóa không?'),
                actions: [
                  TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Hủy')),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    child: const Text('Xóa', style: TextStyle(color: Colors.red)),
                  ),
                ],
              ),
            );
         },
         onDismissed: (_) => _deleteChat(chatId),
         child: ListTile(
            selected: isActive,
            selectedTileColor: Colors.blue.withOpacity(0.1),
            title: Text(chat['title'] ?? 'Chat', maxLines: 1, overflow: TextOverflow.ellipsis,
               style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
            subtitle: Text("${_getChatSubtitle(messages)}\n$timestamp", 
               maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12)),
            trailing: IconButton(
               icon: Icon(isPinned ? Icons.push_pin : Icons.push_pin_outlined, 
                  color: isPinned ? Colors.blue : null, size: 20),
               onPressed: () => _togglePin(chatId),
            ),
            onTap: () => _loadChat(chat),
         )
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_currentChatTitle),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(), // Navigate back
          ),
        ),
        actions: [
          // Push Drawer icon to the right side so we can keep the Back button on the left
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.history), // Use history or menu icon
              tooltip: 'Lịch sử hội thoại',
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: _buildDrawer(), // Moved drawer to the right side
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
    final isUser = message.isUser;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: const EdgeInsets.all(12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.85,
        ),
        decoration: BoxDecoration(
          color: isUser ? Colors.blue : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(12),
        ),
        child: isUser
            ? SelectableText(
                message.text,
                style: const TextStyle(color: Colors.white, fontSize: 15),
              )
            : MarkdownWidget(
                data: message.text,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                config: MarkdownConfig(
                  configs: [
                    const PConfig(
                      textStyle: TextStyle(
                        fontSize: 15,
                        height: 1.5,
                        color: Colors.black87,
                      ),
                    ),
                    H1Config(
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue.shade800,
                      ),
                    ),
                    H2Config(
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.blue.shade700,
                      ),
                    ),
                    H3Config(
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    const PreConfig(
                      textStyle: TextStyle(fontSize: 13),
                      decoration: BoxDecoration(
                        color: Color(0xFFF5F5F5),
                        borderRadius: BorderRadius.all(Radius.circular(6)),
                      ),
                    ),
                    const BlockquoteConfig(
                      textColor: Colors.black54,
                      sideColor: Colors.blue,
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
