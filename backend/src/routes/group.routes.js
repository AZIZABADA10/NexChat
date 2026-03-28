const express = require('express');
const { createGroup, getMyGroups, getGroupMessages } = require('../controllers/group.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createGroup);
router.get('/my', getMyGroups);
router.get('/:groupId/messages', getGroupMessages);

module.exports = router;
