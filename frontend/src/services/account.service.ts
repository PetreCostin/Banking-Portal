import api from './api';

export const accountService = {
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getAccountById: async (id: string) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: { accountType: string; currency?: string }) => {
    const response = await api.post('/accounts', data);
    return response.data;
  },

  getAccountBalance: async (id: string) => {
    const response = await api.get(`/accounts/${id}/balance`);
    return response.data;
  },
};
