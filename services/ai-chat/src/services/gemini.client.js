const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateChatResponse = async (messages, systemPromptContext = '') => {
    try {
        const customSystemInstruction = `You are a helpful and knowledgeable AI Tutor. Always respond in Vietnamese.\n\nContext about the current learning subject and lesson:\n${systemPromptContext}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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

module.exports = {
    generateChatResponse
};
