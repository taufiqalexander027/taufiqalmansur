import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { newsAPI } from '../services/api';
import axios from 'axios';
import './Services.css';

const Services = () => {
    const { isAuthenticated } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [formData, setFormData] = useState({
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        organization: '',
        purpose: '',
        start_date: '',
        end_date: '',
        num_participants: '',
        facility_id: '',
        visit_location: '',
        visit_objectives: '',
        rental_items: '',
        special_requirements: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const services = [
        {
            id: 1,
            slug: 'field-visit',
            icon: "🚜",
            title: "Kunjungan Lapang",
            description: "Kunjungan ke lokasi pertanian dan pelatihan untuk studi lapangan atau benchmarking",
            features: ["Tour Guided", "Materi Presentasi", "Dokumentasi"]
        },
        {
            id: 2,
            slug: 'venue-rental',
            icon: "🏢",
            title: "Sewa Gedung",
            description: "Penyewaan gedung dan ruangan untuk acara, seminar, workshop dan kegiatan lainnya",
            features: ["AC & Proyektor", "Sound System", "Kapasitas Besar"]
        },
        {
            id: 3,
            slug: 'equipment-rental',
            icon: "🛠️",
            title: "Sewa Peralatan",
            description: "Penyewaan peralatan pertanian modern untuk mendukung produktivitas usaha tani Anda",
            features: ["Traktor", "Alat Semprot", "Perawatan Termasuk"]
        },
        {
            id: 4,
            slug: 'lms',
            icon: "🎓",
            title: "Pelatihan Online (LMS)",
            description: "Platform pembelajaran digital dengan materi lengkap dan sertifikat resmi",
            features: ["Video Learning", "Quiz & Assessment", "Sertifikat Digital"]
        },
        {
            id: 5,
            slug: 'consulting',
            icon: "💼",
            title: "Konsultasi Pertanian",
            description: "Layanan konsultasi dan pendampingan untuk pengembangan usaha pertanian",
            features: ["Analisis Usaha", "Rencana Bisnis", "Monitoring Berkala"]
        },
        {
            id: 6,
            slug: 'info',
            icon: "📊",
            title: "Informasi & Layanan",
            description: "Informasi lengkap mengenai program, layanan, dan kegiatan UPT Pelatihan Pertanian",
            features: ["Info Program", "Jadwal Kegiatan", "Kontak Layanan"]
        }
    ];

    const openBookingModal = async (service) => {
        if (!isAuthenticated) {
            alert('Silakan login terlebih dahulu untuk melakukan pemesanan');
            window.location.href = '/login';
            return;
        }

        setSelectedService(service);

        // Load facilities untuk venue/equipment rental
        if (service.slug === 'venue-rental' || service.slug === 'equipment-rental') {
            try {
                const response = await axios.get(`${API_URL}/bookings/facilities?service_type=${service.slug}`);
                setFacilities(response.data.data || []);
            } catch (error) {
                console.error('Error loading facilities:', error);
            }
        }

        setShowModal(true);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/bookings`,
                {
                    service_type_slug: selectedService.slug,
                    ...formData
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert(`Booking berhasil dibuat! Kode booking: ${response.data.data.booking_code}`);
                setShowModal(false);
                setFormData({
                    contact_name: '',
                    contact_phone: '',
                    contact_email: '',
                    organization: '',
                    purpose: '',
                    start_date: '',
                    end_date: '',
                    num_participants: '',
                    facility_id: '',
                    visit_location: '',
                    visit_objectives: '',
                    rental_items: '',
                    special_requirements: ''
                });
            }
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Gagal membuat booking'));
        }
    };

    const isBookableService = (slug) => {
        return ['field-visit', 'venue-rental', 'equipment-rental'].includes(slug);
    };

    return (
        <section id="layanan" className="services-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="gradient-text">Layanan Kami</span>
                    </h2>
                    <p className="section-subtitle">
                        Solusi terpadu untuk kebutuhan pertanian dan pelatihan modern
                    </p>
                </div>

                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.id} className="service-card glass">
                            <div className="service-icon">{service.icon}</div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-description">{service.description}</p>

                            <ul className="service-features">
                                {service.features.map((feature, index) => (
                                    <li key={index} className="service-feature">
                                        <span className="feature-check">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="service-btn"
                                onClick={() => isBookableService(service.slug) ? openBookingModal(service) : null}
                                style={!isBookableService(service.slug) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                            >
                                {isBookableService(service.slug) ? 'Pesan Sekarang' : 'Pelajari Lebih Lanjut'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Booking Modal */}
                {showModal && selectedService && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>

                            <h2 className="modal-title">
                                {selectedService.icon} Booking {selectedService.title}
                            </h2>

                            <form onSubmit={handleSubmit} className="booking-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nama Lengkap *</label>
                                        <input
                                            type="text"
                                            name="contact_name"
                                            value={formData.contact_name}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>No. Telepon *</label>
                                        <input
                                            type="tel"
                                            name="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Organisasi/Instansi</label>
                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                {(selectedService.slug === 'venue-rental' || selectedService.slug === 'equipment-rental') && facilities.length > 0 && (
                                    <div className="form-group">
                                        <label>Pilih {selectedService.slug === 'venue-rental' ? 'Ruangan' : 'Peralatan'} *</label>
                                        <select
                                            name="facility_id"
                                            value={formData.facility_id}
                                            onChange={handleInputChange}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">-- Pilih --</option>
                                            {facilities.map(f => (
                                                <option key={f.id} value={f.id}>
                                                    {f.name} {f.price_per_day ? `- Rp ${f.price_per_day.toLocaleString()}/hari` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tanggal Mulai *</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tanggal Selesai *</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Jumlah Peserta</label>
                                    <input
                                        type="number"
                                        name="num_participants"
                                        value={formData.num_participants}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tujuan/Keperluan *</label>
                                    <textarea
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className="form-textarea"
                                    />
                                </div>

                                {selectedService.slug === 'field-visit' && (
                                    <>
                                        <div className="form-group">
                                            <label>Lokasi yang Ingin Dikunjungi</label>
                                            <input
                                                type="text"
                                                name="visit_location"
                                                value={formData.visit_location}
                                                onChange={handleInputChange}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Objektif Kunjungan</label>
                                            <textarea
                                                name="visit_objectives"
                                                value={formData.visit_objectives}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="form-textarea"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Permintaan Khusus</label>
                                    <textarea
                                        name="special_requirements"
                                        value={formData.special_requirements}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="form-textarea"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-success">
                                        Kirim Booking
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="cta-section glass-dark">
                    <h3 className="cta-title">Butuh bantuan atau informasi lebih lanjut?</h3>
                    <p className="cta-description">
                        Hubungi kami untuk konsultasi gratis dan temukan solusi terbaik untuk kebutuhan Anda
                    </p>
                    <button className="cta-btn">
                        📞 Hubungi Sekarang
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Services;
