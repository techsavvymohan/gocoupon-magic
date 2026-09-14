import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const client = await pool.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  client.release();
} catch (err) {
  console.error(err);
} finally {
  await pool.end();
}
