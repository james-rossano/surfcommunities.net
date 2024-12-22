const sqlite3 = require('sqlite3').verbose();
const surfSpots = require('./output.json');
const db = new sqlite3.Database('./surfcommunity.db');

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS surfspots (
        id INTEGER PRIMARY KEY,
        type TEXT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        country TEXT,
        region TEXT,
        sub_region TEXT,
        description TEXT,
        forecast TEXT
    )`);
    
    const insertStmt = db.prepare(`INSERT INTO surfspots 
        (id, type, name, latitude, longitude, country, region, sub_region, description, forecast) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            type = excluded.type,
            name = excluded.name,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            country = excluded.country,
            region = excluded.region,
            sub_region = excluded.sub_region,
            description = excluded.description,
            forecast = excluded.forecast`);

    surfSpots.forEach(spot => {
        insertStmt.run(
            spot.id,
            spot.type,
            spot.name,
            spot.coordinates.lat,
            spot.coordinates.lng,
            spot.country,
            spot.region,
            spot.sub_region,
            spot.description,
            JSON.stringify(spot.forecast) // Store forecast as JSON string
        );
    });

    insertStmt.finalize();
});

db.close();

/*
const mongoose = require('mongoose');
const SurfSpot = require('./models/surfspot'); // Your updated model
const surfSpots = require('./output.json'); // Your JSON file

// Connect to MongoDB and specify the "surfcommunity" database
mongoose.connect('mongodb+srv://jrossano4:12345@surfcommunity-cluster.gi10z.mongodb.net/surfcommunity?retryWrites=true&w=majority&appName=surfcommunity-cluster')
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        
        // Iterate over each surf spot in the JSON
        const upsertPromises = surfSpots.map(spot => {
            return SurfSpot.findOneAndUpdate(
                { id: spot.id }, // Query by the "id" field
                spot, // Update with the new data
                { upsert: true, new: true, setDefaultsOnInsert: true } // Upsert option: inserts if no match is found
            );
        });

        // Wait for all upserts to finish
        return Promise.all(upsertPromises);
    })
    .then(() => {
        console.log('Data upserted successfully into the "surfspots" collection!');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error upserting data:', err);
        mongoose.connection.close();
    });
    */
