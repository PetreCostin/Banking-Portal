import api from './api';

export const transactionService = {
  getTransactions: async (params?: any) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
};

export const transferService = {
  internalTransfer: async (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }) => {
    const response = await api.post('/transfers/internal', data);
    return response.data;
  },

  getTransferStatus: async (id: string) => {
    const response = await api.get(`/transfers/${id}/status`);
    return response.data;
  },
};
