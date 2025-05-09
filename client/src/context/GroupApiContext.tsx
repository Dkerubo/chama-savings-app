import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { CreateGroupPayload } from '../types/group';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GroupApiContextType {
  getAllGroups: () => Promise<any>;
  getUserGroups: (userId: string) => Promise<any>;
  createGroup: (data: CreateGroupPayload) => Promise<any>;
  deleteGroup: (groupId: number) => Promise<any>;
}

const GroupApiContext = createContext<GroupApiContextType | undefined>(undefined);

export const useGroupApi = (): GroupApiContextType => {
  const context = useContext(GroupApiContext);
  if (!context) {
    throw new Error('useGroupApi must be used within a GroupApiProvider');
  }
  return context;
};

export const GroupApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const getAllGroups = async () => {
    return axios.get(`${API_URL}/groups`, authHeaders);
  };

  const getUserGroups = async (userId: string) => {
    return axios.get(`${API_URL}/groups/user/${userId}`, authHeaders);
  };

  const createGroup = async (data: CreateGroupPayload) => {
    return axios.post(`${API_URL}/groups`, data, authHeaders);
  };

  const deleteGroup = async (groupId: number) => {
    return axios.delete(`${API_URL}/groups/${groupId}`, authHeaders);
  };

  return (
    <GroupApiContext.Provider
      value={{ getAllGroups, getUserGroups, createGroup, deleteGroup }}
    >
      {children}
    </GroupApiContext.Provider>
  );
};