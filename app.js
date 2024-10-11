// Initialize the Leaflet map with the original OpenStreetMap theme
const map = L.map('map').setView([40.1795, -74.0327], 8);

// Revert to the old tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch surf spots from the database
fetch('/api/surfspots')
    .then(response => response.json())
    .then(surfSpots => {
        surfSpots.forEach(spot => {
            const labelHtml = `<div class="label">${spot.name}</div>`;

            // Add the label to the map instead of a pin marker
            const label = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
                icon: L.divIcon({
                    className: 'label-icon',
                    html: labelHtml
                })
            }).addTo(map);

            // Add a click event to show the details in the info box
            label.on('click', function () {
                showDetails(spot, [spot.coordinates.lat, spot.coordinates.lng]);
            });
        });
    })
    .catch(error => console.error('Error fetching surf spots:', error));

// Show surf spot details in the info box
function showDetails(spot, latLng) {
    const forecastLinks = spot.forecast.map(f => `<a href="${f.url}" target="_blank">${f.name}</a>`).join('<br>') || 'No forecast data available';

    document.getElementById('spot-details').innerHTML = `
        <strong>${spot.name}</strong><br>
        ${spot.description || 'No description available'}<br>
        ${forecastLinks}
    `;

    // Update the image
    const spotImage = document.getElementById('spot-image');
    spotImage.src = spot.image || '';
    spotImage.style.display = spot.image ? 'block' : 'none';

    // Position the info box near the clicked spot's location
    const infoBox = document.getElementById('info-box');
    const point = map.latLngToContainerPoint(latLng); // Get the pixel coordinates of the marker
    infoBox.style.display = 'block';
    infoBox.style.top = `${point.y - 50}px`; // Adjust the Y offset
    infoBox.style.left = `${point.x + 10}px`; // Adjust the X offset
}

// Make the info box disappear when clicking outside of it or dragging the map
map.on('click', () => {
    document.getElementById('info-box').style.display = 'none';
});

map.on('drag', () => {
    document.getElementById('info-box').style.display = 'none';
});
