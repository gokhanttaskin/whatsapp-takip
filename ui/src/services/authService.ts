// import axios from 'axios';

// const API_URL = 'http://localhost:3000/api';

// export const register = async (userData: {
//   username: string;
//   password: string;
//   email: string;
// }) => {
//   return axios.post(`${API_URL}/users/register`, userData);
// };

// export const login = async (credentials: {
//   username: string;
//   password: string;
// }) => {
//   const response = await axios.post(`${API_URL}/auth/login`, credentials);
//   if (response.data.access_token) {
//     localStorage.setItem('token', response.data.access_token);
//   }
//   return response;
// };

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api', // API URL
  withCredentials: true, // Kimlik bilgileri (token) için
  headers: {
    'Content-Type': 'application/json', // JSON veri gönderimi için
  },
});

// Token'ı otomatik ekle
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (userData: {
  username: string;
  password: string;
  email: string;
}) => {
  return API.post('/users/register', userData);
};

export const login = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response;
};

// Yeni eklenen fonksiyonlar
export const getNumaralar = async () => {
  const response = await API.get('/numaralar');
  return response.data;
};

export const getLoglar = async (numaraId: number) => {
  const response = await API.get(`/numara-log/${numaraId}`);
  return response.data;
};

export const numaraEkle = async (numara: string) => {
  const response = await API.post('/numaralar', { telefonNumarasi: numara });
  return response.data;
};