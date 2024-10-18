const mongoose = require('mongoose');

// Define your schema
const SurfSpotSchema = new mongoose.Schema({
    id: Number,
    name: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    country: String,
    region: String,
    sub_region: String,
    description: String,
    forecast: Array
}, { collection: 'surfspots' }); // Specify collection name here

// Create the model using the schema
module.exports = mongoose.model('SurfSpot', SurfSpotSchema);
