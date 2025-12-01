import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsAPI } from '../services/api';
import Navbar from './Navbar';
import './NewsDetail.css';

const NewsDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsAPI.getBySlug(slug);
                if (response.data.success) {
                    setNews(response.data.data);
                } else {
                    setError('Berita tidak ditemukan');
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Gagal memuat berita. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchNews();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="news-detail-loading">
                <div className="loader"></div>
                <p>Memuat berita...</p>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="news-detail-error">
                <div className="error-card glass">
                    <h2>😕 Oops!</h2>
                    <p>{error || 'Berita tidak ditemukan'}</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar isLoggedIn={false} /> {/* Navbar for public view */}
            <div className="news-detail-page">
                <div className="container">
                    <article className="news-article glass">
                        <header className="article-header">
                            <div className="article-meta">
                                <span className="article-category">{news.category_name}</span>
                                <span className="article-date">
                                    {new Date(news.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <h1 className="article-title">{news.title}</h1>
                            <div className="article-author">
                                <span className="author-avatar">👤</span>
                                <span className="author-name">Oleh: {news.author_name || 'Admin'}</span>
                            </div>
                        </header>

                        {news.image_url && (
                            <div className="article-image">
                                <img src={news.image_url} alt={news.title} />
                            </div>
                        )}

                        <div className="article-content">
                            {news.content.split('\n').map((paragraph, index) => (
                                paragraph.trim() && <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        <footer className="article-footer">
                            <button onClick={() => navigate('/')} className="btn btn-secondary">
                                ← Kembali ke Beranda
                            </button>
                        </footer>
                    </article>
                </div>
            </div>
        </>
    );
};

export default NewsDetail;
