const express = require('express');
const router = express.Router();
const challengesController = require('../controllers/challenges.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solve', authenticateToken);
router.use('/current', authenticateToken);
router.use('/inactive', authenticateToken);
router.use('/add', authenticateToken);
router.use('/edit', authenticateToken);
router.use('/remove', authenticateToken);
router.use('/byId/:challId', authenticateToken);

router.get('/inactive', challengesController.getInactive);
router.get('/current', challengesController.getCurrent);
router.get('/competitionTimeRange', challengesController.competitionTimeRange);
router.get('/correctAnswer', challengesController.correctAnswer);
router.get('/byId/:challId', challengesController.getById);

router.post('/solve', challengesController.sendAnswer);
router.post('/edit', challengesController.edit);
router.post('/add', challengesController.add);

router.delete('/remove', challengesController.remove);

module.exports = router;
