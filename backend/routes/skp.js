const express = require('express');
const router = express.Router();
const skpController = require('../controllers/skpController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Reusing existing upload middleware

// Configure upload for SKP (we might need to adjust destination if we want separate folders, 
// but for now reusing 'uploads/news' or creating a new middleware instance is fine.
// Actually, let's create a specific middleware instance for SKP if needed, 
// OR just use the existing one which saves to 'uploads/news'. 
// To keep it clean, let's modify the upload middleware to support dynamic folders or just use a generic one.
// For simplicity, I'll use the existing one, but I should probably create a specific one for SKP 
// if I want them in 'uploads/skp'.
// Let's check 'backend/middleware/upload.js' again.
// It hardcodes 'uploads/news'. I should make it more flexible or create a new one.
// I'll create a new one for SKP to avoid breaking existing stuff.

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/skp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const skpUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});


// Profile Routes
router.get('/profile', auth, skpController.getProfile);
router.put('/profile', auth, skpController.updateProfile);

// Activity Routes
router.get('/activities', auth, skpController.getActivities);
router.post('/activities', auth, skpUpload.single('image'), skpController.createActivity);
router.put('/activities/:id', auth, skpUpload.single('image'), skpController.updateActivity);
router.delete('/activities/:id', auth, skpController.deleteActivity);

// Assessment Routes
router.get('/assessments', auth, skpController.getAssessments);
router.post('/assessments', auth, skpUpload.array('images', 5), skpController.createAssessment);
router.put('/assessments/:id', auth, skpUpload.array('images', 5), skpController.updateAssessment);
router.delete('/assessments/:id', auth, skpController.deleteAssessment);

module.exports = router;
