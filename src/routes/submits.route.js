const express = require('express');

const router = express.Router();
const submitsController = require('../controllers/submits.controller');
const authenticateToken = require('../middlewares/auth');
const isAdmin = require('../utils/isAdmin');
const errorHandler = require('../middlewares/errorHandler');

router.use('/', authenticateToken);
router.use('/', (req, res, next) => {
    isAdmin(req.body.id).then((admin) => {
        if (!admin) {
            return res.status(403).send('You have to be admin');
        }
        return next();
    });
});

router.get('/', errorHandler(submitsController.getAll));

module.exports = router;
