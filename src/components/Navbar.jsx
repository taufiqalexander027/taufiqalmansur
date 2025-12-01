import React from 'react';
import './Navbar.css';

const Navbar = ({ isLoggedIn, user, onLogout }) => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name gradient-text">Taufiq Al Mansur</span>
        </div>

        <ul className="nav-links">
          <li>
            <a onClick={() => scrollToSection('home')} className="nav-link">
              Beranda
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('berita')} className="nav-link">
              Berita
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('layanan')} className="nav-link">
              Layanan
            </a>
          </li>
          {isLoggedIn && user?.role === 'admin' && (
            <li>
              <a href="/admin" className="nav-link">
                Admin
              </a>
            </li>
          )}
          {isLoggedIn && (user?.role === 'staff' || user?.role === 'admin') && (
            <>
              <li>
                <a href="https://keuangan.uptpelatihanpertanian.id" target="_blank" rel="noopener noreferrer" className="nav-link">
                  💰 Keuangan
                </a>
              </li>
              <li>
                <a href="https://skp.uptpelatihanpertanian.id" target="_blank" rel="noopener noreferrer" className="nav-link">
                  📝 Laporan ASN
                </a>
              </li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <span className="user-name">Hi, {user?.full_name || user?.username}</span>
              <button onClick={onLogout} className="btn btn-outline">
                Keluar
              </button>
            </>
          ) : (
            <a href="/login" className="btn btn-primary">
              Masuk
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
