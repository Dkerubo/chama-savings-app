import axios from 'axios';
import { User } from '../types';

const API_BASE = '/api/users';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Type for paginated user response
type PaginatedUsers = {
  users: User[];
  total: number;
  pages: number;
  current_page: number;
};

/**
 * Get paginated list of users (admin only)
 */
export const getUsers = async (
  page = 1,
  per_page = 10
): Promise<PaginatedUsers> => {
  try {
    const { data } = await axios.get(`${API_BASE}?page=${page}&per_page=${per_page}`, getAuthHeaders());
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
    throw new Error('Failed to fetch users');
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (
  user: Omit<User, 'id'> & { password: string }
): Promise<User> => {
  try {
    const { data } = await axios.post(`${API_BASE}/create`, user, getAuthHeaders());
    return data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
    throw new Error('Failed to create user');
  }
};

/**
 * Update a user (admin or self)
 */
export const updateUser = async (
  id: number,
  updates: Partial<User>
): Promise<User> => {
  try {
    const { data } = await axios.put(`${API_BASE}/${id}`, updates, getAuthHeaders());
    return data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
    throw new Error('Failed to update user');
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
    throw new Error('Failed to delete user');
  }
};

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<User> => {
  try {
    const { data } = await axios.get(`${API_BASE}/me`, getAuthHeaders());
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to load profile');
    }
    throw new Error('Failed to load profile');
  }
};

/**
 * Update current user's profile
 */
export const updateProfile = async (
  updates: Partial<User>
): Promise<User> => {
  try {
    const { data } = await axios.put(`${API_BASE}/me`, updates, getAuthHeaders());
    return data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
    throw new Error('Failed to update profile');
  }
};
