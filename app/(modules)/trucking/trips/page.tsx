import { db } from "@/db";
import { truckingTrips, truckingTripsCpf, truckingFleet } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { DataTable } from "./data-table";
import { columns, type TripRecord } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function TableSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center border rounded-xl bg-slate-50/50 dark:bg-slate-900/20 min-h-[400px]">
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading records...</p>
      </div>
    </div>
  );
}

async function TripsTableWrapper({ tab }: { tab: string }) {
  let data: TripRecord[] = [];

  if (tab === "CPF") {
    const rawData = await db
      .select({
        id: truckingTripsCpf.id,
        truckId: truckingTripsCpf.truckId,
        date: truckingTripsCpf.date,
        origin: truckingTripsCpf.origin,
        destination: truckingTripsCpf.destination,
        tripType: truckingTripsCpf.tripType,
        deliveryOrderNo: truckingTripsCpf.deliveryOrderNo,
        ratePerTrip: truckingTripsCpf.ratePerTrip,
        tollFees: truckingTripsCpf.tollFees,
        dieselCash: truckingTripsCpf.dieselCash,
        dieselPo: truckingTripsCpf.dieselPo,
        meals: truckingTripsCpf.meals,
        salary: truckingTripsCpf.salary,
        salaryNote: truckingTripsCpf.salaryNote,
        miscellaneous: truckingTripsCpf.miscellaneous,
        miscellaneousNote: truckingTripsCpf.miscellaneousNote,
        createdAt: truckingTripsCpf.createdAt,
        fleetCode: truckingFleet.fleetCode,
        plateNumber: truckingFleet.plateNumber,
      })
      .from(truckingTripsCpf)
      .leftJoin(truckingFleet, eq(truckingTripsCpf.truckId, truckingFleet.id))
      .orderBy(desc(truckingTripsCpf.createdAt));

    // Map missing fields so the DataTable columns don't break
    data = rawData.map((trip) => ({
      ...trip,
      customerId: "N/A",
      loadType: "NONE",
      farmName: "N/A",
      qtyHeads: 0,
      qtyNote: "",
      rate: 0,
      roroShip: 0,
      others: 0,
      othersNote: "",
    }));
  } else {
    const rawNormalData = await db
      .select({
        id: truckingTrips.id,
        truckId: truckingTrips.truckId,
        date: truckingTrips.date,
        customerId: truckingTrips.customerId,
        farmName: truckingTrips.farmName,
        origin: truckingTrips.origin,
        destination: truckingTrips.destination,
        tripType: truckingTrips.tripType,
        loadType: truckingTrips.loadType,
        qtyHeads: truckingTrips.qtyHeads,
        qtyNote: truckingTrips.qtyNote,
        rate: truckingTrips.rate,
        tollFees: truckingTrips.tollFees,
        dieselCash: truckingTrips.dieselCash,
        dieselPo: truckingTrips.dieselPo,
        meals: truckingTrips.meals,
        roroShip: truckingTrips.roroShip,
        salary: truckingTrips.salary,
        salaryNote: truckingTrips.salaryNote,
        others: truckingTrips.others,
        othersNote: truckingTrips.othersNote,
        createdAt: truckingTrips.createdAt,
        fleetCode: truckingFleet.fleetCode,
        plateNumber: truckingFleet.plateNumber,
      })
      .from(truckingTrips)
      .leftJoin(truckingFleet, eq(truckingTrips.truckId, truckingFleet.id))
      .where(eq(truckingTrips.tripType, tab))
      .orderBy(desc(truckingTrips.createdAt));
      
    // Map defaults for the removed fields
    data = rawNormalData.map((trip) => ({
      ...trip,
      deliveryOrderNo: "",
      ratePerTrip: 0,
      miscellaneous: 0,
      miscellaneousNote: "",
    }));
  }

  return <DataTable columns={columns} data={data} />;
}

export default async function TripsHistoryPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const tab = (searchParams?.tab as string) || "RTL";

  const tabs = [
    { name: "RTL", id: "RTL" },
    { name: "LAYER", id: "LAYER" },
    { name: "CPF", id: "CPF" },
  ];

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
                Trips History
              </span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            View and manage all Fhernie Logistics hauling records.
          </p>
        </div>

        <Link href="/trucking/trips/new" className="w-full sm:w-auto shrink-0">
          <Button className="relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold w-full sm:w-auto whitespace-nowrap shrink-0">
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <Plus className="w-5 h-5 mr-2 transition-transform group-hover/btn:rotate-90 duration-300 shrink-0" />
            <span className="whitespace-nowrap">Record New Trip</span>
          </Button>
        </Link>
      </div>

      {/* TABS UI */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 ml-1">
          Trip Type
        </p>
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl w-fit">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <Link key={t.id} href={`?tab=${t.id}`} scroll={false}>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {t.name}
              </button>
            </Link>
          );
        })}
        </div>
      </div>

      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0">
        <Suspense key={tab} fallback={<TableSkeleton />}>
          <TripsTableWrapper tab={tab} />
        </Suspense>
      </div>
    </div>
  );
}
