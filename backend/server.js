
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');

const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const videoRoutes = require('./routes/videos');
const letterRoutes = require('./routes/letters');

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Database
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/letters', letterRoutes);

// Simple health check route
app.get('/', (req, res) => {
    res.send('Our Secret Garden API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
