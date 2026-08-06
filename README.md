# 🌤️ SkyCast - Real-Time Weather Forecasting Platform

SkyCast is a modern, high-performance, client-side Real-Time Weather Forecasting Web Application built with **HTML5**, **CSS3 (Glassmorphism & Dynamic Themes)**, and **Vanilla JavaScript**. It directly integrates with **OpenWeatherMap REST APIs** to provide live atmospheric data, hourly predictions, 5-day daily forecasts, air quality index metrics, and detailed weather parameters for any location worldwide.

---

## ✨ Features

- 🔍 **Top-Center Search & Validation**: Quick city search with input clearing, debouncing, and error handling.
- 📍 **Geolocation Detection**: Instantly fetch live local weather using the browser's `navigator.geolocation` API.
- 🎨 **Light Theme Default & Dynamic Weather Backgrounds**: Responsive glassmorphic UI with animated background themes shifting according to weather conditions (Sunny, Rain, Thunderstorm, Snow, Mist, Clear Night, Overcast).
- ⏰ **Live Ticking Clock Engine**: Real-time 1-second clock calculating exact local wall-clock time for any city worldwide using UTC offset calculations.
- 🌓 **Dark & Light Mode Toggle**: Seamless theme switcher with persistent settings saved in `localStorage`.
- 🕒 **Hourly Forecast Carousel**: 24-hour horizontal scrolling carousel with 3-hour interval updates.
- 📅 **5-Day Extended Forecast**: Grouped daily summaries with min/max temperatures, condition icons, and dates.
- 🍃 **Air Quality Index (AQI) Panel**: Displays AQI score (1-5), status badges (Good, Fair, Moderate, Poor, Very Poor), and individual pollutants (`PM2.5`, `PM10`, `CO`, `NO2`, `SO2`, `O3`) with progress indicators.
- 📊 **Weather Highlights Grid**: 8 detailed atmospheric cards:
  - **Humidity & Dew Point**
  - **Wind Speed & Direction** (with rotating compass needle indicator)
  - **Atmospheric Pressure**
  - **Visibility Distance**
  - **UV Index** (Estimated based on solar position & cloud cover)
  - **Cloud Coverage Percentage**
  - **Dew Point Condensation**
  - **Sunrise & Sunset Timeline** (with real-time daylight progress bar)
- 🗝️ **API Key Interface & Security**: Built-in modal dialog and `config.js` to manage your OpenWeatherMap API key securely in browser storage.
- 📱 **Fully Responsive Layout**: Custom 50/50 side-by-side grid layout optimized across Desktop, Laptop, Tablet, and Mobile viewports.

---

## 🛠️ Tech Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+ Async/Await, Fetch API)
- **Styling**: Vanilla CSS3 (CSS Custom Properties, Light Glassmorphism `backdrop-filter`, Flexbox, CSS Grid, Keyframe Animations)
- **Typography & Icons**: Google Fonts (*Outfit* & *Inter*), Font Awesome 6
- **APIs**: [OpenWeatherMap REST APIs](https://openweathermap.org/api)
  - Geocoding API (`/geo/1.0/direct`)
  - Reverse Geocoding API (`/geo/1.0/reverse`)
  - Current Weather API (`/data/2.5/weather`)
  - 5-Day / 3-Hour Forecast API (`/data/2.5/forecast`)
  - Air Pollution API (`/data/2.5/air_pollution`)

---

## 📂 Project Structure
