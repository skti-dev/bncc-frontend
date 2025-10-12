import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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

const forceLogout = async () => {
  try {
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Erro ao fazer logout automático:", error);
  }
};

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      await forceLogout();
    }
    return Promise.reject(error);
  }
);

export default api;