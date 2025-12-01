-- Portal Terintegrasi - Database Schema Fase 1
-- Created: 2025-11-30
-- Purpose: Backend foundation dengan auth dan news management

-- Database creation
CREATE DATABASE IF NOT EXISTS portal_terintegrasi 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE portal_terintegrasi;

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('public', 'Public user - can access public content, booking, LMS'),
('staff', 'Internal staff - can access E-Laporan ASN and Financial Reports'),
('admin', 'Administrator - full access to all systems and content management');

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt
INSERT INTO users (username, email, password, full_name, role_id) VALUES
('admin', 'admin@portal.local', '$2a$10$rHqZlKm8wnT3LZzPPY.qKuXOX9wYGwX9QqQ8kQZK3qp0YL0YjZb0O', 'Administrator', 3);

-- =============================================
-- NEWS CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS news_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO news_categories (name, slug, description, icon) VALUES
('Teknologi', 'teknologi', 'Berita seputar teknologi dan inovasi', '💻'),
('Keuangan', 'keuangan', 'Informasi laporan dan kebijakan keuangan', '💰'),
('Bisnis', 'bisnis', 'Berita bisnis dan kemitraan', '💼'),
('Prestasi', 'prestasi', 'Penghargaan dan pencapaian', '🏆'),
('Kebijakan', 'kebijakan', 'Kebijakan dan peraturan', '📋'),
('Pengumuman', 'pengumuman', 'Pengumuman resmi', '📢');

-- =============================================
-- NEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    category_id INT NOT NULL,
    author_id INT NOT NULL,
    views INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_published (is_published),
    INDEX idx_featured (is_featured),
    INDEX idx_category (category_id),
    INDEX idx_published_at (published_at),
    FULLTEXT idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample news data
INSERT INTO news (title, slug, excerpt, content, category_id, author_id, is_published, is_featured, published_at) VALUES
(
    'Peluncuran Layanan Digital Terbaru',
    'peluncuran-layanan-digital-terbaru',
    'Portal terintegrasi resmi diluncurkan dengan berbagai fitur unggulan untuk meningkatkan pelayanan publik.',
    '<p>Kami dengan bangga mengumumkan peluncuran portal terintegrasi yang menggabungkan berbagai layanan dalam satu platform yang mudah diakses.</p><p>Fitur-fitur unggulan meliputi sistem booking online, platform pembelajaran digital (LMS), dan akses laporan terintegrasi.</p>',
    1, -- Teknologi
    1, -- Admin
    TRUE,
    TRUE,
    NOW()
),
(
    'Laporan Keuangan Q4 2024 Telah Tersedia',
    'laporan-keuangan-q4-2024',
    'Laporan realisasi anggaran triwulan keempat tahun 2024 telah dipublikasikan dan dapat diakses oleh pegawai internal.',
    '<p>Laporan keuangan triwulan IV tahun 2024 menunjukkan peningkatan realisasi anggaran sebesar 18.7% dibanding periode yang sama tahun lalu.</p><p>Untuk informasi lengkap, silakan login ke sistem laporan keuangan internal.</p>',
    2, -- Keuangan
    1,
    TRUE,
    FALSE,
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
),
(
    'Program Kemitraan Strategis Diluncurkan',
    'program-kemitraan-strategis',
    'Kerjasama dengan berbagai instansi untuk meningkatkan kualitas layanan dan pengembangan SDM.',
    '<p>Program kemitraan strategis merupakan inisiatif untuk memperkuat kolaborasi antar institusi dalam rangka peningkatan kualitas pelayanan publik.</p>',
    3, -- Bisnis
    1,
    TRUE,
    FALSE,
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- =============================================
-- SESSIONS TABLE (Optional - untuk tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ACTIVITY LOG TABLE (untuk audit trail)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Views untuk kemudahan query
-- =============================================

-- View untuk news dengan informasi lengkap
CREATE OR REPLACE VIEW v_news_full AS
SELECT 
    n.id,
    n.title,
    n.slug,
    n.excerpt,
    n.content,
    n.featured_image,
    n.views,
    n.is_published,
    n.is_featured,
    n.published_at,
    n.created_at,
    n.updated_at,
    c.name AS category_name,
    c.slug AS category_slug,
    c.icon AS category_icon,
    u.full_name AS author_name,
    u.username AS author_username
FROM news n
JOIN news_categories c ON n.category_id = c.id
JOIN users u ON n.author_id = u.id;

-- View untuk user dengan role
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    u.phone,
    u.is_active,
    u.last_login,
    u.created_at,
    r.name AS role_name,
    r.description AS role_description
FROM users u
JOIN roles r ON u.role_id = r.id;

-- =============================================
-- Success Message
-- =============================================
SELECT '✅ Database schema created successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_news FROM news;
SELECT COUNT(*) AS total_categories FROM news_categories;
