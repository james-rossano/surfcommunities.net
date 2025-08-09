const express = require('express');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const port = process.env.PORT || 3000;
let db = null;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
async function initDatabase() {
    try {
        const SQL = await initSqlJs();
        
        // Check if database file exists
        if (fs.existsSync('./surf_data.db')) {
            const fileBuffer = fs.readFileSync('./surf_data.db');
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
            
            // Create table if it doesn't exist
            db.run(`CREATE TABLE IF NOT EXISTS surfspots (
                "spot-id" INTEGER PRIMARY KEY,
                type TEXT,
                forecast TEXT,
                description TEXT
            )`);
            
            // Create regions table if needed
            db.run(`CREATE TABLE IF NOT EXISTS regions (
                "region-id" INTEGER PRIMARY KEY,
                name TEXT,
                country TEXT,
                "greater-region" TEXT,
                coordinates TEXT,
                "telegram-link" TEXT
            )`);
            
            // Save the database
            const data = db.export();
            fs.writeFileSync('./surf_data.db', data);
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Get all regions
app.get('/api/regions', (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        
        const stmt = db.prepare("SELECT `region-id`, name, country, `greater-region`, coordinates, `telegram-link` FROM regions");
        const rows = [];
        
        while (stmt.step()) {
            const row = stmt.getAsObject();
            rows.push({
                "region-id": row["region-id"],
                name: row.name,
                country: row.country,
                "greater-region": row["greater-region"],
                coordinates: row.coordinates ? JSON.parse(row.coordinates) : [],
                telegramLink: row["telegram-link"]
            });
        }
        
        stmt.free();
        res.json(rows);
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
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        
        const stmt = db.prepare("SELECT `spot-id`, type, forecast, description FROM surfspots WHERE `spot-id` = ?");
        stmt.bind([spotId]);
        
        if (stmt.step()) {
            const row = stmt.getAsObject();
            
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
            
            stmt.free();
            res.json(row);
        } else {
            stmt.free();
            res.status(404).json({ error: "Spot not found" });
        }
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
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        
        const stmt = db.prepare("SELECT `region-id`, name, country, `greater-region`, coordinates, `telegram-link` as telegram_link FROM regions WHERE `region-id` = ?");
        stmt.bind([regionId]);
        
        if (stmt.step()) {
            const row = stmt.getAsObject();
            row.coordinates = row.coordinates ? JSON.parse(row.coordinates) : [];
            stmt.free();
            res.json(row);
        } else {
            stmt.free();
            res.status(404).json({ error: 'Region not found' });
        }
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Initialize database then start server
initDatabase().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://0.0.0.0:${port}`);
    });
});