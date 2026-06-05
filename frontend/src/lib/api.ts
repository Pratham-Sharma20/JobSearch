import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally, interceptors can be added here for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (e.g., redirect to login on 401)
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
