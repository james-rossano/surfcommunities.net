const express = require('express');
const mongoose = require('mongoose');
const SurfSpot = require('./models/surfspot'); // Import the Mongoose model

const app = express();
const port = 3000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://jrossano4:12345@surfcommunity-cluster.gi10z.mongodb.net/?retryWrites=true&w=majority&appName=surfcommunity-cluster')
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Serve static files
app.use(express.static(__dirname));

// API endpoint to fetch surf spots from MongoDB
app.get('/api/surfspots', async (req, res) => {
    try {
        const surfSpots = await SurfSpot.find(); // Fetch from MongoDB
        res.json(surfSpots); // Send data as JSON
    } catch (err) {
        res.status(500).send('Error fetching surf spots');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

