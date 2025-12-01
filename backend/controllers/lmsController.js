const db = require('../config/database');

// @desc    Get all courses
// @route   GET /api/lms/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
    try {
        const { category, level, featured } = req.query;

        let query = 'SELECT * FROM v_courses_full WHERE is_published = TRUE';
        let params = [];

        if (category) {
            query += ' AND category_name = ?';
            params.push(category);
        }
        if (level) {
            query += ' AND level = ?';
            params.push(level);
        }
        if (featured === 'true') {
            query += ' AND is_featured = TRUE';
        }

        query += ' ORDER BY created_at DESC';

        const [courses] = await db.query(query, params);

        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('GetAllCourses error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kursus'
        });
    }
};

// @desc    Get single course
// @route   GET /api/lms/courses/:slug
// @access  Public
exports.getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [courses] = await db.query(
            'SELECT * FROM v_courses_full WHERE slug = ? AND is_published = TRUE',
            [slug]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kursus tidak ditemukan'
            });
        }

        // Get modules and lessons
        const [modules] = await db.query(
            `SELECT m.*, 
       (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) as lesson_count
       FROM course_modules m
       WHERE m.course_id = ?
       ORDER BY m.order_number`,
            [courses[0].id]
        );

        for (let module of modules) {
            const [lessons] = await db.query(
                'SELECT * FROM lessons WHERE module_id = ? ORDER BY order_number',
                [module.id]
            );
            module.lessons = lessons;
        }

        res.json({
            success: true,
            data: {
                ...courses[0],
                modules
            }
        });
    } catch (error) {
        console.error('GetCourseBySlug error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail kursus'
        });
    }
};

// @desc    Enroll in course
// @route   POST /api/lms/courses/:id/enroll
// @access  Private
exports.enrollCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if already enrolled
        const [existing] = await db.query(
            'SELECT * FROM enrollments WHERE course_id = ? AND user_id = ?',
            [id, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah terdaftar di kursus ini'
            });
        }

        // Enroll
        await db.query(
            'INSERT INTO enrollments (course_id, user_id) VALUES (?, ?)',
            [id, userId]
        );

        // Update enrollment count
        await db.query(
            'UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?',
            [id]
        );

        res.status(201).json({
            success: true,
            message: 'Berhasil mendaftar kursus'
        });
    } catch (error) {
        console.error('EnrollCourse error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mendaftar kursus'
        });
    }
};

// @desc    Get my enrollments
// @route   GET /api/lms/my-courses
// @access  Private
exports.getMyEnrollments = async (req, res) => {
    try {
        const [enrollments] = await db.query(
            `SELECT e.*, c.* 
       FROM enrollments e
       JOIN v_courses_full c ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        console.error('GetMyEnrollments error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kursus'
        });
    }
};

// @desc    Update lesson progress
// @route   PUT /api/lms/lessons/:id/progress
// @access  Private
exports.updateLessonProgress = async (req, res) => {
    try {
        const { id: lessonId } = req.params;
        const { enrollment_id, time_spent } = req.body;

        // Check enrollment belongs to user
        const [enrollments] = await db.query(
            'SELECT * FROM enrollments WHERE id = ? AND user_id = ?',
            [enrollment_id, req.user.id]
        );

        if (enrollments.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak'
            });
        }

        // Update or insert progress
        await db.query(
            `INSERT INTO lesson_progress (enrollment_id, lesson_id, is_completed, completed_at, time_spent_seconds)
       VALUES (?, ?, TRUE, NOW(), ?)
       ON DUPLICATE KEY UPDATE 
       is_completed = TRUE, completed_at = NOW(), time_spent_seconds = time_spent_seconds + ?`,
            [enrollment_id, lessonId, time_spent || 0, time_spent || 0]
        );

        // Calculate overall progress
        const [total] = await db.query(
            `SELECT COUNT(*) as total FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE m.course_id = (SELECT course_id FROM enrollments WHERE id = ?)`,
            [enrollment_id]
        );

        const [completed] = await db.query(
            `SELECT COUNT(*) as completed FROM lesson_progress 
       WHERE enrollment_id = ? AND is_completed = TRUE`,
            [enrollment_id]
        );

        const progress = Math.round((completed[0].completed / total[0].total) * 100);

        await db.query(
            'UPDATE enrollments SET progress_percentage = ?, last_accessed_at = NOW() WHERE id = ?',
            [progress, enrollment_id]
        );

        res.json({
            success: true,
            message: 'Progress berhasil diupdate',
            data: { progress }
        });
    } catch (error) {
        console.error('UpdateLessonProgress error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate progress'
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM course_categories');
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('GetCategories error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil kategori'
        });
    }
};
