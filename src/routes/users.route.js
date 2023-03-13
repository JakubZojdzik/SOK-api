const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/myid', authenticateToken);

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.get('/myid', usersController.myid);
router.post('/register', usersController.register);
router.post('/login', usersController.login);

module.exports = router;
