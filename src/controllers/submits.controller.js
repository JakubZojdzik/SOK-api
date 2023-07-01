const pool = require('../services/db.service');
const dotenv = require('dotenv');

dotenv.config();

const getAll = (request, response) => {
    pool.query('SELECT * FROM submits', [], (error, dbRes) => {
        if (error) {
            throw error;
        }
        return response.status(200).send(dbRes.rows);
    });
}

module.exports = {
    getAll
};
