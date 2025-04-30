import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,  // Required for cookies/JWT
  headers: {
    'Content-Type': 'application/json',
     'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
});


export default api;



