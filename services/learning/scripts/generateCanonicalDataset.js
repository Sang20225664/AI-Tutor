const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const LESSONS_DIR = path.join(DATA_DIR, 'lessons');
const QUIZZES_DIR = path.join(DATA_DIR, 'quizzes');

const subjects = {
    math: {
        name: 'Toán học',
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 3,
        topics: [
            'Số học và tính toán',
            'Hình học và đo lường',
            'Phương trình và ứng dụng',
            'Hàm số và đồ thị',
            'Thống kê và xác suất'
        ]
    },
    literature: {
        name: 'Ngữ văn',
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Đọc hiểu văn bản',
            'Từ vựng và câu',
            'Tập làm văn',
            'Văn học Việt Nam',
            'Nghị luận và biểu đạt'
        ]
    },
    english: {
        name: 'Tiếng Anh',
        grades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Vocabulary and daily communication',
            'Grammar foundations',
            'Reading comprehension',
            'Writing practice',
            'Speaking situations'
        ]
    },
    history: {
        name: 'Lịch sử',
        grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Lịch sử Việt Nam',
            'Các nền văn minh cổ đại',
            'Kháng chiến và độc lập',
            'Thế giới hiện đại'
        ]
    },
    geography: {
        name: 'Địa lý',
        grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Bản đồ và phương hướng',
            'Địa lý Việt Nam',
            'Tự nhiên và dân cư',
            'Kinh tế và môi trường'
        ]
    },
    physics: {
        name: 'Vật lý',
        grades: [6, 7, 8, 9, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Chuyển động và lực',
            'Năng lượng và công',
            'Nhiệt học',
            'Điện học',
            'Quang học'
        ]
    },
    chemistry: {
        name: 'Hóa học',
        grades: [8, 9, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Chất và nguyên tử',
            'Phản ứng hóa học',
            'Dung dịch và nồng độ',
            'Hữu cơ cơ bản'
        ]
    },
    biology: {
        name: 'Sinh học',
        grades: [6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Tế bào và cơ thể sống',
            'Thực vật và động vật',
            'Di truyền học',
            'Sinh thái học'
        ]
    },
    informatics: {
        name: 'Tin học',
        grades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 2,
        topics: [
            'Máy tính và an toàn số',
            'Soạn thảo và trình bày',
            'Thuật toán',
            'Lập trình cơ bản',
            'Dữ liệu và Internet'
        ]
    },
    civic: {
        name: 'Giáo dục công dân',
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        lessonsPerGrade: 1,
        topics: [
            'Đạo đức cá nhân',
            'Quyền và nghĩa vụ',
            'Gia đình và cộng đồng',
            'Pháp luật cơ bản'
        ]
    }
};

const protectedFolders = new Set(['math10', 'physics10', 'chemistry10', 'english10']);

function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function lessonMarkdown(subject, grade, topic, index) {
    const title = `${topic} - ${subject.name} ${grade}`;
    return `# ${title}

## Mục tiêu bài học
- Nắm được kiến thức trọng tâm của chủ đề "${topic}" trong chương trình ${subject.name} lớp ${grade}.
- Biết nhận diện dạng bài hoặc tình huống thường gặp liên quan đến chủ đề.
- Vận dụng kiến thức để trả lời câu hỏi trắc nghiệm và giải bài tập cơ bản.

## 1. Kiến thức trọng tâm
${topic} là một phần quan trọng trong mạch kiến thức ${subject.name}. Ở lớp ${grade}, học sinh cần hiểu khái niệm cốt lõi, biết liên hệ với các bài đã học trước đó và hình thành cách trình bày lời giải rõ ràng.

Khi học phần này, cần chú ý ba điểm: định nghĩa, ví dụ minh họa và điều kiện áp dụng. Việc học theo ba lớp như vậy giúp tránh ghi nhớ máy móc và giúp học sinh giải thích được vì sao đáp án đúng.

## 2. Cách tiếp cận
Trước hết, hãy đọc kỹ yêu cầu của đề bài và gạch chân các dữ kiện quan trọng. Sau đó xác định kiến thức cần dùng, viết ra công thức hoặc quy tắc tương ứng, rồi mới thực hiện tính toán hoặc lập luận.

Với các câu hỏi lý thuyết, học sinh nên tự diễn đạt lại bằng lời của mình. Với các bài tập có số liệu, nên kiểm tra đơn vị, điều kiện xác định và kết quả cuối cùng.

## 3. Ví dụ minh họa
**Ví dụ ${index}:** Một câu hỏi yêu cầu xác định nội dung chính của chủ đề "${topic}".

**Hướng dẫn:** Xác định từ khóa trong đề, đối chiếu với định nghĩa đã học, loại bỏ các phương án không liên quan, sau đó chọn đáp án phù hợp nhất.

## 4. Ghi nhớ
- Luôn bắt đầu từ khái niệm cơ bản.
- Không bỏ qua điều kiện áp dụng.
- Sau khi làm xong, cần kiểm tra xem kết quả có hợp lý với ngữ cảnh hay không.

## 5. Bài tập tự luyện
1. Trình bày ngắn gọn nội dung quan trọng nhất của bài học.
2. Nêu một ví dụ thực tế liên quan đến chủ đề "${topic}".
3. Tự tạo một câu hỏi trắc nghiệm gồm 4 phương án và giải thích đáp án đúng.
`;
}

