require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/skp', express.static(path.join(__dirname, 'uploads/skp')));

// Import routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const bookingRoutes = require('./routes/bookings');
const lmsRoutes = require('./routes/lms');
const internalRoutes = require('./routes/internal');
const skpRoutes = require('./routes/skp');
const financeRoutes = require('./routes/finance');

// Import services
const { startEmailProcessor } = require('./services/emailService');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/skp', skpRoutes);
app.use('/api/finance', financeRoutes);

// Start email processor
startEmailProcessor();

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Portal Backend is running',
        timestamp: new Date().toISOString()
    });
});

// DEBUG ROUTE: Reset Admin User
// TODO: Remove this in production after successful login
const bcrypt = require('bcryptjs');
const db = require('./config/database');

app.get('/api/debug/reset-admin', async (req, res) => {
    try {
        const passwordHash = '$2b$10$ABkSip.XtB2fwWvXumMEleOOVqAHdKghcvil/kKtij4rdLxr2PRyC'; // admin123

        // Check if admin exists
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);

        if (users.length > 0) {
            // Update existing admin
            await db.query('UPDATE users SET password = ?, role_id = 3, is_active = TRUE WHERE username = ?', [passwordHash, 'admin']);
            return res.json({ success: true, message: 'Admin user updated successfully. Login with admin / admin123' });
        } else {
            // Create new admin
            await db.query(
                'INSERT INTO users (username, email, password, full_name, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                ['admin', 'admin@portal.local', passwordHash, 'Administrator', 3, true]
            );
            return res.json({ success: true, message: 'Admin user created successfully. Login with admin / admin123' });
        }
    } catch (error) {
        console.error('Reset admin error:', error);
        res.status(500).json({ success: false, message: error.message, stack: error.stack });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Root route for Railway health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Portal Backend is running',
        service: 'premium-news-app-backend'
    });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Listening on 0.0.0.0:${PORT}`);
});

module.exports = app;
