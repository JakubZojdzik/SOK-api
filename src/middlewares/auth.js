const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) {
        req.body.id = null;
        next();
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, tokenRes) => {
        if (err || !tokenRes.id) {
            req.body.id = null;
            next();
        } else {
            req.body.id = tokenRes.id;
            next();
        }
    });
};

module.exports = authenticateToken;
