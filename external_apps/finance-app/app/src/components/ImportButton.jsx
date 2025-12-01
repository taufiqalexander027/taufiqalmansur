import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile } from '../services/excelParser';

const ImportButton = ({ onImportSuccess }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setError(null);
        setSuccess(false);

        try {
            const data = await parseExcelFile(file);
            onImportSuccess(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 10000); // 10 seconds for readability
        } catch (err) {
            setError(err.message || 'Error importing file');
            console.error('Import error:', err);
        } finally {
            setIsImporting(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    opacity: 0
                }}
                id="excel-file-input"
            />

            <label htmlFor="excel-file-input" className="btn btn-primary" style={{ cursor: isImporting ? 'not-allowed' : 'pointer', pointerEvents: isImporting ? 'none' : 'auto' }}>
                {isImporting ? (
                    <>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        <span>Importing...</span>
                    </>
                ) : success ? (
                    <>
                        <CheckCircle size={18} />
                        <span>✅ Data Tersimpan!</span>
                    </>
                ) : (
                    <>
                        <FileSpreadsheet size={18} />
                        <span>Import Excel</span>
                    </>
                )}
            </label>

            {error && (
                <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'hsla(0, 84%, 60%, 0.1)',
                    border: '1px solid hsla(0, 84%, 60%, 0.3)',
                    borderRadius: 'var(--border-radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <AlertCircle size={16} color="var(--color-accent-error)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-error)' }}>
                        {error}
                    </span>
                </div>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ImportButton;
