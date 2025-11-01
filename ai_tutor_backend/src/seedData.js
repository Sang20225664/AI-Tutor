const mongoose = require('mongoose');
const { Subject, Quiz, Lesson, LessonSuggestion } = require('./models');
const { grade5Quizzes, grade5Lessons, grade5Suggestions } = require('./data/grade5Data');

// MongoDB connection string - use MONGO_URI from environment or fallback to mongo hostname
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://mongo:27017/ai_tutor';

// Subject data with icon names and colors
const subjectsData = [
    { name: 'Toán học', icon: 'calculate', color: '#2196F3', description: 'Học toán từ cơ bản đến nâng cao', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Vật lý', icon: 'science', color: '#F44336', description: 'Khám phá các quy luật tự nhiên', grade: [6, 7, 8, 9, 10, 11, 12] },
    { name: 'Hóa học', icon: 'biotech', color: '#4CAF50', description: 'Thế giới các phản ứng hóa học', grade: [8, 9, 10, 11, 12] },
    { name: 'Ngữ văn', icon: 'text_fields', color: '#00BCD4', description: 'Văn học và tiếng Việt', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Tiếng Anh', icon: 'language', color: '#9C27B0', description: 'Học tiếng Anh giao tiếp và học thuật', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Sinh học', icon: 'eco', color: '#009688', description: 'Khám phá sự sống', grade: [6, 7, 8, 9, 10, 11, 12] },
    { name: 'Lịch sử', icon: 'history_edu', color: '#FF9800', description: 'Tìm hiểu quá khứ, hiểu hiện tại', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Địa lý', icon: 'public', color: '#795548', description: 'Khám phá thế giới xung quanh', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Tin học', icon: 'computer', color: '#3F51B5', description: 'Công nghệ thông tin và lập trình', grade: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Giáo dục công dân', icon: 'school', color: '#FFC107', description: 'Đạo đức và công dân', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Thể dục', icon: 'fitness_center', color: '#03A9F4', description: 'Rèn luyện thể chất', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Âm nhạc', icon: 'music_note', color: '#E91E63', description: 'Thế giới âm thanh', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: 'Mỹ thuật', icon: 'brush', color: '#FF5722', description: 'Nghệ thuật tạo hình', grade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

// Quiz data (from quiz_data.dart)
const quizzesData = [
    {
        title: 'Toán học cơ bản',
        description: 'Kiểm tra kiến thức toán học cơ bản.',
        subjectName: 'Toán học',
        grade: [1, 2, 3],
        difficulty: 'easy',
        questions: [
            { question: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: 1 },
            { question: '5 x 3 = ?', options: ['8', '15', '10', '20'], answer: 1 },
        ],
    },
    {
        title: 'Tiếng Anh cơ bản',
        description: 'Kiểm tra từ vựng tiếng Anh cơ bản.',
        subjectName: 'Tiếng Anh',
        grade: [1, 2, 3],
        difficulty: 'easy',
        questions: [
            { question: 'Dog nghĩa là gì?', options: ['Mèo', 'Chó', 'Cá', 'Chim'], answer: 1 },
            { question: 'Apple là quả gì?', options: ['Cam', 'Chuối', 'Táo', 'Nho'], answer: 2 },
        ],
    },
    {
        title: 'Lịch sử Việt Nam',
        description: 'Kiểm tra kiến thức lịch sử Việt Nam.',
        subjectName: 'Lịch sử',
        grade: [8, 9, 10, 11, 12],
        difficulty: 'medium',
        questions: [
            { question: 'Năm 1945, sự kiện nào diễn ra ở Việt Nam?', options: ['Cách mạng tháng Tám', 'Chiến tranh thế giới thứ hai', 'Khởi nghĩa Lam Sơn', 'Chiến dịch Điện Biên Phủ'], answer: 0 },
            { question: 'Ai là người đọc Tuyên ngôn Độc lập ngày 2/9/1945?', options: ['Trần Hưng Đạo', 'Hồ Chí Minh', 'Lê Lợi', 'Ngô Quyền'], answer: 1 },
            { question: 'Ai là vị vua đầu tiên của nhà Nguyễn?', options: ['Gia Long', 'Minh Mạng', 'Thiệu Trị', 'Tự Đức'], answer: 0 },
            { question: 'Chiến dịch Điện Biên Phủ diễn ra vào năm nào?', options: ['1954', '1945', '1968', '1975'], answer: 0 },
            { question: 'Ai là người sáng lập ra nhà Nguyễn?', options: ['Nguyễn Huệ', 'Nguyễn Ánh', 'Nguyễn Thái Học', 'Nguyễn Trãi'], answer: 1 },
            { question: 'Sự kiện nào đánh dấu sự kết thúc của Chiến tranh Việt Nam?', options: ['Hiệp định Paris', 'Chiến dịch Hồ Chí Minh', 'Chiến dịch Điện Biên Phủ', 'Cách mạng tháng Tám'], answer: 1 },
            { question: 'Ai là người lãnh đạo cuộc khởi nghĩa Lam Sơn?', options: ['Lê Lợi', 'Trần Hưng Đạo', 'Nguyễn Huệ', 'Ngô Quyền'], answer: 0 },
            { question: 'Năm 1975, sự kiện nào diễn ra ở Việt Nam?', options: ['Giải phóng miền Nam', 'Cách mạng tháng Tám', 'Chiến tranh thế giới thứ hai', 'Khởi nghĩa Lam Sơn'], answer: 0 },
            { question: 'Ai là người sáng lập ra Đảng Cộng sản Việt Nam?', options: ['Hồ Chí Minh', 'Trường Chinh', 'Lê Duẩn', 'Phạm Văn Đồng'], answer: 0 },
            { question: 'Ai là người lãnh đạo cuộc khởi nghĩa chống Pháp ở Bắc Kỳ?', options: ['Trần Hưng Đạo', 'Nguyễn Huệ', 'Ngô Quyền', 'Lê Lợi'], answer: 0 },
        ],
    },
    {
        title: 'Khoa học tự nhiên',
        description: 'Kiểm tra kiến thức khoa học tự nhiên.',
        subjectName: 'Vật lý',
        grade: [6, 7, 8],
        difficulty: 'easy',
        questions: [
            { question: 'Nước có công thức hóa học là gì?', options: ['CO2', 'H2O', 'O2', 'NaCl'], answer: 1 },
            { question: 'Trái Đất quay quanh gì?', options: ['Mặt Trăng', 'Sao Hỏa', 'Mặt Trời', 'Sao Kim'], answer: 2 },
        ],
    },
    {
        title: 'Địa lý Việt Nam',
        description: 'Kiểm tra kiến thức địa lý Việt Nam.',
        subjectName: 'Địa lý',
        grade: [5, 6, 7, 8],
        difficulty: 'easy',
        questions: [
            { question: 'Thủ đô của Việt Nam là gì?', options: ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'], answer: 0 },
            { question: 'Sông Hồng chảy qua thành phố nào?', options: ['Hải Phòng', 'Hà Nội', 'Huế', 'Nha Trang'], answer: 1 },
        ],
    },
    {
        title: 'Văn học Việt Nam',
        description: 'Kiểm tra kiến thức văn học Việt Nam.',
        subjectName: 'Ngữ văn',
        grade: [10, 11, 12],
        difficulty: 'medium',
        questions: [
            { question: 'Tác giả của bài thơ "Tây Tiến" là ai?', options: ['Tố Hữu', 'Quang Dũng', 'Xuân Diệu', 'Chế Lan Viên'], answer: 1 },
            { question: 'Ai là tác giả của tác phẩm "Chí Phèo"?', options: ['Nam Cao', 'Ngô Tất Tố', 'Nguyễn Tuân', 'Nguyễn Minh Châu'], answer: 0 },
        ],
    },
    {
        title: 'Tin học cơ bản',
        description: 'Kiểm tra kiến thức tin học cơ bản.',
        subjectName: 'Tin học',
        grade: [6, 7, 8, 9],
        difficulty: 'easy',
        questions: [
            { question: 'Hệ điều hành phổ biến nhất hiện nay là gì?', options: ['Windows', 'Linux', 'macOS', 'Android'], answer: 0 },
            { question: 'HTML là viết tắt của từ gì?', options: ['HyperText Markup Language', 'HighText Markup Language', 'HyperText Markdown Language', 'HighText Markdown Language'], answer: 0 },
        ],
    },
    {
        title: 'Giáo dục công dân',
        description: 'Kiểm tra kiến thức giáo dục công dân.',
        subjectName: 'Giáo dục công dân',
        grade: [6, 7, 8, 9],
        difficulty: 'medium',
        questions: [
            { question: 'Quyền nào sau đây không phải là quyền cơ bản của công dân?', options: ['Quyền tự do ngôn luận', 'Quyền bầu cử', 'Quyền sở hữu tài sản', 'Quyền được bảo vệ bí mật đời tư'], answer: 3 },
            { question: 'Luật pháp Việt Nam quy định độ tuổi tối thiểu để kết hôn là bao nhiêu?', options: ['16 tuổi', '18 tuổi', '20 tuổi', '22 tuổi'], answer: 1 },
        ],
    },
    // Add Grade 5 quizzes
    ...grade5Quizzes,
];

// Lesson data
const lessonsData = [
    {
        title: 'Phép cộng và phép trừ trong phạm vi 100',
        content: `## Mục tiêu bài học
- Hiểu và thực hiện phép cộng, trừ trong phạm vi 100
- Áp dụng vào các bài toán thực tế

## Nội dung
### 1. Phép cộng
Phép cộng là phép tính gộp hai số lại với nhau.
Ví dụ: 25 + 17 = 42

### 2. Phép trừ
Phép trừ là phép tính lấy đi một phần từ tổng.
Ví dụ: 50 - 23 = 27

## Bài tập thực hành
1. 34 + 26 = ?
2. 78 - 45 = ?
3. 12 + 38 + 15 = ?`,
        subjectName: 'Toán học',
        grade: [1, 2],
        topics: ['Phép cộng', 'Phép trừ'],
        difficulty: 'beginner',
        duration: 45
    },
    {
        title: 'Giới thiệu về lực và chuyển động',
        content: `## Mục tiêu bài học
- Hiểu khái niệm lực và chuyển động
- Phân biệt các loại lực

## Nội dung
### 1. Lực là gì?
Lực là tác động làm vật thay đổi trạng thái chuyển động hoặc biến dạng.

### 2. Các loại lực
- Lực đẩy
- Lực kéo
- Lực ma sát
- Trọng lực

### 3. Chuyển động
Chuyển động là sự thay đổi vị trí của vật theo thời gian.

## Thí nghiệm
Quan sát chuyển động của xe đồ chơi khi được đẩy trên các bề mặt khác nhau.`,
        subjectName: 'Vật lý',
        grade: [6, 7],
        topics: ['Lực', 'Chuyển động', 'Cơ học'],
        difficulty: 'beginner',
        duration: 45
    },
    {
        title: 'Cách mạng tháng Tám 1945',
        content: `## Mục tiêu bài học
- Hiểu nguyên nhân, diễn biến và ý nghĩa của Cách mạng tháng Tám
- Nhận thức vai trò lãnh đạo của Đảng

## Nội dung
### 1. Bối cảnh lịch sử
- Thế giới: Chiến tranh thế giới thứ hai sắp kết thúc
- Việt Nam: Nạn đói năm 1945

### 2. Diễn biến
- Khởi nghĩa ở Hà Nội (19/8/1945)
- Lực lượng Việt Minh chiếm chính quyền các địa phương
- Vua Bảo Đại thoái vị (25/8/1945)

### 3. Ý nghĩa
- Giành được độc lập dân tộc
- Lật đổ chế độ phong kiến
- Nước Việt Nam Dân chủ Cộng hòa ra đời

## Tài liệu tham khảo
Tuyên ngôn Độc lập ngày 2/9/1945 của Chủ tịch Hồ Chí Minh`,
        subjectName: 'Lịch sử',
        grade: [9, 10],
        topics: ['Lịch sử Việt Nam', 'Cách mạng tháng Tám', 'Độc lập'],
        difficulty: 'intermediate',
        duration: 60
    },
    {
        title: 'English Grammar: Present Simple Tense',
        content: `## Learning Objectives
- Understand and use Present Simple tense
- Form positive, negative, and question sentences

## Content
### 1. Structure
**Positive:** Subject + V(s/es)
- I/You/We/They + verb
- He/She/It + verb + s/es

**Negative:** Subject + do/does + not + verb
- I/You/We/They + don't + verb
- He/She/It + doesn't + verb

**Question:** Do/Does + subject + verb?

### 2. Usage
- Habitual actions: I go to school every day.
- General truths: The sun rises in the east.
- Scheduled events: The train leaves at 8 AM.

### 3. Time expressions
- Always, usually, often, sometimes, rarely, never
- Every day/week/month/year
- On Mondays, at weekends

## Practice Exercises
1. She _____ (go) to work by bus.
2. They _____ (not like) coffee.
3. _____ you _____ (speak) English?`,
        subjectName: 'Tiếng Anh',
        grade: [6, 7, 8],
        topics: ['Grammar', 'Present Simple', 'Tenses'],
        difficulty: 'beginner',
        duration: 45
    },
    {
        title: 'Giới thiệu về HTML và CSS',
        content: `## Mục tiêu bài học
- Hiểu cấu trúc cơ bản của HTML
- Làm quen với CSS để tạo kiểu cho trang web

## Nội dung
### 1. HTML - Ngôn ngữ đánh dấu siêu văn bản
HTML (HyperText Markup Language) là ngôn ngữ để tạo cấu trúc trang web.

**Cấu trúc cơ bản:**
\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Trang web của tôi</title>
  </head>
  <body>
    <h1>Xin chào!</h1>
    <p>Đây là đoạn văn bản.</p>
  </body>
</html>
\`\`\`

### 2. CSS - Cascading Style Sheets
CSS dùng để tạo kiểu, màu sắc, bố cục cho trang web.

**Ví dụ:**
\`\`\`css
h1 {
  color: blue;
  font-size: 24px;
}

p {
  color: gray;
  line-height: 1.6;
}
\`\`\`

## Bài tập thực hành
Tạo một trang web đơn giản giới thiệu bản thân với HTML và CSS.`,
        subjectName: 'Tin học',
        grade: [8, 9, 10],
        topics: ['HTML', 'CSS', 'Web Development'],
        difficulty: 'beginner',
        duration: 60
    },
    {
        title: 'Phân tích tác phẩm "Chí Phèo" - Nam Cao',
        content: `## Mục tiêu bài học
- Hiểu nội dung và nghệ thuật của truyện ngắn "Chí Phèo"
- Phân tích hình tượng nhân vật Chí Phèo

## Nội dung
### 1. Tác giả Nam Cao (1915-1951)
- Nhà văn hiện thực xuất sắc
- Tác phẩm tiêu biểu: Chí Phèo, Lão Hạc, Sống mòn...

### 2. Hoàn cảnh sáng tác
Truyện viết năm 1941, phản ánh xã hội Việt Nam trước Cách mạng tháng Tám.

### 3. Nội dung truyện
- Hoàn cảnh và số phận bi thảm của Chí Phèo
- Mối quan hệ giữa Chí Phèo và Thị Nở
- Cái chết của Chí Phèo

### 4. Nghệ thuật
- Kỹ thuật kể chuyện: Lồng ghép hiện tại - quá khứ
- Phong cách: Giọng văn châm biếm, trào phúng
- Hình tượng nghệ thuật: Chí Phèo - nạn nhân của xã hội

## Câu hỏi thảo luận
1. Vì sao Chí Phèo trở thành kẻ côn đồ?
2. Ý nghĩa cái chết của Chí Phèo?
3. Thông điệp nhân văn của tác phẩm?`,
        subjectName: 'Ngữ văn',
        grade: [11, 12],
        topics: ['Văn học Việt Nam', 'Truyện ngắn', 'Nam Cao'],
        difficulty: 'intermediate',
        duration: 90
    },
    // Add Grade 5 lessons
    ...grade5Lessons,
];

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Subject.deleteMany({});
        await Quiz.deleteMany({});
        await Lesson.deleteMany({});
        await LessonSuggestion.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert subjects
        console.log('📚 Inserting subjects...');
        const subjects = await Subject.insertMany(subjectsData);
        console.log(`✅ Inserted ${subjects.length} subjects`);

        // Create subject map for reference
        const subjectMap = {};
        subjects.forEach(subject => {
            subjectMap[subject.name] = subject._id;
        });

        // Insert quizzes with subject references
        console.log('📝 Inserting quizzes...');
        const quizzesWithRefs = quizzesData.map(quiz => ({
            ...quiz,
            subjectId: subjectMap[quiz.subjectName]
        }));
        const quizzes = await Quiz.insertMany(quizzesWithRefs);
        console.log(`✅ Inserted ${quizzes.length} quizzes`);

        // Insert lessons with subject references
        console.log('📖 Inserting lessons...');
        const lessonsWithRefs = lessonsData.map(lesson => ({
            ...lesson,
            subjectId: subjectMap[lesson.subjectName]
        }));
        const lessons = await Lesson.insertMany(lessonsWithRefs);
        console.log(`✅ Inserted ${lessons.length} lessons`);

        // Insert lesson suggestions for grade 5
        console.log('💡 Inserting lesson suggestions...');
        const suggestionsWithRefs = grade5Suggestions.map(suggestion => ({
            ...suggestion,
            subjectId: subjectMap[suggestion.subjectName]
        }));
        const suggestions = await LessonSuggestion.insertMany(suggestionsWithRefs);
        console.log(`✅ Inserted ${suggestions.length} lesson suggestions`);

        // Print summary
        console.log('\n📊 Seed Data Summary:');
        console.log(`   - Subjects: ${subjects.length}`);
        console.log(`   - Quizzes: ${quizzes.length}`);
        console.log(`   - Lessons: ${lessons.length}`);
        console.log(`   - Lesson Suggestions: ${suggestions.length}`);
        console.log('\n✨ Database seeding completed successfully!');

        return { subjects, quizzes, lessons, suggestions };
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Export the seed function for use in other files
module.exports = seedDatabase;

// Run the seed function only if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

