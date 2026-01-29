const express = require('express');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Neon Postgres Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Create table if it doesn't exist
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pastes (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};
initDb();

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

// GET endpoint to fetch all pastes
app.get('/api/pastes', async (req, res) => {
    try {
        const result = await pool.query('SELECT content, timestamp FROM pastes ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST endpoint to add a new paste
app.post('/api/pastes', async (req, res) => {
    const { content } = req.body;
    if (content && content.trim()) {
        try {
            const result = await pool.query(
                'INSERT INTO pastes (content) VALUES ($1) RETURNING *',
                [content]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    } else {
        res.status(400).json({ error: 'Content is required' });
    }
});

// Serve the index.html file for the root request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Paste app listening at http://localhost:${port}`);
});
