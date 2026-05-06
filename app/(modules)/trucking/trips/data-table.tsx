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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md pl-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Search Area, Date, or Customer..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus-visible:ring-blue-500/50 text-base sm:text-sm"
        />
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
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative transition-all hover:shadow-md"
              >
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${net >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          {new Date(trip.date).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wider uppercase">
                          {trip.fleetCode || "N/A"}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {trip.customerId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 ml-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate flex-1 font-semibold text-slate-700 dark:text-slate-300">
                      {trip.origin}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate flex-1 font-semibold text-slate-700 dark:text-slate-300">
                      {trip.destination}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-1 border-t border-slate-100 dark:border-slate-800 ml-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      Net Income
                    </span>
                    <span
                      className={`font-black text-xl tracking-tight ${
                        net >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formattedNet}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
              No trips found
            </h3>
            <p className="text-slate-500 text-sm">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>

      {/* Desktop View - Excel Replica Table */}
      <div className="hidden lg:block w-full rounded-lg border border-blue-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="w-full max-w-full overflow-auto custom-scrollbar max-h-[650px]">
          <Table className="text-sm w-full min-w-[1300px] h-full min-h-[60px] border-collapse relative">
            <TableHeader className="sticky top-0 z-20 bg-blue-50 dark:bg-blue-900/40 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-blue-200 dark:border-blue-800/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-bold text-blue-800 dark:text-blue-300 h-8 px-4 whitespace-nowrap border-r border-blue-200/60 dark:border-blue-800/60 last:border-r-0 bg-transparent uppercase tracking-widest text-xs"
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
                    className="even:bg-slate-50/80 dark:even:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-1 px-2 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0 font-medium text-slate-700 dark:text-slate-300 text-[12.5px]"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-1">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div>
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
            <p className="text-sm font-medium">Rows per page:</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent
                side="top"
                className="z-150 rounded-xl border-slate-200 dark:border-slate-800"
              >
                {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex-1 sm:flex-none rounded-xl h-10 border-slate-200 dark:border-slate-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex-1 sm:flex-none rounded-xl h-10 border-slate-200 dark:border-slate-800"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
