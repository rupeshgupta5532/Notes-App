// Application configuration for version checking and environment settings
export const APP_CONFIG = {
  version: '1.0.0',
  platform: 'WEB',
  apiUrl: process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  appName: 'Enterprise Application Suite',
};

export default APP_CONFIG;
