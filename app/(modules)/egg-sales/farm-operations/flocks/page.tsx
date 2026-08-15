import { getFarmFlocks } from "@/app/actions/farm-actions";
import { format } from "date-fns";
import Link from "next/link";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";

function calculateAgeInWeeks(dateLoaded: string | Date) {
  const loaded = new Date(dateLoaded);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - loaded.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

export default async function FlocksPage() {
  const response = await getFarmFlocks();
  const flocks = response.success ? response.data : [];

  const formattedFlocks =
    flocks?.map((flock) => ({
      ...flock,
      ageInWeeks: calculateAgeInWeeks(flock.dateLoaded),
      formattedDateLoaded: format(new Date(flock.dateLoaded), "MMM dd, yyyy"),
    })) || [];

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-4">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-0.5 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">
              Flock Management
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your chicken batches, track building assignments, and monitor
            flock age.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
          <Link
            href="/egg-sales/farm-operations/flocks/new"
            className="w-full sm:w-auto relative h-10 px-5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all duration-300 overflow-hidden group/btn font-semibold text-xs sm:text-sm inline-flex items-center justify-center whitespace-nowrap shrink-0"
          >
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <Plus className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-90 duration-300 shrink-0" />
            <span className="whitespace-nowrap">New Batch</span>
          </Link>
        </div>
      </div>

      {/* ── DATA TABLE (Fills remaining height, table body scrolls) ── */}
      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0">
        <DataTable columns={columns} data={formattedFlocks} />
      </div>
    </div>
  );
}
