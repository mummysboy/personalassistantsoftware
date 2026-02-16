const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || '';
const isInternal = dbUrl.includes('.railway.internal');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: (!isInternal && process.env.NODE_ENV === 'production') ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
