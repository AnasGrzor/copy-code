const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

// In-memory storage for pastes
let pastes = [
    { content: "Welcome to the Simple Paste site! Paste something below.", timestamp: new Date() }
];

// GET endpoint to fetch all pastes
app.get('/api/pastes', (req, res) => {
    res.json(pastes);
});

// POST endpoint to add a new paste
app.post('/api/pastes', (req, res) => {
    const { content } = req.body;
    if (content && content.trim()) {
        const newPaste = {
            content: content,
            timestamp: new Date()
        };
        pastes.unshift(newPaste); // Add new paste to the top
        res.status(201).json(newPaste);
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
