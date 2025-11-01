import 'package:flutter/material.dart';

class LessonSuggestion {
  final String id;
  final String title;
  final String description;
  final String? subjectId;
  final String subjectName;
  final int grade;
  final List<String> topics;
  final String difficulty;
  final int duration;
  final String icon;
  final String color;
  final List<String> lessonIds;
  final int order;

  LessonSuggestion({
    required this.id,
    required this.title,
    required this.description,
    this.subjectId,
    required this.subjectName,
    required this.grade,
    required this.topics,
    required this.difficulty,
    required this.duration,
    required this.icon,
    required this.color,
    required this.lessonIds,
    required this.order,
  });

  factory LessonSuggestion.fromJson(Map<String, dynamic> json) {
    return LessonSuggestion(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      subjectId:
          json['subjectId'] is Map
              ? json['subjectId']['_id']?.toString()
              : json['subjectId']?.toString(),
      subjectName: json['subjectName']?.toString() ?? '',
      grade: _parseIntSafely(json['grade']),
      topics: _parseListOfStrings(json['topics']),
      difficulty: json['difficulty']?.toString() ?? 'beginner',
      duration: _parseIntSafely(json['duration']),
      icon: json['icon']?.toString() ?? 'lightbulb',
      color: json['color']?.toString() ?? '#4CAF50',
      lessonIds: _parseListOfStrings(json['lessonIds']),
      order: _parseIntSafely(json['order']),
    );
  }

  static int _parseIntSafely(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static List<String> _parseListOfStrings(dynamic value) {
    if (value == null) return [];
    if (value is! List) return [];

    return value
        .map((e) {
          if (e == null) return '';
          if (e is String) return e;
          if (e is Map && e['_id'] != null) return e['_id'].toString();
          return e.toString();
        })
        .where((s) => s.isNotEmpty)
        .toList();
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      if (subjectId != null) 'subjectId': subjectId,
      'subjectName': subjectName,
      'grade': grade,
      'topics': topics,
      'difficulty': difficulty,
      'duration': duration,
      'icon': icon,
      'color': color,
      'lessonIds': lessonIds,
      'order': order,
    };
  }

  String get difficultyText {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return 'Cơ bản';
    }
  }

  Color get backgroundColor {
    try {
      String colorStr = color.replaceAll('#', '').trim();
      if (colorStr.length == 6) {
        return Color(int.parse('FF$colorStr', radix: 16));
      }
      return Colors.blue;
    } catch (e) {
      return Colors.blue;
    }
  }
}
