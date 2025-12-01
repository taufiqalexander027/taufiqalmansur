# ⚠️ CATATAN PENTING - Kesalahan yang Perlu Dihindari

Dokumentasi ini berisi kesalahan-kesalahan yang pernah terjadi selama development dan cara mencegahnya.

---

## 🔥 MASALAH KRITIS 2 HARI TERAKHIR

### ❌ **Bug Aggregation - Kode Rekening Duplikat**

**Kapan:** 28-29 November 2025  
**Gejala:** 
- Di mode UPT Gabungan, kode rekening yang sama muncul 2x
- Harusnya di-aggregate (sum values), tapi malah duplicate rows

**Penyebab:**
```javascript
// SALAH - Aggregate by kodeRekening saja
const aggregated = data.reduce((acc, item) => {
    const key = item.kodeRekening;
    // ...
}, {});

// Kode rekening SAMA bisa ada di subKegiatan BERBEDA!
// Contoh: 5.1.02.02.01.0080 ada di:
// - Penyuluhan > Sub A
// - Penunjang > Sub B
```

**Solusi:**
```javascript
// BENAR - Aggregate by kodeRekening + subKegiatan
const key = `${item.kodeRekening}_${item.subKegiatan}`;

// Atau filter dulu by program sebelum aggregate
const penyuluhanData = data.filter(d => d.program.includes('PENYULUHAN'));
const penunjangData = data.filter(d => d.program.includes('PENUNJANG'));
```

**Lesson Learned:**
- JANGAN assume kode rekening unique across all data
- ALWAYS aggregate dengan composite key jika ada hierarchy
- Test dengan real data yang punya duplicate codes

---

### ❌ **Bug Data Import Tidak Tersimpan**

**Kapan:** 28 November 2025  
**Gejala:**
- Import Excel success notification muncul
- Tapi data tidak muncul di tabel
- Refresh page → data hilang

**Penyebab:**
```javascript
// Import berhasil parse
const parsedData = await parseExcel(file);
setData(parsedData); // ✓ Set di state

// TAPI LUPA SAVE KE LOCALSTORAGE!
// saveFinancialData(parsedData); // ❌ Missing
```

**Solusi:**
```javascript
const handleFileUpload = async (e) => {
    const parsedData = await parseExcel(file);
    setData(parsedData);
    saveFinancialData(parsedData); // ✓ WAJIB!
    
    // Show success message
    setSuccessMessage('✅ Data berhasil disimpan!');
};
```

**Lesson Learned:**
- ALWAYS save to localStorage after state change
- Success message harus SETELAH save, bukan setelah setState
- Test dengan hard refresh (Ctrl+Shift+R)

---

### ❌ **Bug "Yth. Bapak" Wrap ke Baris Baru**

**Kapan:** 29 November 2025  
**Gejala:**
- Di Surat Pengantar, "Yth." dan "Bapak" terpisah di 2 baris
- Harusnya satu baris: "Yth. Bapak ..."

**Penyebab:**
```html
<!-- SALAH - "Bapak" di cell terpisah -->
<tr>
    <td>Kepada</td>
    <td>Yth.</td>
</tr>
<tr>
    <td></td>
    <td>Bapak ...</td> <!-- Wrap ke baris baru! -->
</tr>
```

**Solusi:**
```html
<!-- BENAR - "Yth. Bapak" satu cell -->
<tr>
    <td>Kepada</td>
    <td style={{ whiteSpace: 'nowrap' }}>
        Yth. Bapak Kepala Dinas ...
    </td>
</tr>
```

**Lesson Learned:**
- Gunakan `white-space: nowrap` untuk prevent wrapping
- Test layout dengan nama panjang
- Preview PDF before final formatting

---

### ❌ **Bug Multi-Row Paste "Per Baris, Bukan Per Kolom"**

**Kapan:** 30 November 2025  
**Gejala:**
- Copy dari tabel HTML (select multiple rows) → paste jadi horizontal
- Harusnya paste vertikal per kolom

**Penyebab:**
```javascript
// Browser copy HTML table selection sebagai tab-separated
// Row 1: "cell1\tcell2\tcell3"
// Row 2: "cell4\tcell5\tcell6"

// Paste akan jadi horizontal, bukan vertical
```

**Solusi:**
```javascript
// WORKAROUND: Copy dari Excel/Google Sheets (kolom tunggal)
// Bukan dari HTML table selection

// Atau implement custom drag-select + copy logic
```

**Limitation:**
- Copy multi-row DARI tabel HTML → Tidak support (browser limitation)
- Copy multi-row DARI Excel → ✓ Support
- Paste single cell → ✓ Support

