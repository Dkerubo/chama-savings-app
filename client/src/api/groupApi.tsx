// src/api/groupApi.ts
import axios from 'axios';
import { Group, CreateGroupPayload } from '../types/group';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: `${API_URL}/groups`,
  withCredentials: true,
});

// Automatically attach JWT token to all requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Define API methods for group management
const groupApi = {
  // Fetch all groups
  getAllGroups: () => axios.get(`${API_URL}/groups`),
  
  // Fetch groups for a specific user
  getUserGroups: (userId: string) => axios.get(`${API_URL}/groups/${userId}`),
  
  // Create a new group (exclude 'id', 'members', 'created_at' from payload)
  createGroup: (groupData: CreateGroupPayload) => axios.post(`${API_URL}/groups`, groupData),
  
  // Delete a group by ID
  deleteGroup: (groupId: number) => axios.delete(`${API_URL}/groups/${groupId}`),
  
  // Get details of a specific group by ID
  getGroupDetails: (groupId: number) => axios.get<Group>(`/${groupId}`),
};

export default groupApi;
