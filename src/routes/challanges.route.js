const express = require('express');
const router = express.Router();
const challangesController = require('../controllers/challanges.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solve', authenticateToken);
router.use('/allChallanges', authenticateToken);

router.get('/', challangesController.getChallanges);
router.get('/allChallanges', challangesController.getAllChallanges);
router.post('/solve', challangesController.sendAnswer);

module.exports = router;
