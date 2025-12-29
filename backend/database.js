
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'our_garden.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const initDb = () => {
    db.serialize(() => {
        // User table (for one couple account)
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);

        // Photos table
        db.run(`CREATE TABLE IF NOT EXISTS photos (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            category TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )`);

        // Videos table
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            category TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )`);

        // Letters table
        db.run(`CREATE TABLE IF NOT EXISTS letters (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )`);
        
        console.log("Database tables checked/created successfully.");
    });
};

module.exports = { db, initDb };
