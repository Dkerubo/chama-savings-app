// src/api/userApi.ts
import api from "../api";
import { User } from "../types";

const API_BASE = "/users"; // Assuming `api` has baseURL like /api already

// Get all users
export const get_user = async (): Promise<User[]> => {
  const response = await api.get(API_BASE);
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get(`${API_BASE}/me`);
    return response.data;
  } catch (error) {
    return null;
  }
};

// Add a new user
export const addUser = async (user: Partial<User>): Promise<User> => {
  const response = await api.post(API_BASE, user);
  return response.data;
};

// Update an existing user
export const updateUser = async (userId: string, user: Partial<User>): Promise<User> => {
  const response = await api.put(`${API_BASE}/${userId}`, user);
  return response.data;
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`${API_BASE}/${userId}`);
};
