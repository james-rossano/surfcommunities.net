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