**Lesson Learned:**
- Browser clipboard API limited untuk HTML table
- Excel clipboard format berbeda dengan HTML table
- Document limitation jelas ke user

---

### ❌ **Typo "Pertaniaan" di Header Image**

**Kapan:** 29 November 2025  
**Gejala:**
- Surat Pengantar header ada typo "Pertaniaan" (double 'a')

**Penyebab:**
- Typo di source image file (kop_surat.png)

**Solusi:**
```javascript
// Fix di code (temporary):
// Ganti text di JSX (tapi image tetap typo)

// Fix permanent:
// Replace image file dengan yang benar
```

**Lesson Learned:**
- Check semua asset files untuk typo
- Preview final output sebelum delivery
- Keep source files editable (PSD/AI/Figma)

---

### ❌ **Font Size Surat Pengantar Terlalu Kecil**

**Kapan:** 29 November 2025  
**Gejala:**
- Font terlalu kecil, susah dibaca
- Spacing terlalu rapat

**Solusi:**
```css
.surat-body {
    font-size: 11pt; /* Naik dari 10pt */
    line-height: 1.6; /* Spacing lebih lega */
    text-align: justify; /* Rata kanan-kiri */
}
```

**Lesson Learned:**
- Font minimal 11pt untuk readability
- Line-height minimal 1.5-1.6
- Test print preview di actual paper size

---

### ❌ **Mobile: crypto.randomUUID() Error**

**Kapan:** 27 November 2025  
**Gejala:**
- Error di mobile browser: "crypto.randomUUID is not a function"
- Desktop works fine

**Penyebab:**
```javascript
// crypto.randomUUID() tidak support di semua mobile browser
const id = crypto.randomUUID(); // ❌ Error di mobile
```

**Solusi:**
```javascript
// Gunakan fallback UUID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

**Lesson Learned:**
- ALWAYS check browser compatibility
- Test di actual mobile devices
- Provide fallback untuk modern APIs

---

## 🚨 MASALAH UMUM & SOLUSI


### 1. **PDF Download Blank/Kosong**

**Penyebab:**
- Teks tidak dipaksa jadi hitam saat render PDF
- Background putih tidak di-set explicit
- Scale terlalu kecil

**Solusi:**
```javascript
// SELALU force black text sebelum capture
const originalColor = element.style.color;
element.style.color = 'black';

// Gunakan backgroundColor: '#ffffff'
await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true
});

// Restore color
element.style.color = originalColor;
```

**Pencegahan:**
- Selalu force warna hitam sebelum PDF generation
- Gunakan scale minimal 2 untuk resolusi bagus
- Set backgroundColor explicit

---

### 2. **PDF Landscape Berubah Jadi Portrait (atau sebaliknya)**

**Penyebab:**
- `html2pdf.js` tidak reliable untuk orientation complex layout
- Pagebreak tidak berfungsi dengan baik

**Solusi:**
```javascript
// JANGAN pakai html2pdf untuk layout kompleks
// Gunakan direct canvas-to-PDF dengan jsPDF

const { jsPDF } = await import('jspdf');
const pdf = new jsPDF({
    orientation: 'landscape', // atau 'portrait'
    unit: 'mm',
    format: 'a4'
});
```

**Pencegahan:**
- Untuk DKKB (Landscape): Gunakan jsPDF + html2canvas
- Untuk Receipt/Surat (Portrait): Bisa pakai html2pdf atau jsPDF
- ALWAYS set orientation explicit

---

### 3. **Content PDF Terpotong (Cut-off)**

**Penyebab:**
- Margin PDF tidak match dengan CSS padding
- Width container tidak fixed

**Solusi:**
```javascript
// WYSIWYG approach: Margin PDF = 0, pakai CSS padding
const opt = {
    margin: 0, // Let CSS handle margins
    // ... other options
};

// Untuk landscape, set width explicit
<div ref={contentRef} style={{ width: '297mm', margin: '0 auto' }}>
```

**Pencegahan:**
- `margin: 0` di PDF options
- Gunakan CSS padding untuk visual margins
- Set width container = paper size (210mm Portrait, 297mm Landscape)

---

### 4. **Header Tidak Repeat di Halaman 2, 3, dst (DKKB)**

**Penyebab:**
- `html2pdf.js` tidak reliable untuk multi-page dengan repeating header
- CSS `page-break-before` tidak berfungsi

**Solusi:**
```javascript
// Manual pagination - buat .dkkb-page untuk tiap halaman
// Setiap .dkkb-page punya header sendiri

