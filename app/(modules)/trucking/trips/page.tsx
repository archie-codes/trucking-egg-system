// app/(modules)/trucking/trips/page.tsx
import { db } from "@/db";
import { truckingTrips } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, Map } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Ensures the page always fetches fresh data

export default async function TripsHistoryPage() {
  // Fetch all trips from Neon, sorted by the newest first
  const data = await db
    .select()
    .from(truckingTrips)
    .orderBy(desc(truckingTrips.createdAt));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-2xl">
              <Map className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-500" />
            </div>
            Trip History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base font-medium">
            View and manage all Fhernie Logistics hauling records.
          </p>
        </div>

        <Link href="/trucking/trips/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto relative h-12 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold">
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <Plus className="w-5 h-5 mr-2 transition-transform group-hover/btn:rotate-90 duration-300" />
            Record New Trip
          </Button>
        </Link>
      </div>

      {/* Data Table Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
