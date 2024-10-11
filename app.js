document.addEventListener('DOMContentLoaded', function () {
    const spotDetails = document.getElementById('spot-details');
    const addFavoriteBtn = document.getElementById('add-favorite');

    // Initialize Leaflet map
    const map = L.map('map').setView([40.1795, -74.0327], 8); // Change the coordinates and zoom level as needed

    const northNJCoords = [
        [40.494945, -74.052420], // Example points for the North NJ region
        [40.487518, -73.898210],
        [39.981180, -73.983534],
        [39.988310, -74.109678]
    ];
    
    const southNJCoords = [
        [39.055571, -75.147163], // Example points for the South NJ region
        [39.867076, -74.211439],
        [39.809305, -73.983598],
        [38.797593, -74.923496]
    ];
    
    // Create the polygon for the North NJ coast
    const northNJPolygon = L.polygon(northNJCoords, {
        color: '#0073e6',  // Border color
        fillColor: '#0073e6',  // Fill color
        fillOpacity: 0.4  // Semi-opaque fill
    }).addTo(map);
    
    // Create the polygon for the South NJ coast
    const southNJPolygon = L.polygon(southNJCoords, {
        color: '#e67300',  // Border color
        fillColor: '#e67300',  // Fill color
        fillOpacity: 0.4  // Semi-opaque fill
    }).addTo(map);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch surf spots from the local JSON file
    fetch('/api/surfspots') // Call the API endpoint to get data from MongoDB
        .then(response => response.json())
        .then(data => {
            data.forEach(spot => {
                // Create a circleMarker instead of a pin
                const circle = L.circleMarker([spot.coordinates.lat, spot.coordinates.lng], {
                    radius: 8, // Size of the circle
                    color: '#0073e6', // Border color
                    fillColor: '#0073e6', // Fill color
                    fillOpacity: 0.8 // Opacity of the fill
                }).addTo(map);

                // Create a popup with the spot name
                let popupContent = `<strong>${spot.name}</strong><br>`;

                // Check if forecast is available
                if (Array.isArray(spot.forecast) && spot.forecast.length > 0) {
                    spot.forecast.forEach(f => {
                        popupContent += `<a href="${f.url}" target="_blank">${f.name}</a><br>`;
                    });
                } else {
                    popupContent += 'No forecast data available<br>';
                    console.log(spot);
                }

                // Bind the popup content to the circle marker
                circle.bindPopup(popupContent);
            });
        })
        .catch(error => console.error('Error:', error));

    // Function to display spot details
    function showSpotInfo(spot) {
        spotDetails.innerHTML = `
            <h3>${spot.name}</h3>
            <p>Latitude: ${spot.lat}, Longitude: ${spot.lng}</p>
            <p><a href="${spot.forecast_url}" target="_blank">View Surf Forecast</a></p>
            <p><a href="${spot.community_url}" target="_blank">Join Community</a></p>
        `;
    }

    // Add to Favorites functionality
    addFavoriteBtn.addEventListener('click', function () {
        alert("Added to favorites!");
    });
});