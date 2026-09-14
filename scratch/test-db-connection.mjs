import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
// Uses Node built-in --env-file=.env

console.log('Testing Supabase & PostgreSQL Connection...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('DATABASE_URL present:', Boolean(DATABASE_URL));

// 1. Test Supabase JS Client
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  try {
    const { data, error } = await supabase.from('gocoupon_price_snapshots').select('*').limit(1);
    console.log('Supabase gocoupon_price_snapshots test:', { hasData: Boolean(data), error: error?.message });
  } catch (err) {
    console.log('Supabase query error:', err.message);
  }
}

// 2. Test PostgreSQL direct connection
if (DATABASE_URL) {
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully!');
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Existing public tables in PostgreSQL:', res.rows.map(r => r.table_name));
    client.release();
  } catch (err) {
    console.log('PostgreSQL direct connection error:', err.message);
  } finally {
    await pool.end();
  }
}
