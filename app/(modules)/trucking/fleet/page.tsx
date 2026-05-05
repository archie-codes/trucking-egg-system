// app/trucking/fleet/page.tsx
import { db } from "@/db";
import { truckingFleet } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Truck,
  CheckCircle2,
  Wrench,
  XCircle,
  FolderOpen,
  MoreVertical,
} from "lucide-react";
import { AddTruckButton } from "./add-truck-button";
import { Badge } from "@/components/ui/badge";

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
            <h1 className="text-lg lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
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

      {/* CSS GRID: Replaces the Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-4 sm:gap-y-12 sm:gap-x-6">
        {/* EMPTY STATE */}
        {fleetData.length === 0 && (
          <div className="col-span-full py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/30 rounded-[24px] sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 sm:mb-4">
              <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-bold text-lg sm:text-xl text-slate-700 dark:text-slate-300">
              No folders created yet.
            </p>
            <p className="text-xs sm:text-sm font-medium mt-1">
              Click 'Register Truck' to create your first asset folder.
            </p>
          </div>
        )}

        {/* TRUCK FOLDERS (CARDS) */}
        {fleetData.map((truck) => (
          <div
            key={truck.id}
            className="relative group flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-[320px] mx-auto h-[160px] sm:h-[180px]"
          >
            <div className="file relative w-full h-full cursor-pointer origin-bottom perspective-[1500px] z-50">
              {/* Back flap of folder */}
              <div className="work-5 bg-amber-600 dark:bg-amber-700 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[35%] after:h-4 after:bg-amber-600 dark:after:bg-amber-700 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-15px] before:left-[calc(35%-4px)] before:w-4 before:h-4 before:bg-amber-600 dark:before:bg-amber-700 before:[clip-path:polygon(0_35%,0%_100%,50%_100%)]" />

              {/* Papers inside */}
              <div className="work-4 absolute inset-1 bg-zinc-400 dark:bg-zinc-600 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:transform-[rotateX(-20deg)]" />
              <div className="work-3 absolute inset-1 bg-zinc-300 dark:bg-zinc-500 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-30deg)]" />
              <div className="work-2 absolute inset-1 bg-zinc-100 dark:bg-slate-200 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-38deg)] p-4 sm:p-5 flex flex-col gap-1.5 sm:gap-2 shadow-inner overflow-hidden">
                <div className="w-1/3 h-2 sm:h-2.5 bg-zinc-200 dark:bg-slate-300 rounded-full mb-1"></div>
                <div className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
                <div className="w-5/6 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
                <div className="w-4/5 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
                <div className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full mt-2"></div>
                <div className="w-3/4 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
                <div className="mt-auto flex justify-end">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-zinc-200 dark:border-slate-300 rounded-full flex items-center justify-center opacity-50 transform -rotate-12">
                    <span className="text-[7px] sm:text-[9px] font-bold text-zinc-300 dark:text-slate-400">
                      OK
                    </span>
                  </div>
                </div>
              </div>

              {/* Front flap of folder */}
              <div className="work-1 absolute bottom-0 bg-linear-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500 w-full h-[calc(100%-4px)] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[50%] after:h-[16px] after:bg-amber-400 dark:after:bg-amber-500 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-10px] before:right-[calc(50%-4px)] before:size-3 before:bg-amber-400 dark:before:bg-amber-500 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%)] transition-all ease duration-300 origin-bottom flex flex-col justify-between p-3 sm:p-4 group-hover:shadow-[inset_0_20px_40px_#fbbf24,inset_0_-20px_40px_#d97706] dark:group-hover:shadow-[inset_0_20px_40px_#b45309,inset_0_-20px_40px_#92400e] group-hover:transform-[rotateX(-46deg)_translateY(1px)]">
                {/* Folder Header */}
                <div className="flex justify-between items-start">
                  <div className="p-1.5 sm:p-2 bg-white/20 dark:bg-black/20 rounded-md sm:rounded-lg text-amber-50 dark:text-amber-100 group-hover:bg-white/30 transition-colors">
                    <FolderOpen
                      className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    {truck.status === "active" && (
                      <Badge className="bg-emerald-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
                        Active
                      </Badge>
                    )}
                    {truck.status === "maintenance" && (
                      <Badge className="bg-orange-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
                        <Wrench className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
                        Garage
                      </Badge>
                    )}
                    {truck.status === "inactive" && (
                      <Badge className="bg-slate-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
                        <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Folder Body */}
                <div className="mt-1 sm:mt-2">
                  <h3 className="text-sm sm:text-base font-black text-white flex flex-wrap items-center gap-x-1.5 gap-y-0.5 tracking-tight drop-shadow-sm">
                    <span className="truncate max-w-full">
                      {truck.fleetCode}
                    </span>
                    <span className="text-white/60 font-normal shrink-0">
                      -
                    </span>
                    <span className="font-mono text-sm sm:text-base text-amber-100 truncate max-w-full">
                      {truck.plateNumber}
                    </span>
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-amber-100/80 font-medium mt-0.5 sm:mt-1 flex items-center gap-1">
                    <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Logistics
                    Asset
                  </p>
                </div>

                {/* Folder Footer */}
                <div className="mt-auto pt-2 sm:pt-3 border-t border-amber-300/30 dark:border-amber-700/50 flex justify-between items-center">
                  {truck.isActive ? (
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-400"></span>
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-emerald-100 uppercase">
                        Operational
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-400"></span>
                      <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-red-100 uppercase">
                        Disabled
                      </span>
                    </div>
                  )}
                  <button className="text-white/70 hover:text-white transition-colors p-1 sm:p-1.5 rounded-md hover:bg-white/20 outline-none focus-visible:ring-2 focus-visible:ring-white">
                    <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
