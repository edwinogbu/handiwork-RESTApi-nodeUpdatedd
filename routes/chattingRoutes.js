const express = require('express');
const router = express.Router();
const chattingController = require('./../controllers/chattingController');

// Create a conversation
router.post('/create-conversation', chattingController.createConversation);

// Get conversation messages
router.get('/conversation-messages/:conversationId', chattingController.getConversationMessages);

// Create a message
router.post('/create-message', chattingController.createMessage);

// Update a message
router.put('/update-message/:messageId', chattingController.updateMessage);

// Delete a message
router.delete('/delete-message/:messageId', chattingController.deleteMessage);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const chattingController = require('./chattingController');

// // Routes for chatting service
// router.post('/conversation', chattingController.createConversation);
// router.get('/conversation/:conversationId/messages', chattingController.getConversationMessages);
// router.post('/message', chattingController.createMessage);
// router.put('/message/:messageId', chattingController.updateMessage);
// router.delete('/message/:messageId', chattingController.deleteMessage);

// module.exports = router;
