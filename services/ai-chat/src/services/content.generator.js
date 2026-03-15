const geminiClient = require('./gemini.client');
const learningClient = require('./learning.client');
const logger = require('../config/logger');
const FlashcardCache = require('../models/flashcardCache.model');
const SummaryCache = require('../models/summaryCache.model');

/**
 * Content Generator — Flashcard and Summary generation via Gemini
 * Uses MongoDB cache to avoid hitting Gemini for the same lesson twice.
 */

/**
 * Generate flashcards from a lesson (cache-first)
 */
const generateFlashcards = async (lessonId, count = 10, requestId) => {
    // 1. Check cache first
    const cached = await FlashcardCache.findOne({ lessonId: lessonId.toString() }).lean();
    if (cached) {
        logger.info(`Flashcard cache HIT for lesson ${lessonId}`, { headers: { 'x-request-id': requestId } });
        return {
            lessonId: cached.lessonId,
            lessonTitle: cached.lessonTitle,
            flashcards: cached.cards,
            cached: true
        };
    }

    // 2. Cache miss — fetch lesson and generate
    logger.info(`Flashcard cache MISS for lesson ${lessonId}, calling Gemini`, { headers: { 'x-request-id': requestId } });
    const lesson = await learningClient.getLessonById(lessonId, requestId);
    if (!lesson || !lesson.content) {
        throw new Error('Lesson content is empty — cannot generate flashcards');
    }

    const lessonContent = (lesson.content || '').slice(0, 5000);

    const prompt = `You are an educational flashcard generator. Create exactly ${count} flashcards based on the lesson content below.

Subject: ${lesson.subjectName || 'General'}
Lesson Title: ${lesson.title}

Lesson Content:
${lessonContent}

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no explanation.
The JSON must follow this EXACT format:
{
  "flashcards": [
    {
      "front": "Question or concept (short)",
      "back": "Answer or explanation (concise)"
    }
  ]
}

Rules:
- Each flashcard should cover a key concept from the lesson
- "front" should be a question, term, or concept prompt
- "back" should be the answer or explanation
- Use Vietnamese if the lesson content is in Vietnamese
- Generate exactly ${count} flashcards
- Keep each side concise (1-3 sentences max)`;

    const aiResponse = await geminiClient.generateQuizContent(prompt);

    let data;
    try {
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        data = JSON.parse(cleanResponse);
    } catch (parseError) {
        throw new Error('AI returned invalid flashcard format. Please try again.');
    }

    if (!data.flashcards || !Array.isArray(data.flashcards) || data.flashcards.length === 0) {
        throw new Error('AI returned empty flashcards.');
    }

    const flashcards = data.flashcards.map((fc, i) => {
        if (!fc.front || !fc.back) {
            throw new Error(`Invalid flashcard at index ${i}`);
        }
        return { front: fc.front, back: fc.back };
    });

    // 3. Save to cache
    try {
        await FlashcardCache.findOneAndUpdate(
            { lessonId: lessonId.toString() },
            { lessonId: lessonId.toString(), lessonTitle: lesson.title, cards: flashcards },
            { upsert: true, new: true }
        );
        logger.info(`Flashcard cache SAVED for lesson ${lessonId}`);
    } catch (cacheErr) {
        logger.warn(`Failed to cache flashcards: ${cacheErr.message}`);
    }

    return {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        flashcards,
        cached: false
    };
};

/**
 * Generate a bullet-point summary from a lesson (cache-first)
 */
const generateSummary = async (lessonId, requestId) => {
    // 1. Check cache first
    const cached = await SummaryCache.findOne({ lessonId: lessonId.toString() }).lean();
    if (cached) {
        logger.info(`Summary cache HIT for lesson ${lessonId}`, { headers: { 'x-request-id': requestId } });
        return {
            lessonId: cached.lessonId,
            lessonTitle: cached.lessonTitle,
            summary: cached.summary,
            cached: true
        };
    }

    // 2. Cache miss — fetch lesson and generate
    logger.info(`Summary cache MISS for lesson ${lessonId}, calling Gemini`, { headers: { 'x-request-id': requestId } });
    const lesson = await learningClient.getLessonById(lessonId, requestId);
    if (!lesson || !lesson.content) {
        throw new Error('Lesson content is empty — cannot generate summary');
    }

    const lessonContent = (lesson.content || '').slice(0, 6000);

    const prompt = `You are an educational content summarizer. Summarize the lesson below into clear, concise bullet points.

Subject: ${lesson.subjectName || 'General'}
Lesson Title: ${lesson.title}

Lesson Content:
${lessonContent}

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no explanation.
The JSON must follow this EXACT format:
{
  "summary": [
    "First key point or concept",
    "Second key point or concept",
    "Third key point or concept"
  ]
}

Rules:
- Each bullet point should be 1-2 sentences max
- Cover ALL important concepts from the lesson
- Use Vietnamese if the lesson content is in Vietnamese
- Generate 5-15 bullet points depending on lesson length
- Order from most important to least important`;

    const aiResponse = await geminiClient.generateQuizContent(prompt);

    let data;
    try {
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        data = JSON.parse(cleanResponse);
    } catch (parseError) {
        throw new Error('AI returned invalid summary format. Please try again.');
    }

    if (!data.summary || !Array.isArray(data.summary) || data.summary.length === 0) {
        throw new Error('AI returned empty summary.');
    }

    // 3. Save to cache
    try {
        await SummaryCache.findOneAndUpdate(
            { lessonId: lessonId.toString() },
            { lessonId: lessonId.toString(), lessonTitle: lesson.title, summary: data.summary },
            { upsert: true, new: true }
        );
        logger.info(`Summary cache SAVED for lesson ${lessonId}`);
    } catch (cacheErr) {
        logger.warn(`Failed to cache summary: ${cacheErr.message}`);
    }

    return {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        summary: data.summary,
        cached: false
    };
};

module.exports = { generateFlashcards, generateSummary };
