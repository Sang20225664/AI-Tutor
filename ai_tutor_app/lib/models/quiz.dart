class Quiz {
  final String? id;
  final String title;
  final String description;
  final String? subjectId;
  final String subjectName;
  final List<int> grade;
  final String difficulty;
  final List<Question> questions;

  Quiz({
    this.id,
    required this.title,
    required this.description,
    this.subjectId,
    required this.subjectName,
    required this.grade,
    required this.difficulty,
    required this.questions,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['_id'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      subjectId:
          json['subjectId'] is Map
              ? json['subjectId']['_id'] as String?
              : json['subjectId'] as String?,
      subjectName: json['subjectName'] as String,
      grade: (json['grade'] as List<dynamic>).map((e) => e as int).toList(),
      difficulty: json['difficulty'] as String,
      questions:
          (json['questions'] as List<dynamic>)
              .map((q) => Question.fromJson(q as Map<String, dynamic>))
              .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'title': title,
      'description': description,
      if (subjectId != null) 'subjectId': subjectId,
      'subjectName': subjectName,
      'grade': grade,
      'difficulty': difficulty,
      'questions': questions.map((q) => q.toJson()).toList(),
    };
  }
}

class Question {
  final String question;
  final List<String> options;
  final int answer;
  final String? explanation;

  Question({
    required this.question,
    required this.options,
    required this.answer,
    this.explanation,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      question: json['question'] as String,
      options:
          (json['options'] as List<dynamic>).map((e) => e as String).toList(),
      answer: json['answer'] as int,
      explanation: json['explanation'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'question': question,
      'options': options,
      'answer': answer,
      if (explanation != null) 'explanation': explanation,
    };
  }
}
