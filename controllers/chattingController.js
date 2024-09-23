const chattingService = require('../services/chattingService');

// Controller for creating a conversation
exports.createConversation = async (req, res) => {
    try {
        const participants = req.body.participants;
        const conversationId = await chattingService.createConversation(participants);
        res.json({ success: true, conversationId: conversationId });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Controller for getting conversation messages
exports.getConversationMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await chattingService.getConversationMessages(conversationId);
        res.json({ success: true, messages: messages });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Controller for creating a message
exports.createMessage = async (req, res) => {
    try {
        const { conversation_id, sender_id, recipient_id, message_text } = req.body;
        const messageId = await chattingService.createMessage(conversation_id, sender_id, recipient_id, message_text);
        res.json({ success: true, messageId: messageId });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Controller for updating a message
exports.updateMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const content = req.body.message_text;
        await chattingService.updateMessage(messageId, content);
        res.json({ success: true, message: 'Message updated successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Controller for deleting a message
exports.deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        await chattingService.deleteMessage(messageId);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};


// const chattingService = require('../services/chattingService');

// async function createConversation(req, res) {
//     try {
//         const { participants } = req.body;
        
//         // Call the service layer function to create a conversation
//         const newConversationId = await chattingService.createConversation(participants);
        
//         // Return success response with the newly created conversation ID
//         res.status(201).json({ success: true, conversationId: newConversationId });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getConversationMessages(req, res) {
//     try {
//         const conversationId = req.params.conversationId;
        
//         // Call the service layer function to get messages for the specified conversation ID
//         const messages = await chattingService.getConversationMessages(conversationId);
        
//         // Return success response with the conversation messages
//         res.status(200).json({ success: true, messages });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function createMessage(req, res) {
//     try {
//         const { conversation_id, sender_id, recipient_id, message_text } = req.body;
        
//         // Call the service layer function to create a message
//         const newMessageId = await chattingService.createMessage(conversation_id, sender_id, recipient_id, message_text);
        
//         // Return success response with the newly created message ID
//         res.status(201).json({ success: true, messageId: newMessageId });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateMessage(req, res) {
//     try {
//         const messageId = req.params.messageId;
//         const { message_text } = req.body;
        
//         // Call the service layer function to update a message
//         await chattingService.updateMessage(messageId, message_text);
        
//         // Return success response
//         res.status(200).json({ success: true, message: 'Message updated successfully' });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteMessage(req, res) {
//     try {
//         const messageId = req.params.messageId;
        
//         // Call the service layer function to delete a message
//         await chattingService.deleteMessage(messageId);
        
//         // Return success response
//         res.status(200).json({ success: true, message: 'Message deleted successfully' });
//     } catch (error) {
//         // Return error response if any error occurs during the process
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



// const chattingService = require('./../services/chattingService');

// // Controller for chatting
// const chattingController = {};

// chattingController.createConversation = async (req, res) => {
//     try {
//         const { participants } = req.body;
//         const conversationId = await chattingService.createConversation(participants);
//         res.status(201).json({ conversationId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// chattingController.getConversationMessages = async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const messages = await chattingService.getConversationMessages(conversationId);
//         res.json({ messages });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// chattingController.createMessage = async (req, res) => {
//     try {
//         const { conversation_id, sender_id, recipient_id, content } = req.body;
//         const messageId = await chattingService.createMessage(conversation_id, sender_id, recipient_id, content);
//         res.status(201).json({ messageId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// chattingController.updateMessage = async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const { content } = req.body;
//         await chattingService.updateMessage(messageId, content);
//         res.json({ message: 'Message updated successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// chattingController.deleteMessage = async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         await chattingService.deleteMessage(messageId);
//         res.json({ message: 'Message deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = chattingController;
