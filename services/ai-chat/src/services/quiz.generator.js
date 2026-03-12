const geminiClient = require('./gemini.client');
const learningClient = require('./learning.client');
const logger = require('../config/logger');

/**
 * AI Quiz Generator Service
 * Flow: Fetch Lesson → Prompt Gemini → Parse JSON → Save Quiz to Learning DB
 */
const generateQuiz = async ({ lessonId, difficulty = 'medium', questionCount = 5 }, requestId) => {
    // 1️⃣ Fetch lesson content from Learning Service (with 1 retry)
    logger.info(`Fetching lesson ${lessonId} for quiz generation`, { headers: { 'x-request-id': requestId } });
    let lesson;
    try {
        lesson = await learningClient.getLessonById(lessonId, requestId);
    } catch (firstErr) {
        logger.warn(`Retry fetching lesson ${lessonId}...`, { headers: { 'x-request-id': requestId } });
        lesson = await learningClient.getLessonById(lessonId, requestId); // 1 retry
    }

    // Validate lesson has content
    if (!lesson || !lesson.content || lesson.content.trim().length === 0) {
        throw new Error('Lesson content is empty — cannot generate quiz');
    }

    // 2️⃣ Build prompt — limit content to 5000 chars to avoid token overflow
    const lessonContent = (lesson.content || '').slice(0, 5000);
    const prompt = `You are an educational quiz generator. Generate exactly ${questionCount} multiple-choice questions based on the lesson content below.

Difficulty level: ${difficulty}
Subject: ${lesson.subjectName || 'General'}
Lesson Title: ${lesson.title}

Lesson Content:
${lessonContent}

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no explanation.
The JSON must follow this EXACT format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Brief explanation why this is correct"
    }
  ]
}

Rules:
- "answer" is the 0-based index of the correct option (0, 1, 2, or 3)
- Each question MUST have exactly 4 options
- Questions should match the "${difficulty}" difficulty level
- Questions should be in Vietnamese if the lesson content is in Vietnamese
- Generate exactly ${questionCount} questions`;

    // 3️⃣ Call Gemini
    logger.info(`Calling Gemini for ${questionCount} questions (${difficulty})`, { headers: { 'x-request-id': requestId } });
    const aiResponse = await geminiClient.generateQuizContent(prompt);

    // 4️⃣ Parse AI response — handle potential markdown code blocks
    let quizData;
    try {
        // Strip markdown code blocks if present (```json ... ```)
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        quizData = JSON.parse(cleanResponse);
    } catch (parseError) {
        logger.error(`Failed to parse Gemini quiz response: ${parseError.message}`, { headers: { 'x-request-id': requestId } });
        throw new Error('AI returned invalid quiz format. Please try again.');
    }

    // 5️⃣ Validate parsed data
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('AI returned empty quiz. Please try again.');
    }

    // Validate each question structure
    quizData.questions = quizData.questions.map((q, i) => {
        if (!q.question || !q.options || q.options.length !== 4 || typeof q.answer !== 'number') {
            throw new Error(`Invalid question format at index ${i}`);
        }
        return {
            question: q.question,
            options: q.options,
            answer: Math.min(Math.max(q.answer, 0), 3), // Clamp to 0-3
            explanation: q.explanation || ''
        };
    });

    // 6️⃣ Save quiz to Learning Service
    const quizPayload = {
        title: `AI Quiz — ${lesson.title}`,
        description: `Auto-generated ${difficulty} quiz for "${lesson.title}" (${quizData.questions.length} questions)`,
        lessonId: lesson._id,
        subjectId: lesson.subjectId,
        subjectName: lesson.subjectName,
        grade: lesson.grade,
        difficulty,
        generatedBy: 'AI',
        questions: quizData.questions
    };

    logger.info(`Saving AI quiz (${quizData.questions.length} questions) to Learning Service`, { headers: { 'x-request-id': requestId } });
    const savedQuiz = await learningClient.saveQuiz(quizPayload, requestId);

    return savedQuiz;
};

module.exports = { generateQuiz };
