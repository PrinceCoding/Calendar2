// Weather Widget
(function() {
  'use strict';

  const API_KEY = 'b95afe6a6237faddd746ed772fb66ae7'; // User needs to add their OpenWeatherMap API key
  const weatherWidget = document.getElementById('floatingWeather');
  const weatherLocation = document.getElementById('weatherLocation');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherDesc = document.getElementById('weatherDesc');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherHumidity = document.getElementById('weatherHumidity');
  const weatherWind = document.getElementById('weatherWind');
  const weatherFeels = document.getElementById('weatherFeels');
  const weatherSearch = document.getElementById('weatherSearch');
  const weatherSearchBtn = document.getElementById('weatherSearchBtn');
  const weatherRefreshBtn = document.getElementById('weatherRefreshBtn');

  let currentCity = localStorage.getItem('weatherCity') || 'London';

  // Fetch weather data
  async function fetchWeather(city) {
    try {
      // Show loading state
      if (weatherTemp) weatherTemp.textContent = '...';
      if (weatherDesc) weatherDesc.textContent = 'Loading...';

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      updateWeatherDisplay(data);
      currentCity = city;
      localStorage.setItem('weatherCity', city);
    } catch (error) {
      console.error('Weather fetch error:', error);
      if (weatherTemp) weatherTemp.textContent = '--°';
      if (weatherDesc) weatherDesc.textContent = error.message === 'City not found' ? 'City not found' : 'Error loading weather';
    }
  }

  // Update weather display
  function updateWeatherDisplay(data) {
    if (weatherLocation) weatherLocation.textContent = data.name + ', ' + data.sys.country;
    if (weatherTemp) weatherTemp.textContent = Math.round(data.main.temp) + '°C';
    if (weatherDesc) weatherDesc.textContent = data.weather[0].description.charAt(0).toUpperCase() + 
                                                data.weather[0].description.slice(1);
    if (weatherIcon) weatherIcon.textContent = getWeatherEmoji(data.weather[0].main);
    if (weatherHumidity) weatherHumidity.textContent = data.main.humidity + '%';
    if (weatherWind) weatherWind.textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    if (weatherFeels) weatherFeels.textContent = Math.round(data.main.feels_like) + '°C';
  }

  // Get weather emoji based on condition
  function getWeatherEmoji(condition) {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Smoke': '🌫️',
      'Haze': '🌫️',
      'Dust': '🌫️',
      'Fog': '🌫️',
      'Sand': '🌫️',
      'Ash': '🌫️',
      'Squall': '💨',
      'Tornado': '🌪️'
    };
    return emojiMap[condition] || '🌡️';
  }

  // Event listeners
  if (weatherSearchBtn) {
    weatherSearchBtn.addEventListener('click', () => {
      const city = weatherSearch.value.trim();
      if (city) {
        fetchWeather(city);
        weatherSearch.value = '';
      }
    });
  }

  if (weatherSearch) {
    weatherSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = weatherSearch.value.trim();
        if (city) {
          fetchWeather(city);
          weatherSearch.value = '';
        }
      }
    });
  }

  if (weatherRefreshBtn) {
    weatherRefreshBtn.addEventListener('click', () => {
      fetchWeather(currentCity);
    });
  }

  // Initial load
  if (API_KEY !== 'YOUR_API_KEY_HERE') {
    fetchWeather(currentCity);
  } else {
    if (weatherDesc) weatherDesc.textContent = 'Add API key in weather.js';
    if (weatherTemp) weatherTemp.textContent = '--°';
  }

  // Export for main script
  window.WeatherWidget = {
    element: weatherWidget,
    refresh: () => fetchWeather(currentCity)
  };
})();
