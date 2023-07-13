const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const Pool = require('pg').Pool;
const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB
});

pool.query(
    `CREATE TABLE IF NOT EXISTS public.announcements
    (
        id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        title text COLLATE pg_catalog."default",
        author text COLLATE pg_catalog."default",
        content text COLLATE pg_catalog."default",
        added timestamp without time zone NOT NULL DEFAULT now(),
        CONSTRAINT announcements_pkey PRIMARY KEY (id)
    )`,
    (error) => {
        if (error) {
            throw error;
        }
    }
);

pool.query(
    `CREATE TABLE IF NOT EXISTS public.challenges
    (
        id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        title text COLLATE pg_catalog."default" NOT NULL,
        content text COLLATE pg_catalog."default" NOT NULL,
        author text COLLATE pg_catalog."default",
        points integer NOT NULL,
        answer text COLLATE pg_catalog."default" NOT NULL,
        solves integer NOT NULL DEFAULT 0,
        start timestamp without time zone NOT NULL DEFAULT now(),
        CONSTRAINT challanges_pkey PRIMARY KEY (id)
    )`,
    (error) => {
        if (error) {
            throw error;
        }
    }
);

pool.query(
    `CREATE TABLE IF NOT EXISTS public.submits
    (
        id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        usr_id integer NOT NULL,
        chall_id integer NOT NULL,
        sent timestamp without time zone NOT NULL,
        answer text COLLATE pg_catalog."default" NOT NULL,
        correct boolean NOT NULL,
        CONSTRAINT submits_pkey PRIMARY KEY (id)
    )`,
    (error) => {
        if (error) {
            throw error;
        }
    }
);

pool.query(
    `CREATE TABLE IF NOT EXISTS public.users
    (
        id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        name text COLLATE pg_catalog."default",
        email text COLLATE pg_catalog."default",
        password text COLLATE pg_catalog."default",
        points integer NOT NULL DEFAULT 0,
        solves integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        verified boolean NOT NULL DEFAULT false,
        submitted timestamp without time zone NOT NULL DEFAULT '2005-04-02 21:37:00'::timestamp without time zone,
        admin integer NOT NULL DEFAULT 0,
        submitted_ac timestamp without time zone NOT NULL DEFAULT '2005-04-02 21:37:00'::timestamp without time zone,
        CONSTRAINT users_pkey PRIMARY KEY (id)
    )`,
    (error) => {
        if (error) {
            throw error;
        }
    }
);

pool.query('SELECT * FROM users', (error, dbRes) => {
    if (dbRes.rowCount) return;
    if (error) {
        throw error;
    }
    bcrypt
        .genSalt(10)
        .then((salt) => {
            return bcrypt.hash(process.env.ADMIN_PASS, salt);
        })
        .then((hash) => {
            pool.query('INSERT INTO users (name, email, password, verified, admin) VALUES ($1, $2, $3, true, 2)', [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hash], (error) => {
                if (error) {
                    throw error;
                }
            });
        })
        .catch((err) => console.error(err.message));
});

module.exports = pool;
