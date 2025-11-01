class Lesson {
  final String? id;
  final String title;
  final String content;
  final String? subjectId;
  final String subjectName;
  final List<int> grade;
  final List<String> topics;
  final String difficulty;
  final int duration;

  Lesson({
    this.id,
    required this.title,
    required this.content,
    this.subjectId,
    required this.subjectName,
    required this.grade,
    required this.topics,
    required this.difficulty,
    required this.duration,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['_id'] as String?,
      title: json['title'] as String,
      content: json['content'] as String,
      subjectId:
          json['subjectId'] is Map
              ? json['subjectId']['_id'] as String?
              : json['subjectId'] as String?,
      subjectName: json['subjectName'] as String,
      grade: (json['grade'] as List<dynamic>).map((e) => e as int).toList(),
      topics:
          (json['topics'] as List<dynamic>).map((e) => e as String).toList(),
      difficulty: json['difficulty'] as String,
      duration: json['duration'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'title': title,
      'content': content,
      if (subjectId != null) 'subjectId': subjectId,
      'subjectName': subjectName,
      'grade': grade,
      'topics': topics,
      'difficulty': difficulty,
      'duration': duration,
    };
  }

  String get difficultyText {
    switch (difficulty) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return difficulty;
    }
  }
}
