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

// Import routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const bookingRoutes = require('./routes/bookings');
const lmsRoutes = require('./routes/lms');
const internalRoutes = require('./routes/internal');

// Import services
const { startEmailProcessor } = require('./services/emailService');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/internal', internalRoutes);

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
