const pool = require('../services/db.service');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

async function isSolved(usrId, challId) {
    dbRes = await pool.query('SELECT ($1 = ANY ((SELECT solves FROM users WHERE id=$2)::int[]))::text', [challId, usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return 'false';
    } else {
        return dbRes.rows[0]['text'];
    }
}

async function isAdmin(usrId) {
    dbRes = await pool.query('SELECT admin FROM users WHERE id=$1', [usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return false;
    } else {
        return dbRes.rows[0]['admin'];
    }
}

//! Only for testing, remove in production
const getChallanges = (request, response) => {
    pool.query('SELECT * FROM challanges ORDER BY start ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getCurrentChallanges = (request, response) => {
    pool.query('SELECT * FROM challanges WHERE start < now() ORDER BY start ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getAllChallanges = (request, response) => {
    const id = request.body.id;
    if (!id) {
        return response.status(403).send('Not permited!');
    }

    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('Not permited');
        }
        pool.query('SELECT * FROM challanges ORDER BY start ASC', (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    });
};

const getChallangeById = (request, response) => {
    const id = request.params['id'];
    pool.query('SELECT * FROM challanges WHERE id = $1 AND start < now()', [id], (error, dbRes) => {
        if (error) {
            throw error;
        }
        if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
            return response.status(400).send('Challange does not exist');
        }
        return response.status(200).send(dbRes.rows[0]);
    });
};

const sendAnswer = (request, response) => {
    const { id, challId, answer } = request.body;
    if (!id) {
        return response.status(403).send('Not permited!');
    }

    isSolved(id, challId).then((v) => {
        if (v == 'true') {
            return response.status(200).send(false);
        }
        pool.query('SELECT * FROM challanges WHERE id=$1 AND start < now()', [challId], (error, dbRes) => {
            if (error) {
                throw error;
            }
            if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
                return response.status(400).send('Challange does not exist');
            } else {
                const chall = dbRes.rows[0];

                if (!chall || !chall['answer'] || !chall['points'] || !chall['id']) {
                    return response.status(400).send('Challange does not exist');
                }

                if (chall['answer'] === answer) {
                    pool.query('UPDATE users SET points=points+$1, solves=array_append(solves,$2) WHERE id=$3', [chall['points'], chall['id'], id], (error) => {
                        if (error) {
                            throw error;
                        }
                        pool.query('UPDATE challanges SET solves=solves+1', (error) => {
                            if (error) {
                                throw error;
                            }
                            return response.status(200).send(true);
                        });
                    });
                } else {
                    return response.status(200).send(false);
                }
            }
        });
    });
};

module.exports = {
    getChallanges,
    sendAnswer,
    getChallangeById,
    getAllChallanges,
    getCurrentChallanges
};
