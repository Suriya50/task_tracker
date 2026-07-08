const express = require('express');

const router = express.Router();

const { getChats, getOrCreateChat } = require('../controllers/chatController');

const { protect } = require('../middleware/auth');



router.get('/', protect, getChats);

router.get('/private/:userId', protect, getOrCreateChat);



module.exports = router;