const pool = require('../services/db.service');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const getChallanges = (response) => {
    pool.query('SELECT * FROM challanges ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getChallangeById = (request, response) => {
    const id = request.body.id;
    pool.query('SELECT * FROM challanges WHERE id = $1', [id], (error, dbRes) => {
        if (error) {
            throw error;
        }
        if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
            return response.status(400).send('Challange does not exist');
        }
        return response.status(200).send(dbRes.rows[0]);
    });
};


const sendAnswer = (request, response) => {
    const { id, challId, givenAnswer } = request.body;
    if (!id) {
        return response.status(403).send('Could not verify token');
    }

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
                    return response.status(200).json({ token: token, email: dbRes.rows[0]['email'], name: dbRes.rows[0]['name'] });
                } else {
                    return response.status(401).send('Nieprawidłowe dane!');
                }
            });
        }
    });
};

module.exports = {
    getChallanges,
    sendAnswer,
    getChallangeById,
};
