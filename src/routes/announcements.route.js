const express = require('express');

const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/remove', authenticateToken);
router.use('/add', authenticateToken);
router.use('/byId', authenticateToken);
router.use('/inactive', authenticateToken);
router.use('/edit', authenticateToken);

router.get('/', announcementsController.getCurrent);
router.get('/inactive', announcementsController.getInactive);
router.get('/byId', announcementsController.getById);

router.post('/add', announcementsController.add);
router.post('/edit', announcementsController.edit);

router.delete('/remove', announcementsController.remove);

module.exports = router;
