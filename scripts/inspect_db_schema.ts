import pg from 'pg';

const connectionString = 'postgresql://postgres.evporattcrijnkfgislh:Hgq6uSqnFTeg3sga@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'gocoupon_deals'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in gocoupon_deals:');
    res.rows.forEach(r => {
      console.log(`  - ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
    });

    const couponsRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'coupons'
      ORDER BY ordinal_position;
    `);

    console.log('\nColumns in coupons:');
    couponsRes.rows.forEach(r => {
      console.log(`  - ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
    });

    await client.end();
  } catch (err: any) {
    console.error('Database Error:', err.message);
  }
}

main();
