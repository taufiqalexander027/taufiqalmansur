const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware untuk verify JWT token
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const [users] = await db.query(
            `SELECT u.id, u.username, u.email, u.full_name, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Middleware untuk check role
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role_name)) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Insufficient permissions.'
            });
        }

        next();
    };
};

// Middleware untuk log activity
const logActivity = (action, entityType = null) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id || null;
            const entityId = req.params.id || req.body.id || null;
            const description = `${action} ${entityType || ''}`.trim();
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            await db.query(
                `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, action, entityType, entityId, description, ipAddress, userAgent]
            );
        } catch (error) {
            console.error('Activity logging error:', error);
            // Don't fail the request if logging fails
        }
        next();
    };
};

module.exports = { auth, checkRole, logActivity };
