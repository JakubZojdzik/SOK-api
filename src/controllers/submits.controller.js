const pool = require('../services/db.service');
const dotenv = require('dotenv');

dotenv.config();

const getAll = (request, response) => {
    pool.query(
        `
            SELECT users.name, challenges.title, challenges.answer submits.answer, submits, correct, submits.answer
            FROM ((submits
            INNER JOIN users ON submits.usrId = users.id)
            INNER JOIN challenges ON submits.challId = challenges.id)
            ORDER BY sent DESC
        `, [], (error, dbRes) => {
        if (error) {
            throw error;
        }
        return response.status(200).send(dbRes.rows);
    });
}

module.exports = {
    getAll
};
