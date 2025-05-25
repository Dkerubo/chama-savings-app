// src/api/userApi.ts
import axios from 'axios';
import { User } from '../types';

const API_BASE = '/api/users';

// === Helper: Get Authorization Headers ===
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Fetch all users (admin/superadmin only)
 */
export const getUsers = async (): Promise<{ users: User[] }> => {
  try {
    const { data } = await axios.get(`${API_BASE}`, getAuthHeaders());
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
    const { data } = await axios.post(`${API_BASE}`, user, getAuthHeaders());
    return data;
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
    return data;
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
 * Get current logged-in user's profile
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
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
    throw new Error('Failed to update profile');
  }
};
