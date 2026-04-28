// app/(modules)/trucking/trips/page.tsx
import { db } from "@/db";
import { liveTrips } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Ensures the page always fetches fresh data

export default async function TripsHistoryPage() {
  // Fetch all trips from Neon, sorted by the newest first
  const data = await db
    .select()
    .from(liveTrips)
    .orderBy(desc(liveTrips.createdAt));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Trip History</h1>
          <p className="text-slate-500">
            View and manage all Fhernie Logistics hauling records.
          </p>
        </div>

        <Link href="/trucking/trips/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
            <Plus className="w-4 h-4 mr-2" />
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
