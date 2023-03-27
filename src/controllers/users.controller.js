const pool = require('../services/db.service');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '21600s' });
}

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const register = (request, response) => {
    const { name, email, password } = request.body;
    bcrypt
        .genSalt(10)
        .then((salt) => {
            return bcrypt.hash(password, salt);
        })

        .then((hash) => {
            pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hash], () => {
                response.status(201).send(`User registered`);
            });
        })
        .catch((err) => console.error(err.message));
};

const login = (request, response) => {
    const { email, password } = request.body;
    let baseHash = '';
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, dbRes) => {
        if (error) {
            throw error;
        }
        if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
            return response.status(401).send('Nieprawidłowe dane!');
        } else {
            baseHash = dbRes.rows[0]['password'];
            bcrypt.compare(password, baseHash, function (err, cmpRes) {
                if (err) {
                    console.log(err);
                }
                if (cmpRes) {
                    const token = generateAccessToken({ id: dbRes.rows[0]['id'] });
                    return response.status(200).json({token: token, email: dbRes.rows[0]['email'], name: dbRes.rows[0]['name']});
                } else {
                    return response.status(401).send('Nieprawidłowe dane!');
                }
            });
        }
    });
};

const isLogged = (request, response) => {
    const { id } = request.body;
    if (id) {
        return response.status(200).send(true);
    }
    else {
        return response.status(200).send(false);
    }
}

// Returns array with id's of solved challanges
const solves = (request, response) => {
    const id = request.body.id;
    if (!id) {
        return response.status(403).send('Not permited!');
    }
    pool.query('SELECT solves FROM users WHERE id = $1', [id], (error, dbRes) => {
        if (error) {
            throw error;
        }
        if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
            return response.status(400).send('User does not exist');
        }
        return response.status(200).send(dbRes.rows[0]['solves']);
    });
};

const ranking = (request, response) => {
    pool.query('SELECT name, email, points FROM users ORDER BY points DESC', (error, dbRes) => {
        if (error) {
            throw error;
        }
        return response.status(200).send(dbRes.rows);
    });
}

module.exports = {
    getUsers,
    login,
    register,
    solves,
    isLogged,
    ranking
};
