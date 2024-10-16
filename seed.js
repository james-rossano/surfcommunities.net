const mongoose = require('mongoose');
const SurfSpot = require('./models/surfspot');
const surfSpots = require('./output.json'); // Your JSON file

// Connect to MongoDB
mongoose.connect('mongodb+srv://jrossano4:12345@surfcommunity-cluster.gi10z.mongodb.net/?retryWrites=true&w=majority&appName=surfcommunity-cluster')
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        
        // Iterate over each surf spot in the JSON
        const upsertPromises = surfSpots.map(spot => {
            return SurfSpot.findOneAndUpdate(
                { name: spot.name }, // Query by the "name" field
                spot, // Update with the new data
                { upsert: true, new: true } // Upsert option: inserts if no match is found
            );
        });

        // Wait for all upserts to finish
        return Promise.all(upsertPromises);
    })
    .then(() => {
        console.log('Data upserted successfully!');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error upserting data:', err);
        mongoose.connection.close();
    });