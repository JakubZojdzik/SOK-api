const pool = require('../services/db.service');
const dotenv = require('dotenv');

dotenv.config();

const getAll = (request, response) => {
    pool.query(
        `
            SELECT submits.id AS "id", users.name AS "name", challenges.title AS "title", challenges.answer AS "corr_ans", submits.answer AS "given_ans", submits.correct AS "correct", submits.sent AS "sent"
            FROM ((submits
            INNER JOIN users ON submits.usr_id = users.id)
            INNER JOIN challenges ON submits.chall_id = challenges.id)
            ORDER BY submits.sent DESC
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
