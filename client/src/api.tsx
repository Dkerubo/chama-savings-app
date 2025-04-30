import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/auth',
  withCredentials: true,  // optional, only if you're using sessions/cookies
});

export default api;
