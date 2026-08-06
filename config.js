/**
 * SkyCast - Configuration & API Constants
 */

const CONFIG = {
    // User configured OpenWeatherMap API Key
    DEFAULT_API_KEY: 'b83c79e2048bffaddd71d73e7c6373f0',
    
    // OpenWeatherMap API Endpoints
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_BASE_URL: 'https://api.openweathermap.org/geo/1.0',
    
    // Units
    UNITS: 'metric', // 'metric' for Celsius
    
    // Default City on Initial Load
    DEFAULT_CITY: 'Bangalore',

    // Local Storage Keys
    STORAGE_KEYS: {
        API_KEY: 'skycast_api_key',
        THEME: 'skycast_theme',
        LAST_CITY: 'skycast_last_city',
        UNITS: 'skycast_units',
        DEMO_MODE: 'skycast_demo_mode'
    }
};

/**
 * Check if a given API key string is a valid configured key structure
 * @param {string} key
 * @returns {boolean}
 */
function isApiKeyValid(key) {
    if (!key) return false;
    const k = key.trim();
    return k !== '' && 
           k !== 'YOUR_OPENWEATHER_API_KEY' && 
           k !== 'PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE';
}

/**
 * Retrieve active API key from LocalStorage or Default Config
 * @returns {string}
 */
function getApiKey() {
    const storedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    if (storedKey && isApiKeyValid(storedKey)) {
        return storedKey.trim();
    }
    return CONFIG.DEFAULT_API_KEY || '';
}

/**
 * Save API key to LocalStorage
 * @param {string} key 
 */
function setApiKey(key) {
    if (key && isApiKeyValid(key)) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, key.trim());
    } else {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
    }
}