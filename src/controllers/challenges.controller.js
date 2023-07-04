const pool = require('../services/db.service');
const dotenv = require('dotenv');
const fs = require('fs');
const isAdmin = require('../utils/isAdmin');
const logSubmit = require('../utils/logSubmit');

dotenv.config();

const isSolved = async (usrId, challId) => {
    dbRes = await pool.query('SELECT ($1 = ANY ((SELECT solves FROM users WHERE id=$2 AND verified=true)::int[]))::text', [challId, usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return 'false';
    } else {
        return dbRes.rows[0]['text'];
    }
};

const timeToSubmit = async (usrId) => {
    dbRes = await pool.query(
        `
        WITH diff AS (
            SELECT
                submitted - NOW() AT TIME ZONE 'CEST' + INTERVAL '10 minutes' AS difftime
            from
                users
            WHERE
                id=$1
        )

        SELECT
            CASE
                WHEN difftime <= INTERVAL '0 seconds' THEN CEIL(EXTRACT(EPOCH FROM (INTERVAL '0 minutes'))/60)
            ELSE
                CEIL(EXTRACT(EPOCH FROM (difftime))/60)
            END AS minutes
        FROM diff
    `,
        [usrId]
    );
    return dbRes.rows[0]['minutes'];
};

Date.prototype.fixZone = function () {
    this.setHours(this.getHours() + 2);
    return this;
};

const compAnswers = (chall, answer, usrId) => {
    if (new Date(Date.parse(process.env.COMPETITION_END)) >= new Date().fixZone()) {
        if (chall.answer === answer) {
            pool.query('UPDATE users SET points=points+$1, solves=array_append(solves,$2), submitted_ac=now() WHERE id=$3 AND verified = true', [chall.points, chall.id, usrId], (error) => {
                if (error) {
                    throw error;
                }
                pool.query('UPDATE challenges SET solves=solves+1 WHERE id=$1', [chall.id], (error) => {
                    if (error) {
                        throw error;
                    }
                    return { correct: true, info: '' };
                });
            });
        } else {
            pool.query("UPDATE users SET points=points-1, submitted=now() AT TIME ZONE 'CEST' WHERE id=$1 AND verified = true", [usrId]);
            return { correct: false, info: 'Przed nastepną odpowiedzią musisz odczekać 10 min' };
        }
    } else {
        if (chall.answer === answer) {
            pool.query('UPDATE users SET solves=array_append(solves,$1) WHERE id=$2 AND verified = true', [chall.id, usrId], (error) => {
                if (error) {
                    throw error;
                }
                return { correct: true, info: '' };
            });
        } else {
            return { correct: false, info: 'Błędna odpowiedź' };
        }
    }
};

const getCurrent = (request, response) => {
    const id = request.body.id;
    isAdmin(id).then((admin) => {
        if (new Date(Date.parse(process.env.COMPETITION_START)) >= new Date().fixZone() && !admin) {
            return response.status(200).send([]);
        }
        pool.query("SELECT id, title, content, author, points, solves, start FROM challenges WHERE start <= now() AT TIME ZONE 'CEST' ORDER BY start DESC, points DESC", (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(results.rows);
        });
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
        pool.query("SELECT id, title, content, author, points, solves, start FROM challenges WHERE start > now() AT TIME ZONE 'CEST' ORDER BY start DESC, points DESC", (error, results) => {
            if (error) {
                throw error;
            }
            return response.status(200).send(results.rows);
        });
    });
};

const getById = (request, response) => {
    const { id } = request.body;
    const { challId } = request.query;
    isAdmin(id).then((admin) => {
        let tmp = " AND start <= now() AT TIME ZONE 'CEST'";
        if (admin) {
            tmp = '';
        } else if (new Date(Date.parse(process.env.COMPETITION_START)) >= new Date().fixZone()) {
            return response.status(400).send('Challenge does not exist');
        }
        pool.query('SELECT id, title, content, author, points, solves, start FROM challenges WHERE id = $1' + tmp, [challId], (error, dbRes) => {
            if (error) {
                throw error;
            }
            if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
                return response.status(400).send('Challenge does not exist');
            } else {
                return response.status(200).send(dbRes.rows[0]);
            }
        });
    });
};

const sendAnswer = (request, response) => {
    const { id, challId, answer } = request.body;
    if (answer.length >= 100) {
        return response.status(400).send('Za długa odpowiedź!');
    }
    if (answer.length === 0) {
        return response.status(400).send('Wpisz odpowiedź!');
    }
    timeToSubmit(id).then((t) => {
        if (t != '0') {
            return response.status(400).send('Musisz odczekać jeszcze ' + t + ' min');
        }
        isSolved(id, challId).then((v) => {
            if (v == 'true') {
                return response.status(200).send(false);
            }
            pool.query("SELECT id, title, content, author, points, answer, solves, start FROM challenges WHERE id=$1 AND start <= now() AT TIME ZONE 'CEST'", [challId], (error, dbRes) => {
                if (error) {
                    throw error;
                }
                if (!dbRes || !dbRes.rows || !dbRes.rows.length || !dbRes.rows[0].id) {
                    return response.status(400).send('Challenge does not exist');
                }
                const corr = compAnswers(dbRes.rows[0], answer, id);
                logSubmit(id, challId, answer, corr.correct);
                return response.status(200).send(corr);
            });
        });
    });
};

const correctAnswer = (request, response) => {
    const { id } = request.body;
    const { challId } = request.query;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('SELECT answer FROM challenges WHERE id=$1', [challId], (error, dbRes) => {
            if (error) {
                throw error;
            }
            if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
                return response.status(400).send('Challenge does not exist');
            }
            return response.status(200).send(dbRes.rows[0].answer);
        });
    });
};

const add = (request, response) => {
    const { id, title, content, author, points, answer, start } = request.body;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('INSERT INTO challenges (title, content, author, points, answer, start) VALUES ($1, $2, $3, $4, $5, $6)', [title, content, author, points, answer, start], (error) => {
            if (error) {
                throw error;
            }
            response.status(201).send('Challenge added');
        });
    });
};

const edit = (request, response) => {
    const { id, title, content, author, points, answer, solves, start, challId } = request.body;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('UPDATE challenges SET title=$1, content=$2, author=$3, points=$4, answer=$5, solves=$6, start=$7 WHERE id=$8', [title, content, author, points, answer, solves, start, challId], (error) => {
            if (error) {
                throw error;
            }
            response.status(201).send('Challenge updated');
        });
    });
};

const remove = (request, response) => {
    const { id, challId } = request.body;
    isAdmin(id).then((admin) => {
        if (!admin) {
            return response.status(403).send('You have to be admin');
        }
        pool.query('DELETE FROM challenges WHERE id=$1', [challId], (error) => {
            if (error) {
                throw error;
            }
            response.status(201).send('Challenge removed');
        });
    });
};

const competitionTimeRange = (request, response) => {
    response.status(200).send({ start: process.env.COMPETITION_START, end: process.env.COMPETITION_END });
};

module.exports = {
    sendAnswer,
    getById,
    getInactive,
    getCurrent,
    add,
    remove,
    competitionTimeRange,
    edit,
    correctAnswer
};
