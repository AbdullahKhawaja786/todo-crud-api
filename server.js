const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const PORT = 3000;

app.use(express.json());

// our "database" — just a list in memory
const Database = require('better-sqlite3');
const db = new Database('tasks.db');

// create the table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// seed 3 example tasks, but only if the table is empty
const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Buy milk', 0);
  insert.run('Walk the dog', 1);
  insert.run('Finish assignment', 0);
}

// Stage 1 — front door endpoints
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Stage 2 — Read
app.get('/tasks', (req, res) => {
  const allTasks = db.prepare('SELECT * FROM tasks').all();
  res.json(allTasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

// Stage 3 — Create
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
    title: title,
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Stage 4 — Update & Delete
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const { title, done } = req.body;

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;

  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(openapiSpec));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});