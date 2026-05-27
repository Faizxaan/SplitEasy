import api from './axios';

export const createSettlement = (groupId, data) =>
  api.post(`/groups/${groupId}/settlements`, data);

export const getGroupSettlements = (groupId) =>
  api.get(`/groups/${groupId}/settlements`);

export const deleteSettlement = (groupId, settlementId) =>
  api.delete(`/groups/${groupId}/settlements/${settlementId}`);
