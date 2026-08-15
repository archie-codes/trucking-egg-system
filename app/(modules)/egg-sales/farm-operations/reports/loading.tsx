import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-3 animate-in fade-in duration-300">
      {/* ── PAGE HEADER SKELETON ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56 sm:w-64 rounded-lg" />
          <Skeleton className="h-3.5 w-72 sm:w-96 rounded-md" />
        </div>
      </div>

      {/* ── BATCH SELECTOR SKELETON ── */}
      <div className="w-full sm:w-80 shrink-0">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* ── DASHBOARD SKELETON CONTENT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {/* 1. TOP BATCH INFO CARDS (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card p-4 flex items-center gap-3 shadow-xs"
            >
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-4.5 w-32 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* 2. MAIN METRICS GRID (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-44 rounded-md" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <div className="flex justify-between items-center py-1">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 mt-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. ADDITIONAL PERFORMANCE / METRICS SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card p-5 space-y-3 shadow-xs"
            >
              <Skeleton className="h-5 w-36 rounded-md mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
