// Initialize the Leaflet map with the original OpenStreetMap theme
const map = L.map('map').setView([40.1795, -74.0327], 8);

// Load and display the tile layer on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch surf spots from the database
fetch('/api/surfspots')
    .then(response => response.json())
    .then(surfSpots => {
        surfSpots.forEach(spot => {
            const labelHtml = `<div class="label">${spot.name}</div>`;

            // Add the label to the map, and ensure it's clickable
            const label = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
                icon: L.divIcon({
                    className: 'label-icon',
                    html: labelHtml
                })
            }).addTo(map);

            // Attach click event to the marker instead of the label HTML
            label.on('click', function () {
                showDetails(spot, [spot.coordinates.lat, spot.coordinates.lng]);
            });
        });
    })
    .catch(error => console.error('Error fetching surf spots:', error));

    function showDetails(spot, latLng) {
        const forecastLinks = spot.forecast
            .map(f => `<button class="forecast-btn" onclick="window.open('${f.url}', '_blank')">${f.name} Forecast</button>`)
            .join('') || 'No forecast data available';
    
        document.getElementById('spot-details').innerHTML = `
            <div class="spot-details">
                <strong>${spot.name}</strong><br>
                ${spot.description || 'No description available'}
            </div>
            <div class="forecast-container">
                ${forecastLinks}
                <button class="forecast-btn" onclick="window.open('https://www.windy.com/-Waves-waves?waves,${spot.coordinates.lat},${spot.coordinates.lng},10', '_blank')">
                    Windy Forecast
                </button>
            </div>
            <div class="descriptors">
                <p>&#127909; Share Photos/Video</p>
                <p>&#127940; Learn About Conditions</p>
                <p>&#128513; Meet Friends</p>
                <p>&#128198; Discuss Forecasts</p>
            </div>
            <a href="https://t.me/${spot.name.replace(/\s+/g, '')}_surfcommunity" target="_blank" class="community-link">
                Join ${spot.name} Community
            </a>
        `;
    
        const spotImage = document.getElementById('spot-image');
        spotImage.src = spot.image || '';
        spotImage.style.display = spot.image ? 'block' : 'none';
    
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
    
    map.on('click', () => {
        document.getElementById('info-box').style.display = 'none';
    });
    
    map.on('drag', () => {
        document.getElementById('info-box').style.display = 'none';
    });
    
    map.on('zoomend', () => {
        document.getElementById('info-box').style.display = 'none';
    });
    
