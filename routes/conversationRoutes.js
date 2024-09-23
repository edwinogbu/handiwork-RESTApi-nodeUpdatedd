// const express = require('express');
// const router = express.Router();
// const conversationController = require('../controllers/conversationController');

// // Create a new conversation
// router.post('/conversation', conversationController.createConversation);

// // Get messages of a conversation
// router.get('/conversation/:id/messages', conversationController.getConversationMessages);

// // Create a new message
// router.post('/conversation/:id/message', conversationController.createMessage);

// // Update a message
// router.put('/conversation/message/:id', conversationController.updateMessage);

// // Delete a message
// router.delete('/conversation/message/:id', conversationController.deleteMessage);

// module.exports = router;


// routes/conversationRoutes.js

const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

router.post('/conversations', conversationController.createConversation);
router.get('/conversations/:conversationId/messages', conversationController.getConversationMessages);
router.post('/conversations/:conversationId/messages', conversationController.createMessage);
router.put('/messages/:messageId', conversationController.updateMessage);
router.delete('/messages/:messageId', conversationController.deleteMessage);

module.exports = router;
