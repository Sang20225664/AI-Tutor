# AI Tutor - API Integration Guide

## Overview
This guide documents the complete migration from hardcoded data to MongoDB + REST API architecture.

## Architecture

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      Mongoose      ┌─────────────┐
│   Flutter   │ ◄─────────────────► │   Node.js   │ ◄─────────────────► │   MongoDB   │
│   Frontend  │    JSON Responses   │   Backend   │   ODM/Queries      │   Database  │
│  (Port 3000)│                     │ (Port 5000) │                    │ (Port 27017)│
└─────────────┘                     └─────────────┘                    └─────────────┘
```

## Backend Setup

### 1. MongoDB Models

#### Subject Model (`/models/subject.js`)
```javascript
{
  name: String,              // "Toán học", "Vật lý", etc.
  icon: String,              // Material Icon name: "calculate", "science"
  color: String,             // Hex color: "#2196F3"
  description: String,       // Optional description
  grade: [Number],           // [1, 2, 3, ..., 12]
  createdAt: Date,
  updatedAt: Date
}
```

#### Quiz Model (`/models/quiz.js`)
```javascript
{
  title: String,
  description: String,
  subjectId: ObjectId,       // Reference to Subject
  subjectName: String,       // Denormalized for performance
  grade: [Number],
  difficulty: String,        // "easy" | "medium" | "hard"
  questions: [{
    question: String,
    options: [String],
    answer: Number,          // Index of correct answer (0-based)
    explanation: String      // Optional
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Lesson Model (`/models/lesson.js`)
```javascript
{
  title: String,
  content: String,           // Markdown formatted content
  subjectId: ObjectId,       // Reference to Subject
  subjectName: String,       // Denormalized
  grade: [Number],
  topics: [String],
  difficulty: String,        // "beginner" | "intermediate" | "advanced"
  duration: Number,          // Minutes
  createdAt: Date,
  updatedAt: Date
}
```

### 2. API Endpoints

#### Subjects API
```
GET    /api/subjects              # Get all subjects
GET    /api/subjects/:id          # Get subject by ID
GET    /api/subjects?grade=6      # Filter by grade
POST   /api/subjects              # Create subject (admin)
PUT    /api/subjects/:id          # Update subject (admin)
DELETE /api/subjects/:id          # Delete subject (admin)
```

**Response Example:**
```json
{
  "success": true,
  "count": 13,
  "data": [
    {
      "_id": "68f90793ed106280ef95209a",
      "name": "Toán học",
      "icon": "calculate",
      "color": "#2196F3",
      "description": "Học toán từ cơ bản đến nâng cao",
      "grade": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      "createdAt": "2025-10-22T16:34:27.438Z",
      "updatedAt": "2025-10-22T16:34:27.438Z"
    }
  ]
}
```

#### Quizzes API
```
GET    /api/quizzes                           # Get all quizzes
GET    /api/quizzes/:id                       # Get quiz by ID
GET    /api/quizzes?grade=6                   # Filter by grade
GET    /api/quizzes?subjectName=Toán học      # Filter by subject
GET    /api/quizzes?difficulty=easy           # Filter by difficulty
POST   /api/quizzes                           # Create quiz (admin)
PUT    /api/quizzes/:id                       # Update quiz (admin)
DELETE /api/quizzes/:id                       # Delete quiz (admin)
```

**Response Example:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "68f90793ed106280ef9520a7",
      "title": "Bài tập Toán học lớp 6",
      "description": "Kiểm tra kiến thức toán học cơ bản",
      "subjectId": {
        "_id": "68f90793ed106280ef95209a",
        "name": "Toán học",
        "icon": "calculate",
        "color": "#2196F3"
      },
      "subjectName": "Toán học",
      "grade": [6],
      "difficulty": "easy",
      "questions": [
        {
          "question": "2 + 2 = ?",
          "options": ["3", "4", "5", "6"],
          "answer": 1,
          "explanation": "2 cộng 2 bằng 4"
        }
      ],
      "createdAt": "2025-10-22T16:34:27.447Z"
    }
  ]
}
```

#### Lessons API
```
GET    /api/lessons                           # Get all lessons
GET    /api/lessons/:id                       # Get lesson by ID
GET    /api/lessons?grade=6                   # Filter by grade
GET    /api/lessons?subjectName=Vật lý        # Filter by subject
GET    /api/lessons?difficulty=beginner       # Filter by difficulty
GET    /api/lessons?topics=Lực,Chuyển động    # Filter by topics
GET    /api/lessons/subject/:subjectId        # Get lessons by subject ID
POST   /api/lessons                           # Create lesson (admin)
PUT    /api/lessons/:id                       # Update lesson (admin)
DELETE /api/lessons/:id                       # Delete lesson (admin)
```

**Response Example:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "68f90793ed106280ef9520ca",
      "title": "Giới thiệu về lực và chuyển động",
      "content": "## Mục tiêu bài học\n- Hiểu khái niệm lực và chuyển động...",
      "subjectId": {
        "_id": "68f90793ed106280ef95209b",
        "name": "Vật lý",
        "icon": "science",
        "color": "#F44336"
      },
      "subjectName": "Vật lý",
      "grade": [6, 7],
      "topics": ["Lực", "Chuyển động", "Cơ học"],
      "difficulty": "beginner",
      "duration": 45,
      "createdAt": "2025-10-22T16:34:27.471Z"
    }
  ]
}
```

