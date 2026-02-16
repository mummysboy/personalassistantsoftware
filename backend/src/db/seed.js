require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./connection');

async function seed() {
  try {
    const bossHash = await bcrypt.hash('OGB13!', 10);
    const assistantHash = await bcrypt.hash('OGB13!', 10);

    // Update existing boss account if it exists, otherwise insert
    await pool.query(`
      UPDATE users SET email = 'jefferyflippo13@gmail.com', password_hash = $1
      WHERE role = 'boss'
    `, [bossHash]);

    // Update existing assistant account if it exists, otherwise insert
    await pool.query(`
      UPDATE users SET email = 'isaac@rightimagedigital.com', password_hash = $1, name = 'Isaac Hirsch'
      WHERE role = 'assistant'
    `, [assistantHash]);

    await pool.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES
        ('jefferyflippo13@gmail.com', $1, 'Jeffery Flippo', 'boss'),
        ('isaac@rightimagedigital.com', $2, 'Isaac Hirsch', 'assistant')
      ON CONFLICT (email) DO NOTHING
    `, [bossHash, assistantHash]);

    console.log('Seed completed successfully');
    console.log('Boss login: jefferyflippo13@gmail.com / OGB13!');
    console.log('Assistant login: isaac@rightimagedigital.com / OGB13!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
