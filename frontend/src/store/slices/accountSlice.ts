import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
}

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
}

const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  loading: false,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;
    },
    setSelectedAccount: (state, action: PayloadAction<Account | null>) => {
      state.selectedAccount = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAccounts, setSelectedAccount, setLoading } =
  accountSlice.actions;
export default accountSlice.reducer;