### 3. Seed Data

Run the seed script to populate MongoDB with initial data:

```bash
# Using Docker
docker compose exec backend npm run seed

# Direct Node.js
cd ai_tutor_backend
node src/seedData.js
```

**Seeded Data:**
- **13 Subjects**: Toán, Lý, Hóa, Văn, Anh, Sinh, Sử, Địa, Tin, GDCD, Thể dục, Âm nhạc, Mỹ thuật
- **8 Quizzes**: Various subjects with 2-11 questions each
- **6 Lessons**: Detailed lessons in Markdown format

## Frontend Integration

### 1. API Service (`lib/services/api_service.dart`)

```dart
class ApiService {
  // Subjects API
  static Future<Map<String, dynamic>> getSubjects({int? grade});
  static Future<Map<String, dynamic>> getSubjectById(String id);
  
  // Quizzes API
  static Future<Map<String, dynamic>> getQuizzes({
    int? grade,
    String? subjectName,
    String? difficulty,
  });
  static Future<Map<String, dynamic>> getQuizById(String id);
  
  // Lessons API
  static Future<Map<String, dynamic>> getLessons({
    int? grade,
    String? subjectName,
    String? difficulty,
    List<String>? topics,
  });
  static Future<Map<String, dynamic>> getLessonById(String id);
  static Future<Map<String, dynamic>> getLessonsBySubject(
    String subjectId, {
    int? grade,
    String? difficulty,
  });
}
```

### 2. Models

#### Subject Model (`lib/models/subject.dart`)
```dart
class Subject {
  final String? id;
  final String name;
  final IconData icon;
  final Color color;
  final String? description;
  final List<int>? grade;
  
  factory Subject.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}
```

#### Quiz Model (`lib/models/quiz.dart`)
```dart
class Quiz {
  final String? id;
  final String title;
  final String description;
  final String? subjectId;
  final String subjectName;
  final List<int> grade;
  final String difficulty;
  final List<Question> questions;
  
  factory Quiz.fromJson(Map<String, dynamic> json);
}

class Question {
  final String question;
  final List<String> options;
  final int answer;
  final String? explanation;
  
  factory Question.fromJson(Map<String, dynamic> json);
}
```

#### Lesson Model (`lib/models/lesson.dart`)
```dart
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
  
  factory Lesson.fromJson(Map<String, dynamic> json);
  String get difficultyText; // "Cơ bản" | "Trung bình" | "Nâng cao"
}
```

### 3. Updated Screens

#### SubjectScreen
- Loads subjects from `/api/subjects`
- Shows loading spinner while fetching
- Error handling with retry button
- Search functionality maintained
- Responsive grid layout (2/3/4 columns)

#### QuizScreen
- Loads quizzes from `/api/quizzes`
- Displays subject chips, difficulty badges
- Shows question count
- Full quiz detail view with explanations
- Submit and scoring functionality

#### LessonScreen
- Loads lessons from `/api/lessons`
- Shows subject, difficulty, duration chips
- Displays topics as tags
- Card-based list layout

#### LessonDetailScreen
- Full lesson information display
- Topics as chips
- Difficulty color-coding
- "Start Lesson" button

#### LessonTheoryScreen
- Formatted lesson content display
- Subject metadata header
- "Practice" button to quizzes

## Migration Checklist

