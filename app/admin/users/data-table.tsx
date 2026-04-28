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
import { UsersIcon } from "lucide-react";

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
    <div className="relative overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl ring-1 ring-slate-200/50 dark:ring-white/10 transition-all duration-500">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90" />

      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-none hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-bold text-slate-700 dark:text-slate-300 h-14"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100/80 dark:border-slate-800/50 last:border-0 group/row cursor-default"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-5 transition-colors group-hover/row:text-slate-900 dark:group-hover/row:text-white"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-64 text-center"
              >
                <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <UsersIcon className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium text-lg">No staff accounts found</p>
                  <p className="text-sm opacity-70">
                    Click 'Add New Staff' to create one.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
