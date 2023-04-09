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

## Endpoints

## Project Setup

```sh
npm install
```

## Compile and Hot-Reload for Development

```sh
npm run start.dev
```
