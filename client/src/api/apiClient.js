import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Optionally add interceptors for auth
// api.interceptors.request.use(...)

export default api;
