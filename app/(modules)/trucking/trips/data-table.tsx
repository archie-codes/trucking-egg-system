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

  const [textSize, setTextSize] = React.useState<"xs" | "sm" | "base">("xs");

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
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const textSizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
  }[textSize];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md pl-1 rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search area, date, or customer..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 bg-background w-full"
          />
        </div>

        {/* Text Size Adjuster */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <p className="text-sm font-medium text-muted-foreground">
            Text Size:
          </p>
          <Select
            value={textSize}
            onValueChange={(value: "xs" | "sm" | "base") => setTextSize(value)}
          >
            <SelectTrigger className="h-10 w-[110px] bg-background">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="z-110">
              <SelectItem value="xs">Small</SelectItem>
              <SelectItem value="sm">Medium</SelectItem>
              <SelectItem value="base">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Standard Shadcn Table (Responsive) */}
      <div className="rounded-md border bg-card">
        <Table className={textSizeClass}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`${textSizeClass} ${
                        header.id === "actions"
                          ? "sticky right-0 bg-card z-10 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.05)] w-[60px]"
                          : ""
                      }`}
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${textSizeClass} ${
                        cell.column.id === "actions"
                          ? "sticky right-0 bg-card z-10 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.05)] p-0"
                          : ""
                      }`}
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
                  className="h-24 text-center"
                >
                  No trip records found. Start encoding to see your data!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground font-medium">
          <div>
            Showing{" "}
            <span className="font-medium text-foreground">
              {table.getRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
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
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top" className="z-110">
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
            className="flex-1 sm:flex-none h-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex-1 sm:flex-none h-8"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
