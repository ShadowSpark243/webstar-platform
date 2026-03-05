import axios from 'axios';

const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to automatically attach the JWT token to every request
api.interceptors.request.use(
      (config) => {
            const token = localStorage.getItem('webstar_token');
            if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
      },
      (error) => {
            return Promise.reject(error);
      }
);

// Add a response interceptor to handle expired tokens and maintenance mode globally
api.interceptors.response.use(
      (response) => response,
      (error) => {
            if (error.response?.status === 401) {
                  // Token expired or invalid — clear and redirect to login
                  localStorage.removeItem('webstar_token');
                  if (window.location.pathname.startsWith('/dashboard')) {
                        window.location.href = '/';
                  }
            }

            if (error.response?.status === 503 && error.response?.data?.maintenance) {
                  // System is in maintenance mode — redirect to maintenance page
                  if (window.location.pathname !== '/maintenance') {
                        window.location.href = '/maintenance';
                  }
            }

            return Promise.reject(error);
      }
);

export default api;
