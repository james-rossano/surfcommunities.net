document.addEventListener('DOMContentLoaded', function () {
    const spotDetails = document.getElementById('spot-details');
    const addFavoriteBtn = document.getElementById('add-favorite');

    // Initialize Leaflet map
    const map = L.map('map').setView([34.0195, -118.4912], 10); // Centered around Santa Monica, CA

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch surf spots from the local JSON file
    fetch('surfspots.json')
        .then(response => response.json())
        .then(surfSpots => {
            surfSpots.forEach(spot => {
                // Add a marker for each surf spot
                const marker = L.marker([spot.lat, spot.lng]).addTo(map);
                marker.bindPopup(`<b>${spot.name}</b><br><a href="${spot.forecast_url}" target="_blank">View Forecast</a>`);

                // Add click event to show more details
                marker.on('click', function () {
                    showSpotInfo(spot);
                });
            });
        })
        .catch(error => console.error('Error fetching surf spots:', error));

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