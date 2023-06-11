const pool = require('../services/db.service');

const isAdmin = async (usrId) => {
    dbRes = await pool.query('SELECT admin FROM users WHERE id=$1 AND verified = true', [usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return false;
    } else {
        return dbRes.rows[0]['admin'] === 2;
    }
};

const getCurrent = (request, response) => {
    pool.query("SELECT * FROM announcements WHERE added <= now() AT TIME ZONE 'CEST' ORDER BY added DESC", (error, results) => {
        if (error) {
            throw error;
        }
        return response.status(200).send(results.rows);
    });
};

const getInactive = (request, response) => {
    const id = request.body.id;
    if (!id) {
        return response.status(403).send('Not permited!');
    }

    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('Not permited');
        }
        pool.query("SELECT * FROM announcements WHERE added > now() AT TIME ZONE 'CEST' ORDER BY added DESC", (error, results) => {
            if (error) {
                throw error;
            }
            return response.status(200).send(results.rows);
        });
    });
};

const addAnnouncement = (request, response) => {
    const { id, title, content, author, added } = request.body;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('INSERT INTO announcements (title, author, content, added) VALUES ($1, $2, $3, $4)', [title, author, content, added], (error) => {
            if (error) {
                throw error;
            }
            response.status(201).send('Announcement added');
        });
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
    getCurrent,
    removeAnnouncement,
    addAnnouncement,
    getInactive
};
