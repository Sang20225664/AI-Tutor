const geminiClient = require('./gemini.client');
const usageService = require('./usage.service');
const logger = require('../config/logger');
const axios = require('axios');

const ASSESSMENT_SERVICE_URL = process.env.ASSESSMENT_SERVICE_URL || 'http://assessment:3003';

/**
 * AI Lesson Suggestion Generator
 * Flow: Fetch weak topics -> Prompt Gemini to recommend 3 new lessons -> Return JSON
 */
const generateLessonSuggestions = async (userId, grade, requestId) => {
    logger.info(`Generating personalized lesson suggestions for user ${userId}, grade ${grade}`, { headers: { 'x-request-id': requestId } });
    
    // 1. Fetch weak topics to personalize suggestions
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
        logger.warn(`Failed to fetch weak topics for suggestions: ${err.message}`, { headers: { 'x-request-id': requestId } });
    }

    let weakTopicSummary = '';
    if (weakTopics.length > 0) {
        const topWeakLessons = weakTopics.slice(0, 5);
        weakTopicSummary = topWeakLessons.map(l => `- "${l.lessonTitle}" (Accuracy: ${l.accuracy}%)`).join('\n');
    }

    // 3. Build Prompt
    let prompt = `You are an expert AI personalized tutor for a Grade ${grade} student.
Your task is to recommend 3 to 5 highly relevant and tailored lessons for the student to study next.
`;

    if (weakTopicSummary) {
        prompt += `\nThe student is currently struggling with these topics (Weak Topics):\n${weakTopicSummary}\n\nPlease suggest lessons that will help them bridge these knowledge gaps, or build upon these concepts.`;
    } else {
        prompt += `\nThe student is doing well. Please suggest some interesting and slightly challenging new topics suitable for a Grade ${grade} curriculum.`;
    }

    prompt += `
IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no explanation.
The JSON must follow this EXACT format and be an array of objects:
[
  {
    "title": "Title of the lesson",
    "description": "A 2-sentence encouraging description of what they will learn and why it helps.",
    "subjectName": "Toán học",
    "difficultyText": "Trung bình",
    "difficulty": "intermediate",
    "duration": 30,
    "icon": "calculate",
    "backgroundColor": "0xFFE3F2FD",
    "topics": ["Topic 1", "Topic 2"]
  }
]

Rules:
- Give exactly 3 to 5 suggestions.
- All text strings must be in Vietnamese.
- Make the descriptions motivating.
- Keep the JSON strictly compliant to the array format above.
- "difficulty" must be one of: "beginner", "intermediate", "advanced".`;

    // 4. Call Gemini
    logger.info(`Calling Gemini for Lesson Suggestions`, { headers: { 'x-request-id': requestId } });
    const aiResponse = await geminiClient.generateQuizContent(prompt); // Reusing the content generator method since it just uses gemini-pro

    if (aiResponse.usage) {
        usageService.logUsage({
            userId,
            type: 'suggestion',
            usage: aiResponse.usage,
            requestId
        });
    }

    // 5. Parse response
    let suggestionsData;
    try {
        let cleanResponse = aiResponse.content.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        suggestionsData = JSON.parse(cleanResponse);
    } catch (parseError) {
        throw new Error('AI returned invalid JSON format for suggestions. ' + parseError.message);
    }

    if (!Array.isArray(suggestionsData) || suggestionsData.length === 0) {
        throw new Error('AI returned empty suggestions array.');
    }

    return suggestionsData;
};

module.exports = { generateLessonSuggestions };