// Lalu capture per-page dengan html2canvas + jsPDF
const pageElements = contentRef.current.querySelectorAll('.dkkb-page');
for (let i = 0; i < pageElements.length; i++) {
    const canvas = await html2canvas(pageElements[i], {...});
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
}
```

**Pencegahan:**
- Manual pagination untuk control penuh
- Capture per-page bukan 1 element besar
- Setiap page punya header sendiri

---

### 5. **Copy-Paste Tidak Berfungsi**

**Penyebab:**
- Input field tidak punya `onPaste` handler
- Clipboard data tidak di-parse dengan benar

**Solusi:**
```javascript
const handlePaste = (e) => {
    e.preventDefault(); // WAJIB!
    const pastedText = e.clipboardData.getData('text');
    
    // Parse multi-line untuk Excel
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim());
    
    // Remove thousand separator
    const digitsOnly = line.replace(/\D/g, '');
};

// Pasang di input
<input onPaste={handlePaste} />
```

**Pencegahan:**
- ALWAYS `e.preventDefault()` di paste handler
- Parse multi-line dengan `split(/\r?\n/)`
- Remove thousand separator: `replace(/\D/g, '')`

---

### 6. **Data Tidak Update di HP**

**Penyebab:**
- localStorage adalah **per-device**, bukan server-based
- Data di laptop dan HP terpisah

**Solusi:**
- Import Excel yang sama di HP
- Atau edit manual di HP

**Pencegahan:**
- Jelaskan ke user bahwa data adalah lokal
- Sediakan fitur Import/Export untuk sync
- JANGAN expect auto-sync tanpa backend

---

### 7. **CSS Syntax Error (camelCase vs kebab-case)**

**Penyebab:**
```javascript
// SALAH - React inline style pakai camelCase
<div style={{ flexDirection: 'column' }}>

// BENAR di CSS string
<style>{`
    .container {
        flex-direction: column; /* kebab-case */
    }
`}</style>
```

**Pencegahan:**
- Inline style → camelCase: `flexDirection`
- CSS string → kebab-case: `flex-direction`
- Hati-hati saat copy-paste dari CSS ke JSX

---

### 8. **Dropdown Teks Tidak Kelihatan**

**Penyebab:**
- Warna teks sama dengan background (putih-putih)
- Tidak ada explicit color setting

**Solusi:**
```javascript
style={{
    backgroundColor: 'white',
    color: '#1e293b', // ALWAYS set explicit
}}
```

**Pencegahan:**
- ALWAYS set text color explicit
- Test dengan background terang DAN gelap
- Gunakan contrast checker

---

### 9. **State Array vs String**

**Penyebab:**
```javascript
// Tadinya string
const [viewMonth, setViewMonth] = useState('');

// Jadi array untuk multi-select
const [viewMonth, setViewMonth] = useState([]);
```

**Masalah:**
- Logic yang pakai viewMonth harus diubah semua
- `viewMonth ? ...` jadi `viewMonth.length > 0 ? ...`

**Pencegahan:**
- Rencanakan data structure dari awal
- Kalau mungkin multi-select, langsung pakai array
- Document state type di comment

---

### 10. **Auto-Print Triggered Saat Preview**

**Penyebab:**
- `window.print()` dipanggil otomatis di `useEffect`
- User belum sempat review

**Solusi:**
```javascript
// JANGAN auto-print!
// Buat button "Print" untuk trigger manual
<button onClick={() => window.print()}>Print</button>

// Atau hapus fitur print, pakai PDF saja
```

**Pencegahan:**
- Preview ALWAYS manual control
- Print hanya via button click
- Prefer PDF download (lebih reliable)

---

## 📋 CHECKLIST SEBELUM COMMIT

- [ ] Test PDF download (Portrait & Landscape)
- [ ] Test di Chrome, Safari, Firefox
- [ ] Test di HP/tablet (responsive)
- [ ] Test Copy-Paste dari Excel
- [ ] Check console untuk error
- [ ] Verify localStorage save/load
- [ ] Test semua filter dropdown
- [ ] Verify calculations correct
- [ ] Check text color contrast
- [ ] Test keyboard navigation

---

## 💡 BEST PRACTICES

1. **PDF Generation:**
   - Landscape complex layouts → jsPDF + html2canvas
   - Multi-page dengan header → Manual pagination
   - Always force black text & white background

2. **State Management:**
   - Document state type di comment
   - Use array untuk multi-select dari awal
   - Save to localStorage after every change

3. **Styling:**
   - Inline style → camelCase
   - CSS string → kebab-case
   - Always set text color explicit

4. **User Experience:**
   - No auto-print/auto-download
   - Always preview before action
   - Clear error messages

5. **Testing:**
   - Test di multiple browsers
   - Test di mobile
   - Test copy-paste edge cases

---

**Terakhir diupdate:** 30 November 2025  
**Dibuat oleh:** Taufiq Al Mansur
