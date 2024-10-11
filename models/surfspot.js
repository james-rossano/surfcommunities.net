const mongoose = require('mongoose');

const surfSpotSchema = new mongoose.Schema({
    name: String,
    location: String,
    type: String,
    description: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    image: String,
    forecast: [
        {
            name: String,
            url: String
        }
    ]
});

const SurfSpot = mongoose.model('SurfSpot', surfSpotSchema);
module.exports = SurfSpot;
