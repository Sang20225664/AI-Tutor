const mongoose = require('mongoose');
const Subject = require('../src/models/Subject');
const Lesson = require('../src/models/Lesson');
const Quiz = require('../src/models/Quiz');
const LessonSuggestion = require('../src/models/LessonSuggestion');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learning_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB:', MONGODB_URI);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

const generateData = async () => {
    await connectDB();
    console.log("Tìm subject Toán học, Ngữ văn, Tiếng Anh...");
    const toan = await Subject.findOne({ name: 'Toán học' });
    const ngan = await Subject.findOne({ name: 'Ngữ văn' });
    const eng = await Subject.findOne({ name: 'Tiếng Anh' });

    if (!toan || !ngan || !eng) {
        console.log("Warning: Không tìm thấy cơ sở các môn học. Hãy chạy seedData ban đầu trước.");
        process.exit(1);
    }

    const lessons = [];
    const quizzes = [];
    const suggestions = [];

    // Tạo dữ liệu cho Toán lớp 6 -> 12
    for (let grade = 6; grade <= 12; grade++) {
        for (let i = 1; i <= 5; i++) {
            // Toán
            lessons.push({
                subjectId: toan._id,
                title: `Bài ${i}: Ôn tập Toán Đại Số lớp ${grade} - Phần ${i}`,
                lessonNumber: i,
                description: `Kiến thức đại số cốt lõi chương trình lớp ${grade}, phần ${i}.`,
                content: `Nội dung chi tiết Toán học lớp ${grade} bài ${i}. Đây là kiến thức quan trọng để nắm vững các phương trình, hệ phương trình và bất đẳng thức cốt lõi.`,
                videoUrl: `https://youtube.com/watch?v=toan${grade}_${i}`,
                duration: Math.floor(Math.random() * 30) + 15,
                grade: grade,
                subjectName: toan.name,
                status: 'published'
            });

            // Quizzes Toán
            quizzes.push({
                subjectId: toan._id,
                title: `Trắc nghiệm Toán ${grade} - Bài ${i}`,
                description: `Kiểm tra kiến thức Đại số lớp ${grade} bài ${i}.`,
                grade: grade,
                difficulty: 'medium',
                subjectName: toan.name,
                questions: [
                    {
                        question: `Kết quả của phương trình mẫu bài ${i} lớp ${grade} là gì?`,
                        options: ['A', 'B', 'C', 'D'],
                        answer: 0,
                        explanation: 'Vì theo công thức cơ bản...'
                    },
                    {
                        question: `Công thức nào sai trong bài ${i}?`,
                        options: ['X', 'Y', 'Z', 'W'],
                        answer: 2,
                        explanation: 'Công thức Z không tồn tại.'
                    }
                ]
            });

            // Ngữ văn
            lessons.push({
                subjectId: ngan._id,
                title: `Bài ${i}: Tác phẩm văn học dân gian. Ngữ văn ${grade}`,
                lessonNumber: i,
                description: `Khám phá các nét đẹp văn học Việt Nam lớp ${grade}, bài ${i}.`,
                content: `Chi tiết phân tích tác phẩm bài ${i}. Cảm nhận vẻ đẹp ngôn từ, ý nghĩa sâu sắc mà tác giả gửi gắm...`,
                videoUrl: `https://youtube.com/watch?v=nguvan${grade}_${i}`,
                duration: 45,
                grade: grade,
                subjectName: ngan.name,
                status: 'published'
            });

             // English
            lessons.push({
                subjectId: eng._id,
                title: `Unit ${i}: Grammar and Vocabulary - English ${grade}`,
                lessonNumber: i,
                description: `Advanced English vocabulary unit ${i} for grade ${grade}.`,
                content: `In this unit we learn new vocabulary, idioms, grammar structures and how to apply them in writing and speaking...`,
                videoUrl: `https://youtube.com/watch?v=eng${grade}_${i}`,
                duration: 25,
                grade: grade,
                subjectName: eng.name,
                status: 'published'
            });

            // Suggestions
            suggestions.push({
                subjectId: eng._id,
                title: `Lộ trình chinh phục Tiếng Anh ${grade} - Giai đoạn ${i}`,
                description: `Học giỏi tiếng Anh toàn diện kèm từ vựng bài ${i}`,
                grade: grade,
                reason: `Đề xuất dựa trên lộ trình chuẩn lớp ${grade}`,
                subjectName: eng.name,
                priority: i,
                status: 'active'
            });
        }
    }

    console.log(`Đang lưu ${lessons.length} lessons, ${quizzes.length} quizzes, ${suggestions.length} suggestions...`);
    await Lesson.insertMany(lessons);
    await Quiz.insertMany(quizzes);
    await LessonSuggestion.insertMany(suggestions);

    console.log("✅ Seed thành công rất nhiều data!");
    process.exit(0);
};

generateData();

