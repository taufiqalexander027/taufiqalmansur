import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import './FloatingNews.css';

const FloatingNews = () => {
    const [isPaused, setIsPaused] = useState(false);
    const [newsItems, setNewsItems] = useState([]);
    const [featuredNews, setFeaturedNews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch news dari API
    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Get all published news untuk ticker
                const { data: allNewsData } = await newsAPI.getAll({
                    limit: 10,
                    is_published: true
                });

                // Get featured news untuk cards
                const { data: featuredData } = await newsAPI.getAll({
                    limit: 3,
                    featured: true
                });

                setNewsItems(allNewsData.data || []);
                setFeaturedNews(featuredData.data || []);
            } catch (error) {
                console.error('Error fetching news:', error);
                // Fallback ke data dummy jika API gagal
                setNewsItems([
                    {
                        id: 1,
                        title: "Peluncuran Layanan Digital Terbaru",
                        category_name: "Teknologi",
                        published_at: "2 jam yang lalu"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'Baru saja';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHrs < 1) return 'Baru saja';
        if (diffHrs < 24) return `${diffHrs} jam yang lalu`;
        if (diffDays === 1) return '1 hari yang lalu';
        return `${diffDays} hari yang lalu`;
    };

    // Duplicate items for seamless loop
    const duplicatedNews = [...newsItems, ...newsItems];

    if (loading) {
        return (
            <section id="berita" className="floating-news-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="gradient-text">Memuat Berita...</span>
                        </h2>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="berita" className="floating-news-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="gradient-text">Berita Terkini</span>
                    </h2>
                    <p className="section-subtitle">
                        Informasi dan update terbaru dari berbagai kategori
                    </p>
                </div>
            </div>

            {newsItems.length > 0 && (
                <div
                    className="news-ticker-container glass-dark"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="news-ticker-label">
                        <span className="live-dot"></span>
                        BREAKING NEWS
                    </div>

                    <div className="news-ticker-wrapper">
                        <div className={`news-ticker ${isPaused ? 'paused' : ''}`}>
                            {duplicatedNews.map((news, index) => (
                                <div key={`${news.id}-${index}`} className="news-item">
                                    <span className="news-category">{news.category_name || 'Umum'}</span>
                                    <span className="news-title">{news.title}</span>
                                    <span className="news-time">{formatTime(news.published_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* News Cards Grid */}
            <div className="container">
                <div className="news-grid">
                    {(featuredNews.length > 0 ? featuredNews : newsItems.slice(0, 3)).map((news) => (
                        <div key={news.id} className="news-card glass">
                            <div className="news-card-header">
                                <span className="news-card-category">{news.category_name || 'Umum'}</span>
                                <span className="news-card-time">{formatTime(news.published_at)}</span>
                            </div>
                            <h3 className="news-card-title">{news.title}</h3>
                            <p className="news-card-excerpt">
                                {news.excerpt || 'Baca selengkapnya untuk informasi detail mengenai berita ini.'}
                            </p>
                            <button className="news-card-btn" onClick={() => window.location.href = `/news/${news.slug}`}>
                                Baca Selengkapnya →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FloatingNews;
