
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();
const saltRounds = 10;

// Single endpoint for registration (if no user exists) or login
router.post('/register-login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.get('SELECT * FROM user LIMIT 1', [], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        try {
            if (!user) {
                // No user exists, create the first and only account
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                db.run('INSERT INTO user (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
                    if (err) {
                        return res.status(500).json({ message: 'Error creating account', error: err.message });
                    }
                    const token = jwt.sign({ id: this.lastID, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
                    res.status(201).json({ token });
                });
            } else {
                // User exists, attempt login
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    if (user.username !== username) {
                        return res.status(401).json({ message: 'Invalid credentials' });
                    }
                    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
                    res.status(200).json({ token });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error during authentication' });
        }
    });
});

module.exports = router;
