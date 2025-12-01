import React, { useState, useEffect } from 'react';
import FinancialTable from './components/Financial/FinancialTable';
import { login, logout, isLoggedIn } from './services/apiService';

function App() {
  const [pageTitle, setPageTitle] = useState('Sistem Realisasi Keuangan');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isLoggedIn());
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(username, password);
    if (success) {
      setIsAuthenticated(true);
    } else {
      setError('Login gagal. Periksa username dan password.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login Keuangan</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div className="flex justify-between items-start">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.2' }}>{pageTitle}</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>

        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#64748b',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.05em'
        }}>
          &copy; 2025 made by <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>Taufiq Al Mansur</span>
        </div>
      </header>

      <FinancialTable onTitleChange={setPageTitle} />

      <footer style={{
        marginTop: '4rem',
        padding: '2rem 0',
        textAlign: 'center',
        borderTop: '1px solid rgba(226, 232, 240, 0.6)',
        color: '#64748b',
        fontSize: '0.875rem',
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))'
      }}>
        <p style={{ margin: 0, fontWeight: '500', letterSpacing: '0.05em', opacity: 0.8 }}>
          &copy; 2025 made by <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>Taufiq Al Mansur</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
