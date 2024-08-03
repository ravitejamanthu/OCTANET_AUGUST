// Real-time weather update
const apiKey = '8401f08459488a00a8191cef15350cde'; // Replace with your OpenWeatherMap API key
const city = 'Mumbai'; // Example city

function updateWeather() {
    const weatherInfo = document.getElementById('weather-info');
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const temp = data.main.temp;
            const weather = data.weather[0].description;
            weatherInfo.innerHTML = `<p>Current weather in ${city}: ${temp}°C, ${weather}</p>`;
        })
        .catch(error => {
            weatherInfo.innerHTML = `<p>Unable to fetch weather data.</p>`;
        });
}

updateWeather();

function initializeMap() {
    const map = L.map('map').setView([19.0760, 72.8777], 10); // Coordinates for Mumbai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([19.0760, 72.8777]).addTo(map)
        .bindPopup('Mumbai, India')
        .openPopup();
}

initializeMap();

