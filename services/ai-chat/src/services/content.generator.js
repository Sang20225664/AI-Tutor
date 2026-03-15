const geminiClient = require('./gemini.client');
const learningClient = require('./learning.client');
const logger = require('../config/logger');
const FlashcardCache = require('../models/flashcardCache.model');
const SummaryCache = require('../models/summaryCache.model');

// Cache key versioning — bump these when changing prompts or model
const AI_MODEL = 'gemini-2.5-flash';
const FLASHCARD_PROMPT_VERSION = 'v1';
const SUMMARY_PROMPT_VERSION = 'v1';

/**
 * Build composite cache key: lessonId:model:promptVersion
 */
const buildCacheKey = (lessonId, model, promptVersion) =>
    `${lessonId}:${model}:${promptVersion}`;

/**
 * Generate flashcards from a lesson (cache-first)
 */
const generateFlashcards = async (lessonId, count = 10, requestId) => {
    const cacheKey = buildCacheKey(lessonId, AI_MODEL, FLASHCARD_PROMPT_VERSION);

    // 1. Check cache
    const cached = await FlashcardCache.findOne({ cacheKey }).lean();
    if (cached) {
        logger.info(`Flashcard cache HIT [${cacheKey}]`, { headers: { 'x-request-id': requestId } });
        return {
            lessonId: cached.lessonId,
            lessonTitle: cached.lessonTitle,
            flashcards: cached.cards,
            cached: true
        };
    }

    // 2. Cache miss — generate
    logger.info(`Flashcard cache MISS [${cacheKey}], calling Gemini`, { headers: { 'x-request-id': requestId } });
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
        if (!fc.front || !fc.back) throw new Error(`Invalid flashcard at index ${i}`);
        return { front: fc.front, back: fc.back };
    });

    // 3. Save to cache
    try {
        await FlashcardCache.findOneAndUpdate(
            { cacheKey },
            { cacheKey, lessonId: lessonId.toString(), lessonTitle: lesson.title, model: AI_MODEL, promptVersion: FLASHCARD_PROMPT_VERSION, cards: flashcards },
            { upsert: true, new: true }
        );
    } catch (cacheErr) {
        logger.warn(`Failed to cache flashcards: ${cacheErr.message}`);
    }

    return { lessonId: lesson._id, lessonTitle: lesson.title, flashcards, cached: false };
};

/**
 * Generate a bullet-point summary from a lesson (cache-first)
 */
const generateSummary = async (lessonId, requestId) => {
    const cacheKey = buildCacheKey(lessonId, AI_MODEL, SUMMARY_PROMPT_VERSION);

    // 1. Check cache
    const cached = await SummaryCache.findOne({ cacheKey }).lean();
    if (cached) {
        logger.info(`Summary cache HIT [${cacheKey}]`, { headers: { 'x-request-id': requestId } });
        return {
            lessonId: cached.lessonId,
            lessonTitle: cached.lessonTitle,
            summary: cached.summary,
            cached: true
        };
    }

    // 2. Cache miss — generate
    logger.info(`Summary cache MISS [${cacheKey}], calling Gemini`, { headers: { 'x-request-id': requestId } });
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
            { cacheKey },
            { cacheKey, lessonId: lessonId.toString(), lessonTitle: lesson.title, model: AI_MODEL, promptVersion: SUMMARY_PROMPT_VERSION, summary: data.summary },
            { upsert: true, new: true }
        );
    } catch (cacheErr) {
        logger.warn(`Failed to cache summary: ${cacheErr.message}`);
    }

    return { lessonId: lesson._id, lessonTitle: lesson.title, summary: data.summary, cached: false };
};

module.exports = { generateFlashcards, generateSummary };
