const { neon } = require('@neondatabase/serverless');

const databaseUrl = 'postgresql://neondb_owner:npg_EvX5xkRn6bqW@ep-summer-dream-anwk3t7s-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function migrate() {
  console.log("Migrating egg_batches table in Neon PostgreSQL...");

  // 1. Add new columns if not exist
  await sql`ALTER TABLE egg_batches ADD COLUMN IF NOT EXISTS total_trays_picked_up INTEGER DEFAULT 0 NOT NULL;`;
  await sql`ALTER TABLE egg_batches ADD COLUMN IF NOT EXISTS extra_type VARCHAR(20) DEFAULT 'NONE' NOT NULL;`;
  await sql`ALTER TABLE egg_batches ADD COLUMN IF NOT EXISTS extra_pieces_picked_up INTEGER DEFAULT 0 NOT NULL;`;

  // 2. Backfill total_trays_picked_up from raw_cases_picked_up if raw_cases_picked_up exists
  const checkOldCols = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'egg_batches' AND column_name = 'raw_cases_picked_up';
  `;

  if (checkOldCols.length > 0) {
    console.log("Backfilling total_trays_picked_up from raw_cases_picked_up...");
    await sql`
      UPDATE egg_batches 
      SET total_trays_picked_up = (raw_cases_picked_up * 12 + raw_trays_picked_up)
      WHERE total_trays_picked_up = 0 AND (raw_cases_picked_up > 0 OR raw_trays_picked_up > 0);
    `;
  }

  // 3. Convert QA count columns from integer to real (trays)
  const qaCols = [
    'qty_peewee', 'qty_xs', 'qty_small', 'qty_medium', 'qty_large', 'qty_xl', 'qty_xxl',
    'qty_cracked', 'qty_broken', 'qty_dirty',
    'brown_qty_peewee', 'brown_qty_xs', 'brown_qty_small', 'brown_qty_medium', 'brown_qty_large',
    'brown_qty_xl', 'brown_qty_xxl', 'brown_qty_assorted', 'brown_qty_cracked', 'brown_qty_broken', 'brown_qty_dirty'
  ];

  for (const col of qaCols) {
    const colInfo = await sql.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = 'egg_batches' AND column_name = '${col}'`
    );

    if (colInfo.length > 0 && colInfo[0].data_type === 'integer') {
      console.log(`Converting ${col} to real (trays)...`);
      await sql.query(
        `ALTER TABLE egg_batches ALTER COLUMN ${col} TYPE REAL USING (${col}::real / 30.0)`
      );
    } else if (colInfo.length === 0) {
      console.log(`Adding missing column ${col}...`);
      await sql.query(
        `ALTER TABLE egg_batches ADD COLUMN IF NOT EXISTS ${col} REAL DEFAULT 0 NOT NULL`
      );
    }
  }

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
