// Initialize the Leaflet map with the original OpenStreetMap theme
const map = L.map('map').setView([40.1795, -74.0327], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let surfSpots = [];
let markers = []; // Store markers
let labels = [];  // Store labels

// Fetch surf spots data from the API
fetch('/api/surfspots')
    .then(response => response.json())
    .then(data => {
        surfSpots = data;
        updateMarkers(); // Load markers and labels initially
})
.catch(error => console.error('Error fetching surf spots:', error));

function updateMarkers() {
    // Clear previous markers and labels
    markers.forEach(marker => map.removeLayer(marker));
    labels.forEach(label => map.removeLayer(label));
    markers = [];
    labels = [];

    const bounds = map.getBounds(); // Get the current map bounds
    const zoomLevel = map.getZoom(); // Get the current zoom level

    // Filter surf spots that are within the visible bounds
    const visibleSpots = surfSpots.filter(spot =>
        bounds.contains([spot.coordinates.lat, spot.coordinates.lng])
    );

    visibleSpots.forEach(spot => {
        if (zoomLevel < 10) {
            // Show circle markers for lower zoom levels
            const marker = L.circleMarker([spot.coordinates.lat, spot.coordinates.lng], {
                radius: 8,
                fillColor: '#0E49B5',
                color: '#0E49B5',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).on('click', () => showDetails(spot, [spot.coordinates.lat, spot.coordinates.lng]));

            marker.addTo(map);
            markers.push(marker);
        } else {

            const labelHtml = `<div class="label">${spot.name}</div>`;
            const label = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
                icon: L.divIcon({
                    className: 'label-icon',
                    html: labelHtml,
                }),
            }).on('click', () => showDetails(spot, [spot.coordinates.lat, spot.coordinates.lng]));

            label.addTo(map);
            labels.push(label);
        }
    });
}
    
// Recalculate markers and labels when the map is moved or zoomed
map.on('moveend', updateMarkers);
    

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
        </div>
        
        <a href="https://t.me/${spot.name.replace(/\s+/g, '')}_surfcommunity" target="_blank" class="community-link">
            Join ${spot.name} Community
        </a>
    `;

    const spotImage = document.getElementById('spot-image');
    spotImage.src = spot.image || 'images/test.jpg';
    spotImage.style.display = 'block';

    const infoBox = document.getElementById('info-box');
    const point = map.latLngToContainerPoint(latLng);
    infoBox.style.display = 'block';

    let topPos = point.y - 50;
    let leftPos = point.x + 10;

    const infoBoxHeight = infoBox.offsetHeight;
    const infoBoxWidth = infoBox.offsetWidth;

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
