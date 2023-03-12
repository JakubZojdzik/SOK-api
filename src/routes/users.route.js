const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', usersController.getUsers)
router.get('/:id', usersController.getUserById)
router.post('/register', usersController.register)
router.post('/login', usersController.login)

module.exports = router;