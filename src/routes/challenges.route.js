const express = require('express');

const router = express.Router();
const challengesController = require('../controllers/challenges.controller');
const authenticateToken = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler');

router.use('/solve', authenticateToken);
router.use('/current', authenticateToken);
router.use('/inactive', authenticateToken);
router.use('/add', authenticateToken);
router.use('/edit', authenticateToken);
router.use('/remove', authenticateToken);
router.use('/correctAnswer', authenticateToken);
router.use('/byId', authenticateToken);

router.get('/inactive', errorHandler(challengesController.getInactive));
router.get('/current', errorHandler(challengesController.getCurrent));
router.get('/correctAnswer', errorHandler(challengesController.correctAnswer));
router.get('/byId', errorHandler(challengesController.getById));

router.post('/solve', errorHandler(challengesController.sendAnswer));
router.post('/edit', errorHandler(challengesController.edit));
router.post('/add', errorHandler(challengesController.add));

router.delete('/remove', errorHandler(challengesController.remove));

module.exports = router;
