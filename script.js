// Weather search and display
const apiKey = '8401f08459488a00a8191cef15350cde'; // OpenWeatherMap API key

// Map state
let mapInstance = null;
let mapMarker = null;
let pendingMapCenter = null; // store coords if weather loads before map

function setWeatherLoading(message = 'Loading...') {
    const weatherInfo = document.getElementById('weather-info');
    if (weatherInfo) weatherInfo.innerHTML = `<p>${message}</p>`;
}

function renderWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    if (!weatherInfo) return;

    const cityName = `${data.name}, ${data.sys.country}`;
    const description = data.weather?.[0]?.description ?? 'N/A';
    const icon = data.weather?.[0]?.icon;
    const temp = Math.round(data.main?.temp);
    const feels = Math.round(data.main?.feels_like);
    const humidity = data.main?.humidity;
    const wind = Math.round((data.wind?.speed ?? 0) * 3.6); // m/s -> km/h

    const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';

    weatherInfo.innerHTML = `
        <div class="weather-card">
            <div class="weather-main">
                ${iconUrl ? `<img alt="${description}" src="${iconUrl}" />` : ''}
                <div>
                    <h3>${cityName}</h3>
                    <p style="text-transform: capitalize;">${description}</p>
                </div>
            </div>
            <div class="weather-metrics">
                <div><strong>${temp}°C</strong> <span>Temp</span></div>
                <div>${feels}°C <span>Feels like</span></div>
                <div>${humidity}% <span>Humidity</span></div>
                <div>${wind} km/h <span>Wind</span></div>
            </div>
        </div>
    `;

    // Update map to this location
    const lat = data.coord?.lat;
    const lon = data.coord?.lon;
    if (typeof lat === 'number' && typeof lon === 'number') {
        updateMapLocation(lat, lon, cityName);
    }
}

async function fetchWeatherByQuery(query) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather not found');
    return res.json();
}

function attachWeatherSearch() {
    const form = document.getElementById('weather-search-form');
    const input = document.getElementById('location-input');
    if (!form || !input) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        document.getElementById('weather')?.scrollIntoView({ behavior: 'smooth' });
        setWeatherLoading('Fetching current weather...');
        try {
            const data = await fetchWeatherByQuery(query);
            renderWeather(data);
        } catch (err) {
            setWeatherLoading('Unable to fetch weather. Try another location.');
        }
    });
}

// Initial default weather (Mumbai) so the section is not empty on load
(async function initDefaultWeather() {
    try {
        const data = await fetchWeatherByQuery('Mumbai');
        renderWeather(data);
    } catch (e) {
        setWeatherLoading('Enter a location to see the current weather.');
    }
})();

function initializeMap() {
    mapInstance = L.map('map').setView([19.0760, 72.8777], 10); // Default to Mumbai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    if (pendingMapCenter) {
        updateMapLocation(pendingMapCenter.lat, pendingMapCenter.lon, pendingMapCenter.label);
        pendingMapCenter = null;
    } else {
        mapMarker = L.marker([19.0760, 72.8777]).addTo(mapInstance)
            .bindPopup('Mumbai, India')
            .openPopup();
    }
}

function updateMapLocation(lat, lon, label) {
    if (!mapInstance) {
        pendingMapCenter = { lat, lon, label };
        return;
    }
    mapInstance.setView([lat, lon], 10);
    if (!mapMarker) {
        mapMarker = L.marker([lat, lon]).addTo(mapInstance);
    } else {
        mapMarker.setLatLng([lat, lon]);
    }
    if (label) {
        mapMarker.bindPopup(label).openPopup();
    }
}

initializeMap();

// Wire up search handlers
attachWeatherSearch();

