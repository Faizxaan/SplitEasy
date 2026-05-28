import api from './axios';

export const createDraftSession = (data) => api.post('/quick-splits', data);
export const listDraftSessions = () => api.get('/quick-splits');
export const getDraftSession = (id) => api.get(`/quick-splits/${id}`);
export const updateDraftSession = (id, data) => api.patch(`/quick-splits/${id}`, data);
export const deleteDraftSession = (id) => api.delete(`/quick-splits/${id}`);

export const addDraftParticipant = (draftId, data) => api.post(`/quick-splits/${draftId}/participants`, data);
export const removeDraftParticipant = (draftId, participantId) => api.delete(`/quick-splits/${draftId}/participants/${participantId}`);

export const addDraftExpense = (draftId, data) => api.post(`/quick-splits/${draftId}/expenses`, data);
export const updateDraftExpense = (draftId, expenseId, data) => api.put(`/quick-splits/${draftId}/expenses/${expenseId}`, data);
export const deleteDraftExpense = (draftId, expenseId) => api.delete(`/quick-splits/${draftId}/expenses/${expenseId}`);

export const getDraftSettlements = (draftId) => api.get(`/quick-splits/${draftId}/settlements`);

export const getSharedDraft = (shareToken) =>
  api.get(`/quick-splits/share/${shareToken}`);
