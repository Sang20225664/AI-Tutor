const axios = require('axios');

const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3002';

const getContextForAi = async (lessonId) => {
    try {
        // AI directly calls internal learning service API to fetch context
        // This keeps AI completely decoupled from learning_db directly
        const response = await axios.get(`${LEARNING_SERVICE_URL}/internal/lessons/${lessonId}`, {
            timeout: 5000
        });

        const lesson = response.data.data;
        if (!lesson) return '';

        return `Subject: ${lesson.subjectName || 'Unknown'}\nLesson Title: ${lesson.title}\nContent:\n${lesson.content}`;
    } catch (error) {
        console.warn(`⚠️ Warning: Failed to fetch Learning context for AI. Lesson ID: ${lessonId}. Proceeding without context.`);
        return '';
    }
};
/**
 * Fetch full lesson data by ID (for quiz generation)
 */
const getLessonById = async (lessonId, requestId) => {
    try {
        const response = await axios.get(`${LEARNING_SERVICE_URL}/internal/lessons/${lessonId}`, {
            headers: requestId ? { 'x-request-id': requestId } : {},
            timeout: 5000
        });
        return response.data.data;
    } catch (error) {
        console.error(`❌ Failed to fetch lesson ${lessonId}:`, error.message);
        throw new Error(`Lesson not found or Learning Service unavailable`);
    }
};

/**
 * Save AI-generated quiz to Learning Service
 */
const saveQuiz = async (quizData, requestId) => {
    try {
        const response = await axios.post(`${LEARNING_SERVICE_URL}/internal/quizzes`, quizData, {
            headers: {
                'Content-Type': 'application/json',
                ...(requestId ? { 'x-request-id': requestId } : {})
            },
            timeout: 5000
        });
        return response.data.data;
    } catch (error) {
        console.error('❌ Failed to save quiz:', error.message);
        throw new Error('Failed to save generated quiz');
    }
};

module.exports = {
    getContextForAi,
    getLessonById,
    saveQuiz
};
