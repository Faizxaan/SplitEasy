import api from './axios';

export const getGroupBalances = (groupId) =>
  api.get(`/groups/${groupId}/balances`);

export const getSimplifiedDebts = (groupId) =>
  api.get(`/groups/${groupId}/balances/simplified`);
