import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function checkPostgres() {
  const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'smrikaam_db'}`;
  
  console.log('Checking connection with string:', connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL!');
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL version:', res.rows[0].version);
    await client.end();
    return true;
  } catch (err) {
    console.log('Could not connect to PostgreSQL directly:', err.message);
    return false;
  }
}

checkPostgres();
