const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);
router.put('/:messageId/read', protect, markAsRead);

module.exports = router;