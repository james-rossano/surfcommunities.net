// Define initial center points for specific regions
const initialCenters = {
    '/indonesia': { lat: -2.5, lng: 118, zoom: 5 },
    '/california': { lat: 36.7783, lng: -119.4179, zoom: 6 },
    '/australia': { lat: -25.2744, lng: 133.7751, zoom: 5 },
    // add more as needed
};

const path = window.location.pathname.toLowerCase();
const center = initialCenters[path] || { lat: 40.1795, lng: -74.0327, zoom: 6 };

// Initialize the Leaflet map with custom bounds and no wrap
const map = L.map('map', {
    worldCopyJump: false,
    minZoom: 3
}).setView([center.lat, center.lng], center.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: false
}).addTo(map);

let surfSpots = [];
let markers = []; // Store markers
let labels = [];  // Store labels
let regions = [];

const urlParams = new URLSearchParams(window.location.search);
const showAll = urlParams.get('showAll') === '1';

// Log coordinates on map click (dev utility)
map.on('click', function(e) {
    // Get the latitude and longitude from the event object
    const { lat, lng } = e.latlng;

    // Log the coordinates to the console
    console.log(`${lat}, ${lng}`);
});

// Fetch regions data
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

function updateMarkers() {
    if (window.markerClusterGroup) {
        map.removeLayer(window.markerClusterGroup);
    }
    markers.forEach(marker => map.removeLayer(marker));
    labels.forEach(label => map.removeLayer(label));
    markers = [];
    labels = [];

    const bounds = map.getBounds();
    const zoomLevel = map.getZoom();

    // Only filter visible spots
    const visibleSpots = surfSpots.filter(spot =>
        spot.latitude !== undefined && spot.longitude !== undefined &&
        (zoomLevel < 11 ||
            (spot.latitude >= bounds.getSouth() &&
             spot.latitude <= bounds.getNorth() &&
             spot.longitude >= bounds.getWest() &&
             spot.longitude <= bounds.getEast()))
    );

    if (zoomLevel < 11) {
        window.markerClusterGroup = L.markerClusterGroup();
    }

    visibleSpots.forEach(spot => {
        const latLng = [spot.latitude, spot.longitude];
        let marker;
        if (zoomLevel < 10) {
            marker = L.circleMarker(latLng, {
                radius: 8,
                fillColor: '#0E49B5',
                color: '#0E49B5',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            marker.on('click', () => showDetails(spot, latLng));
            window.markerClusterGroup.addLayer(marker);
        } else {
            const labelHtml = `<div class="label">${spot.name}</div>`;
            marker = L.marker(latLng, {
                icon: L.divIcon({
                    className: 'label-icon',
                    html: labelHtml,
                }),
            });
            marker.on('click', () => showDetails(spot, latLng));
            marker.addTo(map);
            labels.push(marker);
        }
        markers.push(marker);
    });

    if (zoomLevel < 11) {
        map.addLayer(window.markerClusterGroup);
    }
}
    
// Recalculate markers and labels when the map is moved or zoomed
map.on('moveend', updateMarkers);
map.on('zoomend', updateMarkers); // Optional: keep if you want updates after panning
    

// Function to display surf spot details in the info box
function showDetails(spot, latLng) {
    const infoBox = document.getElementById('info-box');
    infoBox.style.display = 'block';
    infoBox.style.visibility = 'hidden';

    // Fetch details from the DB using spot-id
    fetch(`/api/spotdetails?spot_id=${spot["spot-id"]}`)
        .then(response => response.json())
        .then(details => {
            // Fetch region info if needed
            fetch(`/api/regiondetails?region_id=${spot["region-id"]}`)
                .then(regionRes => regionRes.json())
                .then(region => {
                    const telegramLink = region?.telegram_link || '#';
                    let forecastLinks = '';
                    if (Array.isArray(details.forecast) && details.forecast.length > 0) {
                        forecastLinks = details.forecast
                            .map(f => `<button class="forecast-btn" onclick="window.open('${f.url || '#'}', '_blank')">${f.name || 'Unnamed Forecast'}</button>`)
                            .join('');
                    }

                    document.getElementById('spot-details').innerHTML = `
                        <div class="spot-details">
                            <strong>${spot.name}</strong><br>
                        </div>
                        ${forecastLinks ? `<div class="forecast-container">${forecastLinks}</div>` : ''}
                        <a href="${telegramLink}" target="_blank" class="community-link">
                            Join Group
                        </a>
                        <div>${details.description || ''}</div>
                    `;

                    const spotImage = document.getElementById('spot-image');
                    spotImage.src = details.image || 'images/spot_detail.jpg';
                    spotImage.style.display = 'block';

                    // Use spot.latitude and spot.longitude for positioning
                    const container = map.getContainer().getBoundingClientRect();
                    const point = map.latLngToContainerPoint([spot.latitude, spot.longitude]);

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
                });
        })
        .catch(error => {
            console.error('Error fetching spot details:', error);
            infoBox.style.display = 'none';
        });
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
    suggestionsContainer.innerHTML = '';

    if (suggestions.length > 0) {
        suggestions.forEach(spot => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = spot.name;

            suggestionItem.addEventListener('click', () => {
                map.setView([spot.latitude, spot.longitude], 12);
                showDetails(spot, [spot.latitude, spot.longitude]);
                suggestionsContainer.style.display = 'none';
            });

            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
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

fetch('/surfspots.json')
    .then(response => response.json())
    .then(data => {
        // Only show all if showAll is true
        surfSpots = showAll
            ? data
            : data.filter(spot =>
                spot["region-id"] !== null &&
                spot["region-id"] !== undefined &&
                spot["region-id"] !== "" &&
                !isNaN(spot["region-id"])
            );
        updateMarkers();
        document.getElementById('loading-overlay').style.display = 'none';
    })
    .catch(error => {
        console.error('Error fetching surf spots:', error);
        document.getElementById('loading-overlay').style.display = 'none';
    });
