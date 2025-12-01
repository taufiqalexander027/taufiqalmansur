const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, logActivity } = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required')
];

// Routes
router.post('/register', registerValidation, logActivity('REGISTER'), authController.register);
router.post('/login', logActivity('LOGIN'), authController.login);
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, logActivity('LOGOUT'), authController.logout);

module.exports = router;
