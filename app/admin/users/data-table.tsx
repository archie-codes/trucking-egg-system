// "use client";

// import {
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { UsersIcon } from "lucide-react";

// interface DataTableProps<TData, TValue> {
//   columns: any[];
//   data: TData[];
// }

// export function DataTable<TData, TValue>({
//   columns,
//   data,
// }: DataTableProps<TData, TValue>) {
//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   return (
//     <div className="relative overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl ring-1 ring-slate-200/50 dark:ring-white/10 transition-all duration-500">
//       {/* Decorative Top Gradient Line */}
//       <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90" />

//       <Table>
//         <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800/50">
//           {table.getHeaderGroups().map((headerGroup) => (
//             <TableRow
//               key={headerGroup.id}
//               className="border-none hover:bg-transparent"
//             >
//               {headerGroup.headers.map((header) => (
//                 <TableHead
//                   key={header.id}
//                   className="font-bold text-slate-700 dark:text-slate-300 h-14"
//                 >
//                   {header.isPlaceholder
//                     ? null
//                     : flexRender(
//                         header.column.columnDef.header,
//                         header.getContext(),
//                       )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {table.getRowModel().rows?.length ? (
//             table.getRowModel().rows.map((row) => (
//               <TableRow
//                 key={row.id}
//                 className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100/80 dark:border-slate-800/50 last:border-0 group/row cursor-default"
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell
//                     key={cell.id}
//                     className="py-5 transition-colors group-hover/row:text-slate-900 dark:group-hover/row:text-white"
//                   >
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={columns.length} className="h-64 text-center">
//                 <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
//                   <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
//                     <UsersIcon className="w-8 h-8 opacity-50" />
//                   </div>
//                   <p className="font-medium text-lg">No staff accounts found</p>
//                   <p className="text-sm opacity-70">
//                     Click 'Add New Staff' to create one.
//                   </p>
//                 </div>
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

// app/admin/users/data-table.tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
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
import { UsersIcon, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: { globalFilter, sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const hasFilter = globalFilter.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, email, role…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm bg-background border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/40 placeholder:text-muted-foreground/50"
          />
          {hasFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Row count */}
        <p className="text-[12px] text-muted-foreground sm:ml-auto shrink-0">
          {hasFilter ? (
            <>
              <span className="font-medium text-foreground">
                {filteredCount}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{data.length}</span>{" "}
              staff
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{data.length}</span>{" "}
              staff member{data.length !== 1 ? "s" : ""}
            </>
          )}
        </p>
      </div>

      {/* ── Table card ── */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Desktop table — hidden on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-muted/40 hover:bg-muted/40 border-b border-border/60"
                >
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-9 py-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
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
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-b border-border/40 transition-colors",
                      i % 2 === 0 ? "bg-card" : "bg-muted/20",
                      "hover:bg-blue-50/40 dark:hover:bg-blue-950/15",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-sm">
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
                    className="h-52 text-center"
                  >
                    <div className="flex flex-col items-center gap-2.5 text-muted-foreground">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                        <UsersIcon className="h-5 w-5 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">
                        {hasFilter
                          ? "No staff match your search."
                          : "No staff accounts found."}
                      </p>
                      {!hasFilter && (
                        <p className="text-[12px] opacity-60">
                          Click "Add staff" to create one.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card list — shown only on mobile */}
        <div className="sm:hidden divide-y divide-border/40">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const user = row.original as any;
              return <MobileRow key={row.id} row={row} columns={columns} />;
            })
          ) : (
            <div className="flex flex-col items-center gap-2.5 py-16 text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <UsersIcon className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium">
                {hasFilter
                  ? "No staff match your search."
                  : "No staff accounts found."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {pageCount > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground order-2 sm:order-1">
            Page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium text-foreground">{pageCount}</span>
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let page = i;
                if (pageCount > 5) {
                  const half = 2;
                  page = Math.min(
                    Math.max(currentPage - 1 - half, 0) + i,
                    pageCount - 1,
                  );
                }
                const isActive = page === currentPage - 1;
                return (
                  <button
                    key={page}
                    onClick={() => table.setPageIndex(page)}
                    className={cn(
                      "w-7 h-8 rounded-lg text-xs font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {page + 1}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile row ─────────────────────────────────────────────────────────────────
function MobileRow({ row, columns }: { row: any; columns: any[] }) {
  const user = row.original as any;
  // Find specific cells
  const nameCell = row
    .getVisibleCells()
    .find((c: any) => c.column.id === "name");
  const emailCell = row
    .getVisibleCells()
    .find((c: any) => c.column.id === "email");
  const deptCell = row
    .getVisibleCells()
    .find((c: any) => c.column.id === "department");
  const roleCell = row
    .getVisibleCells()
    .find((c: any) => c.column.id === "role");
  const actionCell = row
    .getVisibleCells()
    .find((c: any) => c.column.id === "actions");

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-4 bg-card hover:bg-muted/20 transition-colors">
      {/* Left: avatar + info (rendered via name cell) */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {nameCell &&
          flexRender(nameCell.column.columnDef.cell, nameCell.getContext())}
        <div className="ml-[52px] flex flex-wrap gap-1.5 items-center">
          {deptCell &&
            flexRender(deptCell.column.columnDef.cell, deptCell.getContext())}
          {roleCell &&
            flexRender(roleCell.column.columnDef.cell, roleCell.getContext())}
        </div>
        {emailCell && (
          <p className="ml-[52px] text-[12px] text-muted-foreground truncate">
            {flexRender(
              emailCell.column.columnDef.cell,
              emailCell.getContext(),
            )}
          </p>
        )}
      </div>
      {/* Right: actions */}
      {actionCell && (
        <div className="shrink-0 mt-0.5">
          {flexRender(
            actionCell.column.columnDef.cell,
            actionCell.getContext(),
          )}
        </div>
      )}
    </div>
  );
}
