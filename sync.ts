import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_EvX5xkRn6bqW@ep-summer-dream-anwk3t7s-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function syncInventory() {
  console.log("Fetching totals from egg_batches...");
  
  const batchRes = await sql`
    SELECT 
      COALESCE(SUM(qty_cracked), 0) as cracked, 
      COALESCE(SUM(qty_broken), 0) as broken, 
      COALESCE(SUM(qty_dirty), 0) as dirty 
    FROM egg_batches
  `;
  
  const { cracked, broken, dirty } = batchRes[0];
  console.log("Received totals:", { cracked, broken, dirty });

  console.log("Fetching sales totals from egg_sales...");
  const salesRes = await sql`
    SELECT classification, COALESCE(SUM(quantity_trays * 30), 0) as pieces 
    FROM egg_sales 
    WHERE classification IN ('CRACKED', 'BROKEN', 'DIRTY') 
    GROUP BY classification
  `;

  let salesCracked = 0;
  let salesBroken = 0;
  let salesDirty = 0;

  for (const row of salesRes) {
    if (row.classification === 'CRACKED') salesCracked = Number(row.pieces);
    if (row.classification === 'BROKEN') salesBroken = Number(row.pieces);
    if (row.classification === 'DIRTY') salesDirty = Number(row.pieces);
  }

  const netCracked = Number(cracked) - salesCracked;
  const netBroken = Number(broken) - salesBroken;
  const netDirty = Number(dirty) - salesDirty;

  console.log("Net Stock (Pieces):", { CRACKED: netCracked, BROKEN: netBroken, DIRTY: netDirty });

  // Upsert into egg_inventory
  async function upsertStock(classification: string, pieces: number) {
    console.log(`Upserting ${classification} -> ${pieces} pieces`);
    await sql`
      INSERT INTO egg_inventory (classification, current_stock_trays, price_per_tray)
      VALUES (${classification}, ${pieces}, 0)
      ON CONFLICT (classification) 
      DO UPDATE SET current_stock_trays = ${pieces}, last_updated = NOW()
    `;
  }

  await upsertStock('CRACKED', netCracked);
  await upsertStock('BROKEN', netBroken);
  await upsertStock('DIRTY', netDirty);

  console.log("Inventory sync complete!");
}

syncInventory().catch(console.error);
