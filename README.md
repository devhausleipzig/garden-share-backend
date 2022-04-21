# Garden Share Backend

## Prerequisites
- Create an `.env` file and add to it:
```sh
POSTGRES_USER=local_admin
POSTGRES_PASSWORD=unsafeLocalPassword0!
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=main
```
- Run `docker-compose build` to build image for backend container (prisma DB client & express http server)
- Run `docker-compose up -d` to spin up DB and backend containers