function quizGroup(subject, grade, topic) {
    const title = `${topic} - ${subject.name} ${grade}`;
    return {
        lessonTitle: title,
        questions: [
            {
                question: `Mục tiêu quan trọng nhất khi học "${topic}" trong ${subject.name} lớp ${grade} là gì?`,
                options: [
                    'Hiểu khái niệm và biết vận dụng vào bài tập',
                    'Chỉ học thuộc tên bài',
                    'Bỏ qua ví dụ minh họa',
                    'Chỉ chọn đáp án theo cảm tính'
                ],
                correctAnswer: 0,
                explanation: 'Bài học nhấn mạnh việc hiểu kiến thức trọng tâm và vận dụng vào câu hỏi hoặc bài tập cụ thể.',
                difficulty: 'easy'
            },
            {
                question: `Khi gặp bài tập thuộc chủ đề "${topic}", bước đầu tiên nên làm là gì?`,
                options: [
                    'Đọc kỹ đề và xác định dữ kiện quan trọng',
                    'Chọn ngay đáp án dài nhất',
                    'Bỏ qua điều kiện của bài',
                    'Chỉ nhìn vào kết quả cuối'
                ],
                correctAnswer: 0,
                explanation: 'Đọc kỹ đề giúp xác định đúng kiến thức cần dùng và tránh sai sót do hiểu nhầm dữ kiện.',
                difficulty: 'easy'
            },
            {
                question: `Vì sao cần xem ví dụ minh họa trong bài "${topic}"?`,
                options: [
                    'Để hiểu cách áp dụng lý thuyết vào tình huống cụ thể',
                    'Để thay thế hoàn toàn phần lý thuyết',
                    'Để bỏ qua bài tập tự luyện',
                    'Để học thuộc từng chữ trong lời giải'
                ],
                correctAnswer: 0,
                explanation: 'Ví dụ minh họa giúp nối phần khái niệm với cách giải bài tập thực tế.',
                difficulty: 'medium'
            }
        ]
    };
}

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function removeGeneratedData() {
    if (!fs.existsSync(LESSONS_DIR)) return;

    for (const item of fs.readdirSync(LESSONS_DIR)) {
        if (protectedFolders.has(item)) continue;
        const target = path.join(LESSONS_DIR, item);
        if (fs.statSync(target).isDirectory() && /^[a-z]+\d{1,2}$/.test(item)) {
            fs.rmSync(target, { recursive: true, force: true });
        }
    }

    if (fs.existsSync(QUIZZES_DIR)) {
        for (const item of fs.readdirSync(QUIZZES_DIR)) {
            const datasetKey = item.replace(/\.json$/, '');
            if (protectedFolders.has(datasetKey)) continue;
            if (/^[a-z]+\d{1,2}$/.test(datasetKey)) {
                fs.rmSync(path.join(QUIZZES_DIR, item), { force: true });
            }
        }
    }
}

function generate() {
    ensureDir(LESSONS_DIR);
    ensureDir(QUIZZES_DIR);
    removeGeneratedData();

    let lessonCount = 0;
    let quizQuestionCount = 0;

    for (const [subjectKey, subject] of Object.entries(subjects)) {
        for (const grade of subject.grades) {
            const datasetKey = `${subjectKey}${grade}`;
            if (protectedFolders.has(datasetKey)) continue;

            const lessonDir = path.join(LESSONS_DIR, datasetKey);
            ensureDir(lessonDir);

            const quizGroups = [];
            for (let index = 0; index < subject.lessonsPerGrade; index += 1) {
                const topic = subject.topics[(grade + index) % subject.topics.length];
                const filename = `${String(index + 1).padStart(2, '0')}-${slugify(topic)}.md`;
                fs.writeFileSync(path.join(lessonDir, filename), lessonMarkdown(subject, grade, topic, index + 1), 'utf-8');
                quizGroups.push(quizGroup(subject, grade, topic));
                lessonCount += 1;
                quizQuestionCount += 3;
            }

            fs.writeFileSync(path.join(QUIZZES_DIR, `${datasetKey}.json`), JSON.stringify(quizGroups, null, 4), 'utf-8');
        }
    }

    console.log(`Generated ${lessonCount} lesson files and ${quizQuestionCount} quiz questions.`);
}

if (require.main === module) {
    generate();
}

module.exports = generate;
