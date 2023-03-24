const express = require('express');
const router = express.Router();
const challangesController = require('../controllers/challanges.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solve', authenticateToken);
router.use('/allChallanges', authenticateToken);

router.get('/allChallanges', challangesController.getAllChallanges);
router.get('/currentChallanges', challangesController.getCurrentChallanges);
router.get('/:id', challangesController.getChallangeById);

router.post('/solve', challangesController.sendAnswer);

//! Remove in prod
router.get('/', challangesController.getChallanges);

module.exports = router;