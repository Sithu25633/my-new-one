
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Get all photos
router.get('/', authMiddleware, (req, res) => {
    db.all('SELECT * FROM photos ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
});

// Upload photos (up to 10 at a time)
router.post('/', authMiddleware, upload.array('photos', 10), (req, res) => {
    const { category } = req.body;
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const stmt = db.prepare('INSERT INTO photos (id, name, url, category, createdAt) VALUES (?, ?, ?, ?, ?)');
    req.files.forEach(file => {
        const id = crypto.randomUUID();
        const url = `/uploads/photos/${file.filename}`;
        const createdAt = new Date().toISOString();
        stmt.run(id, file.originalname, url, category, createdAt);
    });

    stmt.finalize((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving photo metadata', error: err.message });
        }
        res.status(201).json({ message: 'Photos uploaded successfully' });
    });
});

// Delete a photo
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    db.get('SELECT url FROM photos WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (row) {
            const filePath = path.join(__dirname, '..', row.url);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        }
        db.run('DELETE FROM photos WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Photo not found' });
            }
            res.status(204).send();
        });
    });
});

module.exports = router;
