const pool = require('../services/db.service');

const logSubmit = async (usrId, challId, answer, correct) => {
    dbRes = await pool.query('INSERT INTO submits (usr_id, chall_id, sent, answer, correct) VALUES ($1, $2, now(), $3, $4)', [usrId, challId, answer, correct], (error) => {
        if (error) {
            throw error;
        }
        return 0;
    });
};

module.exports = logSubmit;

// 'INSERT INTO challenges (title, content, author, points, answer, start) VALUES ($1, $2, $3, $4, $5, $6)'