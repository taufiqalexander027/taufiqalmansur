const db = require('../config/database');

// Helper: Generate unique booking code
const generateBookingCode = (serviceSlug) => {
    const prefix = serviceSlug === 'field-visit' ? 'FV' :
        serviceSlug === 'venue-rental' ? 'VR' : 'ER';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const {
            service_type_slug,
            facility_id,
            contact_name,
            contact_phone,
            contact_email,
            organization,
            purpose,
            start_date,
            end_date,
            num_participants,
            visit_location,
            visit_objectives,
            rental_items,
            special_requirements
        } = req.body;

        // Get service type
        const [serviceTypes] = await db.query(
            'SELECT id, slug FROM service_types WHERE slug = ? AND is_active = TRUE',
            [service_type_slug]
        );

        if (serviceTypes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tipe layanan tidak valid'
            });
        }

        const serviceTypeId = serviceTypes[0].id;
        const bookingCode = generateBookingCode(service_type_slug);

        // Calculate cost if facility selected
        let totalCost = 0;
        if (facility_id) {
            const [facilities] = await db.query(
                'SELECT price_per_day FROM facilities WHERE id = ? AND is_available = TRUE',
                [facility_id]
            );

            if (facilities.length > 0) {
                const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1;
                totalCost = facilities[0].price_per_day * days;
            }
        }

        // Insert booking
        const [result] = await db.query(
            `INSERT INTO bookings (
        booking_code, service_type_id, facility_id, user_id,
        contact_name, contact_phone, contact_email, organization,
        purpose, start_date, end_date, num_participants,
        visit_location, visit_objectives, rental_items, special_requirements,
        total_cost, status_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                bookingCode, serviceTypeId, facility_id || null, req.user.id,
                contact_name, contact_phone, contact_email, organization || null,
                purpose, start_date, end_date, num_participants || null,
                visit_location || null, visit_objectives || null, rental_items || null, special_requirements || null,
                totalCost
            ]
        );

        // Block dates if facility booking
        if (facility_id) {
            const startD = new Date(start_date);
            const endD = new Date(end_date);
            const dates = [];
            for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
                dates.push([facility_id, result.insertId, new Date(d).toISOString().split('T')[0]]);
            }

            if (dates.length > 0) {
                await db.query(
                    'INSERT INTO booking_availability (facility_id, booking_id, date) VALUES ?',
                    [dates]
                );
            }
        }

        // Queue email notification
        await db.query(
            `INSERT INTO email_queue (recipient_email, recipient_name, subject, body, template_name, related_entity_type, related_entity_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                contact_email,
                contact_name,
                `Booking Confirmation - ${bookingCode}`,
                `Terima kasih telah melakukan pemesanan. Kode booking Anda: ${bookingCode}. Kami akan menghubungi Anda segera.`,
                'booking_confirmation',
                'booking',
                result.insertId
            ]
        );

        // Get created booking
        const [bookings] = await db.query(
            'SELECT * FROM v_bookings_full WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Booking berhasil dibuat',
            data: bookings[0]
        });
    } catch (error) {
        console.error('CreateBooking error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat booking'
        });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const [bookings] = await db.query(
            'SELECT * FROM v_bookings_full WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('GetMyBookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data booking'
        });
    }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const { status, service_type } = req.query;

        let query = 'SELECT * FROM v_bookings_full WHERE 1=1';
        let params = [];

        if (status) {
            query += ' AND status_name = ?';
            params.push(status);
        }

        if (service_type) {
            query += ' AND service_type_slug = ?';
            params.push(service_type);
        }

        query += ' ORDER BY created_at DESC';

        const [bookings] = await db.query(query, params);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('GetAllBookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data booking'
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        // Get status ID
        const [statuses] = await db.query(
            'SELECT id FROM booking_statuses WHERE name = ?',
            [status]
        );

        if (statuses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid'
            });
        }

        const statusId = statuses[0].id;
        const approved_at = status === 'approved' ? new Date() : null;

        // Update booking
        await db.query(
            `UPDATE bookings 
       SET status_id = ?, admin_notes = ?, approved_by = ?, approved_at = ?
       WHERE id = ?`,
            [statusId, admin_notes || null, req.user.id, approved_at, id]
        );

        // Get updated booking
        const [bookings] = await db.query(
            'SELECT * FROM v_bookings_full WHERE id = ?',
            [id]
        );

        if (bookings.length > 0) {
            // Queue status update email
            await db.query(
                `INSERT INTO email_queue (recipient_email, recipient_name, subject, body, template_name, related_entity_type, related_entity_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookings[0].contact_email,
                    bookings[0].contact_name,
                    `Booking ${bookings[0].booking_code} - Status Update`,
                    `Status booking Anda telah diupdate menjadi: ${status.toUpperCase()}. ${admin_notes || ''}`,
                    'booking_status_update',
                    'booking',
                    id
                ]
            );
        }

        res.json({
            success: true,
            message: 'Status booking berhasil diupdate',
            data: bookings[0]
        });
    } catch (error) {
        console.error('UpdateBookingStatus error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate status booking'
        });
    }
};

// @desc    Get available facilities
// @route   GET /api/bookings/facilities
// @access  Public
exports.getFacilities = async (req, res) => {
    try {
        const { service_type, start_date, end_date } = req.query;

        let query = `
      SELECT f.* 
      FROM facilities f
      JOIN service_types st ON f.service_type_id = st.id
      WHERE f.is_available = TRUE
    `;
        let params = [];

        if (service_type) {
            query += ' AND st.slug = ?';
            params.push(service_type);
        }

        // Check availability if dates provided
        if (start_date && end_date) {
            query += `
        AND f.id NOT IN (
          SELECT DISTINCT facility_id 
          FROM booking_availability 
          WHERE date BETWEEN ? AND ?
          AND is_blocked = TRUE
        )
      `;
            params.push(start_date, end_date);
        }

        const [facilities] = await db.query(query, params);

        res.json({
            success: true,
            data: facilities
        });
    } catch (error) {
        console.error('GetFacilities error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data fasilitas'
        });
    }
};

// @desc    Check availability
// @route   GET /api/bookings/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
    try {
        const { facility_id, start_date, end_date } = req.query;

        if (!facility_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Parameter tidak lengkap'
            });
        }

        const [blocked] = await db.query(
            `SELECT COUNT(*) as count 
       FROM booking_availability 
       WHERE facility_id = ? 
       AND date BETWEEN ? AND ?
       AND is_blocked = TRUE`,
            [facility_id, start_date, end_date]
        );

        res.json({
            success: true,
            available: blocked[0].count === 0,
            message: blocked[0].count === 0 ? 'Tersedia' : 'Tidak tersedia'
        });
    } catch (error) {
        console.error('CheckAvailability error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memeriksa ketersediaan'
        });
    }
};

exports.getServiceTypes = async (req, res) => {
    try {
        const [types] = await db.query(
            'SELECT * FROM service_types WHERE is_active = TRUE'
        );

        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('GetServiceTypes error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil tipe layanan'
        });
    }
};
