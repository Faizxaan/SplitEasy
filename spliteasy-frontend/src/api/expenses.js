import api from './axios';

export const createExpense = (groupId, data) =>
  api.post(`/groups/${groupId}/expenses`, data);

export const getExpenses = (groupId, params = {}) =>
  api.get(`/groups/${groupId}/expenses`, { params });

export const getExpenseDetail = (groupId, expenseId) =>
  api.get(`/groups/${groupId}/expenses/${expenseId}`);

export const updateExpense = (groupId, expenseId, data) =>
  api.put(`/groups/${groupId}/expenses/${expenseId}`, data);

export const deleteExpense = (groupId, expenseId) =>
  api.delete(`/groups/${groupId}/expenses/${expenseId}`);
