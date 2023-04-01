const express = require('express');
const router = express.Router();
const challangesController = require('../controllers/challanges.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solve', authenticateToken);
router.use('/inactiveChallanges', authenticateToken);
router.use('/addChallange', authenticateToken);
router.use('/removeChallange', authenticateToken);

router.get('/inactiveChallanges', challangesController.getInactiveChallanges);
router.get('/currentChallanges', challangesController.getCurrentChallanges);
router.get('/:id', challangesController.getChallangeById);

router.post('/solve', challangesController.sendAnswer);
router.post('/addChallange', challangesController.addChallange);

router.delete('/removeChallange', challangesController.removeChallange);

//! Remove in prod
router.get('/', challangesController.getChallanges);

module.exports = router;