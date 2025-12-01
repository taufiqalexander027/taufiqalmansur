const db = require('../config/database');

// --- User Profile ---

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query('SELECT * FROM skp_user_profiles WHERE user_id = ?', [userId]);

        if (rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    nama: '',
                    nip: '',
                    pangkat: '',
                    golongan: '',
                    jabatan: '',
                    unitKerja: '',
                    kota: 'Malang'
                }
            });
        }

        // Map DB columns to frontend camelCase
        const profile = rows[0];
        res.json({
            success: true,
            data: {
                nama: profile.nama,
                nip: profile.nip,
                pangkat: profile.pangkat,
                golongan: profile.golongan,
                jabatan: profile.jabatan,
                unitKerja: profile.unit_kerja,
                kota: profile.kota
            }
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nama, nip, pangkat, golongan, jabatan, unitKerja, kota } = req.body;

        // Check if profile exists
        const [existing] = await db.query('SELECT user_id FROM skp_user_profiles WHERE user_id = ?', [userId]);

        if (existing.length > 0) {
            await db.query(
                `UPDATE skp_user_profiles 
                 SET nama = ?, nip = ?, pangkat = ?, golongan = ?, jabatan = ?, unit_kerja = ?, kota = ?
                 WHERE user_id = ?`,
                [nama, nip, pangkat, golongan, jabatan, unitKerja, kota, userId]
            );
        } else {
            await db.query(
                `INSERT INTO skp_user_profiles (user_id, nama, nip, pangkat, golongan, jabatan, unit_kerja, kota)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, nama, nip, pangkat, golongan, jabatan, unitKerja, kota]
            );
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Activities ---

exports.getActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM skp_activities WHERE user_id = ? ORDER BY date ASC',
            [userId]
        );

        // Transform for frontend
        const activities = rows.map(row => ({
            id: row.id,
            date: row.date, // MySQL date string is usually fine
            location: row.location,
            description: row.description,
            image: row.image_url
        }));

        res.json({ success: true, data: activities });
    } catch (error) {
        console.error('Get Activities Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, location, description } = req.body;

        let image_url = null;
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            image_url = `${protocol}://${host}/uploads/skp/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO skp_activities (user_id, date, location, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [userId, date, location, description, image_url]
        );

        res.json({
            success: true,
            data: {
                id: result.insertId,
                date,
                location,
                description,
                image: image_url
            }
        });
    } catch (error) {
        console.error('Create Activity Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { date, location, description } = req.body;

        // Check if activity exists and belongs to user
        const [existing] = await db.query('SELECT * FROM skp_activities WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }

        let image_url = existing[0].image_url;
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            image_url = `${protocol}://${host}/uploads/skp/${req.file.filename}`;
        }

        await db.query(
            'UPDATE skp_activities SET date = ?, location = ?, description = ?, image_url = ? WHERE id = ?',
            [date, location, description, image_url, id]
        );

        res.json({
            success: true,
            data: {
                id,
                date,
                location,
                description,
                image: image_url
            }
        });
    } catch (error) {
        console.error('Update Activity Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await db.query('DELETE FROM skp_activities WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true, message: 'Activity deleted' });
    } catch (error) {
        console.error('Delete Activity Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Assessments ---

exports.getAssessments = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM skp_assessments WHERE user_id = ? ORDER BY timestamp ASC',
            [userId]
        );

        const assessments = rows.map(row => ({
            id: row.id,
            indicator: row.indicator,
            description: row.description,
            images: row.images || [], // JSON column is automatically parsed by mysql2
            timestamp: row.timestamp,
            date: row.date,
            customTitle: row.custom_title
        }));

        res.json({ success: true, data: assessments });
    } catch (error) {
        console.error('Get Assessments Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createAssessment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { indicator, description, timestamp, date, customTitle } = req.body;

        // Handle multiple images
        let images = [];
        if (req.files && req.files.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');
            images = req.files.map(file => `${protocol}://${host}/uploads/skp/${file.filename}`);
        }

        const [result] = await db.query(
            'INSERT INTO skp_assessments (user_id, indicator, description, images, timestamp, date, custom_title) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, indicator, description, JSON.stringify(images), timestamp, date, customTitle]
        );

        res.json({
            success: true,
            data: {
                id: result.insertId,
                indicator,
                description,
                images,
                timestamp,
                date,
                customTitle
            }
        });
    } catch (error) {
        console.error('Create Assessment Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateAssessment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { indicator, description, timestamp, date, customTitle } = req.body;

        // Check if assessment exists
        const [existing] = await db.query('SELECT * FROM skp_assessments WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        let images = existing[0].images || [];
        // If new images are uploaded, we might want to append or replace.
        // For simplicity, let's say if new images are provided, they REPLACE the old ones (or append? usually replace in simple forms).
        // But wait, the form might send existing images as strings and new images as files?
        // Let's assume for now we just handle new uploads.
        // If the frontend sends 'existingImages' we could keep them.
        // But `multer` only handles files.

        // Let's assume if files are uploaded, we use them. If not, we keep existing?
        // Or better: The frontend should handle the logic.
        // For now, let's just say if files are uploaded, they become the new images.

        if (req.files && req.files.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');
            images = req.files.map(file => `${protocol}://${host}/uploads/skp/${file.filename}`);
        }

        await db.query(
            'UPDATE skp_assessments SET indicator = ?, description = ?, images = ?, timestamp = ?, date = ?, custom_title = ? WHERE id = ?',
            [indicator, description, JSON.stringify(images), timestamp, date, customTitle, id]
        );

        res.json({
            success: true,
            data: {
                id,
                indicator,
                description,
                images,
                timestamp,
                date,
                customTitle
            }
        });
    } catch (error) {
        console.error('Update Assessment Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteAssessment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await db.query('DELETE FROM skp_assessments WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true, message: 'Assessment deleted' });
    } catch (error) {
        console.error('Delete Assessment Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
