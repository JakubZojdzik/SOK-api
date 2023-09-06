const express = require('express');

const router = express.Router();
const submitsController = require('../controllers/submits.controller');
const authenticateToken = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler');

router.use('/', authenticateToken);
router.use('/byId', authenticateToken);

router.get('/', errorHandler(submitsController.getAll));
router.get('/byId', errorHandler(submitsController.getById));

module.exports = router;
