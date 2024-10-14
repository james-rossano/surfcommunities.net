// Initialize the Leaflet map with the original OpenStreetMap theme
const map = L.map('map').setView([40.1795, -74.0327], 8);

// Load and display the tile layer on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let surfSpots = [];
const markers = [];
const labels = [];

// Fetch surf spots and initialize both markers and labels
fetch('/api/surfspots')
    .then(response => response.json())
    .then(data => {
        surfSpots = data; // Store surf spots for searching
        data.forEach(spot => {
            // Create circle markers (for zoomed out view)
            const marker = L.circleMarker([spot.coordinates.lat, spot.coordinates.lng], {
                radius: 8,
                fillColor: '#0073e6',
                color: '#0073e6',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).on('click', () => showDetails(spot, [spot.coordinates.lat, spot.coordinates.lng]));

            markers.push(marker);

            // Create labels (for zoomed in view)
            const labelHtml = `<div class="label">${spot.name}</div>`;
            const label = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
                icon: L.divIcon({
                    className: 'label-icon',
                    html: labelHtml
                })
            }).on('click', () => showDetails(spot, [spot.coordinates.lat, spot.coordinates.lng]));

            // Add hover behavior to bring label to front
            label.on('mouseover', function () {
                this.setZIndexOffset(1000); // Bring to front
            });
            label.on('mouseout', function () {
                this.setZIndexOffset(0); // Reset to default
            });

            labels.push(label);
        });

        toggleMarkersAndLabels(); // Initialize the correct view based on zoom level
    })
    .catch(error => console.error('Error fetching surf spots:', error));

// Function to toggle between markers and labels based on zoom level
function toggleMarkersAndLabels() {
    const zoomLevel = map.getZoom();

    if (zoomLevel < 10) {
        // Zoomed out: Show circle markers, hide labels
        markers.forEach(marker => marker.addTo(map));
        labels.forEach(label => map.removeLayer(label));
    } else {
        // Zoomed in: Show labels, hide circle markers
        labels.forEach(label => label.addTo(map));
        markers.forEach(marker => map.removeLayer(marker));
    }
}

// Set up the zoom event listener to toggle markers and labels dynamically
map.on('zoomend', toggleMarkersAndLabels);

// Function to display surf spot details in the info box
function showDetails(spot, latLng) {
    const forecastLinks = spot.forecast
        .map(f => `<button class="forecast-btn" onclick="window.open('${f.url}', '_blank')">${f.name}</button>`)
        .join('') || 'No forecast data available';

    document.getElementById('spot-details').innerHTML = `
        <div class="spot-details">
            <strong>${spot.name}</strong><br>
            ${spot.description || ''}
        </div>
        <div class="forecast-container">
            ${forecastLinks}
            <button class="forecast-btn" onclick="window.open('https://www.windy.com/-Waves-waves?waves,${spot.coordinates.lat},${spot.coordinates.lng},10', '_blank')">
                Windy
            </button>
        </div>
        <div class="descriptors">
            <p>&#127909; Share Photos and Video</p>
            <p>&#127940; Find Where Conditions Are Best</p>
            <p>&#128513; Meet Friends</p>
            <p>&#128198; Share Advice Discuss Forecasts</p>
        </div>
        <a href="https://t.me/${spot.name.replace(/\s+/g, '')}_surfcommunity" target="_blank" class="community-link">
            Join ${spot.name} Community
        </a>
    `;

    const spotImage = document.getElementById('spot-image');
    if (spot.image) {
        spotImage.src = spot.image;
        spotImage.style.display = 'block';
    } else {
        spotImage.src = 'images/test.jpg';
        spotImage.style.display = 'block';
    }

    const infoBox = document.getElementById('info-box');
    const point = map.latLngToContainerPoint(latLng);
    infoBox.style.display = 'block';

    const infoBoxHeight = infoBox.offsetHeight;
    const infoBoxWidth = infoBox.offsetWidth;

    let topPos = point.y - 50;
    let leftPos = point.x + 10;

    if ((topPos + infoBoxHeight) > window.innerHeight) {
        topPos = window.innerHeight - infoBoxHeight - 20;
    }
    if ((leftPos + infoBoxWidth) > window.innerWidth) {
        leftPos = window.innerWidth - infoBoxWidth - 20;
    }

    infoBox.style.top = `${topPos}px`;
    infoBox.style.left = `${leftPos}px`;
}

// Search for surf spots by name and display suggestions
function searchSurfSpot(query) {
    const suggestions = surfSpots.filter(spot =>
        spot.name.toLowerCase().includes(query.toLowerCase())
    );

    displaySuggestions(suggestions);
}

// Display matching suggestions below the search bar
function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (suggestions.length > 0) {
        suggestions.forEach(spot => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = spot.name;

            suggestionItem.addEventListener('click', () => {
                const { lat, lng } = spot.coordinates;
                map.setView([lat, lng], 12); // Zoom to the spot
                showDetails(spot, [lat, lng]);
                suggestionsContainer.style.display = 'none'; // Hide suggestions
            });

            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block'; // Show suggestions
    } else {
        suggestionsContainer.style.display = 'none'; // Hide if no suggestions
    }
}

// Event listener for search input
document.getElementById('search-input').addEventListener('input', function (e) {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        searchSurfSpot(query);
    } else {
        document.getElementById('suggestions').style.display = 'none'; // Hide suggestions
    }
});

// Hide the info box when clicking, dragging, or zooming the map
map.on('click', () => document.getElementById('info-box').style.display = 'none');
map.on('drag', () => document.getElementById('info-box').style.display = 'none');
map.on('zoomend', () => document.getElementById('info-box').style.display = 'none');
