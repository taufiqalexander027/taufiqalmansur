const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { auth, checkRole, logActivity } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/categories', newsController.getCategories);
router.get('/:slug', newsController.getNewsBySlug);

// Protected routes (Admin only)
router.post('/',
    auth,
    checkRole('admin'),
    upload.single('image'),
    logActivity('CREATE', 'news'),
    newsController.createNews
);

router.put('/:id',
    auth,
    checkRole('admin'),
    upload.single('image'),
    logActivity('UPDATE', 'news'),
    newsController.updateNews
);

router.delete('/:id',
    auth,
    checkRole('admin'),
    logActivity('DELETE', 'news'),
    newsController.deleteNews
);

module.exports = router;
