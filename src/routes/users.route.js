const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solves', authenticateToken);
router.use('/islogged', authenticateToken);
router.use('/isAdmin', authenticateToken);

router.get('/', usersController.getUsers);
router.get('/solves', usersController.solves);
router.get('/islogged', usersController.isLogged);
router.get('/ranking', usersController.ranking);
router.get('/isAdmin', usersController.isAdmin);
router.post('/register', usersController.register);
router.post('/login', usersController.login);

module.exports = router;
