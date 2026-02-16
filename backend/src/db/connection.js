const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || '';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
