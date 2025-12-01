import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { SKPView } from './views/SKPView';
import { AssessmentView } from './views/AssessmentView';
import { UmumView } from './views/UmumView';
import { ViewState } from './types';
import { login, isLoggedIn } from './services/apiService';
import { Lock } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isLoggedIn());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <HomeView onChangeView={setCurrentView} />;
      case 'SKP':
        return <SKPView />;
      case 'BERAKHLAK':
        return <AssessmentView />;
      case 'UMUM':
        return <UmumView />;
      default:
        return <HomeView onChangeView={setCurrentView} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Login E-Laporan</h1>
            <p className="text-gray-500">Silakan login untuk mengakses data Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <Navbar
        currentView={currentView}
        onHomeClick={() => setCurrentView('HOME')}
      />

      <main>
        {renderView()}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 no-print animate-fade-in">
        <div className="px-6 py-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 hover:bg-white/90">
          <span className="text-xs font-medium text-gray-500">© {new Date().getFullYear()}</span>
          <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            made by Taufiq Al Mansur
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;