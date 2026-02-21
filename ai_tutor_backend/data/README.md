# Demo Dataset cho AI Tutor v2

## 📋 Tổng quan

Đây là bộ **demo dataset dạng hybrid** (JSON + Markdown) cho hệ thống AI Tutor v2, được thiết kế theo hướng **production-like** nhưng vẫn là toy data để test các tính năng:

- ✅ Progress tracking (Phase 2)
- ✅ AI quiz generation
- ✅ Dashboard analytics
- ✅ Cloud deployment testing

## 📁 Cấu trúc thư mục

```
data/
├── subjects.json                    # 4 môn học (Toán, Vật lý, Hóa, Tiếng Anh lớp 10)
├── lessons/                         # Markdown lessons
│   ├── math10/                      # 5 bài Toán 10
│   │   ├── 01-ham-so-bac-nhat.md
│   │   ├── 02-phuong-trinh-bac-nhat.md
│   │   ├── 03-bat-phuong-trinh-bac-nhat.md
│   │   ├── 04-he-phuong-trinh-bac-nhat.md
│   │   └── 05-he-thuc-luong-tam-giac-vuong.md
│   ├── physics10/                   # 5 bài Vật lý 10
│   │   ├── 01-chuyen-dong-thang-deu.md
│   │   ├── 02-chuyen-dong-thang-bien-doi-deu.md
│   │   ├── 03-ba-dinh-luat-newton.md
│   │   ├── 04-cong-va-cong-suat.md
│   │   └── 05-dong-nang-va-the-nang.md
│   ├── chemistry10/                 # 5 bài Hóa 10
│   │   ├── 01-cau-tao-nguyen-tu.md
│   │   ├── 02-bang-tuan-hoan.md
│   │   ├── 03-lien-ket-hoa-hoc.md
│   │   ├── 04-phan-ung-oxi-hoa-khu.md
│   │   └── 05-mol-va-tinh-toan-hoa-hoc.md
│   └── english10/                   # 5 bài Tiếng Anh 10
│       ├── 01-present-tenses.md
│       ├── 02-past-tenses.md
│       ├── 03-future-forms.md
│       ├── 04-conditional-sentences.md
│       └── 05-passive-voice.md
├── quizzes/                         # JSON quiz files
│   ├── math10.json                  # 15 câu hỏi Toán
│   ├── physics10.json               # 17 câu hỏi Vật lý
│   ├── chemistry10.json             # 16 câu hỏi Hóa
│   └── english10.json               # 16 câu hỏi Tiếng Anh
└── seed-demo-dataset.js             # Seeding script
```

## 📊 Thống kê Dataset

| Môn học | Số bài học | Số câu hỏi | Tổng từ (ước tính) |
|---------|-----------|------------|-------------------|
| **Toán 10** | 5 | 15 | ~7,000 |
| **Vật lý 10** | 5 | 17 | ~7,000 |
| **Hóa 10** | 5 | 16 | ~4,000 |
| **Tiếng Anh 10** | 5 | 16 | ~8,000 |
| **TỔNG** | **20** | **64** | **~26,000** |

## 🎯 Đặc điểm Dataset

### 1. Subjects (subjects.json)
- 4 môn học: Toán 10, Vật lý 10, Hóa 10, Tiếng Anh 10
- Mỗi subject có: name, gradeLevels, description, createdAt

### 2. Lessons (Markdown files)
- **Format:** Markdown (.md)
- **Nội dung:** 300-1800 từ/bài (trung bình ~800 từ)
- **Cấu trúc:** Tiêu đề, lý thuyết, ví dụ, bài tập
- **Chất lượng:** Nội dung học thuật thật, phù hợp lớp 10

### 3. Quizzes (JSON files)
- **Format:** JSON array
- **Số lượng:** 10-17 câu hỏi/môn
- **Độ khó:** easy, medium, hard
- **Nội dung:** 
  - `question`: Câu hỏi rõ ràng
  - `options`: 4 đáp án (A, B, C, D)
  - `correctAnswer`: Index của đáp án đúng (0-3)
  - `explanation`: Giải thích chi tiết (không generic)
  - `difficulty`: Mức độ khó

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies

```bash
cd ai_tutor_backend
npm install
```

### 2. Cấu hình MongoDB

Đảm bảo MongoDB đang chạy và cập nhật connection string trong `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ai_tutor_v2
```

### 3. Chạy seed script

```bash
node data/seed-demo-dataset.js
```

### 4. Output mong đợi

