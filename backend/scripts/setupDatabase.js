require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupCompleteDatabase() {
    let connection;

    try {
        console.log('🚀 Starting COMPLETE database setup...\n');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server\n');

        const schemaFiles = [
            'schema.sql',                      // Fase 1: Base + Auth + News
            'fase2_bookings_schema.sql',      // Fase 2: Booking System
            'fase3_lms_schema.sql',           // Fase 3: LMS
            'fase4_internal_systems_schema.sql' // Fase 4: Internal Systems
        ];

        for (const file of schemaFiles) {
            const filePath = path.join(__dirname, '../database', file);

            if (fs.existsSync(filePath)) {
                console.log(`📄 Executing ${file}...`);
                const schema = fs.readFileSync(filePath, 'utf8');
                await connection.query(schema);
                console.log(`✅ ${file} completed\n`);
            } else {
                console.log(`⚠️  ${file} not found, skipping...\n`);
            }
        }

        console.log('\n🎉 ===== DATABASE SETUP COMPLETE! =====\n');
        console.log('📊 Database Details:');
        console.log(`   Database: ${process.env.DB_NAME || 'portal_terintegrasi'}`);
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Port: ${process.env.DB_PORT || 3306}\n`);

        console.log('🔐 Default Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Role: admin (full access)\n');

        console.log('✅ Available Features:');
        console.log('   📰 News Management');
        console.log('   📅 Booking System (Field Visit, Venue, Equipment)');
        console.log('   🎓 LMS Platform (Courses, Enrollment, Progress)');
        console.log('   📊 ASN Daily Reports');
        console.log('   💰 Financial Management\n');

        console.log('🚀 Ready to start server!');
        console.log('   Run: npm run dev\n');

    } catch (error) {
        console.error('\n❌ Error setting up database:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure MySQL is running');
        console.error('2. Check credentials in backend/.env');
        console.error('3. Ensure user has CREATE DATABASE permissions\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupCompleteDatabase();
