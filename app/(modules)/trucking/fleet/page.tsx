// app/(modules)/trucking/fleet/page.tsx
import { db } from "@/db";
import { truckingFleet } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AddTruckButton } from "./add-truck-button";
import { FleetClientContainer } from "./fleet-client-container";

export const dynamic = "force-dynamic";

export default async function FleetManagementPage() {
  const fleetData = await db
    .select()
    .from(truckingFleet)
    .orderBy(desc(truckingFleet.createdAt));

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
                Fleet Folders
              </span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            Digital asset folders for active trucks and maintenance tracking.
          </p>
        </div>

        <AddTruckButton />
      </div>

      {/* Content Container handles View Mode and Sorting */}
      <FleetClientContainer fleetData={fleetData} />
    </div>
  );
}
