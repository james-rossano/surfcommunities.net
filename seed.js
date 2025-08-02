const Database = require('better-sqlite3');
const db = new Database('surfcommunity.db', { verbose: console.log });


const surfSpots = require('./all_surf_spots.json');

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
