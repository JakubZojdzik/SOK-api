const express = require('express');
const router = express.Router();
const challangesController = require('../controllers/challanges.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solve', authenticateToken);

router.get('/', challangesController.getChallanges);


module.exports = router;
