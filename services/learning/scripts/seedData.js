const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Subject = require('../src/models/Subject');
const Lesson = require('../src/models/Lesson');
const Quiz = require('../src/models/Quiz');
const LessonSuggestion = require('../src/models/LessonSuggestion');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/learning_db';
const DATA_DIR = path.join(__dirname, '../data');

function parseSubjects() {
    const subjectsPath = path.join(DATA_DIR, 'subjects.json');
    const subjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf-8'));
    return subjects.map(subject => ({
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        description: subject.description,
        grade: subject.grade || subject.gradeLevels || []
    }));
}

const folderSubjects = {
    math: 'Toán học',
    physics: 'Vật lý',
    chemistry: 'Hóa học',
    english: 'Tiếng Anh',
    literature: 'Ngữ văn',
    history: 'Lịch sử',
    geography: 'Địa lý',
    biology: 'Sinh học',
    informatics: 'Tin học',
    civic: 'Giáo dục công dân'
};

function parseDatasetKey(datasetKey) {
    const match = datasetKey.match(/^([a-z]+)(\d{1,2})$/);
    if (!match) {
        throw new Error(`Invalid dataset key "${datasetKey}". Expected format like math10 or literature5.`);
    }

    const [, subjectKey, gradeText] = match;
    const subjectName = folderSubjects[subjectKey];
    if (!subjectName) {
        throw new Error(`Unsupported subject key "${subjectKey}" in dataset key "${datasetKey}".`);
    }

    return { subjectKey, subjectName, grade: Number(gradeText) };
}

function extractTitle(markdown, fallback) {
    const titleLine = markdown.split(/\r?\n/).find(line => line.startsWith('# '));
    return titleLine ? titleLine.replace(/^#\s+/, '').trim() : fallback.replace(/\.md$/, '');
}

function parseLessons() {
    const lessonsPath = path.join(DATA_DIR, 'lessons');
    if (!fs.existsSync(lessonsPath)) return [];

    const lessons = [];
    const datasetKeys = fs.readdirSync(lessonsPath).sort();

    for (const datasetKey of datasetKeys) {
        const folderPath = path.join(lessonsPath, datasetKey);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const { subjectName, grade } = parseDatasetKey(datasetKey);
        const markdownFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.md')).sort();

        for (const file of markdownFiles) {
            const content = fs.readFileSync(path.join(folderPath, file), 'utf-8');
            const title = extractTitle(content, file);
            lessons.push({
                datasetKey,
                title,
                content,
                subjectName,
                grade: [grade],
                topics: [title],
                difficulty: grade <= 5 ? 'beginner' : grade <= 9 ? 'intermediate' : 'advanced',
                duration: grade <= 5 ? 35 : 45
            });
        }
    }

    return lessons;
}

function parseQuizzes() {
    const quizzesPath = path.join(DATA_DIR, 'quizzes');
    if (!fs.existsSync(quizzesPath)) return [];

    const quizzes = [];
    const quizFiles = fs.readdirSync(quizzesPath).filter(file => file.endsWith('.json')).sort();

    for (const file of quizFiles) {
        const datasetKey = file.replace(/\.json$/, '');
        const { subjectName, grade } = parseDatasetKey(datasetKey);
        const quizGroups = JSON.parse(fs.readFileSync(path.join(quizzesPath, file), 'utf-8'));

        for (const group of quizGroups) {
            if (!group.lessonTitle || !Array.isArray(group.questions)) {
                throw new Error(`${file} contains a quiz group without lessonTitle or questions.`);
            }

            quizzes.push({
                datasetKey,
                lessonTitle: group.lessonTitle,
                title: `Quiz: ${group.lessonTitle}`,
                description: `Kiểm tra kiến thức bài "${group.lessonTitle}"`,
                subjectName,
                grade: [grade],
                difficulty: 'medium',
                generatedBy: 'seed',
                questions: group.questions.map((question, index) => {
                    if (!Array.isArray(question.options) || question.options.length !== 4) {
                        throw new Error(`${file} -> ${group.lessonTitle} question ${index + 1} must have exactly 4 options.`);
                    }
                    if (!Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer > 3) {
                        throw new Error(`${file} -> ${group.lessonTitle} question ${index + 1} has invalid correctAnswer.`);
                    }
                    return {
                        question: question.question,
                        options: question.options,
                        answer: question.correctAnswer,
                        explanation: question.explanation
                    };
                })
            });
        }
    }

    return quizzes;
}

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const subjectsData = parseSubjects();
        const lessonsData = parseLessons();
        const quizzesData = parseQuizzes();
        console.log(`Parsed ${lessonsData.length} lessons and ${quizzesData.length} quizzes from data/`);

        console.log('Clearing existing learning data...');
        await Subject.deleteMany({});
        await Quiz.deleteMany({});
        await Lesson.deleteMany({});
        await LessonSuggestion.deleteMany({});

        const subjects = await Subject.insertMany(subjectsData);
        const subjectMap = new Map(subjects.map(subject => [subject.name, subject._id]));

        const lessonDocs = lessonsData.map(lesson => ({
            title: lesson.title,
            content: lesson.content,
            subjectId: subjectMap.get(lesson.subjectName),
            subjectName: lesson.subjectName,
            grade: lesson.grade,
            topics: lesson.topics,
            difficulty: lesson.difficulty,
            duration: lesson.duration
        }));

        const lessons = await Lesson.insertMany(lessonDocs);
        const lessonMap = new Map();
        lessons.forEach(lesson => {
            const grade = Array.isArray(lesson.grade) ? lesson.grade[0] : lesson.grade;
            lessonMap.set(`${lesson.subjectName}|${grade}|${lesson.title}`, lesson._id);
        });

        const quizDocs = quizzesData.map(quiz => {
            const lessonId = lessonMap.get(`${quiz.subjectName}|${quiz.grade[0]}|${quiz.lessonTitle}`);
            if (!lessonId) {
                throw new Error(`Quiz "${quiz.title}" cannot find matching lesson "${quiz.lessonTitle}".`);
            }

            return {
                title: quiz.title,
                description: quiz.description,
                subjectId: subjectMap.get(quiz.subjectName),
                subjectName: quiz.subjectName,
                lessonId,
                grade: quiz.grade,
                difficulty: quiz.difficulty,
                generatedBy: quiz.generatedBy,
                questions: quiz.questions
            };
        });

        const quizzes = await Quiz.insertMany(quizDocs);

        console.log('\nSeed Data Summary:');
        console.log(`- Subjects: ${subjects.length}`);
        console.log(`- Lessons: ${lessons.length}`);
        console.log(`- Quizzes: ${quizzes.length}`);
        console.log('Database seeding completed successfully.');

        return { subjects, lessons, quizzes };
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

module.exports = seedDatabase;

if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
