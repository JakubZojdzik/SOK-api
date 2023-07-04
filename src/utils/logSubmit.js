const pool = require('../services/db.service');

const logSubmit = async (usrId, challId, sent, answer, correct) => {
    dbRes = await pool.query('INSERT INTO submits (usrId, challId, sent, answer, correct) VALUES ($1, $2, $3, $4, $5)', [usrId, challId, sent.toISOString(), answer, correct], (error));
    if (error) {
        throw error;
    }
    return 0;
};

module.exports = logSubmit;