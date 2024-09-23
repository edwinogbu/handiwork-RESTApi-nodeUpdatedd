// const conversationService = require('../services/conversationService');

// async function createConversation(req, res) {
//     try {
//         const { participants } = req.body;
//         const newConversation = await conversationService.createConversation(participants);
//         res.status(201).json({ success: true, conversation: newConversation });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getConversationMessages(req, res) {
//     try {
//         const conversationId = req.params.id;
//         const messages = await conversationService.getConversationMessages(conversationId);
//         res.status(200).json({ success: true, messages });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function createMessage(req, res) {
//     try {
//         const { conversationId, senderId, recipientId, content } = req.body;
//         const newMessage = await conversationService.createMessage(conversationId, senderId, recipientId, content);
//         res.status(201).json({ success: true, message: newMessage });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateMessage(req, res) {
//     try {
//         const messageId = req.params.id;
//         const { content } = req.body;
//         await conversationService.updateMessage(messageId, content);
//         res.status(200).json({ success: true, message: 'Message updated successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteMessage(req, res) {
//     try {
//         const messageId = req.params.id;
//         await conversationService.deleteMessage(messageId);
//         res.status(200).json({ success: true, message: 'Message deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createConversation,
//     getConversationMessages,
//     createMessage,
//     updateMessage,
//     deleteMessage
// };


// controllers/conversationController.js

const conversationService = require('../services/conversationService');

exports.createConversation = async (req, res) => {
    try {
        const { participants } = req.body;

        // Create conversation
        const conversationId = await conversationService.createConversation(participants);
        
        res.status(201).json({ conversationId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Retrieve messages for the conversation
        const messages = await conversationService.getConversationMessages(conversationId);
        
        res.status(200).json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const { conversation_id, sender_id, recipient_id, content } = req.body;

        // Send message
        const messageId = await conversationService.createMessage(conversation_id, sender_id, recipient_id, content);
        
        res.status(201).json({ messageId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        // Update message
        await conversationService.updateMessage(messageId, content);
        
        res.status(200).json({ message: 'Message updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        // Delete message
        await conversationService.deleteMessage(messageId);
        
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// services/conversationService.js
