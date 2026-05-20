"use client";

import { useState } from "react";
import {
  LayoutGrid,
  List,
  ArrowDownAZ,
  ArrowUpZA,
  FolderOpen,
} from "lucide-react";
import { TruckFolderCard } from "./truck-folder-card";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FleetClientContainer({ fleetData }: { fleetData: any[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedData = [...fleetData].sort((a, b) => {
    const codeA = (a.fleetCode || "").toLowerCase();
    const codeB = (b.fleetCode || "").toLowerCase();

    // ✨ FIX: Using localeCompare with numeric: true for Natural Sorting
    const comparison = codeA.localeCompare(codeB, undefined, { numeric: true });

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar - Minimal, transparent, space-saving */}
      <div className="flex justify-end items-center gap-3 pb-6">
        {/* Sort Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 px-2 font-semibold text-xs"
        >
          {sortOrder === "asc" ? (
            <>
              <ArrowDownAZ className="w-3.5 h-3.5 mr-1.5" /> Ascending
            </>
          ) : (
            <>
              <ArrowUpZA className="w-3.5 h-3.5 mr-1.5" /> Descending
            </>
          )}
        </Button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

        {/* View Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/50 p-0.5 rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-7 px-2.5 rounded-sm ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-7 px-2.5 rounded-sm ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Rendering logic based on viewMode */}
      {sortedData.length === 0 ? (
        <div className="col-span-full py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/30 rounded-[24px] sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 sm:mb-4">
            <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-lg sm:text-xl text-slate-700 dark:text-slate-300">
            No folders created yet.
          </p>
          <p className="text-xs sm:text-sm font-medium mt-1">
            Click &apos;Register Truck&apos; to create your first asset folder.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-4 sm:gap-y-12 sm:gap-x-6">
          {sortedData.map((truck) => (
            <TruckFolderCard key={truck.id} truck={truck} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedData.map((truck) => (
            <TruckFolderCard key={truck.id} truck={truck} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
