const express = require('express');

const router = express.Router();
const competitionController = require('../controllers/competition.controller');

router.get('/title', competitionController.title);
router.get('/rules', competitionController.rules);
router.get('/timeRange', competitionController.timeRange);

module.exports = router;
