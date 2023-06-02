const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/remove', authenticateToken);
router.use('/addAnnouncement', authenticateToken);

router.get('/', announcementsController.getAll);

router.post('/addAnnouncement', announcementsController.addAnnouncement);

router.delete('/remove', announcementsController.removeAnnouncement);

module.exports = router;
