// app/(modules)/trucking/trips/data-table.tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, MapPin, Truck } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Mobile View - Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const trip = row.original as any;
            const gross = trip.qtyHeads * trip.rate;
            const expenses =
              trip.tollFees +
              trip.dieselAmount +
              trip.meals +
              trip.roroShip +
              trip.salary +
              trip.others;
            const net = gross - expenses;
            const formattedNet = new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(net);

            return (
              <div
                key={row.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3 transition-shadow hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(trip.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {trip.customerId}
                    </div>
                  </div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                    <Truck className="w-3 h-3 mr-1.5" />
                    {trip.truckId}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate flex-1 font-medium text-slate-700 dark:text-slate-300">
                    {trip.origin}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1" />
                  <span className="truncate flex-1 font-medium text-slate-700 dark:text-slate-300">
                    {trip.destination}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    Net Income
                  </span>
                  <span
                    className={`font-black text-lg ${
                      net >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formattedNet}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No trip records found.
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-slate-200 dark:border-slate-800"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-bold text-slate-700 dark:text-slate-300 h-12"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-slate-500 dark:text-slate-400"
                  >
                    No trip records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
