const express = require('express');
const router = express.Router();
const lmsController = require('../controllers/lmsController');
const { auth, checkRole } = require('../middleware/auth');

// Public routes
router.get('/courses', lmsController.getAllCourses);
router.get('/courses/:slug', lmsController.getCourseBySlug);
router.get('/categories', lmsController.getCategories);

// Protected routes
router.post('/courses/:id/enroll', auth, lmsController.enrollCourse);
router.get('/my-courses', auth, lmsController.getMyEnrollments);
router.put('/lessons/:id/progress', auth, lmsController.updateLessonProgress);

module.exports = router;
