const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, tokenRes) => {
        if (err || !tokenRes['id']) {
            return res.status(403).send('Could not verify token');
        } else {
            req.body.id = tokenRes['id'];
            next();
        }
    });
};

module.exports = authenticateToken;