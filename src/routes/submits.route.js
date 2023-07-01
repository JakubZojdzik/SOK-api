const express = require('express');
const router = express.Router();
const submitsController = require('../controllers/submits.controller');
const authenticateToken = require('../middlewares/auth');
const isAdmin = require('../utils/isAdmin');

router.use('/', authenticateToken);
router.use('/', (req, res, next) => {
    isAdmin(req.body.id).then((admin) => {
        if (!admin) {
            return res.status(403).send('You have to be admin');
        }
        next();
    })
});

router.get('/all', submitsController.getAll);

module.exports = router;
