require('dotenv').config();
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const PORT = 3000;
const { Pool } = require('pg');

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `);

  const result = await pool.query('SELECT COUNT(*) FROM tasks');
  const count = parseInt(result.rows[0].count);

  if (count === 0) {
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Buy milk', false]);
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Walk the dog', true]);
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Finish assignment', false]);
  }
}

setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
});

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
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

app.get('/tasks/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  const task = result.rows[0];
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

// Stage 3 — Create
app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [title, false]
  );

  res.status(201).json(result.rows[0]);
});

// Stage 4 — Update & Delete
app.put('/tasks/:id', async (req, res) => {
  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  const task = existing.rows[0];
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const { title, done } = req.body;

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  const newTitle = title !== undefined ? title : task.title;
  const newDone = done !== undefined ? done : task.done;

  const result = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [newTitle, newDone, req.params.id]
  );

  res.json(result.rows[0]);
});

app.delete('/tasks/:id', async (req, res) => {
  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(openapiSpec));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});