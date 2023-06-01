const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/remove', authenticateToken);

router.get('/', announcementsController.getAll);

router.delete('/remove', announcementsController.removeAnnouncement);

module.exports = router;
