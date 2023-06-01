const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');

router.get('/', announcementsController.getAll);

module.exports = router;
