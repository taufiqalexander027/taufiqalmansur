const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, checkRole, logActivity } = require('../middleware/auth');

// Public routes
router.get('/service-types', bookingController.getServiceTypes);
router.get('/facilities', bookingController.getFacilities);
router.get('/check-availability', bookingController.checkAvailability);

// Protected routes (any authenticated user)
router.post('/',
    auth,
    logActivity('CREATE', 'booking'),
    bookingController.createBooking
);

router.get('/my-bookings',
    auth,
    bookingController.getMyBookings
);

// Admin routes
router.get('/',
    auth,
    checkRole('admin', 'staff'),
    bookingController.getAllBookings
);

router.put('/:id/status',
    auth,
    checkRole('admin', 'staff'),
    logActivity('UPDATE_STATUS', 'booking'),
    bookingController.updateBookingStatus
);

module.exports = router;
