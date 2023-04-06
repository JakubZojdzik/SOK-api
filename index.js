const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const usersRouter = require('./src/routes/users.route');
const challengesRouter = require('./src/routes/challenges.route');

const app = express();
const port = 8080;

app.use(cors())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' });
});
app.use('/users', usersRouter);
app.use('/challenges', challengesRouter);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
