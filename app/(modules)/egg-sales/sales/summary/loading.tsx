import React from "react";

export default function Loading() {
  return (
    <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300 flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-teal-600 to-emerald-500">
              Sales & Income Summary
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Overview of outbound dispatches, gross sales, and net income
          </p>
        </div>
      </div>

      {/* SKELETON DASHBOARD */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-12">
        <div className="flex flex-col gap-3 pb-8">
          {/* Top Controls */}
          <div className="flex justify-between items-center">
            <div className="h-10 w-[260px] rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between h-[126px] animate-pulse"
              >
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded mb-4" />
                <div>
                  <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
              >
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-6" />
                <div className="w-full h-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Breakdown Table */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-[400px] animate-pulse">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="p-5 flex-1 bg-slate-50 dark:bg-slate-900/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
