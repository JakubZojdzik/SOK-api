const express = require('express');

const router = express.Router();
const competitionController = require('../controllers/competition.controller');
const errorHandler = require('../middlewares/errorHandler');

router.get('/title', errorHandler(competitionController.title));
router.get('/rules', errorHandler(competitionController.rules));
router.get('/timeRange', errorHandler(competitionController.timeRange));

module.exports = router;
