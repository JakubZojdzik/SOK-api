const pool = require('../services/db.service');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '21600s' });
}

function generateEmailToken(content) {
    return jwt.sign(content, process.env.TOKEN_SECRET, { expiresIn: '900s' });
}

function sendTokenEmail(token, dest) {
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMPT_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    let message = {
        from: '"mądrALO Team" <' + process.env.SMTP_HOST + '>',
        to: dest,
        subject: 'Weryfikacja rejestracji',
        text: 'Dziękuję za rejestrację! Aby aktywować nowe konto należy kliknąć w poniższy link: ' + process.env.CLIENT_URL + '/verification?token=' + token + '<br />',
        html: '<h1><b>Dziękuję za rejestrację! </b></h1><br /> Aby aktywować nowe konto należy kliknąć w poniższy link:<br />' + process.env.CLIENT_URL + '/verification?token=' + token + '<br />'
    };
    transportMail(message);
}

const register = (request, response) => {
    const { email, name, password, passwordRep } = request.body;

    if (!email.endsWith('@alo.pwr.edu.pl') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return response.status(401).send('Nieprawidłowy adres email!');
    }

    if (name.length < 5 || name.length > 12) {
        return response.status(401).send('Błędna długość nazwy!');
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
        return response.status(401).send('Nazwa powinna zawierać tylko litery, liczby, kropki, myślniki i podkreślniki!');
    }

    if (!/^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:',./?`~\-]{16,32}$/.test(password)) {
        return response.status(401).send('Nieprawidłowe hasło!');
    }
    if (password !== passwordRep) {
        return response.status(401).send('Hasła są różne!');
    }

    pool.query('SELECT * FROM users WHERE email = $1 OR name = $2', [email, name], (error, dbRes) => {
        if (error) {
            throw error;
        }
        console.log(dbRes.rows.length);
        if (dbRes.rows.length) {
            return response.status(401).send('Konto o danym mailu lub nazwie już istnieje!');
        } else {
            bcrypt
                .genSalt(10)
                .then((salt) => {
                    return bcrypt.hash(password, salt);
                })
                .then((hash) => {
                    pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hash], () => {
                        const token = generateEmailToken({ email: email });
                        sendTokenEmail(token, email);
                        response.status(201).send('User registered');
                    });
                })
                .catch((err) => console.error(err.message));
        }
    });
};

const verify = (request, response) => {
    const { token } = request.body;
    jwt.verify(token, process.env.TOKEN_SECRET, (err, tokenRes) => {
        if (err || !tokenRes['email']) {
            response.status(401).send('Cant verify token');
        } else {
            pool.query('UPDATE users SET verified = true WHERE email=$1', [tokenRes['email']], (error) => {
                if (error) {
                    throw error;
                }
                response.status(200).send('Account verified!');
            });
        }
    });
};

const login = (request, response) => {
    const { email, password } = request.body;
    let baseHash = '';
    pool.query('SELECT * FROM users WHERE email = $1 AND verified = true', [email], (error, dbRes) => {
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
                    return response.status(200).json({ token: token, email: dbRes.rows[0]['email'], name: dbRes.rows[0]['name'] });
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
        return response.status(200).send(id.toString());
    } else {
        return response.status(200).send(false);
    }
};

// Returns array with id's of solved challenges
const solves = (request, response) => {
    const id = request.body.id;
    if (!id) {
        return response.status(403).send('Not permited!');
    }
    pool.query('SELECT solves FROM users WHERE id = $1 AND verified = true', [id], (error, dbRes) => {
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
    pool.query('SELECT id, name, email, points FROM users WHERE admin = false AND verified = true ORDER BY points DESC', (error, dbRes) => {
        if (error) {
            throw error;
        }
        for (let i = 0; i < dbRes.rows.length; i++) {
            dbRes.rows[i].position = i + 1;
        }
        return response.status(200).send(dbRes.rows);
    });
};

const isAdmin = (request, response) => {
    const id = request.body.id;
    if (!id) {
        return response.status(200).send(false);
    }
    pool.query('SELECT admin FROM users WHERE id=$1 AND verified = true', [id]).then((dbRes) => {
        if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
            return response.status(200).send(false);
        } else {
            return response.status(200).send(dbRes.rows[0]['admin']);
        }
    });
};

module.exports = {
    login,
    register,
    solves,
    isLogged,
    ranking,
    isAdmin,
    verify
};
