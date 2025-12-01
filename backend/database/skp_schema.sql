-- SKP User Profiles
CREATE TABLE IF NOT EXISTS skp_user_profiles (
    user_id INT PRIMARY KEY,
    nama VARCHAR(255),
    nip VARCHAR(50),
    pangkat VARCHAR(100),
    golongan VARCHAR(50),
    jabatan VARCHAR(255),
    unit_kerja VARCHAR(255),
    kota VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SKP Activities (Log Harian)
CREATE TABLE IF NOT EXISTS skp_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SKP Assessments (Laporan Bulanan/Triwulan)
CREATE TABLE IF NOT EXISTS skp_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    indicator VARCHAR(255),
    description TEXT,
    images JSON,
    timestamp DATETIME,
    date DATE,
    custom_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
