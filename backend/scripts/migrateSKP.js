require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const migrateSKP = async () => {
    try {
        console.log('🚀 Starting SKP Database Migration...');

        // Read schema file
        const schemaPath = path.join(__dirname, '../database/skp_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split queries by semicolon
        const queries = schema
            .split(';')
            .filter(query => query.trim().length > 0);

        // Execute each query
        for (const query of queries) {
            if (query.trim()) {
                await db.query(query);
                console.log('✅ Executed query successfully');
            }
        }

        console.log('✨ SKP Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateSKP();
