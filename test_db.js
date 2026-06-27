const { db } = require('./db');
const { truckingTrips } = require('./db/schema');
const { desc } = require('drizzle-orm');

async function main() {
  const trips = await db.select().from(truckingTrips).orderBy(desc(truckingTrips.id)).limit(1);
  console.log(trips);
  process.exit(0);
}
main().catch(console.error);
