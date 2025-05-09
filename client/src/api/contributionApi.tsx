// src/api/contributionApi.ts
import axios, { AxiosError } from 'axios';
import { Contribution } from '../types/Contribution';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create configured axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const ContributionApi = {
  /**
   * Fetch member statistics
   */
  async fetchMemberStats(): Promise<Contribution[]> {
    try {
      const response = await api.get('/member-stats');
      return response.data as Contribution[];
    } catch (error) {
      console.error('Failed to fetch member stats:', error);
      throw new Error(
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to fetch member stats'
          : 'Unknown error occurred'
      );
    }
  },

  /**
   * Create a new contribution
   */
  async createContribution(
    memberId: number,
    groupId: number,
    amount: number,
    note?: string
  ): Promise<Contribution> {
    try {
      const response = await api.post('/contributions', {
        member_id: memberId,
        group_id: groupId,
        amount,
        note,
      });
      return response.data as Contribution;
    } catch (error) {
      console.error('Failed to create contribution:', error);
      throw new Error(
        error instanceof AxiosError
          ? error.response?.data?.error || 'Failed to create contribution'
          : 'Unknown error occurred'
      );
    }
  },

  /**
   * Get contributions by member ID
   */
  async getContributionsByMember(memberId: number): Promise<Contribution[]> {
    try {
      const response = await api.get(`/contributions/member/${memberId}`);
      return response.data as Contribution[];
    } catch (error) {
      console.error('Failed to fetch member contributions:', error);
      throw new Error(
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to fetch contributions'
          : 'Unknown error occurred'
      );
    }
  },

  /**
   * Update contribution status (admin only)
   */
  async updateContributionStatus(
    id: number,
    status: 'pending' | 'confirmed' | 'rejected'
  ): Promise<Contribution> {
    try {
      const response = await api.patch(`/contributions/${id}/status`, { status });
      return response.data as Contribution;
    } catch (error) {
      console.error('Failed to update contribution status:', error);
      throw new Error(
        error instanceof AxiosError
          ? error.response?.data?.error || 'Failed to update status'
          : 'Unknown error occurred'
      );
    }
  },
};

// Optional: Export the axios instance for direct use if needed
export { api as contributionApiClient };