# mądrALO API

## mądrALO

**mądrALO** is system created for school maths competition. It allows to create challenges, solve them, collect points and show best users in ranking.

## API

This repository contains API of **mądrALO** writen in express and javascript.

## Environment variables

`.env` file should contain these variables:
- `CLIENT_URL` with URL of client
- `TOKEN_SECRET` with secret for JWT
- `SMTP_HOST` with address of smtp server
- `SMTP_PORT` with port of smtp server
- `SMTP_USER` with username of smtp server
- `SMTP_PASSWORD` with password of smtp server
- `PG_HOST` with address of postgres server
- `PG_PORT` with port of postgres server
- `PG_USER` with username of postgres server
- `PG_PASSWORD` with password of postgres server
- `PG_DB` with name of postgres databse used for api

For pgadmin you can also provide:
- `PGADMIN_LISTEN` with address that pgadmin will be listen for
- `PGADMIN_email` with email for logging into pgadmin
- `PGADMIN_password` with password for logging into pgadmin

## Database schema
The postgres database should contain two tables with following columns:

- Table `challenges`:
    - `id` (default: next number) - integer, primary key
    - `title` (required) - text, title of challenge
    - `content` (required) - text, content of challenge in html
    - `author` (required) - text, author of challenge
    - `points` (required) - integer, value of challenge
    - `answer` (required) - text, correct answer to challenge
    - `solves` (default: 0) - integer, number of users that solved this challenge
    - `start` (default: now()) - timestampt, moment when challenge should apeare for users

- Table `users`:
    - `id` (default: next number) - integer, primary key
    - `name` (required) - text, username
    - `email` (required) - text, email address in schools domain
    - `password` (required) - text, hash of password
    - `points` (default: 0) - integer, number of points for solving challenges
    - `solves` (default: []) - integer[], array with id's of solved challenges
    - `admin` (defalut: false) - boolean, admin permissions
    - `verified` (default: false) - boolean, has user verified email address
    - `submitted` (default: 2005-04-02 21:37:00) - timestamp, moment of last answer submit


## Endpoints

I should create documentation but it's boring and I'm lazy, so it's nice field for your contribution xd.

## Run

You can run everything with docker-compose:

```sh
docker-compose up -d
```

## Client

You can find my client for **mądrALO** [here](https://github.com/JakubZojdzik/madrALO-client)