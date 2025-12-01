import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from './CurrencyInput';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';

// Helper function to convert number to words (Indonesian)
function terbilang(angka) {
    const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let hasil = "";

    if (angka < 12) {
        hasil = " " + bil[angka];
    } else if (angka < 20) {
        hasil = terbilang(angka - 10) + " Belas";
    } else if (angka < 100) {
        hasil = terbilang(Math.floor(angka / 10)) + " Puluh" + terbilang(angka % 10);
    } else if (angka < 200) {
        hasil = " Seratus" + terbilang(angka - 100);
    } else if (angka < 1000) {
        hasil = terbilang(Math.floor(angka / 100)) + " Ratus" + terbilang(angka % 100);
    } else if (angka < 2000) {
        hasil = " Seribu" + terbilang(angka - 1000);
    } else if (angka < 1000000) {
        hasil = terbilang(Math.floor(angka / 1000)) + " Ribu" + terbilang(angka % 1000);
    } else if (angka < 1000000000) {
        hasil = terbilang(Math.floor(angka / 1000000)) + " Juta" + terbilang(angka % 1000000);
    } else if (angka < 1000000000000) {
        hasil = terbilang(Math.floor(angka / 1000000000)) + " Milyar" + terbilang(angka % 1000000000);
    }

    return hasil;
}

const ReceiptReport = ({ data, config, onAfterPrint }) => {
    const contentRef = useRef(null);

    // Filter data for the specific programs
    const programPenunjang = data.filter(item => item.program && item.program.includes('PENUNJANG'));
    const programPenyuluhan = data.filter(item => item.program && item.program.includes('PENYULUHAN'));

    const targetMonthKey = config.monthKey || 'nov';
    const targetMonthLabel = config.monthLabel || 'November';
    const targetYear = config.year || '2025';

    const sumTotal = (items) => items.reduce((sum, item) => sum + (item.realisasi?.[targetMonthKey]?.realisasi || 0), 0);

    const totalPenunjang = sumTotal(programPenunjang);
    const totalPenyuluhan = sumTotal(programPenyuluhan);
    const totalAmount = totalPenunjang + totalPenyuluhan;

    const terbilangText = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return "Nol Rupiah";
        if (num === 0) return "Nol Rupiah";
        return terbilang(num).trim() + " Rupiah";
    };



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
        pdf.save(`Kwitansi_${targetMonthLabel}_${targetYear}.pdf`);
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
            fontFamily: 'Arial, sans-serif',
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
                    onClick={onAfterPrint}
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

            <style>{`
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
                    
                    /* Print-specific overrides for receipt-page */
                    .receipt-page {
                        width: 210mm !important; /* A4 width */
                        min-height: 297mm !important;
                        padding: 15mm !important; /* 1.5cm margins */
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                }

                /* Screen / Preview Styles */
                .receipt-page {
                    width: 210mm; /* A4 width */
                    min-height: 297mm; /* A4 height */
                    padding: 10mm; /* Reduced margins to fit single page */
                    margin: 0 auto;
                    background: white;
                    box-sizing: border-box;
                    position: relative;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                }

                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .receipt-table td {
                    vertical-align: top;
                    padding: 3px 5px;
                }
                .parallelogram {
                    transform: skew(-20deg);
                    border: 2px solid black;
                    padding: 5px 15px;
                    display: inline-block;
                    margin: 5px 10px;
                    font-weight: bold;
                    font-style: italic;
                }
                .parallelogram-content {
                    transform: skew(20deg); /* Counter skew */
                }
                .header-table td {
                    border: 1px solid black;
                    padding: 1px 4px;
                    font-size: 9pt;
                }
            `}</style>

            <div className="receipt-page" ref={contentRef}>
                {/* Top Right Header Codes */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                    <table className="header-table" style={{ borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr><td style={{ width: '100px' }}>NO BKU/HAL</td><td style={{ width: '150px' }}></td></tr>
                            <tr><td>NO PROGRAM</td><td>3.27.01</td></tr>
                            <tr><td>NO KEGIATAN</td><td></td></tr>
                            <tr><td>NO PROGRAM</td><td>3.27.07</td></tr>
                            <tr><td>NO KEGIATAN</td><td></td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                    KWITANSI
                </div>

                {/* Main Content */}
                <table className="receipt-table">
                    <tbody>
                        <tr>
                            <td style={{ width: '150px', fontStyle: 'italic', fontWeight: 'bold' }}>Sudah terima dari</td>
                            <td style={{ width: '20px' }}>:</td>
                            <td>KEPALA DINAS PERTANIAN DAN KETAHANAN PANGAN PROVINSI JAWA TIMUR</td>
                        </tr>
                        <tr>
                            <td style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Jumlah Uang</td>
                            <td>:</td>
                            <td>
                                <div className="parallelogram">
                                    <div className="parallelogram-content">
                                        == {terbilangText(totalAmount)} ==
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Untuk Pembayaran</td>
                            <td>:</td>
                            <td>
                                Persekot untuk Program (3.27.01) Program Penunjang Urusan Pemerintahan Daerah Provinsi dan Program ( 3.27.07 ) Program Penyuluhan Pertanian, KPA Ir.Agus Sumarsono, M.M bagian bulan <strong>{targetMonthLabel} {targetYear}</strong> ( GU ) dengan perincian :
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Breakdown Table */}
                <div style={{ marginLeft: '170px', marginTop: '5px', marginBottom: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '3px' }}>Program ( 3.27.01 )</td>
                                <td style={{ width: '30px' }}>Rp.</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(totalPenunjang)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '3px' }}>Program ( 3.27.07 )</td>
                                <td style={{ width: '30px' }}>Rp.</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid black' }}>{formatCurrency(totalPenyuluhan)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '3px', fontWeight: 'bold' }}>J U M L A H</td>
                                <td style={{ width: '30px', fontWeight: 'bold' }}>Rp.</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Terbilang Bottom */}
                <table className="receipt-table" style={{ marginBottom: '20px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '150px', fontStyle: 'italic', fontWeight: 'bold' }}>Terbilang</td>
                            <td style={{ width: '20px' }}>:</td>
                            <td style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                Rp. <span style={{ border: '2px solid black', padding: '5px 15px', marginLeft: '10px', display: 'inline-block', transform: 'skew(-10deg)' }}>
                                    <span style={{ display: 'inline-block', transform: 'skew(10deg)' }}>{formatCurrency(totalAmount)}</span>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <table style={{ width: '100%', marginTop: '30px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top' }}>
                                <br />
                                Setuju Dibayar<br />
                                Kepala UPT. Pelatihan Pertanian<br />
                                <br /><br /><br /><br />
                                <u style={{ fontWeight: 'bold' }}>Ir. AGUS SUMARSONO, MM</u><br />
                                NIP. 19680822 199602 1 001
                            </td>
                            <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top' }}>
                                Lunas Dibayar :<br />
                                Tgl.<br />
                                Bendahara Pengeluaran<br />
                                <br /><br /><br /><br />
                                <u style={{ fontWeight: 'bold' }}>RACHMAN ADJI, SE</u><br />
                                NIP. 19701125 200901 1 002
                            </td>
                            <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top' }}>
                                Surabaya, &nbsp;&nbsp;&nbsp;&nbsp; {targetMonthLabel} {targetYear}<br />
                                <br />
                                Yang menerima :<br />
                                <br /><br /><br /><br />
                                <u style={{ fontWeight: 'bold' }}>MEIDIANA PRASTIWI, SP</u><br />
                                NIP. 19960504 202012 2 027
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>,
        document.body
    );
};

export default ReceiptReport;
