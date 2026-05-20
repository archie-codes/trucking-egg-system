// app/(modules)/trucking/trips/page.tsx
import { db } from "@/db";
import { truckingTrips, truckingFleet } from "@/db/schema"; // ✨ ADDED: truckingFleet
import { desc, eq } from "drizzle-orm"; // ✨ ADDED: eq for the JOIN
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TripsHistoryPage() {
  // ✨ THE FIX: We use a JOIN to merge the Trip data with the exact Truck data
  const data = await db
    .select({
      id: truckingTrips.id,
      truckId: truckingTrips.truckId,
      date: truckingTrips.date,
      customerId: truckingTrips.customerId,
      farmName: truckingTrips.farmName,
      origin: truckingTrips.origin,
      destination: truckingTrips.destination,
      qtyHeads: truckingTrips.qtyHeads,
      rate: truckingTrips.rate,
      tollFees: truckingTrips.tollFees,
      dieselCash: truckingTrips.dieselCash,
      dieselPo: truckingTrips.dieselPo,
      meals: truckingTrips.meals,
      roroShip: truckingTrips.roroShip,
      salary: truckingTrips.salary,
      others: truckingTrips.others,
      createdAt: truckingTrips.createdAt,

      // ✨ ADDED: Grabbing these string values from the Fleet table!
      fleetCode: truckingFleet.fleetCode,
      plateNumber: truckingFleet.plateNumber,
    })
    .from(truckingTrips)
    .leftJoin(truckingFleet, eq(truckingTrips.truckId, truckingFleet.id))
    .orderBy(desc(truckingTrips.createdAt));

  return (
    <div className="mx-auto space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-lg lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
                Trips History
              </span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            View and manage all Fhernie Logistics hauling records.
          </p>
        </div>

        <Link href="/trucking/trips/new" className="w-full sm:w-auto">
          <Button className="relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg  transition-all duration-300 overflow-hidden group/btn font-semibold w-full sm:w-auto">
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <Plus className="w-5 h-5 mr-2 transition-transform group-hover/btn:rotate-90 duration-300" />
            Record New Trip
          </Button>
        </Link>
      </div>

      {/* Data Table Section */}
      <div className="animate-in fade-in duration-300">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
