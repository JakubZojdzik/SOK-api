pool = require('../services/db.service')
bcrypt = require('bcryptjs')

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const id = request.params.id
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const register = (request, response) => {
    const name = request.body.name
    const email = request.body.email
    const password = request.body.password
    console.log(request.body)

    bcrypt
        .genSalt(10)
        .then((salt) => {
            return bcrypt.hash(password, salt)
        })

        .then((hash) => {
            pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hash], (error, results) => {
                response.status(201).send(`User added with ID: ${results.id}`)
            })
        })
        .catch((err) => console.error(err.message))
}

const login = (request, response) => {
    const { name, email, password } = request.params

    // const namePattern = /[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]* [A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]*/
    // if (!name.match(namePattern)) {
    //     return res.status(400).json({ err: 'Invalid characters found!' })
    // }

    let baseHash = ''
    pool.query('SELECT password FROM users WHERE email = $1', [email], (error, results) => {
        if (error) {
            throw error
        }
        if (!result || !result.rows || !result.rows.length) {
            return res.status(400).json({ err: 'Email not registered!' })
        } else {
            console.log(results.rows)
            baseHash = results.rows[0]
        }
    })

    bcrypt.compare(password, baseHash, function (err, res) {
        if (err) {
            console.log(err)
        }
        if (res) {
            return response.status(201).send('Logged in!')
        } else {
            return response.json({ success: false, message: 'passwords do not match' })
        }
    })
}

module.exports = {
    getUsers,
    getUserById,
    login,
    register
}
