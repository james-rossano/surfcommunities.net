// Initialize the Leaflet map with the original OpenStreetMap theme
const map = L.map('map').setView([40.1795, -74.0327], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let surfSpots = [];
let markers = []; // Store markers
let labels = [];  // Store labels

map.on('click', function(e) {
    // Get the latitude and longitude from the event object
    const { lat, lng } = e.latlng;

    // Log the coordinates to the console
    console.log(`${lat}, ${lng}`);
});

let regions = [];

// Fetch regions data
const urlParams = new URLSearchParams(window.location.search);
const showAll = urlParams.get('showAll') === '1';

fetch('/api/regions')
    .then(response => response.json())
    .then(data => {
        regions = data;
        if (showAll) {
            addRegionBoxes(data); // Only add region boxes in dev mode
        }
    })

function findRegionForSpot(spot) {
    // Match the surf spot with its region
    return regions.find(region => 
        region.name === spot.sub_region &&
        region.region === spot.region &&
        region.country === spot.country
    );
}

function addRegionBoxes(regions) {
    regions.forEach(region => {
        region.coordinates.forEach(box => {
            const point1 = box.point1.split(',').map(coord => parseFloat(coord.trim()));
            const point2 = box.point2.split(',').map(coord => parseFloat(coord.trim()));

            // Create a bounding box using the two points
            const bounds = [
                [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1])],
                [Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])]
            ];

            // Add the rectangle to the map
            L.rectangle(bounds, {
                color: 'red',
                weight: 1,
                fillOpacity: 0.4 // Semi-transparent fill
            }).addTo(map);

            // Calculate the top-right corner of the box for the label
            const topRightCorner = [Math.min(point1[0], point2[0]), Math.max(point1[1], point2[1])];

            // Add a label with the region name at the top-right corner
            L.marker(topRightCorner, {
                icon: L.divIcon({
                    className: 'region-label', // Custom CSS class for styling
                    html: `<div>${region.name}</div>`,
                    iconSize: null // Size adjusts to content
                }),
            }).addTo(map);
        });
    });
} 

fetch(`/api/surfspots?showAll=${showAll ? 1 : 0}`)
    .then(response => response.json())
    .then(data => {
        surfSpots = data;
        updateMarkers();
    })
    .catch(error => console.error('Error fetching surf spots:', error));

function updateMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    labels.forEach(label => map.removeLayer(label));
    markers = [];
    labels = [];

    const bounds = map.getBounds();
    const zoomLevel = map.getZoom();

    const visibleSpots = surfSpots.filter(spot => {
        const hasCoordinates = spot.latitude !== undefined && spot.longitude !== undefined;
        if (!hasCoordinates) {
            console.warn('Spot missing valid coordinates:', spot);
        }
        return hasCoordinates && bounds.contains([spot.latitude, spot.longitude]);
    });

    visibleSpots.forEach(spot => {
        try {
            if (zoomLevel < 10) {
                const marker = L.circleMarker([spot.latitude, spot.longitude], {
                    radius: 8,
                    fillColor: '#0E49B5',
                    color: '#0E49B5',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).on('click', () => showDetails(spot, [spot.latitude, spot.longitude]));

                marker.addTo(map);
                markers.push(marker);
            } else {
                const labelHtml = `<div class="label">${spot.name}</div>`;
                const label = L.marker([spot.latitude, spot.longitude], {
                    icon: L.divIcon({
                        className: 'label-icon',
                        html: labelHtml,
                    }),
                }).on('click', () => showDetails(spot, [spot.latitude, spot.longitude]));

                label.addTo(map);
                labels.push(label);
            }
        } catch (error) {
            console.error('Error processing spot:', spot, error);
        }
    });
}


    
// Recalculate markers and labels when the map is moved or zoomed
map.on('moveend', updateMarkers);
    

// Function to display surf spot details in the info box
function showDetails(spot, latLng) {
    const infoBox = document.getElementById('info-box');

    // Temporarily show the info box to get its dimensions
    infoBox.style.display = 'block';
    infoBox.style.visibility = 'hidden'; // Prevent flicker while positioning

    const matchedRegion = findRegionForSpot(spot);
    const telegramLink = matchedRegion?.telegramLink || '#';

    const forecastLinks = Array.isArray(spot.forecast)
        ? spot.forecast
            .map(f => `<button class="forecast-btn" onclick="window.open('${f.url || '#'}', '_blank')">${f.name || 'Unnamed Forecast'}</button>`)
            .join('')
        : 'No forecast data available';

    document.getElementById('spot-details').innerHTML = `
        <div class="spot-details">
            <strong>${spot.name}</strong><br>
        </div>
        <div class="forecast-container">
            ${forecastLinks}
        </div>
        
        <a href="${telegramLink}" target="_blank" class="community-link">
            Join Group
        </a>
    `;

    const spotImage = document.getElementById('spot-image');
    spotImage.src = spot.image || 'images/spot_detail.jpg';
    spotImage.style.display = 'block';

    // Get map container and click point relative to the screen
    const container = map.getContainer().getBoundingClientRect();
    const point = map.latLngToContainerPoint(latLng);

    // Calculate the initial position (bottom-right of the click point)
    let topPos = (point.y + container.top) - 100; // Slight offset below the click
    let leftPos = point.x + container.left + 10; // Slight offset to the right of the click

    // Get the size of the info box
    const infoBoxHeight = infoBox.offsetHeight;
    const infoBoxWidth = infoBox.offsetWidth;

    // Ensure the box doesn't overlap the footer
    const footerHeight = document.querySelector('footer').offsetHeight;
    if (topPos + infoBoxHeight > window.innerHeight - footerHeight) {
        topPos = window.innerHeight - footerHeight - infoBoxHeight - 10;
    }

    // Ensure the box stays within the map's left and right boundaries
    const mapLeft = container.left;
    const mapRight = container.right;
    if (leftPos + infoBoxWidth > mapRight) {
        leftPos = mapRight - infoBoxWidth - 10; // Adjust to stay within the right boundary
    }
    if (leftPos < mapLeft) {
        leftPos = mapLeft + 10; // Adjust to stay within the left boundary
    }

    // Ensure the box doesn't overflow at the top of the screen
    topPos = Math.max(10, topPos);

    // Apply the calculated position and make the box visible
    infoBox.style.top = `${topPos}px`;
    infoBox.style.left = `${leftPos}px`;
    infoBox.style.visibility = 'visible';
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
