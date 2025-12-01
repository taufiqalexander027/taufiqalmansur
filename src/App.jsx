import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FloatingNews from './components/FloatingNews';
import Services from './components/Services';
import LoginPage from './components/LoginPage';
import FinancialReports from './components/FinancialReports';
import AdminDashboard from './components/Admin/AdminDashboard';
import ASNDashboard from './components/ASNDashboard';
import NewsDetail from './components/NewsDetail';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home Page Component
const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Navbar
        isLoggedIn={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      <Hero />
      <FloatingNews />
      <Services />
      <footer className="footer">
        <div className="container">
          <p className="footer-text">
            © 2025 Taufiq Al Mansur (@top_ex). Built with passion using React + Node.js
          </p>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/financial-reports"
            element={
              <ProtectedRoute>
                <FinancialReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/asn-reports"
            element={
              <ProtectedRoute>
                <ASNDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public News Detail Route */}
          <Route path="/news/:slug" element={<NewsDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
