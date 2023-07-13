const express = require('express');

const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const authenticateToken = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler');

router.use('/remove', authenticateToken);
router.use('/add', authenticateToken);
router.use('/byId', authenticateToken);
router.use('/inactive', authenticateToken);
router.use('/edit', authenticateToken);

router.get('/', errorHandler(announcementsController.getCurrent));
router.get('/inactive', errorHandler(announcementsController.getInactive));
router.get('/byId', errorHandler(announcementsController.getById));

router.post('/add', errorHandler(announcementsController.add));
router.post('/edit', errorHandler(announcementsController.edit));

router.delete('/remove', errorHandler(announcementsController.remove));

module.exports = router;
