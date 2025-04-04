// Simple caching utility for API responses

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

class ApiCache {
  constructor() {
    this.cache = new Map();
    
    // Try to load from localStorage on initialization
    try {
      const savedCache = localStorage.getItem('apiCache');
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        Object.keys(parsed).forEach(key => {
          this.cache.set(key, parsed[key]);
        });
        console.log('Loaded API cache from localStorage');
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
    }
  }

  // Save cache to localStorage
  _persistCache() {
    try {
      const cacheObj = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = value;
      });
      localStorage.setItem('apiCache', JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }

  async fetchWithCache(url, options = {}) {
    const cacheKey = url;
    const cachedItem = this.cache.get(cacheKey);

    // Return cached data if it exists and isn't expired
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
      console.log('Using cached data for:', url);
      return cachedItem.data;
    }

    // Otherwise fetch fresh data
    console.log('Fetching fresh data for:', url);
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Persist to localStorage
      this._persistCache();
      
      return data;
    } catch (error) {
      // If we have stale cached data, return it as fallback
      if (cachedItem) {
        console.log('Using stale cache as fallback due to fetch error');
        return cachedItem.data;
      }
      console.error('Error fetching data:', error);
      throw error;
    }
  }
}

export default new ApiCache();