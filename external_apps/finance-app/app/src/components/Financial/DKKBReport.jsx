import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from './CurrencyInput';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';

const DKKBReport = ({ data, config, onClose }) => {
    const contentRef = useRef(null);

    // Determine target months based on Triwulan
    let targetMonths = [];
    let endMonthIndex = 11; // 0-indexed (Dec)

    switch (config.triwulan) {
        case 'I':
            targetMonths = [
                { key: 'jan', label: 'JAN' },
                { key: 'feb', label: 'PEB' },
                { key: 'mar', label: 'MAR' }
            ];
            endMonthIndex = 2;
            break;
        case 'II':
            targetMonths = [
                { key: 'apr', label: 'APR' },
                { key: 'mei', label: 'MEI' },
                { key: 'jun', label: 'JUN' }
            ];
            endMonthIndex = 5;
            break;
        case 'III':
            targetMonths = [
                { key: 'jul', label: 'JUL' },
                { key: 'aug', label: 'AGS' },
                { key: 'sep', label: 'SEP' }
            ];
            endMonthIndex = 8;
            break;
        case 'IV':
        default:
            targetMonths = [
                { key: 'okt', label: 'OKT' },
                { key: 'nov', label: 'NOV' },
                { key: 'des', label: 'DES' }
            ];
            endMonthIndex = 11;
            break;
    }

    const allMonths = [
        'jan', 'feb', 'mar', 'apr', 'mei', 'jun',
        'jul', 'aug', 'sep', 'okt', 'nov', 'des'
    ];
    const monthsToSum = allMonths.slice(0, endMonthIndex + 1);

    // Calculate totals
    const totalAnggaran = data.reduce((sum, item) => sum + (item?.anggaran?.papbd || 0), 0);
    const totalSisa = data.reduce((sum, item) => {
        if (!item || !item.realisasi) return sum;
        const realisasiUntilQuarter = monthsToSum.reduce((rSum, mKey) => rSum + (item.realisasi[mKey]?.realisasi || 0), 0);
        return sum + ((item.anggaran?.papbd || 0) - realisasiUntilQuarter);
    }, 0);
    const totalMonths = targetMonths.reduce((acc, m) => {
        acc[m.key] = data.reduce((sum, item) => sum + (item?.realisasi?.[m.key]?.realisasi || 0), 0);
        return acc;
    }, {});

    // --- Manual Pagination Logic ---
    const prepareRows = () => {
        const rows = [];
        let lastKegiatan = null;
        let lastSubKegiatan = null;
        let number = 1;

        data.forEach((item) => {
            if (!item) return;
            if (item.kegiatan !== lastKegiatan) {
                rows.push({ type: 'kegiatan', label: item.kegiatan });
                lastKegiatan = item.kegiatan;
                lastSubKegiatan = null;
            }
            if (item.subKegiatan !== lastSubKegiatan) {
                rows.push({ type: 'subKegiatan', label: item.subKegiatan });
                lastSubKegiatan = item.subKegiatan;
            }
            rows.push({ type: 'data', item, number: number++ });
        });
        return rows;
    };

    const allRows = prepareRows();
    const pages = [];
    let currentPage = [];

    // Pagination Rules:
    // Penyuluhan: Break after row 24 (so row 25 starts new page)
    // Penunjang: Break after row 24 AND row 33 (so row 25 and 34 start new pages)
    const isPenyuluhan = config.program && config.program.includes('PENYULUHAN');

    allRows.forEach(row => {
        if (row.type === 'data') {
            // Check for break BEFORE adding this row
            if (isPenyuluhan) {
                if (row.number === 25) {
                    pages.push(currentPage);
                    currentPage = [];
                }
            } else {
                // Penunjang / Standard
                if (row.number === 25 || row.number === 34) {
                    pages.push(currentPage);
                    currentPage = [];
                }
            }
        }
        currentPage.push(row);
    });
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }



    const handleDownloadPDF = async () => {
        const pageElements = contentRef.current.querySelectorAll('.dkkb-page');
        if (pageElements.length === 0) return;

        // Dynamically import libraries
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        // A4 Landscape dimensions in mm
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // A4 Landscape: 297mm x 210mm
        const pdfWidth = 297;
        const pdfHeight = 210;

        for (let i = 0; i < pageElements.length; i++) {
            const pageElement = pageElements[i];

            // Force black text
            const originalColor = pageElement.style.color;
            pageElement.style.color = 'black';

            // Capture the page as canvas
            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                backgroundColor: '#ffffff'
            });

            // Restore color
            pageElement.style.color = originalColor;

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            // Calculate dimensions to fit A4
            const imgWidth = pdfWidth;
            const imgHeight = pdfHeight;

            // Add page (if not the first one)
            if (i > 0) {
                pdf.addPage();
            }

            // Add image to PDF
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        }

        // Save the PDF
        pdf.save(`DKKB_Triwulan_${config.triwulan}_2025.pdf`);
    };

    return createPortal(
        <div className="print-container" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#94a3b8', zIndex: 9999, overflow: 'auto',
            fontFamily: 'Arial, sans-serif', color: 'black',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: '80px', paddingBottom: '40px', gap: '20px'
        }}>
            {/* Toolbar */}
            <div className="no-print" style={{
                position: 'fixed', top: 0, left: 0, right: 0, padding: '15px',
                backgroundColor: '#334155', display: 'flex', justifyContent: 'center', gap: '20px',
                zIndex: 100000, boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <button onClick={handleDownloadPDF} style={{ padding: '10px 25px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>📥 Download PDF</button>
                <button onClick={onClose} style={{ padding: '10px 25px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>❌ Tutup</button>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background-color: white !important; overflow: visible; display: block; }
                    .no-print { display: none !important; }
                    .dkkb-page { margin: 0 !important; box-shadow: none !important; page-break-after: always; }
                    .dkkb-page:last-child { page-break-after: auto; }
                }
                .dkkb-page {
                    width: 297mm; min-height: 210mm; padding: 12.5mm;
                    margin: 0 auto; background: white; box-sizing: border-box;
                    position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    font-size: 9pt;
                    display: flex; flex-direction: column;
                }
                .dkkb-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 2px solid black; font-size: 10pt; flex: 1; }
                .dkkb-table th { border: 1px solid black; padding: 4px; background-color: #f0f0f0; text-align: center; font-weight: bold; vertical-align: middle; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .dkkb-table td { border-left: 1px solid black; border-right: 1px solid black; border-top: 1px dotted black; border-bottom: 1px dotted black; padding: 2px 4px; vertical-align: middle; }
                .dkkb-table thead tr:last-child th { border-bottom: 2px solid black; }
                .total-row td { border-top: 2px solid black; border-bottom: 2px solid black; font-weight: bold; background-color: #fff; }
                .signature-row td { border: none; padding-top: 30px; }
                .dkkb-header-row td { border: none; padding: 2px; font-size: 10pt; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
            `}</style>

            <div ref={contentRef} style={{ width: '297mm', margin: '0 auto', background: 'white' }}>
                {pages.map((pageRows, pageIndex) => (
                    <div className="dkkb-page" key={pageIndex}>
                        {/* Header only on Page 1? User requested repeated headers, usually implies Table Header. 
                            But standard reports often repeat the Letterhead too or at least the Title. 
                            Let's keep Letterhead on Page 1 only for now to save space, unless requested otherwise. 
                            Wait, if I split pages manually, I must decide what goes on top of Page 2.
                            Usually just the Table Header is enough.
                        */}
                        {pageIndex === 0 && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', fontSize: '12pt' }}>
                                    <div>PEMERINTAH PROVINSI JAWA TIMUR</div>
                                    <div>DAFTAR KEBUTUHAN KAS BULANAN (DKKB) UNIT PELAKSANA TEKNIS PELATIHAN PERTANIAN</div>
                                </div>
                                <table style={{ width: '100%', marginBottom: '10px', fontSize: '10pt' }}>
                                    <tbody>
                                        <tr className="dkkb-header-row"><td style={{ width: '180px' }}>PERANGKAT DAERAH</td><td>: 2.09.3.27.0.00.02.0000 DINAS PERTANIAN DAN KETAHANAN PANGAN</td></tr>
                                        <tr className="dkkb-header-row"><td>BIDANG URUSAN</td><td>: 3.27 URUSAN PEMERINTAHAN BIDANG PERTANIAN</td></tr>
                                        <tr className="dkkb-header-row"><td>PROGRAM</td><td>: {config.program ? config.program : 'SEMUA PROGRAM'}</td></tr>
                                        <tr className="dkkb-header-row"><td>TRIWULAN KE</td><td>: {config.triwulan}</td></tr>
                                        <tr className="dkkb-header-row"><td>TAHUN ANGGARAN</td><td>: 2025</td></tr>
                                        <tr className="dkkb-header-row"><td>K P A</td><td>: Ir. AGUS SUMARSONO, MM</td></tr>
                                    </tbody>
                                </table>
                            </>
                        )}

                        <table className="dkkb-table">
                            <thead>
                                <tr>
                                    <th rowSpan="2" style={{ width: '30px' }}>NO</th>
                                    <th rowSpan="2" style={{ minWidth: '100px' }}>KODE REKENING</th>
                                    <th rowSpan="2">URAIAN</th>
                                    <th rowSpan="2" style={{ minWidth: '100px' }}>ANGGARAN PAPBD</th>
                                    <th colSpan="3">KEBUTUHAN KAS BULANAN</th>
                                    <th rowSpan="2" style={{ minWidth: '100px' }}>SISA ANGGARAN</th>
                                </tr>
                                <tr>
                                    {targetMonths.map(m => <th key={m.key} style={{ minWidth: '80px' }}>{m.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((row, index) => {
                                    if (row.type === 'kegiatan') {
                                        return (
                                            <tr key={`keg-${pageIndex}-${index}`} style={{ fontWeight: 'bold' }}>
                                                <td></td><td>Kegiatan</td><td colSpan={10}>: {row.label}</td>
                                            </tr>
                                        );
                                    } else if (row.type === 'subKegiatan') {
                                        return (
                                            <tr key={`sub-${pageIndex}-${index}`} style={{ fontWeight: 'bold' }}>
                                                <td></td><td>Sub Kegiatan</td><td colSpan={10}>: {row.label}</td>
                                            </tr>
                                        );
                                    } else {
                                        const { item, number } = row;
                                        const itemRealisasiUntilQuarter = monthsToSum.reduce((sum, mKey) => sum + (item.realisasi?.[mKey]?.realisasi || 0), 0);
                                        const itemSisa = (item.anggaran?.papbd || 0) - itemRealisasiUntilQuarter;
                                        return (
                                            <tr key={item.id || `row-${pageIndex}-${index}`}>
                                                <td className="text-center">{number}</td>
                                                <td>{item.kodeRekening}</td>
                                                <td>{item.uraian}</td>
                                                <td className="text-right">{item.anggaran?.papbd ? formatCurrency(item.anggaran.papbd) : '-'}</td>
                                                {targetMonths.map(m => (
                                                    <td key={m.key} className="text-right">
                                                        {item.realisasi?.[m.key]?.realisasi ? formatCurrency(item.realisasi[m.key].realisasi) : '-'}
                                                    </td>
                                                ))}
                                                <td className="text-right">{itemSisa ? formatCurrency(itemSisa) : '-'}</td>
                                            </tr>
                                        );
                                    }
                                })}

                                {/* Render Totals and Signature ONLY on the last page */}
                                {pageIndex === pages.length - 1 && (
                                    <>
                                        <tr className="total-row">
                                            <td colSpan="3" className="text-center">JUMLAH</td>
                                            <td className="text-right">{formatCurrency(totalAnggaran)}</td>
                                            {targetMonths.map(m => (
                                                <td key={m.key} className="text-right">{formatCurrency(totalMonths[m.key])}</td>
                                            ))}
                                            <td className="text-right">{formatCurrency(totalSisa)}</td>
                                        </tr>
                                        <tr className="signature-row">
                                            <td colSpan="8">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <div style={{ textAlign: 'center', width: '40%' }}>
                                                        <div>MENGETAHUI :</div>
                                                        <div>PENGGUNA ANGGARAN</div>
                                                        <div>DINAS PERTANIAN DAN KETAHANAN PANGAN</div>
                                                        <div>PROVINSI JAWA TIMUR,</div>
                                                        <div style={{ marginTop: (config.program && config.program.includes('PENYULUHAN')) ? '40px' : '70px', fontWeight: 'bold', textDecoration: 'underline' }}>Dr. Ir. HERU SUSENO, M.T</div>
                                                        <div>PEMBINA UTAMA MUDA (IV/c)</div>
                                                        <div>NIP. 196805301995031003</div>
                                                    </div>
                                                    <div style={{ textAlign: 'center', width: '40%' }}>
                                                        <div>{config.tanggal || 'MALANG, DESEMBER 2025'}</div>
                                                        <div>KEPALA UNIT PELAKSANA TEKNIS</div>
                                                        <div>PELATIHAN PERTANIAN</div>
                                                        <div style={{ marginTop: (config.program && config.program.includes('PENYULUHAN')) ? '40px' : '85px', fontWeight: 'bold', textDecoration: 'underline' }}>Ir. AGUS SUMARSONO, M.M</div>
                                                        <div>PEMBINA (IV/a)</div>
                                                        <div>NIP. 196808221996022001</div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>,
        document.body
    );
};

export default DKKBReport;
