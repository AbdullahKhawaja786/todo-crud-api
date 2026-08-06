# Task API (SQLite version)

A REST API for managing a to-do list, backed by a real SQLite database instead of in-memory storage. Full CRUD (Create, Read, Update, Delete), with data that survives server restarts.

## Why SQLite

SQLite was chosen because it needs no separate server or installation. The whole database is a single file (`tasks.db`) that gets created automatically the first time the app runs. That makes it a good fit for a small project like this, while still teaching real SQL and real persistence.

## Where the database lives

`tasks.db` sits in the project root and is created automatically on first run. It's git-ignored, so each fresh clone of this repo starts with a clean, auto-seeded database.

## How to run it

```bash
npm install
node server.js
```

The server starts on `http://localhost:3000`. On first run, it automatically creates `tasks.db`, creates the `tasks` table, and seeds 3 example tasks.

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

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
```

Response:

```json
{"id":8,"title":"Buy milk","done":0}
```

## SQL query I ran by hand

```sql
DELETE FROM tasks WHERE done = 1;
```

I ran this in DB Browser for SQLite after marking every task done with `UPDATE tasks SET done = 1;`. It deleted all 3 tasks, and the change appeared instantly through the API with no server restart needed, since the API and DB Browser both read the exact same `tasks.db` file.

## What changed from Assignment 1

The API's endpoints, request bodies, and response shapes are all identical to Assignment 1. Only the storage layer changed, from an in-memory array to a real SQLite database. That's the core idea of this assignment: the API is the promise, the database is just where the promise gets kept.