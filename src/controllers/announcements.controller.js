const pool = require('../services/db.service');

const getAll = (request, response) => {
    pool.query('SELECT * FROM announcements ORDER BY added DESC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(results.rows);
    });
};

module.exports = {
    getAll
};
