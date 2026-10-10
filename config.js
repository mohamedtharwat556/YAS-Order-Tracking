// Frontend Configuration

// Production Backend
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://yas-backend.vercel.app'; // اتحدث بـ Backend URL

export const API_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/api/orders`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
