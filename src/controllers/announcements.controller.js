const pool = require('../services/db.service');


async function isAdmin(usrId) {
    dbRes = await pool.query('SELECT admin FROM users WHERE id=$1 AND verified = true', [usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return false;
    } else {
        return dbRes.rows[0]['admin'] === 2;
    }
}


const getAll = (request, response) => {
    pool.query('SELECT * FROM announcements ORDER BY added DESC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(results.rows);
    });
};

const removeAnnouncement = (request, response) => {
    const { id, annId } = request.body;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('DELETE FROM announcements WHERE id=$1', [annId], (error) => {
            if (error) {
                throw error;
            }
            response.status(201).send('Announcement removed');
        });
    });
};

module.exports = {
    getAll,
    removeAnnouncement
};
