require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Migration Tool: Port 3001 (Laporan Keuangan) → Portal Terintegrasi
 * 
 * This script migrates financial data from old system to integrated portal
 */

const OLD_DB_CONFIG = {
    host: process.env.OLD_FINANCIAL_DB_HOST || 'localhost',
    user: process.env.OLD_FINANCIAL_DB_USER || 'root',
    password: process.env.OLD_FINANCIAL_DB_PASSWORD || '',
    database: process.env.OLD_FINANCIAL_DB_NAME || 'laporan_keuangan',
    port: process.env.OLD_FINANCIAL_DB_PORT || 3306
};

const NEW_DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal_terintegrasi',
    port: process.env.DB_PORT || 3306
};

async function migrateFinancialData() {
    let oldConn, newConn;

    try {
        console.log('🚀 Starting Financial Data Migration...\n');

        oldConn = await mysql.createConnection(OLD_DB_CONFIG);
        newConn = await mysql.createConnection(NEW_DB_CONFIG);

        console.log('✅ Connected to both databases\n');

        // === MIGRATE PROGRAMS ===
        console.log('📊 Migrating financial programs...');
        const [oldPrograms] = await oldConn.query('SELECT * FROM programs');

        for (const prog of oldPrograms) {
            const [existing] = await newConn.query(
                'SELECT id FROM financial_programs WHERE code = ?',
                [prog.code]
            );

            if (existing.length === 0) {
                await newConn.query(
                    'INSERT INTO financial_programs (code, name, description) VALUES (?, ?, ?)',
                    [prog.code, prog.name, prog.description]
                );
                console.log(`  ✓ Migrated program: ${prog.code}`);
            }
        }

        // === MIGRATE ACTIVITIES ===
        console.log('\n📊 Migrating activities...');
        const [oldActivities] = await oldConn.query('SELECT * FROM activities');

        for (const act of oldActivities) {
            const [program] = await newConn.query(
                'SELECT id FROM financial_programs WHERE code = ?',
                [act.program_code]
            );

            if (program.length > 0) {
                const [existing] = await newConn.query(
                    'SELECT id FROM financial_activities WHERE code = ?',
                    [act.code]
                );

                if (existing.length === 0) {
                    await newConn.query(
                        'INSERT INTO financial_activities (program_id, code, name, description) VALUES (?, ?, ?, ?)',
                        [program[0].id, act.code, act.name, act.description]
                    );
                    console.log(`  ✓ Migrated activity: ${act.code}`);
                }
            }
        }

        // === MIGRATE ACCOUNTS ===
        console.log('\n📊 Migrating account codes...');
        const [oldAccounts] = await oldConn.query('SELECT * FROM accounts');

        for (const acc of oldAccounts) {
            const [activity] = await newConn.query(
                'SELECT id FROM financial_activities WHERE code = ?',
                [acc.activity_code]
            );

            if (activity.length > 0) {
                const [existing] = await newConn.query(
                    'SELECT id FROM financial_accounts WHERE account_code = ?',
                    [acc.account_code]
                );

                if (existing.length === 0) {
                    await newConn.query(
                        'INSERT INTO financial_accounts (activity_id, account_code, account_name) VALUES (?, ?, ?)',
                        [activity[0].id, acc.account_code, acc.account_name]
                    );
                    console.log(`  ✓ Migrated account: ${acc.account_code}`);
                }
            }
        }

        // === MIGRATE BUDGETS ===
        console.log('\n📊 Migrating budgets...');
        const [oldBudgets] = await oldConn.query('SELECT * FROM budgets');

        let budgetCount = 0;
        for (const budget of oldBudgets) {
            const [account] = await newConn.query(
                'SELECT id FROM financial_accounts WHERE account_code = ?',
                [budget.account_code]
            );

            if (account.length > 0) {
                const [existing] = await newConn.query(
                    'SELECT id FROM financial_budgets WHERE account_id = ? AND fiscal_year = ?',
                    [account[0].id, budget.fiscal_year]
                );

                if (existing.length === 0) {
                    await newConn.query(
                        `INSERT INTO financial_budgets (account_id, fiscal_year, budget_amount, source_of_funds)
             VALUES (?, ?, ?, ?)`,
                        [account[0].id, budget.fiscal_year, budget.amount, budget.source_of_funds]
                    );
                    budgetCount++;
                }
            }
        }
        console.log(`  ✓ Migrated ${budgetCount} budgets`);

        // === MIGRATE REALIZATIONS ===
        console.log('\n📊 Migrating realizations...');
        const [oldRealizations] = await oldConn.query('SELECT * FROM realizations');

        let realizationCount = 0;
        for (const real of oldRealizations) {
            // Find budget_id in new system
            const [account] = await newConn.query(
                'SELECT id FROM financial_accounts WHERE account_code = ?',
                [real.account_code]
            );

            if (account.length > 0) {
                const [budget] = await newConn.query(
                    'SELECT id FROM financial_budgets WHERE account_id = ? AND fiscal_year = ?',
                    [account[0].id, real.fiscal_year]
                );

                if (budget.length > 0) {
                    const [existing] = await newConn.query(
                        'SELECT id FROM financial_realizations WHERE budget_id = ? AND month = ?',
                        [budget[0].id, real.month]
                    );

                    if (existing.length === 0) {
                        await newConn.query(
                            `INSERT INTO financial_realizations (budget_id, month, realization_amount, notes)
               VALUES (?, ?, ?, ?)`,
                            [budget[0].id, real.month, real.amount, real.notes]
                        );
                        realizationCount++;
                    }
                }
            }
        }
        console.log(`  ✓ Migrated ${realizationCount} realizations`);

        console.log('\n🎉 Financial Migration Complete!\n');
        console.log('Summary:');
        console.log(`  - Programs: ${oldPrograms.length} migrated`);
        console.log(`  - Activities: ${oldActivities.length} migrated`);
        console.log(`  - Accounts: ${oldAccounts.length} migrated`);
        console.log(`  - Budgets: ${budgetCount} migrated`);
        console.log(`  - Realizations: ${realizationCount} migrated`);

    } catch (error) {
        console.error('\n❌ Migration Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check OLD_FINANCIAL_DB_* variables in .env');
        console.error('2. Ensure old database is accessible');
        console.error('3. Verify table structures match expected format');
        console.error('4. Check field mappings (program_code, activity_code, etc.)');
    } finally {
        if (oldConn) await oldConn.end();
        if (newConn) await newConn.end();
    }
}

// Run migration
if (require.main === module) {
    migrateFinancialData();
}

module.exports = { migrateFinancialData };
