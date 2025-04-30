import api from './api';

export const getGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

export const addMember = async (groupId, memberData) => {
  const response = await api.post(`/groups/${groupId}/members`, memberData);
  return response.data;
};

export const removeMember = async (groupId, memberId) => {
  const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
  return response.data;
};