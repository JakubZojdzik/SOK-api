const pool = require('../services/db.service');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const isSolved = async (usrId, challId) => {
    dbRes = await pool.query('SELECT ($1 = ANY ((SELECT solves FROM users WHERE id=$2 AND verified=true)::int[]))::text', [challId, usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return 'false';
    } else {
        return dbRes.rows[0]['text'];
    }
};

const isAdmin = async (usrId) => {
    dbRes = await pool.query('SELECT admin FROM users WHERE id=$1 AND verified = true', [usrId]);
    if (!dbRes || !dbRes.rows || !dbRes.rows.length) {
        return false;
    } else {
        return dbRes.rows[0]['admin'] === 2;
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

const logSubmit = (request, res) => {
    const { id, challId, answer } = request.body;
    let msg;
    if (res) msg = "AC: ";
    else msg = "WA: ";
    msg += id + ', ';
    msg += challId + ', ';
    msg += answer + ', ';
    msg += (request.headers['x-forwarded-for'] || request.socket.remoteAddress) + ', ';
    let d = new Date();
    msg += d.toString() + '\n';

    fs.appendFile('submits.log', msg, (err) => {
        if (err) {
            return console.log(err);
        }
    });
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

const getCurrentChallenges = (request, response) => {
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

const getInactiveChallenges = (request, response) => {
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

const getChallengeById = (request, response) => {
    const challId = request.params['challId'];
    const id = request.body.id;
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
                logSubmit(request, corr.correct);
                return response.status(200).send(corr);
            });
        });
    });
};

const addChallenge = (request, response) => {
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

const removeChallenge = (request, response) => {
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
    getChallengeById,
    getInactiveChallenges,
    getCurrentChallenges,
    addChallenge,
    removeChallenge,
    competitionTimeRange
};
