"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Truck } from "lucide-react";

// This defines the shape of our data based on your Drizzle schema
export type TripRecord = {
  id: number;
  truckId: string;
  customerId: string;
  origin: string;
  destination: string;
  qtyHeads: number;
  rate: number;
  tollFees: number;
  dieselAmount: number;
  meals: number;
  roroShip: number;
  salary: number;
  others: number;
  createdAt: Date;
};

export const columns: ColumnDef<TripRecord>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {date.toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {date.toLocaleTimeString("en-PH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "truckId",
    header: "Truck",
    cell: ({ row }) => (
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 whitespace-nowrap">
        <Truck className="w-3 h-3 mr-1.5" />
        {row.getValue("truckId")}
      </div>
    ),
  },
  {
    accessorKey: "customerId",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {row.getValue("customerId")}
      </span>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => {
      const origin = row.original.origin;
      const destination = row.original.destination;
      return (
        <div className="flex items-center gap-2 text-sm">
          <span
            className="truncate max-w-[120px] lg:max-w-[150px] font-medium text-slate-700 dark:text-slate-300"
            title={origin}
          >
            {origin}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span
            className="truncate max-w-[120px] lg:max-w-[150px] font-medium text-slate-700 dark:text-slate-300"
            title={destination}
          >
            {destination}
          </span>
        </div>
      );
    },
  },
  {
    id: "netIncome",
    header: () => <div className="text-right font-bold">Net Income</div>,
    cell: ({ row }) => {
      const trip = row.original;
      const gross = trip.qtyHeads * trip.rate;
      const expenses =
        trip.tollFees +
        trip.dieselAmount +
        trip.meals +
        trip.roroShip +
        trip.salary +
        trip.others;
      const net = gross - expenses;

      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(net);

      return (
        <div
          className={`text-right font-bold whitespace-nowrap ${
            net >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {formatted}
        </div>
      );
    },
  },
];
