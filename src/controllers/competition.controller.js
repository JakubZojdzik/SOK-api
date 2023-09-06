const fs = require('fs');
const yaml = require('js-yaml');
const isAdmin = require('../utils/isAdmin');

const competitionConf = yaml.load(fs.readFileSync('competition.yaml', 'utf8'));

const getTitle = (request, response) => response.status(200).send(competitionConf.title);

const getRules = (request, response) => response.status(200).send(competitionConf.rules);

const getTimeRange = (request, response) => {
    response.status(200).send({ start: competitionConf.startTime, end: competitionConf.endTime });
};

const edit = async (request, response) => {
    const { id, title, rules, start, end } = request.body;

    const admin = await isAdmin(id);
    if (!admin) {
        return response.status(403).send('You dont have permissions');
    }
    competitionConf.title = title;
    competitionConf.rules = rules;
    competitionConf.startTime = start;
    competitionConf.endTime = end;
    fs.writeFileSync('competition.yaml', yaml.dump(competitionConf));
    return response.status(201).send('Challenge updated');
};

module.exports = {
    getTitle,
    getRules,
    getTimeRange,
    edit,
};
