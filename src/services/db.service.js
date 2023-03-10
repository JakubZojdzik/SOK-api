const Pool = require('pg').Pool
const pool = new Pool({
    host: 'postgres',
    port: 5432,
    user: 'admin',
    password: 'admin',
    database: 'madralo'
})

module.exports = pool