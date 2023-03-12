const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8080

const usersRouter = require('./src/routes/users.route')

app.use(
    bodyParser.urlencoded({
        extended: true
    })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.use('/users', usersRouter)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
