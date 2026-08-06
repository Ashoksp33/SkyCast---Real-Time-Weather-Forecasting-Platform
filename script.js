/**
 * SKYCAST - REAL-TIME WEATHER FORECASTING ENGINE
 * Pure Vanilla JavaScript Client & OpenWeatherMap API Integration
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DOM ELEMENT REFERENCES
    // ----------------------------------------------------------------------
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // API Key Elements
    const apiKeyBtn = document.getElementById('apiKeyBtn');
    const apiKeyBanner = document.getElementById('apiKeyBanner');
    const bannerSetKeyBtn = document.getElementById('bannerSetKeyBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const clearKeyBtn = document.getElementById('clearKeyBtn');

    // Alert & Loader
    const alertContainer = document.getElementById('alertContainer');
    const alertMessage = document.getElementById('alertMessage');
    const alertCloseBtn = document.getElementById('alertCloseBtn');
    const skeletonLoader = document.getElementById('skeletonLoader');
    const mainDashboard = document.getElementById('mainDashboard');

    // Current Weather Elements
    const cityNameEl = document.getElementById('cityName');
    const currentDateTimeEl = document.getElementById('currentDateTime');
    const conditionCategoryEl = document.getElementById('conditionCategory');
    const weatherIconEl = document.getElementById('weatherIcon');
    const currentTempEl = document.getElementById('currentTemp');
    const feelsLikeEl = document.getElementById('feelsLike');
    const weatherDescriptionEl = document.getElementById('weatherDescription');
    const tempMinMaxEl = document.getElementById('tempMinMax');
    const heroHumidityEl = document.getElementById('heroHumidity');
    const heroWindEl = document.getElementById('heroWind');
    const heroAqiEl = document.getElementById('heroAqi');

    // Forecast Containers
    const hourlyForecastContainer = document.getElementById('hourlyForecastContainer');
    const dailyForecastContainer = document.getElementById('dailyForecastContainer');

    // AQI Panel Elements
    const aqiBadgeEl = document.getElementById('aqiBadge');
    const aqiIndexNumEl = document.getElementById('aqiIndexNum');
    const aqiDescTextEl = document.getElementById('aqiDescText');
    const valPm25El = document.getElementById('valPm25');
    const valPm10El = document.getElementById('valPm10');
    const valCoEl = document.getElementById('valCo');
    const valNo2El = document.getElementById('valNo2');
    const valSo2El = document.getElementById('valSo2');
    const valO3El = document.getElementById('valO3');
    const barPm25 = document.getElementById('barPm25');
    const barPm10 = document.getElementById('barPm10');
    const barCo = document.getElementById('barCo');
    const barNo2 = document.getElementById('barNo2');
    const barSo2 = document.getElementById('barSo2');
    const barO3 = document.getElementById('barO3');

    // Highlights Elements
    const hlHumidityEl = document.getElementById('hlHumidity');
    const hlHumidityDescEl = document.getElementById('hlHumidityDesc');
    const hlWindSpeedEl = document.getElementById('hlWindSpeed');
    const hlWindDirEl = document.getElementById('hlWindDir');
    const windCompassNeedle = document.getElementById('windCompassNeedle');
    const hlPressureEl = document.getElementById('hlPressure');
    const hlPressureStatusEl = document.getElementById('hlPressureStatus');
    const hlVisibilityEl = document.getElementById('hlVisibility');
    const hlVisibilityStatusEl = document.getElementById('hlVisibilityStatus');
    const hlUvIndexEl = document.getElementById('hlUvIndex');
    const hlUvStatusEl = document.getElementById('hlUvStatus');
    const hlCloudsEl = document.getElementById('hlClouds');
    const hlCloudDescEl = document.getElementById('hlCloudDesc');
    const hlDewPointEl = document.getElementById('hlDewPoint');
    const hlSunriseEl = document.getElementById('hlSunrise');
    const hlSunsetEl = document.getElementById('hlSunset');
    const sunProgressBar = document.getElementById('sunProgressBar');
    const sunProgressIcon = document.getElementById('sunProgressIcon');

    // ----------------------------------------------------------------------
    // 2. STATE & INIT
    // ----------------------------------------------------------------------
    let currentCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY) || CONFIG.DEFAULT_CITY;

    initTheme();
    checkApiKeyStatus();
    fetchWeatherDataForCity(currentCity);

    // ----------------------------------------------------------------------
    // 3. THEME & API KEY HANDLERS
    // ----------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        themeToggleBtn.innerHTML = theme === 'dark' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    }

    function checkApiKeyStatus() {
        const key = getApiKey();
        if (!isApiKeyValid(key)) {
            apiKeyBanner.style.display = 'flex';
        } else {
            apiKeyBanner.style.display = 'none';
        }
    }

    function openModal() {
        const activeKey = getApiKey();
        apiKeyInput.value = isApiKeyValid(activeKey) ? activeKey : '';
        apiKeyModal.style.display = 'flex';
    }

    function closeModal() {
        apiKeyModal.style.display = 'none';
    }

    // ----------------------------------------------------------------------
    // 4. API FETCHING LOGIC (OpenWeatherMap APIs)
    // ----------------------------------------------------------------------
    async function fetchWeatherDataForCity(city) {
        const apiKey = getApiKey();
        if (!isApiKeyValid(apiKey)) {
            showAlert('Please configure your OpenWeatherMap API Key to fetch live data.', 'warning');
            openModal();
            return;
        }

        showLoading(true);
        hideAlert();

        try {
            // Step 1: Geocoding API - Convert City Name to Lat/Lon
            const geoUrl = `${CONFIG.GEO_BASE_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
            const geoRes = await fetch(geoUrl);

            if (!geoRes.ok) {
                if (geoRes.status === 401) {
                    throw new Error('KEY_PENDING_ACTIVATION');
                }
                throw new Error(`Geocoding error (Status ${geoRes.status})`);
            }

            const geoData = await geoRes.json();
            if (!geoData || geoData.length === 0) {
                throw new Error(`City "${city}" not found. Please check spelling.`);
            }

            const { lat, lon, name, country } = geoData[0];
            await fetchAllWeatherByCoords(lat, lon, `${name}, ${country}`);
            
            // Save last searched city
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, city);

        } catch (error) {
            console.error('Weather fetch error:', error);
            if (error.message === 'KEY_PENDING_ACTIVATION') {
                showAlert(
                    'OpenWeatherMap API Key is pending activation (new keys take 10-30 mins to activate on OpenWeatherMap servers). Showing Demo Data below so you can test the UI!',
                    'warning'
                );
                loadMockWeatherData(city);
            } else {
                showAlert(error.message || 'Failed to fetch weather data.', 'error');
            }
        } finally {
            showLoading(false);
        }
    }

    async function fetchAllWeatherByCoords(lat, lon, locationLabel) {
        const apiKey = getApiKey();

        try {
            // Fetch Current Weather, Forecast, and Air Pollution concurrently
            const [currentRes, forecastRes, airRes] = await Promise.all([
                fetch(`${CONFIG.API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${CONFIG.UNITS}&appid=${apiKey}`),
                fetch(`${CONFIG.API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${CONFIG.UNITS}&appid=${apiKey}`),
                fetch(`${CONFIG.API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
            ]);

            if (!currentRes.ok) throw new Error('Failed to fetch current weather details.');
            if (!forecastRes.ok) throw new Error('Failed to fetch 5-day forecast.');

            const currentData = await currentRes.json();
            const forecastData = await forecastRes.json();
            const airData = airRes.ok ? await airRes.json() : null;

            // Render all UI components
            renderCurrentWeather(currentData, locationLabel);
            renderHourlyForecast(forecastData);
            renderDailyForecast(forecastData);
            renderAirQuality(airData);
            renderHighlights(currentData);
            updateDynamicBackground(currentData);

        } catch (error) {
            console.error('Data bundle error:', error);
            showAlert(error.message || 'Error processing weather payload.', 'error');
        }
    }

    // ----------------------------------------------------------------------
    // 5. MOCK DATA FALLBACK (For Key Activation Window)
    // ----------------------------------------------------------------------
    function loadMockWeatherData(cityName) {
        const mockCity = capitalizeFirstLetter(cityName) || 'Bangalore';
        const nowEpoch = Math.floor(Date.now() / 1000);

        const mockCurrent = {
            name: mockCity,
            dt: nowEpoch,
            timezone: 19800, // GMT+5:30
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
            main: {
                temp: 26,
                feels_like: 27,
                temp_min: 21,
                temp_max: 29,
                humidity: 62,
                pressure: 1013
            },
            wind: { speed: 4.2, deg: 210 },
            clouds: { all: 15 },
            visibility: 10000,
            sys: {
                country: 'IN',
                sunrise: nowEpoch - 21600,
                sunset: nowEpoch + 21600
            }
        };

        const mockForecast = {
            city: { name: mockCity, timezone: 19800 },
            list: Array.from({ length: 40 }, (_, idx) => {
                const stepEpoch = nowEpoch + (idx * 3 * 3600);
                const stepDate = new Date(stepEpoch * 1000);
                const dateStr = stepDate.toISOString().replace('T', ' ').substring(0, 19);
                return {
                    dt: stepEpoch,
                    dt_txt: dateStr,
                    main: {
                        temp: 22 + Math.floor(Math.sin(idx) * 6),
                        temp_min: 20,
                        temp_max: 28
                    },
                    weather: [{
                        main: idx % 3 === 0 ? 'Clouds' : (idx % 5 === 0 ? 'Rain' : 'Clear'),
                        description: idx % 3 === 0 ? 'few clouds' : (idx % 5 === 0 ? 'light rain' : 'clear sky'),
                        icon: idx % 3 === 0 ? '02d' : (idx % 5 === 0 ? '10d' : '01d')
                    }]
                };
            })
        };

        const mockAir = {
            list: [{
                main: { aqi: 2 },
                components: {
                    pm2_5: 18.4,
                    pm10: 35.2,
                    co: 410.5,
                    no2: 22.1,
                    so2: 8.4,
                    o3: 45.0
                }
            }]
        };

        renderCurrentWeather(mockCurrent, `${mockCity}, IN`);
        renderHourlyForecast(mockForecast);
        renderDailyForecast(mockForecast);
        renderAirQuality(mockAir);
        renderHighlights(mockCurrent);
        updateDynamicBackground(mockCurrent);
    }

    // ----------------------------------------------------------------------
    // 6. DOM RENDERING FUNCTIONS
    // ----------------------------------------------------------------------
    function renderCurrentWeather(data, locationLabel) {
        const { main, weather, wind, dt, sys, timezone } = data;
        const condition = weather[0];

        cityNameEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${locationLabel || data.name}`;
        currentDateTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${formatLocalDateTime(dt, timezone)}`;
        conditionCategoryEl.textContent = condition.main;
        
        weatherIconEl.src = `https://openweathermap.org/img/wn/${condition.icon}@4x.png`;
        weatherIconEl.alt = condition.description;

        currentTempEl.textContent = Math.round(main.temp);
        feelsLikeEl.textContent = `${Math.round(main.feels_like)}°C`;
        weatherDescriptionEl.textContent = capitalizeFirstLetter(condition.description);

        tempMinMaxEl.textContent = `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`;
        heroHumidityEl.textContent = `${main.humidity}%`;
        heroWindEl.textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    }

    function renderHourlyForecast(forecastData) {
        hourlyForecastContainer.innerHTML = '';

        if (!forecastData || !forecastData.list) return;

        // Take first 8 slots (next 24 hours, 3-hour steps)
        const hourlyItems = forecastData.list.slice(0, 8);

        hourlyItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'hourly-card';

            const timeStr = formatTimeShort(item.dt, forecastData.city.timezone);
            const iconCode = item.weather[0].icon;
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].main;

            card.innerHTML = `
                <span class="time">${timeStr}</span>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${desc}" />
                <span class="temp">${temp}°C</span>
                <span class="desc">${desc}</span>
            `;

            hourlyForecastContainer.appendChild(card);
        });
    }

    function renderDailyForecast(forecastData) {
        dailyForecastContainer.innerHTML = '';

        if (!forecastData || !forecastData.list) return;

        // Group 3-hour forecasts by date YYYY-MM-DD
        const dailyGroups = {};

        forecastData.list.forEach(item => {
            const dateKey = item.dt_txt.split(' ')[0];
            if (!dailyGroups[dateKey]) {
                dailyGroups[dateKey] = [];
            }
            dailyGroups[dateKey].push(item);
        });

        // Convert grouped objects into daily summary items (up to 5 days)
        const days = Object.keys(dailyGroups).slice(0, 5);

        days.forEach(dateKey => {
            const items = dailyGroups[dateKey];
            let minTemp = Infinity;
            let maxTemp = -Infinity;
            let representativeIcon = items[Math.floor(items.length / 2)].weather[0].icon;
            let description = items[Math.floor(items.length / 2)].weather[0].description;

            items.forEach(it => {
                if (it.main.temp_min < minTemp) minTemp = it.main.temp_min;
                if (it.main.temp_max > maxTemp) maxTemp = it.main.temp_max;
            });

            const dayDate = new Date(dateKey);
            const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
            const dateFormatted = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dailyCard = document.createElement('div');
            dailyCard.className = 'daily-card';
            dailyCard.innerHTML = `
                <div>
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${dateFormatted}</div>
                </div>
                <img src="https://openweathermap.org/img/wn/${representativeIcon}@2x.png" alt="${description}" />
                <div class="condition">${capitalizeFirstLetter(description)}</div>
                <div class="temp-range">
                    <span class="max-temp">${Math.round(maxTemp)}°</span>
                    <span class="min-temp">${Math.round(minTemp)}°</span>
                </div>
            `;

            dailyForecastContainer.appendChild(dailyCard);
        });
    }

    function renderAirQuality(airData) {
        if (!airData || !airData.list || airData.list.length === 0) {
            heroAqiEl.textContent = 'N/A';
            return;
        }

        const aqi = airData.list[0].main.aqi; // 1 to 5 scale
        const components = airData.list[0].components;

        heroAqiEl.textContent = getAqiLabel(aqi);

        // Update AQI Card Header Badge
        aqiIndexNumEl.textContent = aqi;
        aqiBadgeEl.textContent = getAqiLabel(aqi);
        aqiBadgeEl.className = `aqi-status-badge ${getAqiBadgeClass(aqi)}`;
        aqiDescTextEl.textContent = getAqiDescription(aqi);

        // Pollutants
        valPm25El.textContent = `${components.pm2_5.toFixed(1)} µg/m³`;
        valPm10El.textContent = `${components.pm10.toFixed(1)} µg/m³`;
        valCoEl.textContent = `${components.co.toFixed(1)} µg/m³`;
        valNo2El.textContent = `${components.no2.toFixed(1)} µg/m³`;
        valSo2El.textContent = `${components.so2.toFixed(1)} µg/m³`;
        valO3El.textContent = `${components.o3.toFixed(1)} µg/m³`;

        // Progress bars (normalized relative estimations)
        barPm25.style.width = `${Math.min((components.pm2_5 / 75) * 100, 100)}%`;
        barPm10.style.width = `${Math.min((components.pm10 / 150) * 100, 100)}%`;
        barCo.style.width = `${Math.min((components.co / 10000) * 100, 100)}%`;
        barNo2.style.width = `${Math.min((components.no2 / 200) * 100, 100)}%`;
        barSo2.style.width = `${Math.min((components.so2 / 350) * 100, 100)}%`;
        barO3.style.width = `${Math.min((components.o3 / 180) * 100, 100)}%`;
    }

    function renderHighlights(data) {
        const { main, wind, visibility, clouds, sys, dt, timezone } = data;

        // 1. Humidity & Dew point estimate
        hlHumidityEl.textContent = main.humidity;
        const dewPoint = calculateDewPoint(main.temp, main.humidity);
        hlDewPointEl.textContent = Math.round(dewPoint);
        
        if (main.humidity < 30) hlHumidityDescEl.textContent = 'Low humidity, dry air';
        else if (main.humidity <= 60) hlHumidityDescEl.textContent = 'Optimal comfort level';
        else hlHumidityDescEl.textContent = 'High humidity, humid feel';

        // 2. Wind Speed & Direction
        const speedKmH = Math.round(wind.speed * 3.6);
        hlWindSpeedEl.textContent = speedKmH;
        const windDeg = wind.deg || 0;
        const cardinal = degToCardinal(windDeg);
        hlWindDirEl.textContent = `${windDeg}° ${cardinal}`;
        windCompassNeedle.style.transform = `rotate(${windDeg}deg)`;

        // 3. Pressure
        hlPressureEl.textContent = main.pressure;
        if (main.pressure < 1000) hlPressureStatusEl.textContent = 'Low pressure system';
        else if (main.pressure <= 1020) hlPressureStatusEl.textContent = 'Normal atmospheric pressure';
        else hlPressureStatusEl.textContent = 'High pressure system';

        // 4. Visibility
        const visKm = (visibility / 1000).toFixed(1);
        hlVisibilityEl.textContent = visKm;
        if (visibility >= 10000) hlVisibilityStatusEl.textContent = 'Excellent clear visibility';
        else if (visibility >= 5000) hlVisibilityStatusEl.textContent = 'Moderate visibility';
        else hlVisibilityStatusEl.textContent = 'Hazy / Low visibility';

        // 5. UV Index (Calculated estimate based on cloud cover & solar noon)
        const uvEst = calculateEstimatedUv(dt, sys.sunrise, sys.sunset, clouds.all);
        hlUvIndexEl.textContent = uvEst.score;
        hlUvStatusEl.textContent = uvEst.description;

        // 6. Clouds
        hlCloudsEl.textContent = clouds.all;
        if (clouds.all < 20) hlCloudDescEl.textContent = 'Clear / Sunny skies';
        else if (clouds.all <= 70) hlCloudDescEl.textContent = 'Partly cloudy sky';
        else hlCloudDescEl.textContent = 'Overcast sky cover';

        // 7. Sunrise & Sunset timeline
        const sunriseTimeStr = formatTimeShort(sys.sunrise, timezone);
        const sunsetTimeStr = formatTimeShort(sys.sunset, timezone);
        hlSunriseEl.textContent = sunriseTimeStr;
        hlSunsetEl.textContent = sunsetTimeStr;

        // Calculate solar daylight progress %
        const dayProgress = calculateDaylightProgress(dt, sys.sunrise, sys.sunset);
        sunProgressBar.style.width = `${dayProgress}%`;
        sunProgressIcon.style.left = `${dayProgress}%`;
    }

    // ----------------------------------------------------------------------
    // 7. DYNAMIC BACKGROUND THEME ENGINE
    // ----------------------------------------------------------------------
    function updateDynamicBackground(data) {
        const conditionId = data.weather[0].id;
        const iconCode = data.weather[0].icon;
        const isNight = iconCode.endsWith('n');

        // Remove all previous background classes
        document.body.className = '';

        if (conditionId >= 200 && conditionId < 300) {
            document.body.classList.add('weather-bg-thunderstorm');
        } else if ((conditionId >= 300 && conditionId < 600)) {
            document.body.classList.add('weather-bg-rain');
        } else if (conditionId >= 600 && conditionId < 700) {
            document.body.classList.add('weather-bg-snow');
        } else if (conditionId >= 700 && conditionId < 800) {
            document.body.classList.add('weather-bg-mist');
        } else if (conditionId === 800) {
            document.body.classList.add(isNight ? 'weather-bg-clear-night' : 'weather-bg-clear-day');
        } else if (conditionId > 800) {
            document.body.classList.add('weather-bg-clouds');
        } else {
            document.body.classList.add('weather-bg-default');
        }
    }

    // ----------------------------------------------------------------------
    // 8. GEOLOCATION API HANDLER
    // ----------------------------------------------------------------------
    function handleCurrentLocation() {
        if (!navigator.geolocation) {
            showAlert('Geolocation is not supported by your browser.', 'warning');
            return;
        }

        showLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const apiKey = getApiKey();

                try {
                    // Reverse geocode to get city name
                    const reverseGeoUrl = `${CONFIG.GEO_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
                    const res = await fetch(reverseGeoUrl);
                    let label = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
                    if (res.ok) {
                        const geoData = await res.json();
                        if (geoData && geoData.length > 0) {
                            label = `${geoData[0].name}, ${geoData[0].country}`;
                        }
                    }
                    await fetchAllWeatherByCoords(latitude, longitude, label);
                } catch (err) {
                    console.error('Location error:', err);
                    showAlert('Unable to fetch location weather details.', 'error');
                } finally {
                    showLoading(false);
                }
            },
            (error) => {
                showLoading(false);
                let msg = 'Geolocation failed.';
                if (error.code === error.PERMISSION_DENIED) msg = 'Location access denied by user.';
                else if (error.code === error.POSITION_UNAVAILABLE) msg = 'Location information unavailable.';
                else if (error.code === error.TIMEOUT) msg = 'Location request timed out.';
                showAlert(msg, 'warning');
            }
        );
    }

    // ----------------------------------------------------------------------
    // 9. EVENT LISTENERS
    // ----------------------------------------------------------------------
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            fetchWeatherDataForCity(query);
        } else {
            showAlert('Please enter a valid city name.', 'warning');
        }
    });

    searchInput.addEventListener('input', () => {
        clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
    });

    locationBtn.addEventListener('click', handleCurrentLocation);
    themeToggleBtn.addEventListener('click', toggleTheme);
    apiKeyBtn.addEventListener('click', openModal);
    bannerSetKeyBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    saveKeyBtn.addEventListener('click', () => {
        const newKey = apiKeyInput.value.trim();
        if (newKey) {
            setApiKey(newKey);
            checkApiKeyStatus();
            closeModal();
            showAlert('API key saved successfully! Refreshing weather data...', 'info');
            fetchWeatherDataForCity(currentCity);
        } else {
            showAlert('Please enter a valid API key.', 'warning');
        }
    });

    clearKeyBtn.addEventListener('click', () => {
        setApiKey('');
        apiKeyInput.value = '';
        checkApiKeyStatus();
        closeModal();
        showAlert('API key cleared.', 'info');
    });

    alertCloseBtn.addEventListener('click', hideAlert);

    // Close modal on background click
    apiKeyModal.addEventListener('click', (e) => {
        if (e.target === apiKeyModal) closeModal();
    });

    // ----------------------------------------------------------------------
    // 10. HELPER FUNCTIONS & UTILITIES
    // ----------------------------------------------------------------------
    function showLoading(isLoading) {
        if (isLoading) {
            skeletonLoader.style.display = 'block';
            mainDashboard.style.display = 'none';
        } else {
            skeletonLoader.style.display = 'none';
            mainDashboard.style.display = 'block';
        }
    }

    function showAlert(msg, type = 'error') {
        alertMessage.textContent = msg;
        alertContainer.style.display = 'flex';
    }

    function hideAlert() {
        alertContainer.style.display = 'none';
    }

    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatLocalDateTime(epochSec, timezoneOffsetSec) {
        const localDate = new Date((epochSec + timezoneOffsetSec) * 1000);
        return localDate.toUTCString().replace(' GMT', '');
    }

    function formatTimeShort(epochSec, timezoneOffsetSec) {
        const localDate = new Date((epochSec + timezoneOffsetSec) * 1000);
        const hours = localDate.getUTCHours();
        const minutes = localDate.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    function degToCardinal(deg) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(deg / 45) % 8];
    }

    function calculateDewPoint(temp, humidity) {
        return temp - ((100 - humidity) / 5);
    }

    function getAqiLabel(aqi) {
        switch (aqi) {
            case 1: return 'Good';
            case 2: return 'Fair';
            case 3: return 'Moderate';
            case 4: return 'Poor';
            case 5: return 'Very Poor';
            default: return 'Unknown';
        }
    }

    function getAqiBadgeClass(aqi) {
        switch (aqi) {
            case 1: return 'badge-good';
            case 2: return 'badge-fair';
            case 3: return 'badge-moderate';
            case 4: return 'badge-poor';
            case 5: return 'badge-verypoor';
            default: return 'badge-good';
        }
    }

    function getAqiDescription(aqi) {
        switch (aqi) {
            case 1: return 'Air quality is satisfactory with minimal to no health risk.';
            case 2: return 'Air quality is acceptable for most people; sensitive individuals may experience minor irritation.';
            case 3: return 'Members of sensitive groups may experience health effects. General public is less likely affected.';
            case 4: return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.';
            case 5: return 'Health alert: emergency conditions. The entire population is likely to be affected.';
            default: return 'Air quality data unavailable.';
        }
    }

    function calculateEstimatedUv(dt, sunrise, sunset, cloudiness) {
        if (dt < sunrise || dt > sunset) {
            return { score: 0, description: 'Low (Nighttime)' };
        }
        const solarNoon = sunrise + (sunset - sunrise) / 2;
        const distanceToNoon = Math.abs(dt - solarNoon);
        const halfDay = (sunset - sunrise) / 2;
        let peakUv = 8 * (1 - (distanceToNoon / halfDay));
        peakUv *= (1 - (cloudiness / 100) * 0.5); // Cloud reduction factor
        const uvScore = Math.max(0, Math.round(peakUv));

        let desc = 'Low exposure';
        if (uvScore >= 8) desc = 'Very high exposure (Protection required)';
        else if (uvScore >= 6) desc = 'High exposure (Hat & sunscreen required)';
        else if (uvScore >= 3) desc = 'Moderate exposure (Sunscreen recommended)';

        return { score: uvScore, description: desc };
    }

    function calculateDaylightProgress(dt, sunrise, sunset) {
        if (dt <= sunrise) return 0;
        if (dt >= sunset) return 100;
        return Math.round(((dt - sunrise) / (sunset - sunrise)) * 100);
    }
});
