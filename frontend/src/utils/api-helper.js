import axios from 'axios';

// List of potential API URLs to try
const API_URLS = [
  process.env.REACT_APP_API_URL,
  process.env.REACT_APP_API_URL_FALLBACK,
  'https://bobace.com'
].filter(Boolean); // Remove any undefined or empty values

// Fallback data for specific endpoints when all API calls fail
const ENDPOINT_FALLBACKS = {
  '/api/blindates/locations/suggested': [
    {
      name: 'Highlands Coffee',
      address: '141 Nguyễn Du, Quận 1, TP.HCM',
      coordinates: [106.6957, 10.7765],
      type: 'cafe'
    },
    {
      name: 'The Coffee House',
      address: '86-88 Cao Thắng, Quận 3, TP.HCM',
      coordinates: [106.6789, 10.7732],
      type: 'cafe'
    },
    {
      name: 'Phúc Long Coffee & Tea',
      address: 'TTTM Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM',
      coordinates: [106.7032, 10.7772],
      type: 'cafe'
    },
    {
      name: 'Gong Cha',
      address: '188 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
      coordinates: [106.6876, 10.7745],
      type: 'cafe'
    },
    {
      name: 'Nhà hàng Kichi Kichi',
      address: 'TTTM Crescent Mall, Quận 7, TP.HCM',
      coordinates: [106.7180, 10.7286],
      type: 'restaurant'
    }
  ],
  
  // Fallback data for admin activity statistics
  '/api/admin/statistics/activity': {
    users: {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      newUsers: [5, 8, 12, 7, 10, 15, 20],
      activeUsers: [25, 30, 28, 32, 40, 45, 50]
    },
    blindates: {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      created: [3, 5, 4, 7, 8, 12, 10],
      completed: [2, 3, 2, 5, 6, 8, 7]
    },
    matches: {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      created: [10, 12, 15, 14, 18, 22, 25]
    },
    messages: {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      sent: [45, 60, 55, 70, 85, 100, 120]
    }
  }
};

/**
 * Attempts to make an API request to multiple URLs until one succeeds
 * @param {string} endpoint - The API endpoint (e.g., '/api/blindates/matches/find')
 * @param {Object} options - Axios request options
 * @param {string} method - HTTP method (get, post, put, delete)
 * @returns {Promise} - Promise that resolves with the successful response
 */
export const tryMultipleUrls = async (endpoint, options = {}, method = 'get') => {
  let lastError = null;
  
  // Try each URL in sequence
  for (const baseUrl of API_URLS) {
    try {
      const url = `${baseUrl}${endpoint}`;
      let response;
      
      switch (method.toLowerCase()) {
        case 'post':
          response = await axios.post(url, options.data || {}, options);
          break;
        case 'put':
          response = await axios.put(url, options.data || {}, options);
          break;
        case 'delete':
          response = await axios.delete(url, options);
          break;
        case 'get':
        default:
          response = await axios.get(url, options);
          break;
      }
      
      return response;
    } catch (error) {
      console.warn(`Failed to connect to ${baseUrl}${endpoint}:`, error.message);
      lastError = error;
      // Continue to the next URL
    }
  }
  
  // Check if we have fallback data for this endpoint
  if (method.toLowerCase() === 'get' && ENDPOINT_FALLBACKS[endpoint]) {
    console.info(`Using fallback data for ${endpoint}`);
    return { data: ENDPOINT_FALLBACKS[endpoint] };
  }
  
  // If all URLs failed and no fallback exists, throw the last error
  throw lastError || new Error('All API URLs failed');
};

/**
 * Get request with multiple URL fallbacks
 */
export const getWithFallback = (endpoint, options = {}) => {
  return tryMultipleUrls(endpoint, options, 'get');
};

/**
 * Post request with multiple URL fallbacks
 */
export const postWithFallback = (endpoint, data = {}, options = {}) => {
  return tryMultipleUrls(endpoint, { ...options, data }, 'post');
};

/**
 * Put request with multiple URL fallbacks
 */
export const putWithFallback = (endpoint, data = {}, options = {}) => {
  return tryMultipleUrls(endpoint, { ...options, data }, 'put');
};

/**
 * Delete request with multiple URL fallbacks
 */
export const deleteWithFallback = (endpoint, options = {}) => {
  return tryMultipleUrls(endpoint, options, 'delete');
};

export default {
  getWithFallback,
  postWithFallback,
  putWithFallback,
  deleteWithFallback
};