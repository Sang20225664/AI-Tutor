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

module.exports = {
    getContextForAi
};
