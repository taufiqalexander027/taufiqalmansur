const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'railway',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    multipleStatements: true
};

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const schemaPath = path.join(__dirname, '../database/finance_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing migration...');
        await connection.query(schema);
        console.log('Migration successful! Finance tables created.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
