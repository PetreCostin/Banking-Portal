import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { accountService } from '../services/account.service';

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await accountService.getAccounts();
        setAccounts(response.accounts || []);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Banking Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName}</span>
              <button onClick={handleLogout} className="btn-primary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">Overview of your accounts and recent activity</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${calculateTotalBalance().toFixed(2)}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">Active Accounts</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{accounts.length}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">Recent Transactions</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Accounts</h3>
          {accounts.length === 0 ? (
            <p className="text-gray-600">No accounts found. Create your first account to get started.</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{account.accountType}</p>
                    <p className="text-sm text-gray-600">{account.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${Number(account.balance).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{account.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