- [x] Backend Models (Subject, Quiz, Lesson)
- [x] Backend Routes (subjects, quizzes, lessons)
- [x] Seed Data Script
- [x] API Endpoints Testing
- [x] Frontend Models with JSON parsing
- [x] API Service Methods
- [x] Update SubjectScreen
- [x] Update QuizScreen
- [x] Update LessonScreen
- [x] Update LessonDetailScreen
- [x] Update LessonTheoryScreen
- [x] Docker Rebuild & Deploy
- [x] Remove Hardcoded Data Files

## Testing

### Backend API Testing

```bash
# Test subjects
curl http://localhost:5000/api/subjects | jq

# Test quizzes with filters
curl "http://localhost:5000/api/quizzes?grade=6&difficulty=easy" | jq

# Test lessons with subject filter
curl "http://localhost:5000/api/lessons?subjectName=Toán%20học" | jq
```

### Frontend Testing

1. **Open Application**: http://localhost:3000
2. **Test Subject Loading**:
   - Navigate to "Chọn Môn Học"
   - Should see 13 subjects loaded from API
   - Loading spinner should appear briefly
3. **Test Quiz Loading**:
   - Navigate to "Bài tập luyện tập"
   - Should see 8 quizzes with details
   - Click on quiz to see questions
4. **Test Lesson Loading**:
   - Navigate to "Gợi ý bài học"
   - Should see 6 lessons with metadata
   - Click to view lesson details

## Performance Considerations

### Backend Optimizations
- **Denormalization**: Subject name stored in Quiz/Lesson for faster queries
- **Indexing**: Add indexes on frequently queried fields:
  ```javascript
  subjectSchema.index({ grade: 1, name: 1 });
  quizSchema.index({ subjectName: 1, grade: 1, difficulty: 1 });
  lessonSchema.index({ subjectName: 1, grade: 1, difficulty: 1 });
  ```
- **Population**: Use `.populate()` to include subject details in queries
- **Pagination**: Consider adding pagination for large datasets

### Frontend Optimizations
- **Caching**: Implement response caching in ApiService
- **State Management**: Consider adding Provider/Riverpod for state
- **Lazy Loading**: Load data on-demand rather than all at once
- **Error Retry**: Exponential backoff for failed requests

## Future Enhancements

### Backend
- [ ] User progress tracking (completed lessons/quizzes)
- [ ] Search API with fuzzy matching
- [ ] Sorting and advanced filtering
- [ ] Admin authentication for CRUD operations
- [ ] Rate limiting and API security
- [ ] Database backups and migration scripts

### Frontend
- [ ] Offline mode with local caching
- [ ] Favorite subjects/lessons
- [ ] Progress tracking UI
- [ ] Search functionality
- [ ] Filter by multiple criteria
- [ ] Lesson bookmarking
- [ ] Quiz history and analytics

## Troubleshooting

### Backend Issues

**Issue**: Cannot connect to MongoDB
```bash
# Check if MongoDB container is running
docker ps | grep mongo

# Check MongoDB logs
docker logs ai_tutor_mongo

# Restart MongoDB
docker compose restart mongo
```

**Issue**: API returns 404
```bash
# Check if backend is running
curl http://localhost:5000/

# Check backend logs
docker logs ai_tutor_backend_main

# Rebuild backend
docker compose build --no-cache backend
docker compose restart backend
```

### Frontend Issues

**Issue**: Data not loading
1. Check browser console for errors
2. Verify backend is accessible: http://localhost:5000/api/subjects
3. Check CORS configuration in backend
4. Verify ConfigService.backendUrl is correct

**Issue**: Build errors
```bash
# Clean Flutter build
cd ai_tutor_app
flutter clean
flutter pub get
flutter build web

# Or rebuild Docker
docker compose build --no-cache frontend
```

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://mongo:27017/ai_tutor
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_secret_here
```

### Frontend
Backend URL is configured in `lib/services/config_service.dart`:
```dart
static String get backendUrl => kIsWeb 
    ? 'http://localhost:5000'  // Web
    : 'http://10.0.2.2:5000';  // Android emulator
```

## Documentation

- Backend API: `/home/tansang/AI-Tutor/ai_tutor_backend/SEED_DATA_GUIDE.md`
- Frontend Responsive: `/home/tansang/AI-Tutor/RESPONSIVE_IMPROVEMENTS.md`
- This Guide: `/home/tansang/AI-Tutor/API_INTEGRATION_GUIDE.md`

## Support

For issues or questions:
1. Check logs: `docker logs <container_name>`
2. Review code comments in models/routes
3. Test API endpoints with curl/Postman
4. Check browser DevTools for frontend errors

---

**Migration Completed**: October 22, 2025
**Status**: ✅ Production Ready
