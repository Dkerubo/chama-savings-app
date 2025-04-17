import api from './api';

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Logout failed');
  }
};