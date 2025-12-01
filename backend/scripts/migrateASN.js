require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Migration Tool: Port 5001 (E-Laporan ASN) → Portal Terintegrasi
 * 
 * This script migrates data from old E-Laporan ASN system to integrated portal
 */

const OLD_DB_CONFIG = {
    host: process.env.OLD_ASN_DB_HOST || 'localhost',
    user: process.env.OLD_ASN_DB_USER || 'root',
    password: process.env.OLD_ASN_DB_PASSWORD || '',
    database: process.env.OLD_ASN_DB_NAME || 'e_laporan_asn',
    port: process.env.OLD_ASN_DB_PORT || 3306
};

const NEW_DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal_terintegrasi',
    port: process.env.DB_PORT || 3306
};

async function migrateASNReports() {
    let oldConn, newConn;

    try {
        console.log('🚀 Starting ASN Reports Migration...\n');

        // Connect to databases
        oldConn = await mysql.createConnection(OLD_DB_CONFIG);
        newConn = await mysql.createConnection(NEW_DB_CONFIG);

        console.log('✅ Connected to both databases\n');

        // === MIGRATE USERS (if needed) ===
        console.log('📊 Migrating users...');
        const [oldUsers] = await oldConn.query(`
      SELECT id, username, email, full_name 
      FROM users 
      WHERE role = 'staff' OR role = 'admin'
    `);

        for (const user of oldUsers) {
            // Check if user exists in new system
            const [existing] = await newConn.query(
                'SELECT id FROM users WHERE email = ?',
                [user.email]
            );

            if (existing.length === 0) {
                // Create user (with default password, they need to reset)
                const bcrypt = require('bcryptjs');
                const defaultPassword = await bcrypt.hash('change_me_123', 10);

                await newConn.query(
                    `INSERT INTO users (username, email, full_name, password, role_id) 
           VALUES (?, ?, ?, ?, 2)`,
                    [user.username, user.email, user.full_name, defaultPassword]
                );
                console.log(`  ✓ Created user: ${user.username}`);
            } else {
                console.log(`  ⚠ User exists: ${user.username}`);
            }
        }

        // === MIGRATE DAILY REPORTS ===
        console.log('\n📊 Migrating daily reports...');

        // Assuming old table structure (adjust based on actual schema)
        const [oldReports] = await oldConn.query(`
      SELECT 
        user_id,
        report_date,
        activity_description,
        work_hours,
        location,
        notes,
        photo_path as photo_documentation,
        created_at
      FROM daily_reports
      ORDER BY report_date DESC
    `);

        let migratedCount = 0;
        for (const report of oldReports) {
            // Map old user_id to new user_id
            const [oldUser] = await oldConn.query('SELECT email FROM users WHERE id = ?', [report.user_id]);
            if (oldUser.length === 0) continue;

            const [newUser] = await newConn.query('SELECT id FROM users WHERE email = ?', [oldUser[0].email]);
            if (newUser.length === 0) continue;

            const newUserId = newUser[0].id;

            // Check if report already exists
            const [existing] = await newConn.query(
                'SELECT id FROM asn_daily_reports WHERE user_id = ? AND report_date = ?',
                [newUserId, report.report_date]
            );

            if (existing.length === 0) {
                await newConn.query(
                    `INSERT INTO asn_daily_reports 
           (user_id, report_date, activity_description, work_hours, location, notes, photo_documentation, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newUserId,
                        report.report_date,
                        report.activity_description,
                        report.work_hours,
                        report.location,
                        report.notes,
                        report.photo_documentation,
                        report.created_at
                    ]
                );
                migratedCount++;
            }
        }

        console.log(`  ✓ Migrated ${migratedCount} daily reports`);

        // === MIGRATE BERAKHLAK ASSESSMENTS ===
        console.log('\n📊 Migrating Berakhlak assessments...');

        const [oldAssessments] = await oldConn.query(`
      SELECT 
        user_id,
        assessment_period,
        berorientasi_pelayanan,
        akuntabel,
        kompeten,
        harmonis,
        loyal,
        adaptif,
        kolaboratif,
        notes,
        submitted_at
      FROM berakhlak_assessments
      ORDER BY submitted_at DESC
    `);

        migratedCount = 0;
        for (const assessment of oldAssessments) {
            const [oldUser] = await oldConn.query('SELECT email FROM users WHERE id = ?', [assessment.user_id]);
            if (oldUser.length === 0) continue;

            const [newUser] = await newConn.query('SELECT id FROM users WHERE email = ?', [oldUser[0].email]);
            if (newUser.length === 0) continue;

            const newUserId = newUser[0].id;
            const totalScore = (
                assessment.berorientasi_pelayanan +
                assessment.akuntabel +
                assessment.kompeten +
                assessment.harmonis +
                assessment.loyal +
                assessment.adaptif +
                assessment.kolaboratif
            );

            const [existing] = await newConn.query(
                'SELECT id FROM asn_berakhlak_assessments WHERE user_id = ? AND assessment_period = ?',
                [newUserId, assessment.assessment_period]
            );

            if (existing.length === 0) {
                await newConn.query(
                    `INSERT INTO asn_berakhlak_assessments 
           (user_id, assessment_period, berorientasi_pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif, total_score, notes, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newUserId,
                        assessment.assessment_period,
                        assessment.berorientasi_pelayanan,
                        assessment.akuntabel,
                        assessment.kompeten,
                        assessment.harmonis,
                        assessment.loyal,
                        assessment.adaptif,
                        assessment.kolaboratif,
                        totalScore,
                        assessment.notes,
                        assessment.submitted_at
                    ]
                );
                migratedCount++;
            }
        }

        console.log(`  ✓ Migrated ${migratedCount} Berakhlak assessments`);

        console.log('\n🎉 ASN Migration Complete!\n');
        console.log('Summary:');
        console.log(`  - Users: ${oldUsers.length} processed`);
        console.log(`  - Daily Reports: migrated successfully`);
        console.log(`  - Assessments: migrated successfully`);

    } catch (error) {
        console.error('\n❌ Migration Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check OLD_ASN_DB_* variables in .env');
        console.error('2. Ensure old database is accessible');
        console.error('3. Verify table structures match expected format');
    } finally {
        if (oldConn) await oldConn.end();
        if (newConn) await newConn.end();
    }
}

// Run migration
if (require.main === module) {
    migrateASNReports();
}

module.exports = { migrateASNReports };
