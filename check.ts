import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_EvX5xkRn6bqW@ep-summer-dream-anwk3t7s-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function main() {
  const result = await sql`SELECT * FROM egg_sales WHERE invoice_id = 'INV-20260605-9XTX'`;
  console.log(result);
}
main();
