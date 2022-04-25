# Garden Share Backend

## Prerequisites
- Create an `.env` file and add to it:
```sh
POSTGRES_USER=local_admin
POSTGRES_PASSWORD=unsafeLocalPassword0!
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=main
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public&connect_timeout=300
```
- Run `docker-compose build` to build image for backend container (prisma DB client & express http server)
- Run `docker-compose up -d` to spin up both DB and backend containers

## Development Workflow
For a cleaner development workflow experiennce, spin up only the PostgreSQL container using the command `docker-compose start pgsql` and then run the command `npm run dev` to start a hot-reloading instance of the HTTP server directly in a shell. This will save you from having to rebuild the container the HTTP server would be running in every time you make changes.

## Changing the schemata
When you change the Prisma models/DB schemata, you can simply rebuild the container. However, the data in the database/in the seed file may no longer match.

You may sometimes encounter issues with the migration files, especially if you've been making a lot of big changes and/or are merging branches where other people have been changing the schemata. ONLY IN DEVELOPMENT, never for a production branch, you may consider deleting the migrations folder to simplify things.

If old data is still in the DB and is not removed by Prisma as part of a migration, you can manually reset the data stored in the PostgreSQL volume by ensuring the containers are not running (`docker-compose stop`) and then executing `docker volume prune` to delete the managed volume. Then you can start up the containers again and then run `npm run migrate`.