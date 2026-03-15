const geminiClient = require('./gemini.client');
const learningClient = require('./learning.client');
const logger = require('../config/logger');
const axios = require('axios');

const ASSESSMENT_SERVICE_URL = process.env.ASSESSMENT_SERVICE_URL || 'http://assessment:3003';

/**
 * Adaptive Quiz Generator
 * Flow: Fetch weak topics → Fetch lesson content → Prompt Gemini → Save quiz
 */
const generateAdaptiveQuiz = async ({ userId, difficulty = 'medium', questionCount = 5 }, requestId) => {
    // 1. Fetch weak topics from Assessment Service
    logger.info(`Fetching weak topics for user ${userId}`, { headers: { 'x-request-id': requestId } });
    let weakTopics = [];
    try {
        const response = await axios.get(`${ASSESSMENT_SERVICE_URL}/internal/analysis/weak-topics`, {
            headers: {
                'x-user-id': userId,
                ...(requestId ? { 'x-request-id': requestId } : {})
            },
            timeout: 10000
        });
        if (response.data && response.data.success) {
            weakTopics = response.data.data;
        }
    } catch (err) {
        logger.warn(`Failed to fetch weak topics: ${err.message}`, { headers: { 'x-request-id': requestId } });
    }

    if (!weakTopics.length) {
        throw new Error('No weak topics found. Student is doing well on all topics!');
    }

    // 2. Fetch lesson content for the weakest topics (max 3 lessons)
    const topWeakLessons = weakTopics.slice(0, 3);
    const lessonContents = [];
    for (const topic of topWeakLessons) {
        try {
            const lesson = await learningClient.getLessonById(topic.lessonId, requestId);
            if (lesson && lesson.content) {
                lessonContents.push({
                    title: lesson.title,
                    content: (lesson.content || '').slice(0, 2000),
                    accuracy: topic.accuracy,
                    subjectName: lesson.subjectName,
                    subjectId: lesson.subjectId,
                    grade: lesson.grade,
                    lessonId: lesson._id
                });
            }
        } catch (err) {
            logger.warn(`Failed to fetch lesson ${topic.lessonId}: ${err.message}`);
        }
    }

    if (!lessonContents.length) {
        throw new Error('Could not fetch lesson content for weak topics');
    }

    // 3. Build adaptive prompt
    const weakTopicSummary = lessonContents.map(l =>
        `- "${l.title}" (accuracy: ${l.accuracy}%)`
    ).join('\n');

    const lessonContentBlock = lessonContents.map(l =>
        `=== ${l.title} ===\n${l.content}`
    ).join('\n\n');

    const prompt = `You are an educational quiz generator specializing in adaptive learning.
The student is struggling with these topics:
${weakTopicSummary}

Generate exactly ${questionCount} multiple-choice questions that specifically target these weak areas.
Focus more questions on topics with LOWER accuracy scores.

Difficulty level: ${difficulty}

Lesson Content for reference:
${lessonContentBlock}

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
- Questions should be in Vietnamese if the lesson content is in Vietnamese
- Focus on the student's weak areas to help them improve`;

    // 4. Call Gemini
    logger.info(`Calling Gemini for adaptive quiz (${questionCount} questions)`, { headers: { 'x-request-id': requestId } });
    const aiResponse = await geminiClient.generateQuizContent(prompt);

    // 5. Parse response
    let quizData;
    try {
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        quizData = JSON.parse(cleanResponse);
    } catch (parseError) {
        throw new Error('AI returned invalid quiz format. Please try again.');
    }

    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('AI returned empty quiz.');
    }

    quizData.questions = quizData.questions.map((q, i) => {
        if (!q.question || !q.options || q.options.length !== 4 || typeof q.answer !== 'number') {
            throw new Error(`Invalid question format at index ${i}`);
        }
        return {
            question: q.question,
            options: q.options,
            answer: Math.min(Math.max(q.answer, 0), 3),
            explanation: q.explanation || ''
        };
    });

    // 6. Save adaptive quiz to Learning Service
    const primaryLesson = lessonContents[0];
    const quizPayload = {
        title: `Adaptive Quiz — ${topWeakLessons.map(t => t.lessonTitle).join(', ').slice(0, 100)}`,
        description: `Adaptive quiz targeting weak areas (${topWeakLessons.length} weak topics)`,
        lessonId: primaryLesson.lessonId,
        subjectId: primaryLesson.subjectId,
        subjectName: primaryLesson.subjectName,
        grade: primaryLesson.grade,
        difficulty,
        generatedBy: 'AI-Adaptive',
        questions: quizData.questions
    };

    const savedQuiz = await learningClient.saveQuiz(quizPayload, requestId);
    return {
        ...savedQuiz,
        weakTopicsUsed: topWeakLessons.map(t => ({ lessonId: t.lessonId, lessonTitle: t.title, accuracy: t.accuracy }))
    };
};

module.exports = { generateAdaptiveQuiz };
