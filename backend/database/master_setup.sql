-- =============================================
-- MASTER DATABASE SETUP SCRIPT
-- Portal Terintegrasi - All Phases Combined
-- Execute this to setup complete database
-- =============================================

-- Include all phase schemas
SOURCE fase2_bookings_schema.sql;
SOURCE fase3_lms_schema.sql;
SOURCE fase4_internal_systems_schema.sql;

-- =============================================
-- Additional Sample Data for Demo
-- =============================================

USE portal_terintegrasi;

-- Update admin user info
UPDATE users SET full_name = 'Taufiq Al Mansur', phone = '081234567890' WHERE username = 'admin';

-- Add more sample news with personal touch
INSERT INTO news (title, slug, excerpt, content, category_id, author_id, is_published, is_featured, published_at) VALUES
(
    'Transformasi Digital Layanan Publik ASN',
    'transformasi-digital-asn',
    'Implementasi sistem terintegrasi untuk meningkatkan efisiensi dan transparansi layanan ASN',
    '<p>Dalam era digital saat ini, transformasi layanan publik menjadi kebutuhan yang tidak dapat ditunda. Sistem terintegrasi yang menggabungkan berbagai aspek layanan dalam satu platform memudahkan akses dan meningkatkan produktivitas.</p>',
    1,
    1,
    TRUE,
    TRUE,
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
(
    'Inovasi Sistem Pelaporan Keuangan Terintegrasi',
    'inovasi-laporan-keuangan',
    'Sistem pelaporan keuangan real-time untuk transparansi dan akuntabilitas anggaran',
    '<p>Pengelolaan keuangan yang transparan dan akuntabel dimulai dari sistem pelaporan yang baik. Platform digital memungkinkan monitoring real-time dan analisis mendalam terhadap realisasi anggaran.</p>',
    2,
    1,
    TRUE,
    FALSE,
    DATE_SUB(NOW(), INTERVAL 3 HOUR)
);

-- Sample booking
INSERT INTO bookings (
    booking_code, service_type_id, facility_id, user_id,
    contact_name, contact_phone, contact_email, organization, purpose,
    start_date, end_date, num_participants, total_cost, status_id
) VALUES (
    'VR-202512-A1B',
    2, -- venue rental
    1, -- Aula Utama
    1,
    'Taufiq Al Mansur',
    '081234567890',
    'taufiq@example.com',
    'Dinas Pertanian Provinsi',
    'Workshop Transformasi Digital ASN',
    '2025-12-15',
    '2025-12-15',
    100,
    2000000,
    2 -- approved
);

-- Sample LMS course content
SET @course_id = (SELECT id FROM courses LIMIT 1);
SET @module1 = (SELECT id FROM course_modules WHERE course_id = @course_id AND order_number = 1);

INSERT INTO lessons (module_id, title, content, duration_minutes, order_number, is_free) VALUES
(@module1, 'Apa itu Hidroponik?', 'Hidroponik adalah metode bercocok tanam tanpa menggunakan media tanah, melainkan dengan air yang diperkaya dengan nutrisi', 15, 1, TRUE),
(@module1, 'Keuntungan Hidroponik', 'Beberapa keuntungan hidroponik: hemat air, tidak memerlukan lahan luas, hasil lebih bersih, produktivitas tinggi', 20, 2, TRUE);

-- Sample ASN daily report
INSERT INTO asn_daily_reports (user_id, report_date, activity_description, work_hours, location) VALUES
(1, CURDATE(), 'Pengembangan sistem portal terintegrasi dan pelatihan tim IT', 8, 'Kantor Dinas');

-- Sample financial data
SET @prog1 = (SELECT id FROM financial_programs WHERE code = '1.02');
INSERT INTO financial_activities (program_id, code, name) VALUES
(@prog1, '1.02.02', 'Pengembangan Sistem Informasi Pertanian');

SET @act_id = LAST_INSERT_ID();
INSERT INTO financial_accounts (activity_id, account_code, account_name) VALUES
(@act_id, '5.2.02.01.01.0051', 'Belanja Modal Perangkat Komputer');

SET @acc_id = LAST_INSERT_ID();
INSERT INTO financial_budgets (account_id, fiscal_year, budget_amount, source_of_funds) VALUES
(@acc_id, 2025, 150000000, 'APBD');

-- =============================================
-- Create admin menu view
-- =============================================
CREATE OR REPLACE VIEW v_admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM news WHERE is_published = TRUE) as published_news,
    (SELECT COUNT(*) FROM bookings WHERE status_id = 1) as pending_bookings,
    (SELECT COUNT(*) FROM enrollments) as total_enrollments,
    (SELECT COUNT(*) FROM asn_daily_reports) as total_asn_reports,
    (SELECT COUNT(*) FROM financial_budgets) as total_budgets;

-- =============================================
-- Success Summary
-- =============================================
SELECT '✅ MASTER DATABASE SETUP COMPLETE!' AS status;
SELECT '📊 Database Statistics:' AS info;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'portal_terintegrasi' AND table_type = 'BASE TABLE';
SELECT COUNT(*) as total_views FROM information_schema.views 
WHERE table_schema = 'portal_terintegrasi';
SELECT * FROM v_admin_dashboard_stats;
