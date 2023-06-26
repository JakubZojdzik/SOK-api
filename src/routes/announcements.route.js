const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/remove', authenticateToken);
router.use('/add', authenticateToken);
router.use('/inactive', authenticateToken);

router.get('/', announcementsController.getCurrent);
router.get('/inactive', announcementsController.getInactive);

router.post('/add', announcementsController.addAnnouncement);

router.delete('/remove', announcementsController.removeAnnouncement);

module.exports = router;
