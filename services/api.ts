import axios from 'axios';
import { router } from 'expo-router';
import { API_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;