// app/(modules)/trucking/trips/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";

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
        <div className="font-medium text-slate-600">
          {date.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "truckId",
    header: "Truck Plate",
    cell: ({ row }) => (
      <div className="font-bold text-slate-900">{row.getValue("truckId")}</div>
    ),
  },
  {
    accessorKey: "customerId",
    header: "Customer",
  },
  {
    accessorKey: "origin",
    header: "Origin",
  },
  {
    accessorKey: "destination",
    header: "Destination",
  },
  {
    id: "netIncome",
    header: () => <div className="text-right font-bold">Net Income</div>,
    cell: ({ row }) => {
      // Calculate Net Income on the fly
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

      // Format as Philippine Peso
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(net);

      return (
        <div
          className={`text-right font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {formatted}
        </div>
      );
    },
  },
];
