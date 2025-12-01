import React, { useState } from 'react';
import FinancialTable from './components/Financial/FinancialTable';


function App() {
  const [pageTitle, setPageTitle] = useState('Sistem Realisasi Keuangan');

  return (
    <div className="container mx-auto p-4">
      <header style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.2' }}>{pageTitle}</h1>

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
