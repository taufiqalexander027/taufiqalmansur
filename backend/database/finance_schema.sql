-- Table for Master Data Rekening
CREATE TABLE IF NOT EXISTS finance_rekenings (
    id VARCHAR(255) PRIMARY KEY, -- Format: SEKSI_REK_KODE (e.g., SEKSI_PELATIHAN_REK_5_1_02_01_01_0004)
    kode VARCHAR(50) NOT NULL,
    uraian TEXT NOT NULL,
    seksi_id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50),
    program_nama VARCHAR(255),
    kegiatan_id VARCHAR(50),
    kegiatan_nama VARCHAR(255),
    sub_kegiatan_id VARCHAR(50),
    sub_kegiatan_nama VARCHAR(255),
    anggaran_pad DECIMAL(15, 2) DEFAULT 0,
    anggaran_dbhcht DECIMAL(15, 2) DEFAULT 0,
    sheet_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Transactions (DKKB & Realisasi)
CREATE TABLE IF NOT EXISTS finance_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rekening_id VARCHAR(255) NOT NULL,
    tahun INT NOT NULL,
    bulan VARCHAR(20) NOT NULL, -- januari, februari, etc.
    seksi_id VARCHAR(50) NOT NULL,
    sumber_dana VARCHAR(20) NOT NULL, -- PAD, DBHCHT
    nilai DECIMAL(15, 2) DEFAULT 0,
    type ENUM('DKKB', 'REALISASI') NOT NULL,
    input_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rekening_id) REFERENCES finance_rekenings(id) ON DELETE CASCADE,
    INDEX idx_tahun_bulan (tahun, bulan),
    INDEX idx_rekening (rekening_id)
);
