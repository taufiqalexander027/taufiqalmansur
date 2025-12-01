-- =============================================
-- FASE 2: BOOKING SYSTEM SCHEMA
-- Tables untuk Kunjungan Lapang & Sewa Gedung
-- =============================================

USE portal_terintegrasi;

-- =============================================
-- SERVICE TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS service_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default service types
INSERT INTO service_types (name, slug, description, icon) VALUES
('Kunjungan Lapang', 'field-visit', 'Kunjungan ke lokasi pertanian dan pelatihan', '🚜'),
('Sewa Gedung', 'venue-rental', 'Penyewaan gedung untuk acara dan kegiatan', '🏢'),
('Sewa Peralatan', 'equipment-rental', 'Penyewaan peralatan pertanian', '🛠️');

-- =============================================
-- FACILITIES TABLE (untuk sewa gedung/peralatan)
-- =============================================
CREATE TABLE IF NOT EXISTS facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_type_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INT,
    price_per_day DECIMAL(15,2),
    image_url VARCHAR(500),
    amenities TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
    INDEX idx_service_type (service_type_id),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample facilities
INSERT INTO facilities (service_type_id, name, description, capacity, price_per_day, amenities) VALUES
(2, 'Aula Utama', 'Ruang serbaguna dengan kapasitas besar untuk seminar dan workshop', 200, 2000000, 'AC, Proyektor, Sound System, Kursi, Meja'),
(2, 'Ruang Rapat Pimpinan', 'Ruang meeting eksklusif dengan fasilitas lengkap', 30, 500000, 'AC, LED TV, Whiteboard, Wifi'),
(3, 'Traktor Pertanian', 'Traktor untuk pengolahan lahan', NULL, 750000, 'BBM tidak termasuk'),
(3, 'Alat Semprot Hama', 'Peralatan semprot hama modern', NULL, 150000, 'Cairan tidak termasuk');

-- =============================================
-- BOOKING STATUS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS booking_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert booking statuses
INSERT INTO booking_statuses (name, description, color) VALUES
('pending', 'Menunggu persetujuan admin', '#FFA500'),
('approved', 'Booking disetujui', '#4CAF50'),
('rejected', 'Booking ditolak', '#F44336'),
('completed', 'Selesai', '#2196F3'),
('cancelled', 'Dibatalkan', '#9E9E9E');

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    service_type_id INT NOT NULL,
    facility_id INT NULL,
    user_id INT NOT NULL,
    
    -- Contact info
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    
    -- Booking details
    purpose TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    num_participants INT,
    
    -- Field visit specific
    visit_location TEXT,
    visit_objectives TEXT,
    
    -- Rental specific
    rental_items TEXT,
    special_requirements TEXT,
    
    -- Pricing
    total_cost DECIMAL(15,2),
    
    -- Status
    status_id INT NOT NULL DEFAULT 1,
    admin_notes TEXT,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES booking_statuses(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_booking_code (booking_code),
    INDEX idx_user (user_id),
    INDEX idx_status (status_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_service_type (service_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BOOKING AVAILABILITY TABLE (untuk tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS booking_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    facility_id INT NOT NULL,
    booking_id INT NOT NULL,
    date DATE NOT NULL,
    is_blocked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_facility_date (facility_id, date),
    INDEX idx_facility (facility_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- EMAIL QUEUE TABLE (untuk outbox notifications)
-- =============================================
CREATE TABLE IF NOT EXISTS email_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_name VARCHAR(100),
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Views untuk kemudahan query
-- =============================================

-- View untuk bookings dengan info lengkap
CREATE OR REPLACE VIEW v_bookings_full AS
SELECT 
    b.id,
    b.booking_code,
    b.contact_name,
    b.contact_phone,
    b.contact_email,
    b.organization,
    b.purpose,
    b.start_date,
    b.end_date,
    b.num_participants,
    b.visit_location,
    b.visit_objectives,
    b.rental_items,
    b.special_requirements,
    b.total_cost,
    b.admin_notes,
    b.approved_at,
    b.created_at,
    b.updated_at,
    st.name AS service_type_name,
    st.slug AS service_type_slug,
    st.icon AS service_type_icon,
    f.name AS facility_name,
    f.capacity AS facility_capacity,
    f.price_per_day AS facility_price,
    bs.name AS status_name,
    bs.color AS status_color,
    u.username AS user_username,
    u.full_name AS user_full_name,
    admin.full_name AS approved_by_name
FROM bookings b
JOIN service_types st ON b.service_type_id = st.id
LEFT JOIN facilities f ON b.facility_id = f.id
JOIN booking_statuses bs ON b.status_id = bs.id
JOIN users u ON b.user_id = u.id
LEFT JOIN users admin ON b.approved_by = admin.id;

-- View untuk availability check
CREATE OR REPLACE VIEW v_facility_availability AS
SELECT 
    f.id AS facility_id,
    f.name AS facility_name,
    ba.date,
    COUNT(ba.id) AS bookings_count,
    CASE 
        WHEN COUNT(ba.id) > 0 THEN FALSE 
        ELSE TRUE 
    END AS is_available
FROM facilities f
LEFT JOIN booking_availability ba ON f.id = ba.facility_id AND ba.is_blocked = TRUE
GROUP BY f.id, f.name, ba.date;

-- =============================================
-- Success Message
-- =============================================
SELECT '✅ Booking system schema created successfully!' AS status;
SELECT COUNT(*) AS total_service_types FROM service_types;
SELECT COUNT(*) AS total_facilities FROM facilities;
SELECT COUNT(*) AS total_booking_statuses FROM booking_statuses;
