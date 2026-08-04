Here's the final version with your real output swapped in:

markdown
# Task API

A simple to-do list CRUD API built with Express, storing tasks in memory.

## How to run

1. Clone this repo
2. Run `npm install`
3. Run `node server.js`
4. Server starts on `http://localhost:3000`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Example request

curl.exe -i http://localhost:3000/tasks


Response:

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 186
ETag: W/"ba-T9IU6GynhzXZWh5/hcTMF/AYJFc"
Date: Tue, 04 Aug 2026 22:28:49 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Buy milk","done":false},{"id":2,"title":"Walk the dog","done":true},{"id":3,"title":"Finish assignment","done":false},{"id":4,"title":"Test from Swagger","done":false}]


## Swagger UI

Interactive API docs available at `http://localhost:3000/docs` once the server is running.

![Swagger UI](swagger-screenshot.png)

## Notes

Data is stored in memory only — restarting the server resets tasks back to the 3 example tasks. This is intentional for this stage of the project; a database will be added in a future assignment.