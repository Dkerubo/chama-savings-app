// client/src/services/loanService.js
import api from './api'; // Custom axios instance

const API_BASE = '/api/loans';

/**
 * Fetch all loans (not group-specific)
 * @returns {Promise<Object[]>}
 */
export const getAllLoans = async () => {
  try {
    const response = await api.get(API_BASE);
    return response.data;
  } catch (error) {
    console.error('Error fetching all loans:', error);
    throw error;
  }
};

/**
 * Fetch loans for a specific group using the fetch API
 * Alternative to getGroupLoans
 * @param {string} groupId
 * @returns {Promise<Object[]>}
 */
export const getLoans = async (groupId) => {
  const response = await fetch(`/api/loans?groupId=${groupId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch loans');
  }
  return await response.json();
};

/**
 * Fetch loans for a specific group
 * @param {string} groupId
 * @returns {Promise<Object[]>}
 */
export const getGroupLoans = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/loans`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching loans for group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Apply for a general (non-group) loan
 * @param {Object} loanData
 * @returns {Promise<Object>}
 */
export const applyGeneralLoan = async (loanData) => {
  try {
    const response = await api.post(`${API_BASE}/apply`, loanData);
    return response.data;
  } catch (error) {
    console.error('Error applying for general loan:', error);
    throw error;
  }
};

/**
 * Apply for a loan within a group
 * @param {string} groupId
 * @param {Object} loanData
 * @returns {Promise<Object>}
 */
export const applyGroupLoan = async (groupId, loanData) => {
  try {
    const response = await api.post(`/groups/${groupId}/loans`, loanData);
    return response.data;
  } catch (error) {
    console.error(`Error applying for loan in group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Approve a specific loan in a group
 * @param {string} groupId
 * @param {string} loanId
 * @returns {Promise<Object>}
 */
export const approveLoan = async (groupId, loanId) => {
  try {
    const response = await api.put(`/groups/${groupId}/loans/${loanId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving loan ${loanId} in group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Get repayment records for a specific loan
 * @param {string} groupId
 * @param {string} loanId
 * @returns {Promise<Object[]>}
 */
export const getLoanRepayments = async (groupId, loanId) => {
  try {
    const response = await api.get(`/groups/${groupId}/loans/${loanId}/repayments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching repayments for loan ${loanId} in group ${groupId}:`, error);
    throw error;
  }
};
