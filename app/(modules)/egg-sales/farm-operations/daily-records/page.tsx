import { getFarmDailyRecords } from "@/app/actions/farm-actions";
import Link from "next/link";
import { columns, type DailyRecordData } from "./columns";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";

export default async function DailyRecordsPage() {
  const response = await getFarmDailyRecords();
  const records = (response.success ? response.data : []) as DailyRecordData[];

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-4">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-0.5 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">
              Daily Farm Records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor daily mortality rates and raw egg production across active
            flocks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
          <Link
            href="/egg-sales/farm-operations/daily-records/new"
            className="w-full sm:w-auto relative h-10 px-5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all duration-300 overflow-hidden group/btn font-semibold text-xs sm:text-sm inline-flex items-center justify-center whitespace-nowrap shrink-0"
          >
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <Plus className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-90 duration-300 shrink-0" />
            <span className="whitespace-nowrap">Add Daily Record</span>
          </Link>
        </div>
      </div>

      {/* ── DATA TABLE (Fills remaining height, table body scrolls) ── */}
      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0">
        <DataTable columns={columns} data={records} />
      </div>
    </div>
  );
}
