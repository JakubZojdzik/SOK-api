const pool = require('../services/db.service');
const isAdmin = require('../utils/isAdmin');

const getCurrent = (request, response) => {
    pool.query("SELECT * FROM announcements WHERE added <= now() AT TIME ZONE 'CEST' ORDER BY added DESC", (error, results) => {
        if (error) {
            throw error;
        }
        return response.status(200).send(results.rows);
    });
};

const getInactive = (request, response) => {
    const { id } = request.body;
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

const getById = (request, response) => {
    const { id } = request.body;
    const { annId } = request.query;
    isAdmin(id).then((admin) => {
        let tmp = " AND added <= now() AT TIME ZONE 'CEST'";
        if (admin) {
            tmp = '';
        } else if (new Date(Date.parse(process.env.COMPETITION_START)) >= new Date().fixZone()) {
            return response.status(400).send('Challenge does not exist');
        }
        pool.query(`SELECT id, title, content, author, added FROM announcements WHERE id = $1${tmp}`, [annId], (error, dbRes) => {
            if (error) {
                throw error;
            }
            if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
                return response.status(400).send('Announcement does not exist');
            }
            return response.status(200).send(dbRes.rows[0]);
        });
    });
};

const add = (request, response) => {
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

const edit = (request, response) => {
    const { id, annId, title, content, author, added } = request.body;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('UPDATE announcements SET title=$1, content=$2, author=$3, added=$4 WHERE id=$5', [title, content, author, added, annId], (error) => {
            if (error) {
                throw error;
            }
            response.status(201).send('Announcement updated');
        });
    });
};

const remove = (request, response) => {
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
    getById,
    remove,
    add,
    getInactive,
    edit,
};
