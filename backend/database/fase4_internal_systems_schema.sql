-- =============================================
-- FASE 4: INTERNAL SYSTEMS INTEGRATION SCHEMA
-- E-Laporan ASN & Laporan Keuangan (from port 5001 & 3001)
-- =============================================

USE portal_terintegrasi;

-- =============================================
-- ASN ACTIVITY TYPES
-- =============================================
CREATE TABLE IF NOT EXISTS asn_activity_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO asn_activity_types (name, slug, description) VALUES
('Dokumentasi Kinerja Harian', 'daily-performance', 'Laporan aktivitas harian ASN'),
('Self Assessment Berakhlak', 'berakhlak-assessment', 'Penilaian mandiri nilai-nilai Berakhlak'),
('Laporan Kinerja Umum', 'general-performance', 'Laporan kinerja umum lainnya');

-- =============================================
-- ASN DAILY REPORTS
-- =============================================
CREATE TABLE IF NOT EXISTS asn_daily_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    report_date DATE NOT NULL,
    activity_description TEXT NOT NULL,
    photo_documentation VARCHAR(500),
    work_hours DECIMAL(4,2),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ASN BERAKHLAK ASSESSMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS asn_berakhlak_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_period VARCHAR(50),
    berorientasi_pelayanan INT CHECK (berorientasi_pelayanan BETWEEN 1 AND 5),
    akuntabel INT CHECK (akuntabel BETWEEN 1 AND 5),
    kompeten INT CHECK (kompeten BETWEEN 1 AND 5),
    harmonis INT CHECK (harmonis BETWEEN 1 AND 5),
    loyal INT CHECK (loyal BETWEEN 1 AND 5),
    adaptif INT CHECK (adaptif BETWEEN 1 AND 5),
    kolaboratif INT CHECK (kolaboratif BETWEEN 1 AND 5),
    total_score INT,
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_period (assessment_period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ASN GENERAL REPORTS
-- =============================================
CREATE TABLE IF NOT EXISTS asn_general_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    report_content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- FINANCIAL BUDGET PROGRAMS
-- =============================================
CREATE TABLE IF NOT EXISTS financial_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- FINANCIAL ACTIVITIES
-- =============================================
CREATE TABLE IF NOT EXISTS financial_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES financial_programs(id) ON DELETE CASCADE,
    INDEX idx_program (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- FINANCIAL ACCOUNTS (Kode Rekening)
-- =============================================
CREATE TABLE IF NOT EXISTS financial_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES financial_activities(id) ON DELETE CASCADE,
    INDEX idx_activity (activity_id),
    INDEX idx_code (account_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- FINANCIAL BUDGET (DKKB/Anggaran)
-- =============================================
CREATE TABLE IF NOT EXISTS financial_budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    fiscal_year INT NOT NULL,
    budget_amount DECIMAL(18,2) NOT NULL,
    source_of_funds VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES financial_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_budget (account_id, fiscal_year, source_of_funds),
    INDEX idx_year (fiscal_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- FINANCIAL REALIZATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS financial_realizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_id INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    realization_amount DECIMAL(18,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES financial_budgets(id) ON DELETE CASCADE,
    INDEX idx_budget (budget_id),
    INDEX idx_month (month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Sample Data
-- =============================================

INSERT IGNORE INTO financial_programs (code, name, description) VALUES
('1.02', 'PROGRAM PENYULUHAN PERTANIAN', 'Program penyuluhan dan pendampingan petani'),
('1.06', 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Program penunjang urusan pemerintahan');

SET @prog1 = (SELECT id FROM financial_programs WHERE code = '1.02');
SET @prog2 = (SELECT id FROM financial_programs WHERE code = '1.06');

INSERT IGNORE INTO financial_activities (program_id, code, name) VALUES
(@prog1, '1.02.01', 'Pelatihan dan Penyuluhan Petani'),
(@prog2, '1.06.01', 'Perencanaan, Penganggaran, dan Evaluasi Kinerja'),
(@prog2, '1.06.02', 'Administrasi Keuangan');

-- =============================================
-- Views untuk Reporting
-- =============================================

CREATE OR REPLACE VIEW v_financial_summary AS
SELECT 
    fp.code AS program_code,
    fp.name AS program_name,
    fa.code AS activity_code,
    fa.name AS activity_name,
    fac.account_code,
    fac.account_name,
    fb.fiscal_year,
    fb.budget_amount,
    COALESCE(SUM(fr.realization_amount), 0) AS total_realization,
    (fb.budget_amount - COALESCE(SUM(fr.realization_amount), 0)) AS remaining_budget
FROM financial_programs fp
JOIN financial_activities fa ON fp.id = fa.program_id
JOIN financial_accounts fac ON fa.id = fac.activity_id
JOIN financial_budgets fb ON fac.id = fb.account_id
LEFT JOIN financial_realizations fr ON fb.id = fr.budget_id
GROUP BY fp.id, fa.id, fac.id, fb.id;

CREATE OR REPLACE VIEW v_asn_daily_summary AS
SELECT 
    u.full_name,
    u.username,
    DATE_FORMAT(adr.report_date, '%Y-%m') AS month,
    COUNT(*) AS total_reports,
    SUM(adr.work_hours) AS total_hours
FROM asn_daily_reports adr
JOIN users u ON adr.user_id = u.id
GROUP BY u.id, DATE_FORMAT(adr.report_date, '%Y-%m');

SELECT '✅ Internal systems schema created successfully!' AS status;
SELECT COUNT(*) AS total_programs FROM financial_programs;
SELECT COUNT(*) AS total_asn_activity_types FROM asn_activity_types;
