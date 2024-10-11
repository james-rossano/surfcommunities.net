// Your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiamFtZXNyb3NzYW5vIiwiYSI6ImNtMjUxMHZhbjBuNzIyam9yZG9tdW8zbW4ifQ.oCuK9g678_2HhPa8SNSDsw';

// Initialize the Mapbox map with a 3D globe projection
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-v9', // satellite style
    center: [-74.0327, 40.1795], // starting position [lng, lat]
    zoom: 3, // starting zoom level for a globe
    projection: 'globe' // Use the globe projection for a 3D Earth effect
});

// Enable globe terrain shading for better visualization
map.on('style.load', () => {
    map.setFog({
        'range': [-1, 1.5],
        'color': 'white',
        'horizon-blend': 0.03
    });
});

// Fetch surf spots and display labels using Popups
fetch('/api/surfspots')
.then(response => response.json())
.then(data => {
    data.forEach(spot => {
        // Check if the latitude and longitude are valid
        if (!spot.coordinates || typeof spot.coordinates.lat !== 'number' || typeof spot.coordinates.lng !== 'number') {
            console.error(`Invalid coordinates for ${spot.name}`);
            return;
        }

        // Log the coordinates for debugging
        console.log(`${spot.name} coordinates: `, spot.coordinates.lat, spot.coordinates.lng);

        // Create a popup to act as the label
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25 // Ensure popup doesn't overlap the marker
        })
        .setLngLat([spot.coordinates.lng, spot.coordinates.lat])
        .setHTML(`<div class="label">${spot.name}</div>`)
        .addTo(map);

        // Add click event listener for each popup's label
        popup.getElement().addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click event from hiding details box
            showDetails(spot, popup.getLngLat()); // Pass the location of the clicked spot
        });
    });

    function showDetails(spot, latLng) {
        // Update the info box with the surf spot's details
        const forecastLinks = spot.forecast.map(f => 
            `<a href="${f.url}" target="_blank">${f.name}</a>`).join('<br>') || 'No forecast data available';

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
        const point = map.project(latLng); // Get the pixel coordinates of the marker
        infoBox.style.display = 'block';
        infoBox.style.top = `${point.y - 50}px`; // Adjust the Y offset
        infoBox.style.left = `${point.x + 10}px`; // Adjust the X offset
    }

    // Hide the info box when clicking on the map (outside the surf spots)
    map.on('click', () => {
        document.getElementById('info-box').style.display = 'none';
    });

    // Hide the info box when dragging the map
    map.on('dragstart', () => {
        document.getElementById('info-box').style.display = 'none';
    });
})
.catch(error => console.error('Error:', error));
