const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trucking_db',
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM egg_sales WHERE invoice_id = 'INV-20260605-9XTX'");
    console.log(res.rows);
  } finally {
    client.release();
    pool.end();
  }
}

main().catch(console.error);
