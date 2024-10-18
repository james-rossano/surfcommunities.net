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
