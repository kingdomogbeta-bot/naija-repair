// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://naija-repair-api.onrender.com/api',
  EMAIL_SERVICE_URL: 'https://naija-repair-api2.onrender.com',
  FRONTEND_URL: 'https://naija-repair-rd5j.onrender.com'
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper function to build email service URLs
export const buildEmailUrl = (endpoint) => {
  return `${API_CONFIG.EMAIL_SERVICE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};