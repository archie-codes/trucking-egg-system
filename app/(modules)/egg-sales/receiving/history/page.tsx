"use client";

import { useEffect, useState } from "react";
import { getEggBatchHistory } from "@/app/actions/egg-actions";
import { eggBatches } from "@/db/schema";
import Loading from "@/app/(modules)/egg-sales/loading";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function ReceivedHistoryPage() {
  const [batches, setBatches] = useState<(typeof eggBatches.$inferSelect)[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const res = await getEggBatchHistory();
      if (res.success) {
        setBatches(res.data);
      }
      setLoading(false);
    }
    loadHistory();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              Received Egg History
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            Historical ledger of all farm inbound deliveries
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0">
        <DataTable columns={columns} data={batches} />
      </div>
    </div>
  );
}
