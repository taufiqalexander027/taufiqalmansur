const db = require('../config/database');

// Helper function untuk generate slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getAllNews = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            featured,
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM v_news_full WHERE is_published = TRUE';
        let countQuery = 'SELECT COUNT(*) as total FROM news WHERE is_published = TRUE';
        let queryParams = [];
        let countParams = [];

        // Add filters
        if (category) {
            query += ' AND category_slug = ?';
            countQuery += ' AND category_id = (SELECT id FROM news_categories WHERE slug = ?)';
            queryParams.push(category);
            countParams.push(category);
        }

        if (featured === 'true') {
            query += ' AND is_featured = TRUE';
            countQuery += ' AND is_featured = TRUE';
        }

        if (search) {
            query += ' AND (title LIKE ? OR content LIKE ?)';
            countQuery += ' AND (title LIKE ? OR content LIKE ?)';
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Add sorting and pagination
        query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        // Execute queries
        const [news] = await db.query(query, queryParams);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: news,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('GetAllNews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching news'
        });
    }
};

// @desc    Get single news by slug
// @route   GET /api/news/:slug
// @access  Public
exports.getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [news] = await db.query(
            'SELECT * FROM v_news_full WHERE slug = ? AND is_published = TRUE',
            [slug]
        );

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Increment views
        await db.query(
            'UPDATE news SET views = views + 1 WHERE id = ?',
            [news[0].id]
        );

        res.json({
            success: true,
            data: news[0]
        });
    } catch (error) {
        console.error('GetNewsBySlug error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res) => {
    try {
        const {
            title,
            excerpt,
            content,
            category_id,
            is_published = false,
            is_featured = false
        } = req.body;

        if (!title || !content || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and category are required'
            });
        }

        const slug = generateSlug(title);
        const author_id = req.user.id;
        const published_at = is_published ? new Date() : null;

        const [result] = await db.query(
            `INSERT INTO news (title, slug, excerpt, content, category_id, author_id, is_published, is_featured, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, slug, excerpt, content, category_id, author_id, is_published, is_featured, published_at]
        );

        // Get created news
        const [news] = await db.query(
            'SELECT * FROM v_news_full WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            data: news[0]
        });
    } catch (error) {
        console.error('CreateNews error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'A news with similar title already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating news'
        });
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            excerpt,
            content,
            category_id,
            is_published,
            is_featured
        } = req.body;

        // Check if news exists
        const [existing] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        let updateFields = [];
        let updateValues = [];

        if (title) {
            updateFields.push('title = ?', 'slug = ?');
            updateValues.push(title, generateSlug(title));
        }
        if (excerpt !== undefined) {
            updateFields.push('excerpt = ?');
            updateValues.push(excerpt);
        }
        if (content) {
            updateFields.push('content = ?');
            updateValues.push(content);
        }
        if (category_id) {
            updateFields.push('category_id = ?');
            updateValues.push(category_id);
        }
        if (is_published !== undefined) {
            updateFields.push('is_published = ?');
            updateValues.push(is_published);
            if (is_published && !existing[0].published_at) {
                updateFields.push('published_at = NOW()');
            }
        }
        if (is_featured !== undefined) {
            updateFields.push('is_featured = ?');
            updateValues.push(is_featured);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id);

        await db.query(
            `UPDATE news SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Get updated news
        const [news] = await db.query(
            'SELECT * FROM v_news_full WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'News updated successfully',
            data: news[0]
        });
    } catch (error) {
        console.error('UpdateNews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating news'
        });
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM news WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        res.json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        console.error('DeleteNews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting news'
        });
    }
};

// @desc    Get all categories
// @route   GET /api/news/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM news_categories ORDER BY name');

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('GetCategories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
