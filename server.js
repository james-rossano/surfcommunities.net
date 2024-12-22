const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./surfcommunity.db');

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS surfspots (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        forecast TEXT,
        image TEXT
    )`);
});

app.get('/api/surfspots', (req, res) => {
    db.all('SELECT * FROM surfspots', [], (err, rows) => {
        if (err) {
            console.error('Error fetching surf spots:', err);
            res.status(500).send('Error fetching surf spots');
        } else {
            console.log('Data sent to frontend:', rows); // Log the data
            res.json(rows);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});




/*
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit'); // Import rate limiter
const SurfSpot = require('./models/surfspot'); // Import the Mongoose model

const app = express();
const port = process.env.PORT || 3000;

// Set up rate limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiter to all API endpoints
app.use('/api', apiLimiter); // Limits access to /api/* routes

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Serve static files with cache-control
app.use(express.static(__dirname, {
    maxAge: '1d', // Cache for one day
}));

// API endpoint to fetch surf spots from MongoDB
app.get('/api/surfspots', async (req, res) => {
    try {
        const surfSpots = await SurfSpot.find();
        res.json(surfSpots);
    } catch (err) {
        res.status(500).send('Error fetching surf spots');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
*/