import { Skeleton } from "@/components/ui/skeleton";

export default function FlocksLoading() {
  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-4 animate-in fade-in duration-300">
      {/* ── PAGE HEADER SKELETON ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 sm:w-56 rounded-lg" />
            <Skeleton className="h-3.5 w-64 sm:w-80 rounded-md" />
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <Skeleton className="h-10 w-full sm:w-36 rounded-xl" />
        </div>
      </div>

      {/* ── TOOLBAR & FILTERS SKELETON ── */}
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between shrink-0">
        <Skeleton className="h-11 w-full sm:w-[320px] rounded-xl" />
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* ── TABLE CONTAINER SKELETON ── */}
      <div className="rounded-lg border border-border/60 bg-card flex flex-col flex-1 min-h-0 overflow-hidden p-1 space-y-1">
        {/* Table Header Row Skeleton */}
        <div className="flex items-center justify-between h-10 px-4 bg-muted/40 rounded-t-md border-b border-border/40">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-12 rounded-md" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="flex-1 space-y-1 overflow-hidden p-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between h-12 px-4 rounded-md border border-border/20 ${
                i % 2 === 0 ? "bg-card" : "bg-muted/30"
              }`}
            >
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER PAGINATION SKELETON ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <Skeleton className="h-4 w-36 rounded-md" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
