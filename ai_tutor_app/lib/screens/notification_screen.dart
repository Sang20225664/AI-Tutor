// New NotificationScreen
import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo', style: TextStyle(fontSize: 20)),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          'Danh sách thông báo',
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}