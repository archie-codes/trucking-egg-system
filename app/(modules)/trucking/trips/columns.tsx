"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Truck } from "lucide-react";

// 1. ✨ UPDATE THE DATA SHAPE to include Fleet info and Farm Name
export type TripRecord = {
  id: number;
  truckId: number;
  fleetCode: string | null; // ✨ ADDED
  plateNumber: string | null; // ✨ ADDED
  date: string;
  customerId: string;
  farmName: string; // ✨ Cleaned (Replaced 'area')
  origin: string;
  destination: string;
  qtyHeads: number;
  rate: number;
  tollFees: number;
  dieselCash: number;
  dieselPo: number;
  meals: number;
  roroShip: number;
  salary: number;
  others: number;
  createdAt: Date;
};

// Helper for Philippine Peso formatting
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Helper for number formatting (e.g., 1,000)
const formatNum = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const columns: ColumnDef<TripRecord>[] = [
  // ✨ NEW TRUCK COLUMN (Placed right before Customer)
  {
    id: "truck",
    header: "TRUCK",
    cell: ({ row }) => {
      const fleetCode = row.original.fleetCode;
      const plateNumber = row.original.plateNumber;

      return (
        <div className="whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
          {fleetCode || "N/A"} - {plateNumber || "NO PLATE"}
        </div>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: "CUSTOMER",
    cell: ({ row }) => (
      <span className="font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
        {row.getValue("customerId")}
      </span>
    ),
  },
  {
    accessorKey: "origin",
    header: "FROM",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">
        {row.getValue("origin")}
      </span>
    ),
  },
  {
    accessorKey: "destination",
    header: "TO",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
        {row.getValue("destination")}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "DATE",
    cell: ({ row }) => {
      const rawDate = row.getValue("date") as string;
      const dateObj = new Date(rawDate);
      return (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">
          {dateObj.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "qtyHeads",
    header: () => <div className="text-right">QTY HDS</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-slate-800 dark:text-slate-200">
        {formatNum(row.getValue("qtyHeads"))}
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: () => <div className="text-right">RATE</div>,
    cell: ({ row }) => (
      <div className="text-right text-slate-600 dark:text-slate-300">
        {formatPHP(row.getValue("rate"))}
      </div>
    ),
  },
  {
    id: "collectible",
    header: () => <div className="text-right font-bold">COLLECTIBLE</div>,
    cell: ({ row }) => {
      const qty = row.original.qtyHeads;
      const rate = row.original.rate;
      return (
        <div className="text-right font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
          {formatPHP(qty * rate)}
        </div>
      );
    },
  },
  {
    accessorKey: "tollFees",
    header: () => <div className="text-right">TOLL FEES</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("tollFees"))}
      </div>
    ),
  },
  {
    accessorKey: "dieselCash",
    header: () => <div className="text-right">DIESEL (CASH)</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("dieselCash"))}
      </div>
    ),
  },
  {
    accessorKey: "dieselPo",
    header: () => <div className="text-right">DIESEL (P.O.)</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("dieselPo"))}
      </div>
    ),
  },
  {
    accessorKey: "meals",
    header: () => <div className="text-right">MEALS</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("meals"))}
      </div>
    ),
  },
  {
    accessorKey: "roroShip",
    header: () => <div className="text-right">RORO</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("roroShip"))}
      </div>
    ),
  },
  {
    accessorKey: "others",
    header: () => <div className="text-right">OTHERS</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("others"))}
      </div>
    ),
  },
  {
    accessorKey: "salary",
    header: () => <div className="text-right">SALARY</div>,
    cell: ({ row }) => (
      <div className="text-right text-rose-500 whitespace-nowrap">
        {formatPHP(row.getValue("salary"))}
      </div>
    ),
  },
  {
    id: "total",
    header: () => <div className="text-right font-bold">TOTAL</div>,
    cell: ({ row }) => {
      const t = row.original;
      const totalExpenses =
        t.tollFees +
        t.dieselCash +
        t.dieselPo +
        t.meals +
        t.roroShip +
        t.salary +
        t.others;
      return (
        <div className="text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
          {formatPHP(totalExpenses)}
        </div>
      );
    },
  },
  {
    id: "netIncome",
    header: () => (
      <div className="text-right font-black uppercase">NET INCOME</div>
    ),
    cell: ({ row }) => {
      const t = row.original;
      const gross = t.qtyHeads * t.rate;
      const expenses =
        t.tollFees +
        t.dieselCash +
        t.dieselPo +
        t.meals +
        t.roroShip +
        t.salary +
        t.others;
      const net = gross - expenses;

      return (
        <div
          className={`text-right font-black whitespace-nowrap ${
            net >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {formatPHP(net)}
        </div>
      );
    },
  },
];
