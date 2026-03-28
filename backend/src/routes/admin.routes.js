const express = require('express');
const { getAllUsers, updateUserStatus, deleteUser, getStats, getSettings, updateSetting } = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.patch('/users/:userId', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.get('/stats', getStats);
router.get('/settings', getSettings);
router.post('/settings', updateSetting);

module.exports = router;
