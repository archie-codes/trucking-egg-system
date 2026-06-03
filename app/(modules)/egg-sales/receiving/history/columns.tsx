"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { eggBatches } from "@/db/schema";

export type EggBatchRecord = typeof eggBatches.$inferSelect;

export const columns: ColumnDef<EggBatchRecord>[] = [
  {
    accessorKey: "arrivalDate",
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("arrivalDate") as string;
      return (
        <div className="font-bold whitespace-nowrap">
          {format(new Date(dateStr), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "batchId",
    header: "Batch ID",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs text-slate-500 whitespace-nowrap">
          {row.getValue("batchId")}
        </div>
      );
    },
  },
  {
    accessorKey: "farmName",
    header: "Farm Origin",
    cell: ({ row }) => {
      return (
        <div className="font-bold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
          {row.getValue("farmName")}
        </div>
      );
    },
  },
  {
    accessorKey: "rawCasesPickedUp",
    header: () => (
      <div className="text-right text-amber-600 dark:text-amber-500">Cases</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("rawCasesPickedUp") as number;
      return (
        <div className="text-right font-black text-amber-600 dark:text-amber-500 bg-amber-50/30 dark:bg-amber-900/10 px-2 py-1 rounded">
          {val}
        </div>
      );
    },
  },
  {
    accessorKey: "rawTraysPickedUp",
    header: () => (
      <div className="text-right text-amber-600 dark:text-amber-500 border-r border-slate-200 dark:border-slate-800 pr-2">
        Trays
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("rawTraysPickedUp") as number;
      return (
        <div className="text-right font-black text-amber-600 dark:text-amber-500 border-r border-slate-100 dark:border-slate-800/60 pr-2 bg-amber-50/30 dark:bg-amber-900/10 py-1">
          {val}
        </div>
      );
    },
  },
  {
    accessorKey: "qtySmall",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">Small</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtySmall") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyMedium",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">Medium</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyMedium") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyLarge",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">Large</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyLarge") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyXl",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">XL</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyXl") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyXxl",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800 pr-2">
        XXL
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyXxl") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800/60 pr-2">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyCracked",
    header: () => <div className="text-right text-rose-500">Cracked</div>,
    cell: ({ row }) => {
      const val = row.getValue("qtyCracked") as number;
      return (
        <div className="text-right font-mono text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyBroken",
    header: () => <div className="text-right text-rose-500">Broken</div>,
    cell: ({ row }) => {
      const val = row.getValue("qtyBroken") as number;
      return (
        <div className="text-right font-mono text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyDirty",
    header: () => <div className="text-right text-orange-500">Dirty</div>,
    cell: ({ row }) => {
      const val = row.getValue("qtyDirty") as number;
      return (
        <div className="text-right font-mono text-orange-500 bg-orange-50/30 dark:bg-orange-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
];
