import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        balance: 5000.00
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏦 Banking Portal</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="user-info">
            <h2>Welcome, {user?.name}</h2>
            <p>Email: {user?.email}</p>
            <p className="balance">Balance: ${user?.balance.toFixed(2)}</p>
          </div>
        )}
      </header>
    </div>
  );
};

export default App;