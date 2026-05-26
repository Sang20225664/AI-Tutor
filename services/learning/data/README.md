# AI Tutor Canonical Seed Dataset

Dataset này dùng cùng format với commit `3dba229`: bài học là Markdown, quiz là JSON theo từng môn/lớp.

```text
data/
├── lessons/
│   ├── math10/
│   │   ├── 01-ham-so-bac-nhat.md
│   │   └── ...
│   ├── literature5/
│   └── ...
└── quizzes/
    ├── math10.json
    ├── literature5.json
    └── ...
```

## Quy ước folder

Folder/file quiz dùng dạng `<subjectKey><grade>`:

| subjectKey | Subject trong DB |
| --- | --- |
| `math` | Toán học |
| `physics` | Vật lý |
| `chemistry` | Hóa học |
| `english` | Tiếng Anh |
| `literature` | Ngữ văn |
| `history` | Lịch sử |
| `geography` | Địa lý |
| `biology` | Sinh học |
| `informatics` | Tin học |
| `civic` | Giáo dục công dân |

Ví dụ:

- `lessons/math10/*.md`
- `quizzes/math10.json`
- `lessons/literature5/*.md`
- `quizzes/literature5.json`

## Lesson Markdown

Mỗi file `.md` phải có H1 đầu tiên để seeder lấy title:

```markdown
# Hàm số bậc nhất

## Mục tiêu bài học
...
```

Seeder sẽ tự suy ra:

- `subjectName` từ folder
- `grade` từ folder
- `topics` từ title
- `difficulty` theo cấp lớp

## Quiz JSON

Mỗi file quiz là array các nhóm quiz theo bài học:

```json
[
  {
    "lessonTitle": "Hàm số bậc nhất",
    "questions": [
      {
        "question": "Hàm số nào sau đây là hàm số bậc nhất?",
        "options": ["y = 2x² + 3", "y = 3x - 5", "y = 1/x", "y = √x"],
        "correctAnswer": 1,
        "explanation": "Hàm số bậc nhất có dạng y = ax + b với a ≠ 0.",
        "difficulty": "easy"
      }
    ]
  }
]
```

`lessonTitle` phải trùng chính xác với H1 trong file markdown cùng folder. Khi seed, quiz sẽ được gắn `lessonId`, nên flow nộp quiz có thể update progress trực tiếp.

## Seed lại learning data

```bash
cd services/learning
MONGO_URI="<atlas-connection-string>" MONGO_DB_NAME="learning_db" npm run seed
```

Lệnh `npm run seed` sẽ xóa và tạo lại learning data trong DB:

- `subjects`
- `lessons`
- `quizzes`
- `lessonsuggestions`

Nếu muốn sinh lại bộ file generated trước khi seed:

```bash
npm run seed:fresh
```

## Validate dataset

```bash
cd services/learning
npm run validate:data
```

Validation kiểm tra:

- folder có đúng format `<subjectKey><grade>`
- mỗi lesson có H1
- quiz JSON parse được
- mỗi quiz có `lessonTitle` match lesson H1
- mỗi câu có đúng 4 options
- `correctAnswer` nằm trong khoảng 0-3
