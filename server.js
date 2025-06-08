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

const fs = require('fs');

app.get('/api/regions', (req, res) => {
    db.all("SELECT name, country, region, coordinates, `telegram-link` FROM regions", (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error reading from database' });
            console.error('Database error:', err);
            return;
        }

        try {
            const regions = rows.map(row => ({
                name: row.name,
                country: row.country,
                region: row.region,
                coordinates: JSON.parse(row.coordinates), // Parse JSON coordinates
                telegramLink: row['telegram-link'] // Include the telegram link
            }));
            res.json(regions);
        } catch (error) {
            res.status(500).json({ error: 'Error parsing region data' });
            console.error('Parsing error:', error);
        }
    });
});



app.get('/api/surfspots', (req, res) => {
    const showAll = req.query.showAll === '1';

    const query = showAll
        ? 'SELECT * FROM surfspots'
        : `SELECT s.* FROM surfspots s
           JOIN regions r ON s.sub_region = r.name AND s.region = r.region AND s.country = r.country
           WHERE r.\`telegram-link\` IS NOT NULL AND r.\`telegram-link\` != ''`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching surf spots:', err);
            res.status(500).send('Error fetching surf spots');
        } else {
            const transformedRows = rows.map(spot => ({
                ...spot,
                coordinates: { lat: spot.latitude, lng: spot.longitude },
                forecast: spot.forecast ? JSON.parse(spot.forecast) : []
            }));
            res.json(transformedRows);
        }
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


