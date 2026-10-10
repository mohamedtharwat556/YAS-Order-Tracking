// Frontend Configuration

// Auto-detect Backend URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : window.location.origin; // Same domain on Vercel

export const API_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/api/orders`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;

console.log('🌐 API Base URL:', API_BASE_URL);
