# AI Tutor Backend - Seed Data Guide

## Overview
This guide explains how to seed the MongoDB database with initial data for:
- **Subjects** (môn học)
- **Quizzes** (bài tập)
- **Lessons** (bài học)

## Prerequisites
- Docker and Docker Compose installed
- Backend and MongoDB containers running

## Seeding the Database

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Make sure containers are running
cd /home/tansang/AI-Tutor
docker compose up -d

# 2. Run seed script inside the backend container
docker compose exec backend npm run seed
```

### Option 2: Using Docker Exec

```bash
# Run seed script directly
docker exec -it ai_tutor_backend_main npm run seed
```

### Option 3: Manual Execution

```bash
# Access the backend container
docker exec -it ai_tutor_backend_main sh

# Run the seed script
cd /usr/src/app
node src/seedData.js

# Exit container
exit
```

## Expected Output

When seeding completes successfully, you should see:

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Cleared existing data
📚 Inserting subjects...
✅ Inserted 13 subjects
📝 Inserting quizzes...
✅ Inserted 8 quizzes
📖 Inserting lessons...
✅ Inserted 6 lessons

📊 Seed Data Summary:
   - Subjects: 13
   - Quizzes: 8
   - Lessons: 6

✨ Database seeding completed successfully!
```

## Data Structure

### Subjects
- 13 subjects from grade 1-12
- Includes: Toán học, Vật lý, Hóa học, Ngữ văn, Tiếng Anh, Sinh học, Lịch sử, Địa lý, Tin học, GDCD, Thể dục, Âm nhạc, Mỹ thuật

### Quizzes
- Multiple choice quizzes for various subjects
- Organized by subject, grade level, and difficulty
- Includes answer keys and explanations

### Lessons
- Detailed lesson content in Markdown format
- Associated with subjects and grade levels
- Topics, difficulty, and duration included

## API Endpoints

After seeding, these endpoints will be available:

### Subjects
```
GET    /api/subjects              # Get all subjects
GET    /api/subjects/:id          # Get subject by ID
GET    /api/subjects?grade=6      # Filter by grade
POST   /api/subjects              # Create subject (admin)
PUT    /api/subjects/:id          # Update subject (admin)
DELETE /api/subjects/:id          # Delete subject (admin)
```

### Quizzes
```
GET    /api/quizzes               # Get all quizzes
GET    /api/quizzes/:id           # Get quiz by ID
GET    /api/quizzes?grade=6       # Filter by grade
GET    /api/quizzes?subjectName=Toán học  # Filter by subject
POST   /api/quizzes               # Create quiz (admin)
PUT    /api/quizzes/:id           # Update quiz (admin)
DELETE /api/quizzes/:id           # Delete quiz (admin)
```

### Lessons
```
GET    /api/lessons               # Get all lessons
GET    /api/lessons/:id           # Get lesson by ID
GET    /api/lessons?grade=6       # Filter by grade
GET    /api/lessons?subjectName=Toán học  # Filter by subject
POST   /api/lessons               # Create lesson (admin)
PUT    /api/lessons/:id           # Update lesson (admin)
DELETE /api/lessons/:id           # Delete lesson (admin)
```

## Testing the API

### Using curl

```bash
# Get all subjects
curl http://localhost:3001/api/subjects

# Get subjects for grade 6
curl http://localhost:3001/api/subjects?grade=6

# Get all quizzes
curl http://localhost:3001/api/quizzes

# Get quizzes for Toán học
curl "http://localhost:3001/api/quizzes?subjectName=Toán%20học"

# Get all lessons
curl http://localhost:3001/api/lessons
```

### Using Browser
Simply navigate to:
- http://localhost:3001/api/subjects
- http://localhost:3001/api/quizzes
- http://localhost:3001/api/lessons

## Re-seeding the Database

To clear and re-seed the database:

```bash
# The seed script automatically clears existing data before inserting new data
docker compose exec backend npm run seed
```

## Troubleshooting

### Connection Issues
```bash
# Check if MongoDB container is running
docker ps | grep mongo

# Check MongoDB logs
docker logs ai_tutor_mongo

# Restart containers
docker compose restart
```

### Seed Script Errors
```bash
# Check backend logs
docker logs ai_tutor_backend_main

# Access container and check files
docker exec -it ai_tutor_backend_main ls -la src/
```

### MongoDB Access
```bash
# Access MongoDB shell
docker exec -it ai_tutor_mongo mongosh

# In MongoDB shell
use ai_tutor
db.subjects.countDocuments()
db.quizzes.countDocuments()
db.lessons.countDocuments()
```

## Models Reference

### Subject Model
```javascript
{
  name: String,              // Subject name
  icon: String,              // Material Icon name
  color: String,             // Hex color code
  description: String,       // Optional description
  grade: [Number],           // Array of grades (1-12)
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Model
```javascript
{
  title: String,
  description: String,
  subjectId: ObjectId,       // Reference to Subject
  subjectName: String,       // Denormalized
  grade: [Number],
  difficulty: String,        // 'easy' | 'medium' | 'hard'
  questions: [{
    question: String,
    options: [String],
    answer: Number,          // Index of correct answer
    explanation: String      // Optional
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Lesson Model
```javascript
{
  title: String,
  content: String,           // Markdown content
  subjectId: ObjectId,       // Reference to Subject
  subjectName: String,       // Denormalized
  grade: [Number],
  topics: [String],
  difficulty: String,        // 'beginner' | 'intermediate' | 'advanced'
  duration: Number,          // Minutes
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. **Frontend Integration**: Update Flutter app to fetch data from API instead of hardcoded arrays
2. **Add More Content**: Expand quizzes and lessons for all grades
3. **User Progress**: Track which quizzes/lessons users have completed
4. **Admin Panel**: Create UI for managing subjects, quizzes, and lessons
5. **Search & Filter**: Implement advanced search and filtering
6. **Recommendations**: AI-powered lesson recommendations based on user progress
