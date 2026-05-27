import api from './axios';

export const createGroup = (data) => api.post('/groups', data);
export const getUserGroups = () => api.get('/groups');
export const getGroupDetail = (id) => api.get(`/groups/${id}`);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const getGroupPreview = (inviteCode) => api.get(`/groups/join/${inviteCode}`);
export const joinGroup = (inviteCode) => api.post(`/groups/join/${inviteCode}`);
export const leaveGroup = (id) => api.post(`/groups/${id}/leave`);
export const getGroupMembers = (id) => api.get(`/groups/${id}/members`);
