import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { newsAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNews, setEditingNews] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category_id: '',
        is_published: false,
        is_featured: false,
        image: null
    });

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Fetch news and categories
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [newsRes, categoriesRes] = await Promise.all([
                newsAPI.getAll({ limit: 100 }),
                newsAPI.getCategories()
            ]);

            setNews(newsRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('excerpt', formData.excerpt);
            data.append('content', formData.content);
            data.append('category_id', formData.category_id);
            data.append('is_published', formData.is_published ? '1' : '0');
            data.append('is_featured', formData.is_featured ? '1' : '0');

            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingNews) {
                await newsAPI.update(editingNews.id, data);
            } else {
                await newsAPI.create(data);
            }

            // Reset form and refresh data
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                category_id: '',
                is_published: false,
                is_featured: false,
                image: null
            });
            setEditingNews(null);
            setShowForm(false);
            fetchData();

            alert(editingNews ? 'Berita berhasil diupdate!' : 'Berita berhasil dibuat!');
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Gagal menyimpan berita'));
        }
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        setFormData({
            title: newsItem.title,
            excerpt: newsItem.excerpt || '',
            content: newsItem.content,
            category_id: newsItem.category_id,
            is_published: newsItem.is_published,
            is_featured: newsItem.is_featured,
            image: null // Reset image on edit
        });
        setShowForm(true);
    };

    // ... handleDelete ...

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return <div className="admin-loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            {/* ... Header ... */}
            <div className="admin-header glass-dark">
                <div className="admin-header-content">
                    <div>
                        <h1 className="admin-title gradient-text">Admin Dashboard</h1>
                        <p className="admin-subtitle">Selamat datang, {user?.full_name}</p>
                    </div>
                    <div className="admin-actions">
                        <a href="https://keuangan.uptpelatihanpertanian.id" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginRight: '0.5rem' }}>
                            💰 Keuangan
                        </a>
                        <a href="https://skp.uptpelatihanpertanian.id" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginRight: '0.5rem' }}>
                            📝 SKP
                        </a>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowForm(!showForm);
                                setEditingNews(null);
                                setFormData({
                                    title: '',
                                    excerpt: '',
                                    content: '',
                                    category_id: '',
                                    is_published: false,
                                    is_featured: false,
                                    image: null
                                });
                            }}
                        >
                            {showForm ? '✕ Tutup' : '✚ Buat Berita Baru'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/')}>
                            🏠 Ke Beranda
                        </button>
                        <button className="btn btn-outline" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-container">
                {/* ... Stats ... */}
                <div className="admin-stats">
                    <div className="stat-card glass">
                        <div className="stat-value">{news.length}</div>
                        <div className="stat-label">Total Berita</div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-value">{news.filter(n => n.is_published).length}</div>
                        <div className="stat-label">Dipublikasi</div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-value">{news.filter(n => n.is_featured).length}</div>
                        <div className="stat-label">Featured</div>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="news-form glass">
                        <h2 className="form-title">{editingNews ? 'Edit Berita' : 'Buat Berita Baru'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Judul Berita *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kategori *</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Gambar Utama</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    accept="image/*"
                                    className="form-input"
                                />
                                <small style={{ color: '#aaa' }}>Format: JPG, PNG, GIF (Max 5MB)</small>
                            </div>

                            <div className="form-group">
                                <label>Ringkasan</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label>Konten Berita *</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    required
                                    rows="8"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="is_published">Publikasikan</label>
                                </div>
                                <div className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        name="is_featured"
                                        checked={formData.is_featured}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="is_featured">Featured</label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-success">
                                    {editingNews ? 'Update Berita' : 'Simpan Berita'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingNews(null);
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* News List */}
                <div className="news-list">
                    <h2 className="list-title">Daftar Berita</h2>
                    <div className="news-table-container">
                        <table className="news-table">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Kategori</th>
                                    <th>Penulis</th>
                                    <th>Status</th>
                                    <th>Views</th>
                                    <th>Tanggal</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map(item => (
                                    <tr key={item.id}>
                                        <td className="td-title">{item.title}</td>
                                        <td>
                                            <span className="badge">{item.category_icon} {item.category_name}</span>
                                        </td>
                                        <td>{item.author_name}</td>
                                        <td>
                                            <span className={`status ${item.is_published ? 'published' : 'draft'}`}>
                                                {item.is_published ? '✓ Published' : '✎ Draft'}
                                            </span>
                                            {item.is_featured && <span className="badge featured">★ Featured</span>}
                                        </td>
                                        <td>{item.views}</td>
                                        <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="td-actions">
                                            <button
                                                className="btn-action edit"
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDelete(item.id)}
                                                title="Hapus"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
