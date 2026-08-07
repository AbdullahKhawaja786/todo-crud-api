# Task API (Dockerized Postgres version)

A REST API for managing a to-do list, now running against a real PostgreSQL database inside Docker, with the whole stack (app + database) starting from a single command.

## Storage journey

- **Assignment 1**: tasks stored in memory, gone on every restart
- **Assignment 2**: tasks stored in a SQLite file (`tasks.db`)
- **Assignment 3 (this one)**: tasks stored in a containerized PostgreSQL database

The API's endpoints, request bodies, and response shapes never changed across any of these. Only the storage layer changed each time, proving that storage really is just an implementation detail behind a stable API.

## How to run it

1. Copy `.env.example` to `.env` (only needed for connecting manually outside Docker; Compose sets its own connection string internally)
2. Run:

\`\`\`bash
docker compose up
\`\`\`

This starts both the app and a Postgres database together. The app listens on `http://localhost:3000`. The database table is created automatically, and 3 example tasks are seeded only on the first run.

## Environment variables

See `.env.example` for the required variable:

\`\`\`
DATABASE_URL=postgres://postgres:password_here@localhost:5432/tasks
\`\`\`

When running via Docker Compose, this is set automatically in `compose.yaml` and does not need to be set manually.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | API info |
| GET | /health | Health check |
| GET | /tasks | List all tasks |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

## Example request

\`\`\`bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
\`\`\`

Response:

\`\`\`json
{"id":4,"title":"Buy milk","done":false}
\`\`\`

## Persistence proof

I created a task, then ran a full \`docker compose down\` followed by \`docker compose up\` (stopping and restarting both the app and database containers). The task was still present afterward, confirmed via \`GET /tasks\`, because the named volume \`taskdata\` keeps Postgres's data outside the container's own lifecycle.

## Notes on the build

- I removed the \`better-sqlite3\` dependency from Assignment 2, since it required native compilation (Python + build tools) that isn't available in the minimal Docker image, and it was no longer used once the app moved to Postgres.
- I mounted the Postgres volume at \`/var/lib/postgresql\` rather than the older \`/var/lib/postgresql/data\`, since Postgres 18's official image changed its expected data directory structure.
- \`.env\` is excluded from the Docker image via \`.dockerignore\`, so secrets never get baked into the built image, even though Compose still needs \`.env\` values for local, non-containerized runs.