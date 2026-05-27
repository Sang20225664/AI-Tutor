const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';
const RETRYABLE_STATUSES = new Set([429, 503]);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentWithRetry = async (request) => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await ai.models.generateContent(request);
        } catch (error) {
            const status = error.status || error.code;
            if (!RETRYABLE_STATUSES.has(status) || attempt === maxAttempts) {
                throw error;
            }

            await sleep(500 * attempt);
        }
    }
};

const generateChatResponse = async (messages, systemPromptContext = '') => {
    try {
        const hasLearningContext = Boolean(systemPromptContext && systemPromptContext.trim());
        const customSystemInstruction = hasLearningContext
            ? `Bạn là gia sư AI thân thiện, chính xác và hữu ích. Luôn trả lời bằng tiếng Việt.

Ngữ cảnh bài học hiện tại:
${systemPromptContext}

Hãy ưu tiên ngữ cảnh trên khi trả lời. Nếu học sinh chào hỏi ngắn, hãy chào lại ngắn gọn rồi hỏi học sinh muốn học phần nào trong bài.`
            : `Bạn là gia sư AI thân thiện, chính xác và hữu ích. Luôn trả lời bằng tiếng Việt.

Hiện học sinh chưa chọn môn học hoặc bài học cụ thể. Không được tự giả định học sinh đang học môn, lớp, chương, bài hoặc giai đoạn lịch sử nào.

Nếu học sinh chỉ chào hỏi hoặc nhắn rất ngắn như "hi", "hello", "helo", hãy chào lại ngắn gọn và hỏi học sinh muốn học môn/bài nào.
Nếu học sinh hỏi một câu cụ thể, hãy trả lời câu đó và có thể hỏi thêm để làm rõ nếu thiếu thông tin.`;

        const response = await generateContentWithRetry({
            model: AI_MODEL,
            contents: messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user', // genai SDK uses 'model' and 'user' mapping
                parts: [{ text: msg.content }]
            })),
            config: {
                systemInstruction: customSystemInstruction,
                temperature: 0.7,
            }
        });

        return {
            content: response.text,
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount || 0,
                completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: response.usageMetadata?.totalTokenCount || 0
            }
        };
    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        throw new Error('Failed to generate AI response');
    }
};

/**
 * Generate structured quiz content from a prompt.
 * Uses lower temperature for more consistent, parseable JSON output.
 */
const generateQuizContent = async (prompt) => {
    try {
        const response = await generateContentWithRetry({
            model: AI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.3, // Lower temperature for consistent JSON
            }
        });
        return response.text;
    } catch (error) {
        console.error('❌ Gemini Quiz Generation Error:', error);
        throw new Error('Failed to generate quiz from AI');
    }
};

module.exports = {
    generateChatResponse,
    generateQuizContent
};
