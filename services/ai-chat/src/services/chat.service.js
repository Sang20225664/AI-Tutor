const Conversation = require('../models/conversation.model');
const usageService = require('./usage.service');
const geminiClient = require('./gemini.client');
const learningClient = require('./learning.client');

const isShortGreeting = (message) => {
    const normalized = String(message || '')
        .trim()
        .toLowerCase()
        .replace(/[!?.\s]+$/g, '');

    return [
        'hi',
        'hello',
        'helo',
        'hey',
        'chao',
        'chào',
        'xin chào',
        'xin chao'
    ].includes(normalized);
};

/**
 * Handle a new message from the user, attach context, get AI response, and save everything.
 */
const processMessage = async (userId, message, subjectId, lessonId, conversationId = null) => {
    let conversation;

    if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, userId });
        if (!conversation) throw new Error('Conversation not found');
    } else {
        conversation = new Conversation({ userId, subjectId, lessonId, messages: [] });
    }

    // Append user message
    conversation.messages.push({ role: 'user', content: message });

    if (!subjectId && !lessonId && isShortGreeting(message)) {
        const reply = 'Chào bạn! Bạn muốn học môn hoặc bài nào hôm nay?';
        conversation.messages.push({ role: 'assistant', content: reply });
        await conversation.save();

        return {
            conversationId: conversation._id,
            messages: conversation.messages,
            reply
        };
    }

    // Fetch context from Learning Service if this is a new conversation and we have a lessonId
    let context = '';
    if (conversation.messages.length === 1 && lessonId) {
        context = await learningClient.getContextForAi(lessonId);
    }

    // Format history for Gemini
    const chatHistory = conversation.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        content: msg.content
    }));

    // Call Gemini
    const aiResponse = await geminiClient.generateChatResponse(chatHistory, context);

    // Append AI message
    conversation.messages.push({
        role: 'assistant',
        content: aiResponse.content
    });

    await conversation.save();

    // Track usage asynchronously (no need to await)
    if (aiResponse.usage) {
        usageService.logUsage({
            userId,
            type: 'chat',
            usage: aiResponse.usage,
            conversationId: conversation._id
        });
    }

    return {
        conversationId: conversation._id,
        messages: conversation.messages,
        reply: aiResponse.content
    };
};

/**
 * Retrieve chat history for a user
 */
const getUserConversations = async (userId) => {
    return await Conversation.find({ userId }).sort({ updatedAt: -1 });
};

const getConversationById = async (userId, conversationId) => {
    const convo = await Conversation.findOne({ _id: conversationId, userId });
    if (!convo) throw new Error('Conversation not found');
    return convo;
};

const deleteConversation = async (userId, conversationId) => {
    const result = await Conversation.findOneAndDelete({ _id: conversationId, userId });
    if (!result) throw new Error('Conversation not found');
    return result;
};

const togglePin = async (userId, conversationId) => {
    const convo = await Conversation.findOne({ _id: conversationId, userId });
    if (!convo) throw new Error('Conversation not found');
    convo.isPinned = !convo.isPinned;
    await convo.save();
    return convo;
};

module.exports = {
    processMessage,
    getUserConversations,
    getConversationById,
    deleteConversation,
    togglePin
};
