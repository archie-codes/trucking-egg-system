// app/(modules)/trucking/reports/page.tsx
import { db } from "@/db";
import { truckingTrips, truckingFleet } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ReportClient } from "./report-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  // Fetch all trips and all trucks to pass to our instant client-side calculator
  const trips = await db
    .select()
    .from(truckingTrips)
    .orderBy(desc(truckingTrips.date));

  const trucks = await db
    .select()
    .from(truckingFleet)
    .orderBy(truckingFleet.fleetCode);

  return (
    <div className="mx-auto space-y-3 w-full min-w-0 overflow-hidden animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-emerald-500/10 rounded-lg blur-2xl -z-10" />
        <div className="flex items-center gap-4 mb-1">
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              Fleet Analytics & Reports
            </span>
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
          Executive financial summaries aggregated by year.
        </p>
      </div>

      {/* Interactive Client Component */}
      <ReportClient trips={trips} trucks={trucks} />
    </div>
  );
}
