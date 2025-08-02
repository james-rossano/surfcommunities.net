const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new Database('./surf_data.db');

// Create table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS surfspots (
    "spot-id" INTEGER PRIMARY KEY,
    type TEXT,
    forecast TEXT,
    description TEXT
)`).run();


// Get all regions
app.get('/api/regions', (req, res) => {
    try {
        const rows = db.prepare("SELECT `region-id`, name, country, `greater-region`, coordinates, `telegram-link` FROM regions").all();

        const regions = rows.map(row => ({
            "region-id": row["region-id"],
            name: row.name,
            country: row.country,
            "greater-region": row["greater-region"],
            coordinates: JSON.parse(row.coordinates),
            telegramLink: row["telegram-link"]
        }));

        res.json(regions);
    } catch (err) {
        console.error('Error reading regions:', err);
        res.status(500).json({ error: 'Error reading from database' });
    }
});

// Get surf spot details by spot-id
app.get('/api/spotdetails', (req, res) => {
    const spotId = parseInt(req.query.spot_id, 10);
    if (!spotId) {
        return res.status(400).json({ error: "Missing or invalid spot_id" });
    }
    try {
        // Use your actual DB column name: id or spot-id
        const row = db.prepare("SELECT `spot-id`, type, forecast, description FROM surfspots WHERE `spot-id` = ?").get(spotId);
        if (!row) {
            return res.status(404).json({ error: "Spot not found" });
        }
        // Parse forecast if present
        if (row.forecast) {
            try {
                row.forecast = JSON.parse(row.forecast);
            } catch {
                row.forecast = [];
            }
        } else {
            row.forecast = [];
        }
        res.json(row);
    } catch (err) {
        console.error('Error fetching spot details:', err);
        res.status(500).json({ error: 'Error fetching spot details' });
    }
});

// Get region details by region-id
app.get('/api/regiondetails', (req, res) => {
    const regionId = req.query.region_id;
    if (!regionId) {
        return res.status(400).json({ error: 'Missing region_id' });
    }
    try {
        const row = db.prepare("SELECT `region-id`, name, country, `greater-region`, coordinates, `telegram-link` as telegram_link FROM regions WHERE `region-id` = ?").get(regionId);
        if (!row) {
            return res.status(404).json({ error: 'Region not found' });
        }
        row.coordinates = JSON.parse(row.coordinates);
        res.json(row);
    } catch (err) {
        console.error('Error fetching region details:', err);
        res.status(500).json({ error: 'Error fetching region details' });
    }
});

app.get('/surfspots.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'surfspots.json'));
});

const customCenters = ['/indonesia', '/california', '/australia'];
customCenters.forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
