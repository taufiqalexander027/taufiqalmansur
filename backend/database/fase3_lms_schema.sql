-- =============================================
-- FASE 3: LMS (Learning Management System) SCHEMA
-- Tables untuk Course Management, Enrollment, Progress
-- =============================================

-- USE portal_terintegrasi;

-- =============================================
-- COURSE CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS course_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO course_categories (name, slug, description, icon) VALUES
('Pertanian Modern', 'modern-agriculture', 'Teknik pertanian modern dan sustainable', '🌾'),
('Teknologi Pertanian', 'agritech', 'IoT, sensor, dan teknologi di bidang pertanian', '🤖'),
('Bisnis Pertanian', 'agribusiness', 'Manajemen dan pemasaran produk pertanian', '💼'),
('Pengolahan Hasil', 'post-harvest', 'Pengolahan dan packaging hasil pertanian', '📦');

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    category_id INT NOT NULL,
    instructor_id INT NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_hours INT,
    price DECIMAL(15,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    enrollment_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_published (is_published),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- COURSE MODULES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS course_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_order (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration_minutes INT,
    order_number INT NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_module (module_id),
    INDEX idx_order (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ENROLLMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress_percentage INT DEFAULT 0,
    last_accessed_at TIMESTAMP NULL,
    certificate_issued BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (course_id, user_id),
    INDEX idx_user (user_id),
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- LESSON PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    lesson_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (enrollment_id, lesson_id),
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- QUIZZES TABLE (Optional)
-- =============================================
CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INT DEFAULT 70,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- QUIZ QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer ENUM('a', 'b', 'c', 'd') NOT NULL,
    explanation TEXT,
    order_number INT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- QUIZ ATTEMPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT,
    passed BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CERTIFICATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url VARCHAR(500),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_number (certificate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Sample Data
-- =============================================

-- Sample course
INSERT IGNORE INTO courses (title, slug, description, category_id, instructor_id, level, duration_hours, price, is_published, is_featured) VALUES
('Hidroponik untuk Pemula', 'hidroponik-pemula', 'Belajar teknik budidaya tanaman tanpa tanah menggunakan sistem hidroponik', 1, 1, 'beginner', 8, 0, TRUE, TRUE);

SET @course_id = LAST_INSERT_ID();

-- Sample modules
INSERT IGNORE INTO course_modules (course_id, title, description, order_number) VALUES
(@course_id, 'Pengenalan Hidroponik', 'Dasar-dasar sistem hidroponik dan keuntungannya', 1),
(@course_id, 'Sistem dan Peralatan', 'Jenis-jenis sistem hidroponik dan peralatan yang dibutuhkan', 2),
(@course_id, 'Nutrisi dan pH', 'Manajemen nutrisi dan pH dalam sistem hidroponik', 3);

-- =============================================
-- Views
-- =============================================

CREATE OR REPLACE VIEW v_courses_full AS
SELECT 
    c.id,
    c.title,
    c.slug,
    c.description,
    c.thumbnail_url,
    c.level,
    c.duration_hours,
    c.price,
    c.is_published,
    c.is_featured,
    c.enrollment_count,
    c.rating,
    c.created_at,
    cat.name AS category_name,
    cat.icon AS category_icon,
    u.full_name AS instructor_name,
    (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) AS module_count,
    (SELECT COUNT(*) FROM lessons l 
     JOIN course_modules m ON l.module_id = m.id 
     WHERE m.course_id = c.id) AS lesson_count
FROM courses c
JOIN course_categories cat ON c.category_id = cat.id
JOIN users u ON c.instructor_id = u.id;

CREATE OR REPLACE VIEW v_enrollments_full AS
SELECT 
    e.id,
    e.enrolled_at,
    e.completed_at,
    e.progress_percentage,
    e.last_accessed_at,
    e.certificate_issued,
    c.title AS course_title,
    c.slug AS course_slug,
    u.full_name AS student_name,
    u.username AS student_username
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON e.user_id = u.id;

SELECT '✅ LMS schema created successfully!' AS status;
SELECT COUNT(*) AS total_courses FROM courses;
SELECT COUNT(*) AS total_modules FROM course_modules;
