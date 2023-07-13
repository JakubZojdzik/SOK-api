const fs = require('fs');
const yaml = require('js-yaml');

const competitionConf = yaml.load(fs.readFileSync('competition.yaml', 'utf8'));

const title = (request, response) => response.status(200).send(competitionConf.title);

const rules = (request, response) => response.status(200).send(competitionConf.rules);

const timeRange = (request, response) => {
    response.status(200).send({ start: competitionConf.startTime, end: competitionConf.endTime });
};

module.exports = {
    title,
    rules,
    timeRange
};
