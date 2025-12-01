import { LayoutDashboard, Database, Calculator, FileText, PieChart } from 'lucide-react';

const Navigation = ({ activeView, onViewChange }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'master-data', label: 'Master Data', icon: Database },
        { id: 'input-realisasi', label: 'Input Realisasi', icon: Calculator },
        { id: 'input-dkkb', label: 'Input DKKB', icon: FileText },
        { id: 'laporan', label: 'Laporan', icon: PieChart },
    ];

    return (
        <nav style={{
            width: '250px',
            background: 'var(--color-bg-secondary)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent-primary)' }}>
                    Realisasi Keuangan
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    UPT Pelatihan Pertanian
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                background: isActive ? 'var(--color-accent-primary)' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--color-text-primary)',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                fontWeight: isActive ? '600' : '400'
                            }}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                v2.0.0 Full System
            </div>
        </nav>
    );
};

export default Navigation;
