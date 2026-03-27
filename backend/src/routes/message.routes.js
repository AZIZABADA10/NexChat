const express = require('express');
const { getChatHistory, getRecentConversations, getAdmin } = require('../controllers/message.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/admin', authMiddleware, getAdmin);
router.get('/history/:userId', authMiddleware, getChatHistory);
router.get('/conversations', authMiddleware, adminMiddleware, getRecentConversations);

module.exports = router;
