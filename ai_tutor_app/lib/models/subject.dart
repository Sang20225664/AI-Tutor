import 'package:flutter/material.dart';

class Subject {
  final String? id;
  final String name;
  final IconData icon;
  final Color color;
  final String? description;
  final List<int>? grade;

  Subject({
    this.id,
    required this.name,
    required this.icon,
    required this.color,
    this.description,
    this.grade,
  });

  // Factory constructor to create Subject from JSON
  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['_id'] as String?,
      name: json['name'] as String,
      icon: _iconFromString(json['icon'] as String? ?? 'school'),
      color: _colorFromHex(json['color'] as String? ?? '#2196F3'),
      description: json['description'] as String?,
      grade: (json['grade'] as List<dynamic>?)?.map((e) => e as int).toList(),
    );
  }

  // Convert Subject to JSON
  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'name': name,
      'icon': _iconToString(icon),
      'color': _colorToHex(color),
      if (description != null) 'description': description,
      if (grade != null) 'grade': grade,
    };
  }

  // Helper: Convert icon name string to IconData
  static IconData _iconFromString(String iconName) {
    final iconMap = <String, IconData>{
      'calculate': Icons.calculate,
      'science': Icons.science,
      'biotech': Icons.biotech,
      'text_fields': Icons.text_fields,
      'language': Icons.language,
      'eco': Icons.eco,
      'history_edu': Icons.history_edu,
      'public': Icons.public,
      'computer': Icons.computer,
      'school': Icons.school,
      'sports_soccer': Icons.sports_soccer,
      'music_note': Icons.music_note,
      'brush': Icons.brush,
    };
    return iconMap[iconName] ?? Icons.school;
  }

  // Helper: Convert IconData to icon name string
  static String _iconToString(IconData icon) {
    final reverseMap = <int, String>{
      Icons.calculate.codePoint: 'calculate',
      Icons.science.codePoint: 'science',
      Icons.biotech.codePoint: 'biotech',
      Icons.text_fields.codePoint: 'text_fields',
      Icons.language.codePoint: 'language',
      Icons.eco.codePoint: 'eco',
      Icons.history_edu.codePoint: 'history_edu',
      Icons.public.codePoint: 'public',
      Icons.computer.codePoint: 'computer',
      Icons.school.codePoint: 'school',
      Icons.sports_soccer.codePoint: 'sports_soccer',
      Icons.music_note.codePoint: 'music_note',
      Icons.brush.codePoint: 'brush',
    };
    return reverseMap[icon.codePoint] ?? 'school';
  }

  // Helper: Convert hex color string to Color
  static Color _colorFromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  // Helper: Convert Color to hex string
  static String _colorToHex(Color color) {
    return '#${color.value.toRadixString(16).padLeft(8, '0').substring(2)}';
  }
}
