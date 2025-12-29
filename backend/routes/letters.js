
const express = require('express');
const crypto = require('crypto');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all letters
router.get('/', authMiddleware, (req, res) => {
    db.all('SELECT * FROM letters ORDER BY updatedAt DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
});

// Create a new letter
router.post('/', authMiddleware, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.run('INSERT INTO letters (id, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, title, content, now, now],
        function (err) {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            res.status(201).json({ id, title, content, createdAt: now, updatedAt: now });
        }
    );
});

// Update a letter
router.put('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }
    const updatedAt = new Date().toISOString();
    db.run('UPDATE letters SET title = ?, content = ?, updatedAt = ? WHERE id = ?',
        [title, content, updatedAt, id],
        function (err) {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Letter not found' });
            }
            res.status(200).json({ id, title, content, updatedAt });
        }
    );
});

// Delete a letter
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM letters WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Letter not found' });
        }
        res.status(204).send();
    });
});

module.exports = router;