```
╔════════════════════════════════════════╗
║   AI Tutor v2 - Demo Dataset Seeder   ║
╚════════════════════════════════════════╝
✓ Connected to MongoDB

=== Seeding Subjects ===
  ✓ Inserted subject: Toán 10
  ✓ Inserted subject: Vật lý 10
  ✓ Inserted subject: Hóa 10
  ✓ Inserted subject: Tiếng Anh 10

Subjects: 4 inserted, 0 skipped

=== Seeding Lessons ===
  ✓ Inserted lesson: Hàm số bậc nhất (Toán 10)
  ✓ Inserted lesson: Phương trình bậc nhất (Toán 10)
  ...
  
Lessons: 20 inserted, 0 skipped

=== Seeding Quizzes ===
  ✓ Inserted quizzes for lesson: Hàm số bậc nhất (Toán 10)
  ...
  
Quizzes: 64 inserted, 0 skipped

╔════════════════════════════════════════╗
║           Seeding Summary             ║
╠════════════════════════════════════════╣
║ Subjects: 4 inserted, 0 skipped
║ Lessons:  20 inserted, 0 skipped
║ Quizzes:  64 inserted, 0 skipped
╠════════════════════════════════════════╣
║ Completed in 2.34s
╚════════════════════════════════════════╝
```

### 5. Kiểm tra idempotency (chạy lại)

```bash
node data/seed-demo-dataset.js
```

Output sẽ hiển thị "skipped" cho các item đã tồn tại, không xóa hoặc duplicate dữ liệu.

## 🔍 Kiểm tra dữ liệu trong MongoDB

```bash
mongosh ai_tutor_v2
```

```javascript
// Đếm số lượng
db.subjects.countDocuments()   // 4
db.lessons.countDocuments()    // 20
db.quizzes.countDocuments()    // 64

// Xem subjects
db.subjects.find()

// Xem lessons của Toán 10
db.subjects.findOne({ name: "Toán 10" })  // Lấy _id
db.lessons.find({ subject: ObjectId("...") })

// Xem quizzes của một lesson
db.lessons.findOne({ title: "Hàm số bậc nhất" })  // Lấy _id
db.quizzes.find({ lesson: ObjectId("...") })
```

## 📝 Schema Models (V2)

### Subject Schema
```javascript
{
  name: String,
  gradeLevels: [Number],
  description: String,
  createdAt: Date
}
```

### Lesson Schema
```javascript
{
  title: String,
  subject: ObjectId (ref: Subject),
  gradeLevel: Number,
  content: String (markdown),
  order: Number,
  duration: Number (minutes),
  difficulty: String,
  status: String,
  createdAt: Date
}
```

### Quiz Schema
```javascript
{
  question: String,
  options: [String],
  correctAnswer: Number,
  explanation: String,
  difficulty: String,
  lesson: ObjectId (ref: Lesson),
  subject: ObjectId (ref: Subject),
  gradeLevel: Number,
  createdAt: Date
}
```

## 🛠️ Troubleshooting

### Lỗi: Cannot find module '../models/Subject'

**Nguyên nhân:** Models chưa được tạo hoặc path không đúng.

**Giải pháp:** 
1. Kiểm tra file models trong `ai_tutor_backend/models/`
2. Cập nhật path trong `seed-demo-dataset.js` nếu cần

### Lỗi: MongoDB connection failed

**Nguyên nhân:** MongoDB chưa chạy hoặc connection string sai.

**Giải pháp:**
```bash
# Khởi động MongoDB
sudo systemctl start mongodb
# Hoặc
mongod --dbpath=/path/to/data
```

### Lỗi: Duplicate key error

**Nguyên nhân:** Dữ liệu đã tồn tại nhưng logic idempotent chưa hoạt động đúng.

**Giải pháp:** Script đã xử lý idempotency, chạy lại sẽ skip các item đã có.

## 📚 Tài liệu liên quan

- [API Integration Guide](../API_INTEGRATION_GUIDE.md)
- [Seed Data Guide](../SEED_DATA_GUIDE.md)
- [CI/CD Guide](../CICD_GUIDE.md)

## 🎓 Mục đích sử dụng

Dataset này được tạo ra để:

1. **Testing Progress Tracking (Phase 2):**
   - User học lesson, track tiến độ
   - Hiển thị % hoàn thành theo môn/grade

2. **Testing AI Quiz Generation:**
   - Dùng lesson content làm context
   - Generate thêm quiz questions

3. **Testing Dashboard Analytics:**
   - Thống kê số bài học/môn
   - Thống kê độ khó quiz
   - Hiển thị top subjects

4. **Cloud Deployment Testing:**
   - Verify data migration
   - Test backup/restore
   - Performance testing với real-like data

## ⚠️ Lưu ý

- Dataset này là **demo data**, không nên dùng cho production thật
- Nội dung bài học đã được viết kỹ lưỡng nhưng chưa qua review chuyên môn
- Quiz questions được thiết kế đa dạng độ khó nhưng chưa chuẩn hóa hoàn toàn
- Khi deploy production, nên có bộ dataset riêng được review bởi giáo viên

## 📞 Liên hệ

Nếu có thắc mắc về dataset hoặc cần thêm data, vui lòng tạo issue trên repository.

---

**Version:** 1.0  
**Last Updated:** 2024-01-15  
**Author:** AI Tutor Team
