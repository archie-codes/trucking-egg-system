"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter, // ✨ THE FIX: Added globalFilter here so the table listens to it!
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search Area, Date, or Customer..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 border-slate-200 dark:border-slate-800 rounded-xl h-11 bg-slate-50 dark:bg-slate-950/50"
          />
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const trip = row.original as any;
            const gross = trip.qtyHeads * trip.rate;
            const expenses =
              trip.tollFees +
              trip.dieselCash +
              trip.dieselPo +
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
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(trip.date).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold tracking-wider">
                        {trip.fleetCode || "N/A"}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {trip.customerId}
                    </div>
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
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
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
          <div className="text-center p-8 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No trip records found.
          </div>
        )}
      </div>

      {/* Desktop View - Excel Replica Table */}
      <div className="hidden lg:block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md">
        <div className="w-full max-w-full overflow-auto custom-scrollbar max-h-[650px]">
          <Table className="text-sm w-full min-w-[1300px] border-collapse relative">
            <TableHeader className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 shadow-sm border-b-2 border-slate-300 dark:border-slate-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-bold text-slate-700 dark:text-slate-200 h-10 px-3 whitespace-nowrap border-r border-slate-300 dark:border-slate-700 last:border-r-0 bg-slate-100 dark:bg-slate-800"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                    className="hover:bg-blue-50/80 dark:hover:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/50 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2 px-3 border-r border-slate-200 dark:border-slate-700/50 last:border-r-0 group-hover:border-slate-300 dark:group-hover:border-slate-600"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
                    No trip records found. Start encoding to see your data!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Showing{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {table.getRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          trips
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg h-9 border-slate-200 dark:border-slate-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg h-9 border-slate-200 dark:border-slate-800"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
