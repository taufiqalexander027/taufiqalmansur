const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { auth, checkRole, logActivity } = require('../middleware/auth');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/categories', newsController.getCategories);
router.get('/:slug', newsController.getNewsBySlug);

// Protected routes (Admin only)
router.post('/',
    auth,
    checkRole('admin'),
    logActivity('CREATE', 'news'),
    newsController.createNews
);

router.put('/:id',
    auth,
    checkRole('admin'),
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
