const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const LESSONS_DIR = path.join(DATA_DIR, 'lessons');
const QUIZZES_DIR = path.join(DATA_DIR, 'quizzes');

const folderSubjects = new Set([
    'math',
    'physics',
    'chemistry',
    'english',
    'literature',
    'history',
    'geography',
    'biology',
    'informatics',
    'civic'
]);

function parseDatasetKey(datasetKey) {
    const match = datasetKey.match(/^([a-z]+)(\d{1,2})$/);
    if (!match) throw new Error(`Invalid dataset key: ${datasetKey}`);
    if (!folderSubjects.has(match[1])) throw new Error(`Unsupported subject key: ${match[1]}`);
    return { subjectKey: match[1], grade: Number(match[2]) };
}

function getLessonTitle(markdown) {
    const titleLine = markdown.split(/\r?\n/).find(line => line.startsWith('# '));
    return titleLine ? titleLine.replace(/^#\s+/, '').trim() : null;
}

function validate() {
    const issues = [];
    const lessonTitlesByDataset = new Map();
    let lessonCount = 0;
    let quizGroupCount = 0;
    let questionCount = 0;

    for (const datasetKey of fs.readdirSync(LESSONS_DIR).sort()) {
        const folderPath = path.join(LESSONS_DIR, datasetKey);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        try {
            parseDatasetKey(datasetKey);
        } catch (error) {
            issues.push(error.message);
            continue;
        }

        const titles = new Set();
        for (const file of fs.readdirSync(folderPath).filter(name => name.endsWith('.md')).sort()) {
            const markdown = fs.readFileSync(path.join(folderPath, file), 'utf-8');
            const title = getLessonTitle(markdown);
            if (!title) issues.push(`${datasetKey}/${file}: missing markdown H1 title`);
            if (title && titles.has(title)) issues.push(`${datasetKey}/${file}: duplicate lesson title "${title}"`);
            if (title) titles.add(title);
            lessonCount += 1;
        }

        lessonTitlesByDataset.set(datasetKey, titles);
    }

    for (const file of fs.readdirSync(QUIZZES_DIR).filter(name => name.endsWith('.json')).sort()) {
        const datasetKey = file.replace(/\.json$/, '');
        try {
            parseDatasetKey(datasetKey);
        } catch (error) {
            issues.push(error.message);
            continue;
        }

        const lessonTitles = lessonTitlesByDataset.get(datasetKey);
        if (!lessonTitles) {
            issues.push(`${file}: no matching lessons/${datasetKey} folder`);
            continue;
        }

        let quizGroups;
        try {
            quizGroups = JSON.parse(fs.readFileSync(path.join(QUIZZES_DIR, file), 'utf-8'));
        } catch (error) {
            issues.push(`${file}: invalid JSON - ${error.message}`);
            continue;
        }

        if (!Array.isArray(quizGroups)) {
            issues.push(`${file}: expected top-level JSON array`);
            continue;
        }

        for (const [groupIndex, group] of quizGroups.entries()) {
            quizGroupCount += 1;
            if (!group.lessonTitle) issues.push(`${file}[${groupIndex}]: missing lessonTitle`);
            if (group.lessonTitle && !lessonTitles.has(group.lessonTitle)) {
                issues.push(`${file}[${groupIndex}]: lessonTitle "${group.lessonTitle}" does not match a markdown lesson`);
            }
            if (!Array.isArray(group.questions) || group.questions.length === 0) {
                issues.push(`${file}[${groupIndex}]: missing questions`);
                continue;
            }

            for (const [questionIndex, question] of group.questions.entries()) {
                questionCount += 1;
                if (!question.question) issues.push(`${file}[${groupIndex}].questions[${questionIndex}]: missing question`);
                if (!Array.isArray(question.options) || question.options.length !== 4) {
                    issues.push(`${file}[${groupIndex}].questions[${questionIndex}]: expected exactly 4 options`);
                }
                if (!Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer > 3) {
                    issues.push(`${file}[${groupIndex}].questions[${questionIndex}]: invalid correctAnswer`);
                }
                if (!question.explanation) issues.push(`${file}[${groupIndex}].questions[${questionIndex}]: missing explanation`);
            }
        }
    }

    if (issues.length > 0) {
        console.error('Dataset validation failed:');
        for (const issue of issues) console.error(`- ${issue}`);
        process.exit(1);
    }

    console.log(`Dataset validation passed: ${lessonCount} lessons, ${quizGroupCount} quiz groups, ${questionCount} questions.`);
}

if (require.main === module) {
    validate();
}

module.exports = validate;
