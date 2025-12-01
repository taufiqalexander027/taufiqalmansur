import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';

const SuratPengantar = ({ data, config, onClose }) => {
    const [totals, setTotals] = useState({
        penunjang: 0,
        penyuluhan: 0,
        total: 0
    });
    const contentRef = useRef(null);

    // Helper: Format Currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    useEffect(() => {
        if (!data || !config.monthKey) return;

        // Calculate Totals for the selected month
        let totalPenunjang = 0;
        let totalPenyuluhan = 0;

        data.forEach(item => {
            const realisasiBulan = item.realisasi[config.monthKey]?.realisasi || 0;

            // Program Penunjang (3.27.01)
            if (item.program && item.program.includes('PENUNJANG')) {
                totalPenunjang += realisasiBulan;
            }

            // Program Penyuluhan (3.27.07)
            if (item.program && item.program.includes('PENYULUHAN')) {
                totalPenyuluhan += realisasiBulan;
            }
        });

        setTotals({
            penunjang: totalPenunjang,
            penyuluhan: totalPenyuluhan,
            total: totalPenunjang + totalPenyuluhan
        });

    }, [data, config]);



    const handleDownloadPDF = async () => {
        const element = contentRef.current;
        if (!element) return;

        // Dynamically import libraries
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        // Force black text
        const originalColor = element.style.color;
        element.style.color = 'black';

        // Capture the page as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff'
        });

        // Restore color
        element.style.color = originalColor;

        // A4 Portrait: 210mm x 297mm
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(`Surat_Pengantar_${config.monthLabel}_2025.pdf`);
    };

    return createPortal(
        <div className="print-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#94a3b8', // Grey background for preview
            zIndex: 9999,
            overflow: 'auto',
            fontFamily: 'Times New Roman, serif',
            color: 'black',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '80px', // Space for toolbar
            paddingBottom: '40px'
        }}>
            {/* Toolbar (Screen Only) */}
            <div className="no-print" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '15px',
                backgroundColor: '#334155',
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                zIndex: 100000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>

                <button
                    onClick={handleDownloadPDF}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: '#10b981', // Emerald green
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    📥 Download PDF
                </button>
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ❌ Tutup
                </button>
            </div>

            <style>
                {`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0; /* WYSIWYG: Let CSS padding handle margins */
                        }
                        /* Hide everything by default */
                        body * {
                            visibility: hidden;
                        }
                        /* Show only the print container and its children */
                        .print-container, .print-container * {
                            visibility: visible;
                        }
                        .print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: auto;
                            margin: 0;
                            padding: 0;
                            background-color: white !important;
                            overflow: visible;
                        }
                        .no-print {
                            display: none !important;
                        }
                        #root { display: none !important; }
                        
                        /* Print-specific overrides for surat-page */
                        .surat-page {
                            width: 210mm !important;
                            min-height: 297mm !important;
                            padding: 0.3cm 0.5cm 1cm 1.0cm !important; /* Top, Right, Bottom, Left */
                            padding: 20mm 20mm 20mm 25mm !important; /* Top, Right, Bottom, Left */
                            margin: 0 !important;
                            box-shadow: none !important;
                        }
                    }

                    /* Screen / Preview Styles */
                .surat-page {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 20mm 20mm 20mm 25mm; /* Increased Left Padding to 2.5cm */
                    margin: 0 auto;
                    background: white;
                    box-sizing: border-box;
                    position: relative;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 11pt; /* Increased font size */
                    line-height: 1.15;
                    color: black !important; /* Force black text for PDF generation */
                }

                .surat-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 5px; /* Reduced margin */
                    border-bottom: 3px solid black;
                    padding-bottom: 5px;
                }

                .surat-body {
                    margin-top: 10px;
                    text-align: justify; /* Justify text */
                }
                    .header-img {
                        width: 100%;
                        height: auto;
                        margin-bottom: 0px; /* Remove margin below header */
                        display: block;
                    }
                    .content-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px; /* Reduced margin */
                    }
                    .content-table td {
                        vertical-align: top;
                        padding: 2px 5px; /* Reduced padding */
                    }
                    .signature-section {
                        margin-top: 20px; /* Reduced margin */
                        display: flex;
                        justify-content: space-between;
                    }
                    .paraf-table {
                        border-collapse: collapse;
                        width: 200px;
                        font-size: 9pt; /* Smaller font for paraf */
                        margin-top: 20px; /* Reduced margin */
                    }
                    .paraf-table th, .paraf-table td {
                        border: 1px solid black;
                        padding: 2px 4px; /* Reduced padding */
                        text-align: left;
                    }
                `}
            </style>

            <div className="surat-page" ref={contentRef}>
                {/* Header / Kop Surat Image */}
                <img src="/kop_surat.png" alt="Kop Surat" className="header-img" />

                {/* Header Content */}
                <table style={{ width: '100%', marginTop: '20px' }}>
                    <tbody>
                        {/* Date Row - Aligned with Kepada */}
                        <tr>
                            <td style={{ width: '15%' }}></td>
                            <td style={{ width: '35%' }}></td>
                            <td colSpan="2" style={{ verticalAlign: 'bottom', paddingBottom: '10px' }}>
                                Malang, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {config.monthLabel} 2025
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '15%' }}>Nomor :</td>
                            <td style={{ width: '35%' }}>900.1.3.1/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /110.66/2025</td>
                            <td style={{ width: '10%' }}>Kepada</td>
                            <td style={{ width: '40%' }}></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td style={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>Yth. Bapak</td>
                            <td>
                                Kepala Dinas Pertanian dan<br />
                                Ketahanan Pangan Provinsi<br />
                                Jawa Timur<br />
                                Di<br />
                                <span style={{ textDecoration: 'underline', marginLeft: '20px' }}>Surabaya</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '30px 0', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14pt' }}>
                    NOTA PENGAJUAN KONSEP NASKAH DINAS
                </div>

                {/* Body Content */}
                <table className="content-table">
                    <tbody>
                        <tr>
                            <td colSpan="3">Disampaikan dengan hormat :</td>
                        </tr>
                        <tr>
                            <td style={{ width: '100px' }}>Kepada</td>
                            <td style={{ width: '10px' }}>:</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td>Dari</td>
                            <td>:</td>
                            <td>Kepala Unit Pelaksana Teknis Pelatihan Pertanian</td>
                        </tr>
                        <tr>
                            <td>Tentang</td>
                            <td>:</td>
                            <td>
                                Permohonan Penanda tanganan DKKB kegiatan UPT. Pelatihan<br />
                                Pertanian bulan {config.monthLabel} 2025 (GU) dengan perincian :
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Rincian Biaya */}
                <div style={{ marginLeft: '120px', marginTop: '5px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>KPA UPT. Pelatihan Pertanian</div>
                    <table style={{ width: 'auto' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '200px', verticalAlign: 'top' }}>Program (3.27.01)</td>
                                <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>{formatCurrency(totals.penunjang)},-</td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: 'top' }}>Program (3.27.07)</td>
                                <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                                    <div style={{ borderBottom: '1px solid black', display: 'inline-block', paddingBottom: '2px', width: '100%' }}>
                                        {formatCurrency(totals.penyuluhan)},-
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold', paddingTop: '5px', verticalAlign: 'top' }}>JUMLAH TOTAL</td>
                                <td style={{ fontWeight: 'bold', paddingTop: '5px', verticalAlign: 'top' }}>{formatCurrency(totals.total)},-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <table className="content-table" style={{ marginTop: '10px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '100px' }}>Catatan</td>
                            <td style={{ width: '10px' }}>:</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td>Lampiran</td>
                            <td>:</td>
                            <td>2 (Dua) berkas</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '20px', textAlign: 'justify' }}>
                    Mohon perkenan Bapak Kepala Dinas menandatangani dan memberi arahan serta petunjuk lebih lanjut.<br />
                    Atas perkenan Bapak Kepala Dinas disampaikan terima kasih.
                </div>

                {/* Signatures */}
                <div className="signature-section">
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <strong>DISPOSISI PIMPINAN</strong>
                    </div>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        Kepala Unit Pelaksana Teknis<br />
                        Pelatihan Pertanian
                        <br /><br /><br /><br /><br />
                        <strong>Ir. Agus Sumarsono, MM</strong><br />
                        Pembina / (IV/a)<br />
                        NIP 196808221996021001
                    </div>
                </div>

                {/* Paraf Table */}
                <table className="paraf-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>Nama</th>
                            <th style={{ textAlign: 'center' }}>Paraf</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Aminatun, S.Sos, M.Si</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Ir. Agus Sumarsono, MM</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Sri Hasmiati, SE, MMA</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>,
        document.body
    );
};

export default SuratPengantar;
