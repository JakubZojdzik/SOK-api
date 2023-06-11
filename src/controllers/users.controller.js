const pool = require('../services/db.service');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const signToken = (username, expTime) => {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: expTime });
};

const sendMail = (destination, subject, text, html) => {
    console.log('wysylam maila');

    let message = {
        from: process.env.SMTP_FROM,
        to: destination,
        subject: subject,
        text: text,
        html: html
    };
    transporter.sendMail(message);
    console.log(message);
};

const sendTokenEmail = (token, dest) => {
    sendMail(dest, 'Weryfikacja rejestracji', 'Dziękuję za rejestrację! Aby aktywować nowe konto należy kliknąć w poniższy link: ' + process.env.CLIENT_URL + '/verification?token=' + token + '<br />', '<h1><b>Dziękuję za rejestrację! </b></h1><br /> Aby aktywować nowe konto należy kliknąć w poniższy link:<br /><a href="' + process.env.CLIENT_URL + '/verification?token=' + token + '">Weryfikuj</a><br />');
};

const sendVerifyToken = (token, dest) => {
    sendMail(dest, 'Zmiana hasła', 'Aby zmienić hasło należy kliknąć w poniższy link: ' + process.env.CLIENT_URL + '/passChange?token=' + token + '<br />', '<p>Aby zmienić hasło należy kliknąć w poniższy link:<br /><a href="' + process.env.CLIENT_URL + '/passChange?token=' + token + '">Weryfikuj</a><br /></p>');
};

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

    if (!/^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:'"<>,\\./?`~\-]{8,32}$/.test(password)) {
        return response.status(401).send('Nieprawidłowe hasło!');
    }
    if (password !== passwordRep) {
        return response.status(401).send('Hasła są różne!');
    }

    pool.query('SELECT * FROM users WHERE verified = true AND (email = $1 OR name = $2)', [email, name], (error, dbRes) => {
        if (error) {
            throw error;
        }
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
                        const token = signToken({ email: email }, '900s');
                        sendTokenEmail(token, email);
                        response.status(201).send('User registered');
                    });
                })
                .catch((err) => console.error(err.message));
        }
    });
};

const changePassword = (request, response) => {
    const { email, password, passwordRep } = request.body;

    if (!/^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:'"<>,\\./?`~\-]{8,32}$/.test(password)) {
        return response.status(401).send('Nieprawidłowe hasło!');
    }
    if (password !== passwordRep) {
        return response.status(401).send('Hasła są różne!');
    }

    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, dbRes) => {
        if (error) {
            throw error;
        }
        if (!dbRes.rows.length) {
            return response.status(401).send('Konto o danym mailu nie istnieje!');
        } else {
            bcrypt
                .genSalt(10)
                .then((salt) => {
                    return bcrypt.hash(password, salt);
                })
                .then((hash) => {
                    const token = signToken({ email: email, hash: hash }, '900s');
                    sendVerifyToken(token, email);
                    response.status(201).send('Mail sent!');
                })
                .catch((err) => console.error(err.message));
        }
    });
};

const verifyRegistration = (request, response) => {
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

const verifyPasswordChange = (request, response) => {
    const { token } = request.body;
    jwt.verify(token, process.env.TOKEN_SECRET, (err, tokenRes) => {
        if (err || !tokenRes['email'] || !tokenRes['hash']) {
            response.status(401).send('Cant verify token');
        } else {
            pool.query('UPDATE users SET password = $1 WHERE email=$2', [tokenRes['hash'], tokenRes['email']], (error) => {
                if (error) {
                    throw error;
                }
                response.status(200).send('Password change verified!');
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
            bcrypt.compare(password, baseHash, (err, cmpRes) => {
                if (err) {
                    console.log(err);
                }
                if (cmpRes) {
                    const token = signToken({ id: dbRes.rows[0]['id'] }, '21600s');
                    return response.status(200).send({ token: token, email: dbRes.rows[0]['email'], name: dbRes.rows[0]['name'] });
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
    pool.query('SELECT name, points FROM users WHERE admin = 0 AND verified = true ORDER BY points DESC, submitted_ac ASC', (error, dbRes) => {
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
            return response.status(200).send(dbRes.rows[0]['admin'] === 2);
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
    verifyRegistration,
    changePassword,
    verifyPasswordChange
};
