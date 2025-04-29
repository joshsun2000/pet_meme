import axios from 'axios';

export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:5000';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'
});

export default API;