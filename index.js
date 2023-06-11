const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const usersRouter = require('./src/routes/users.route');
const challengesRouter = require('./src/routes/challenges.route');
const announcementsRouter = require('./src/routes/announcements.route');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 8080;

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'MądrALO competition system',
        version: '0.1.0',
        description: 'This is api for MądrALO competition system',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://mit-license.org/'
        },
        contact: {
            name: 'MądrALO',
            email: 'jakub.zojdzik@gmail.com'
        }
    },
    servers: [
        {
            url: 'https://madralo.pl'
        }
    ]
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

const defLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 30000, // 30 requests per 10 seconds
    standardHeaders: false, // Disable rate limit info in the `RateLimit-*` headers
    legacyHeaders: true // Enable the `X-RateLimit-*` headers
});

const longLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 1 requests per minute
    standardHeaders: false, // Disable rate limit info in the `RateLimit-*` headers
    legacyHeaders: true // Enable the `X-RateLimit-*` headers
});

app.use('/', defLimiter);
app.use('/users/register', longLimiter);
app.use('/users/changePassword', longLimiter);
app.use('/users/verifyPass', longLimiter);
app.use('/users/verify', longLimiter);

app.get('/', (request, response) => {
    response.send({ info: 'Node.js, Express, and Postgres API' });
});
app.use('/users', usersRouter);
app.use('/challenges', challengesRouter);
app.use('/announcements', announcementsRouter);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
