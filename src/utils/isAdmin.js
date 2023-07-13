const pool = require('../services/db.service');

const isAdmin = async (usrId) => {
    dbRes = await pool.query('SELECT admin FROM users WHERE id=$1 AND verified = true', [usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return false;
    } else {
        return dbRes.rows[0]['admin'] === 2;
    }
};

module.exports = isAdmin;
