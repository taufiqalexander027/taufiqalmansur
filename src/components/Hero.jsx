import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-background">
                <div className="hero-gradient"></div>
            </div>

            <div className="hero-content">
                <div className="container">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="gradient-text">Portal Berita</span>
                            <br />
                            <span>& Layanan Premium</span>
                        </h1>
                        <p className="hero-subtitle">
                            Informasi Terkini, Layanan Terbaik, dan Transparansi Keuangan dalam Satu Platform
                        </p>
                        <div className="hero-buttons">
                            <button
                                className="btn btn-hero-primary"
                                onClick={() => document.getElementById('berita').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Jelajahi Berita
                            </button>
                            <button
                                className="btn btn-hero-outline"
                                onClick={() => document.getElementById('layanan').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Lihat Layanan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="scroll-indicator">
                    <div className="scroll-icon"></div>
                    <span className="scroll-text">Scroll ke bawah</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
