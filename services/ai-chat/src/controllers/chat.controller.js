const chatService = require('../services/chat.service');

const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { message, subjectId, lessonId, conversationId, greet } = req.body;

        if (greet) {
            return res.status(200).json({
                success: true,
                response: "Xin chào! Mình là AI Tutor, mình có thể giúp gì cho bạn?"
            });
        }

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const response = await chatService.processMessage(userId, message, subjectId, lessonId, conversationId);

        return res.status(200).json({
            success: true,
            data: response,
            response: response.reply
        });
    } catch (error) {
        console.error('❌ Error sending message:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const conversations = await chatService.getUserConversations(userId);

        return res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('❌ Error fetching conversations:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getConversationById = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { id } = req.params;

        const conversation = await chatService.getConversationById(userId, id);

        return res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        if (error.message === 'Conversation not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        console.error('❌ Error fetching conversation:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getConversationById
};
