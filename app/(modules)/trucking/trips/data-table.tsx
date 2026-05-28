// "use client";

// import * as React from "react";
// import {
//   ColumnFiltersState,
//   SortingState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
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
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   FileText,
//   FileSpreadsheet,
//   Type,
//   X,
// } from "lucide-react";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// interface DataTableProps<TData> {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   columns: any[];
//   data: TData[];
// }

// export function DataTable<TData>({
//   columns,
//   data,
// }: DataTableProps<TData>) {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     [],
//   );
//   const [globalFilter, setGlobalFilter] = React.useState("");
//   const [textSize, setTextSize] = React.useState<"xs" | "sm" | "base">("xs");

//   // eslint-disable-next-line react-hooks/incompatible-library
//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onGlobalFilterChange: setGlobalFilter,
//     state: { sorting, columnFilters, globalFilter },
//     initialState: { pagination: { pageSize: 20 } },
//   });

//   const textSizeClass = { xs: "text-xs", sm: "text-sm", base: "text-base" }[
//     textSize
//   ];

//   const getFormattedDate = () => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
//   };

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const extractReportMetadata = (rows: any[]) => {
//     const truckSet = new Set(
//       rows.map(
//         (r) =>
//           `${r.original.fleetCode || "N/A"} - ${r.original.plateNumber || "NO PLATE"}`,
//       ),
//     );
//     const yearSet = new Set(
//       rows.map((r) => new Date(r.original.date).getFullYear().toString()),
//     );
//     const customerSet = new Set(rows.map((r) => r.original.customerId));
//     const routeSet = new Set(rows.map((r) => r.original.destination));

//     let totalGross = 0;
//     let totalExpenses = 0;
//     rows.forEach((r) => {
//       const d = r.original;
//       totalGross += d.qtyHeads * d.rate;
//       totalExpenses +=
//         d.tollFees +
//         d.dieselCash +
//         d.dieselPo +
//         d.meals +
//         d.roroShip +
//         d.salary +
//         d.others;
//     });

//     const totalNet = totalGross - totalExpenses;
//     const fmt = (n: number) =>
//       `PHP ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

//     return {
//       truckName: truckSet.size === 1 ? Array.from(truckSet)[0] : "All Trucks",
//       periodYear: yearSet.size === 1 ? Array.from(yearSet)[0] : "All Years",
//       customerName:
//         customerSet.size === 1 ? Array.from(customerSet)[0] : "All Customers",
//       routeName: routeSet.size === 1 ? Array.from(routeSet)[0] : "All Routes",
//       totalTrips: rows.length.toString(),
//       totalGross: fmt(totalGross),
//       totalExpenses: fmt(totalExpenses),
//       totalNet: fmt(totalNet),
//     };
//   };

//   const exportToCSV = () => {
//     try {
//       const rows = table.getFilteredRowModel().rows;
//       if (!rows.length) {
//         toast.error("No data to export.");
//         return;
//       }
//       const meta = extractReportMetadata(rows);

//       // ✨ FIX: Wrap the ENTIRE line in double quotes so commas inside the numbers
//       // do not break the layout into separate columns.
//       const metaHeader = [
//         `"Fhernie Logistics - Trip Ledger"`,
//         `"${meta.truckName}"`,
//         `"Period / Year : ${meta.periodYear}"`,
//         `"Customer / Client : ${meta.customerName}"`,
//         `"Delivery Route: ${meta.routeName}"`,
//         `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
//         `""`,
//         `"FINANCIAL SUMMARY"`,
//         `"Total Trips: ${meta.totalTrips}"`,
//         `"Collectibles: ${meta.totalGross}"`,
//         `"Expenses: ${meta.totalExpenses}"`,
//         `"Net Income: ${meta.totalNet}"`,
//         `""`, // Blank line before table headers
//       ].join("\n");

//       const headers = [
//         "Date",
//         "Truck",
//         "Plate No.",
//         "Customer",
//         "Farm Name",
//         "Origin",
//         "Destination",
//         "Qty (Heads)",
//         "Rate",
//         "Gross Collectible",
//         "Toll Fees",
//         "Diesel (Cash)",
//         "Diesel (PO)",
//         "Meals",
//         "Roro",
//         "Salary",
//         "Others",
//         "Total Expenses",
//         "Net Income",
//       ];
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const csvData = rows.map((row: any) => {
//         const d = row.original;
//         const collectible = d.qtyHeads * d.rate;
//         const expenses =
//           d.tollFees +
//           d.dieselCash +
//           d.dieselPo +
//           d.meals +
//           d.roroShip +
//           d.salary +
//           d.others;
//         return [
//           new Date(d.date).toLocaleDateString(),
//           d.fleetCode || "N/A",
//           d.plateNumber || "N/A",
//           `"${d.customerId}"`,
//           `"${d.farmName || ""}"`,
//           `"${d.origin}"`,
//           `"${d.destination}"`,
//           d.qtyHeads,
//           d.rate,
//           collectible,
//           d.tollFees,
//           d.dieselCash,
//           d.dieselPo,
//           d.meals,
//           d.roroShip,
//           d.salary,
//           d.others,
//           expenses,
//           collectible - expenses,
//         ].join(",");
//       });

//       const blob = new Blob(
//         [metaHeader + "\n" + [headers.join(","), ...csvData].join("\n")],
//         { type: "text/csv;charset=utf-8;" },
//       );
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.setAttribute("href", url);
//       link.setAttribute(
//         "download",
//         `Fhernie_Trips_Export_${getFormattedDate()}.csv`,
//       );
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       toast.success("CSV downloaded successfully.");
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to generate CSV.");
//     }
//   };

//   const exportToPDF = () => {
//     try {
//       const rows = table.getFilteredRowModel().rows;
//       if (!rows.length) {
//         toast.error("No data to export.");
//         return;
//       }
//       const meta = extractReportMetadata(rows);
//       const doc = new jsPDF("l", "pt", [612, 936]);
//       const fmt = (n: number) =>
//         n.toLocaleString("en-US", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         });

//       doc.setFontSize(18);
//       doc.setFont("helvetica", "bold");
//       doc.text("Fhernie Logistics - Trip Ledger", 40, 40);
//       doc.setFontSize(14);
//       doc.text(meta.truckName, 40, 60);
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Period / Year : ${meta.periodYear}`, 40, 80);
//       doc.text(`Customer / Client : ${meta.customerName}`, 40, 95);
//       doc.text(`Delivery Route: ${meta.routeName}`, 40, 110);
//       doc.text(
//         `Generated on: ${new Date().toLocaleDateString("en-US")}`,
//         40,
//         125,
//       );
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "bold");
//       doc.text("FINANCIAL SUMMARY", 896, 60, { align: "right" });
//       doc.setFont("helvetica", "normal");
//       doc.text(`Total Trips: ${meta.totalTrips}`, 896, 75, { align: "right" });
//       doc.text(`Collectibles: ${meta.totalGross}`, 896, 90, { align: "right" });
//       doc.text(`Expenses: ${meta.totalExpenses}`, 896, 105, { align: "right" });
//       doc.setFont("helvetica", "bold");
//       doc.text(`Net Income: ${meta.totalNet}`, 896, 120, { align: "right" });

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const tableRows = rows.map((row: any) => {
//         const d = row.original;
//         const gross = d.qtyHeads * d.rate;
//         const expenses =
//           d.tollFees +
//           d.dieselCash +
//           d.dieselPo +
//           d.meals +
//           d.roroShip +
//           d.salary +
//           d.others;
//         return [
//           new Date(d.date).toLocaleDateString(),
//           `${d.fleetCode || "N/A"}\n${d.plateNumber || ""}`,
//           d.customerId,
//           d.farmName || "-",
//           d.origin,
//           d.destination,
//           d.qtyHeads.toString(),
//           fmt(d.rate),
//           fmt(gross),
//           fmt(d.tollFees),
//           fmt(d.dieselCash),
//           fmt(d.dieselPo),
//           fmt(d.meals),
//           fmt(d.roroShip),
//           fmt(d.salary),
//           fmt(d.others),
//           fmt(expenses),
//           fmt(gross - expenses),
//         ];
//       });

//       autoTable(doc, {
//         head: [
//           [
//             "Date",
//             "Truck",
//             "Customer",
//             "Farm",
//             "Origin",
//             "Destination",
//             "Qty",
//             "Rate",
//             "Gross",
//             "Toll",
//             "D.Cash",
//             "D.PO",
//             "Meals",
//             "Roro",
//             "Salary",
//             "Others",
//             "Total Exp",
//             "Net",
//           ],
//         ],
//         body: tableRows,
//         startY: 145,
//         theme: "grid",
//         styles: { fontSize: 6.5, cellPadding: 3, overflow: "linebreak" },
//         headStyles: { fillColor: [37, 99, 235], fontSize: 7, halign: "center" },
//         columnStyles: {
//           6: { halign: "center" },
//           7: { halign: "right" },
//           8: { halign: "right", fontStyle: "bold" },
//           9: { halign: "right" },
//           10: { halign: "right" },
//           11: { halign: "right" },
//           12: { halign: "right" },
//           13: { halign: "right" },
//           14: { halign: "right" },
//           15: { halign: "right" },
//           16: { halign: "right", textColor: [225, 29, 72], fontStyle: "bold" },
//           17: { halign: "right", textColor: [5, 150, 105], fontStyle: "bold" },
//         },
//       });

//       doc.save(`Fhernie_Comprehensive_Ledger_${getFormattedDate()}.pdf`);
//       toast.success("PDF downloaded successfully.");
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to generate PDF.");
//     }
//   };

//   const filteredCount = table.getFilteredRowModel().rows.length;
//   const pageCount = table.getPageCount();
//   const currentPage = table.getState().pagination.pageIndex + 1;
//   const hasFilter = globalFilter.length > 0;

//   return (
//     <div className="flex flex-col gap-3">
//       {/* ── Toolbar ── */}
//       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//         {/* Search */}
//         <div className="relative flex-1 sm:max-w-xs">
//           <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
//           <Input
//             placeholder="Search trips, customers, routes…"
//             value={globalFilter}
//             onChange={(e) => setGlobalFilter(e.target.value)}
//             className="pl-9 pr-8 h-9 text-sm bg-background placeholder:text-muted-foreground/60 rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-blue-500/40"
//           />
//           {hasFilter && (
//             <button
//               onClick={() => setGlobalFilter("")}
//               className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
//               aria-label="Clear search"
//             >
//               <X className="h-3.5 w-3.5" />
//             </button>
//           )}
//         </div>

//         {/* Right controls */}
//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Text size */}
//           <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 h-9">
//             <Type className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
//             <div className="flex items-center gap-0.5">
//               {(["xs", "sm", "base"] as const).map((size) => (
//                 <button
//                   key={size}
//                   onClick={() => setTextSize(size)}
//                   className={cn(
//                     "px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors",
//                     textSize === size
//                       ? "bg-blue-600 text-white"
//                       : "text-muted-foreground hover:text-foreground hover:bg-muted",
//                   )}
//                 >
//                   {size === "xs" ? "S" : size === "sm" ? "M" : "L"}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Rows per page */}
//           <Select
//             value={`${table.getState().pagination.pageSize}`}
//             onValueChange={(v) => table.setPageSize(Number(v))}
//           >
//             <SelectTrigger className="h-9 w-[90px] text-xs bg-background border-border/60 rounded-lg focus:ring-1 focus:ring-blue-500/40">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent className="z-110">
//               {[5, 10, 20, 30, 50, 100].map((n) => (
//                 <SelectItem key={n} value={`${n}`} className="text-xs">
//                   {n} rows
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Export */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 size="sm"
//                 className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded-lg px-3 shadow-none border-0"
//               >
//                 <Download className="h-3.5 w-3.5" />
//                 <span>Export</span>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               align="end"
//               className="w-52 rounded-xl border-border/60 shadow-md z-110"
//             >
//               <DropdownMenuItem
//                 onClick={exportToPDF}
//                 className="cursor-pointer gap-2.5 py-2.5 text-sm font-medium"
//               >
//                 <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 dark:bg-rose-950/40">
//                   <FileText className="h-3.5 w-3.5 text-rose-500" />
//                 </div>
//                 <div>
//                   <p className="text-[13px] font-medium leading-none">
//                     Save as PDF
//                   </p>
//                   <p className="text-[11px] text-muted-foreground mt-0.5">
//                     Printable ledger report
//                   </p>
//                 </div>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem
//                 onClick={exportToCSV}
//                 className="cursor-pointer gap-2.5 py-2.5 text-sm font-medium"
//               >
//                 <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/40">
//                   <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
//                 </div>
//                 <div>
//                   <p className="text-[13px] font-medium leading-none">
//                     Export to CSV
//                   </p>
//                   <p className="text-[11px] text-muted-foreground mt-0.5">
//                     Open in Excel or Sheets
//                   </p>
//                 </div>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* ── Filter pill (shown when searching) ── */}
//       {hasFilter && (
//         <div className="flex items-center gap-2">
//           <span className="text-xs text-muted-foreground">
//             {filteredCount === 0
//               ? "No results"
//               : `${filteredCount} trip${filteredCount !== 1 ? "s" : ""} matching`}
//           </span>
//           <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
//             {globalFilter}
//             <button
//               onClick={() => setGlobalFilter("")}
//               className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100"
//             >
//               <X className="h-3 w-3" />
//             </button>
//           </span>
//         </div>
//       )}

//       {/* ── Table ── */}
//       <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
//         <div className="overflow-x-auto">
//           <Table className={cn(textSizeClass, "w-full min-w-[640px]")}>
//             <TableHeader>
//               {table.getHeaderGroups().map((hg) => (
//                 <TableRow
//                   key={hg.id}
//                   className="bg-muted/40 hover:bg-muted/40 border-b border-border/60"
//                 >
//                   {hg.headers.map((header) => (
//                     <TableHead
//                       key={header.id}
//                       className={cn(
//                         textSizeClass,
//                         "h-9 py-0 font-semibold text-muted-foreground uppercase tracking-wide",
//                         header.id === "actions" &&
//                           "sticky right-0 bg-muted/40 z-10 shadow-[-1px_0_0_0_hsl(var(--border))] w-[56px] text-center",
//                       )}
//                     >
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext(),
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows?.length ? (
//                 table.getRowModel().rows.map((row, i) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                     className={cn(
//                       "border-b border-border/40 transition-colors",
//                       i % 2 === 0 ? "bg-card" : "bg-muted",
//                       "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
//                     )}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell
//                         key={cell.id}
//                         className={cn(
//                           textSizeClass,
//                           "py-2.5",
//                           cell.column.id === "actions" &&
//                             "sticky right-0 z-10 p-0 shadow-[-1px_0_0_0_hsl(var(--border))]",
//                           cell.column.id === "actions" &&
//                             (i % 2 === 0 ? "bg-card" : "bg-muted"),
//                         )}
//                       >
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext(),
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-40 text-center"
//                   >
//                     <div className="flex flex-col items-center gap-2 text-muted-foreground">
//                       <FileText className="h-8 w-8 opacity-20" />
//                       <p className="text-sm font-medium">No trips found</p>
//                       <p className="text-xs opacity-70">
//                         {hasFilter
//                           ? "Try adjusting your search."
//                           : "Start encoding to see your data."}
//                       </p>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* ── Pagination ── */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         {/* Count summary */}
//         <p className="text-xs text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
//           Showing{" "}
//           <span className="font-medium text-foreground">
//             {table.getRowModel().rows.length}
//           </span>{" "}
//           of{" "}
//           <span className="font-medium text-foreground">{filteredCount}</span>{" "}
//           trip{filteredCount !== 1 ? "s" : ""}
//           {pageCount > 1 && (
//             <span className="text-muted-foreground/60">
//               {" "}
//               · page {currentPage} of {pageCount}
//             </span>
//           )}
//         </p>

//         {/* Page buttons */}
//         <div className="flex items-center gap-2 order-1 sm:order-2 justify-center sm:justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
//           >
//             <ChevronLeft className="h-3.5 w-3.5" />
//             <span className="hidden xs:inline">Prev</span>
//           </Button>

//           {/* Page number pills (up to 5 visible) */}
//           <div className="flex items-center gap-1">
//             {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
//               let page = i;
//               if (pageCount > 5) {
//                 const half = 2;
//                 page = Math.min(
//                   Math.max(currentPage - 1 - half, 0) + i,
//                   pageCount - 1,
//                 );
//               }
//               const isActive = page === currentPage - 1;
//               return (
//                 <button
//                   key={page}
//                   onClick={() => table.setPageIndex(page)}
//                   className={cn(
//                     "w-7 h-8 rounded-lg text-xs font-medium transition-colors",
//                     isActive
//                       ? "bg-blue-600 text-white"
//                       : "text-muted-foreground hover:bg-muted hover:text-foreground",
//                   )}
//                 >
//                   {page + 1}
//                 </button>
//               );
//             })}
//           </div>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
//           >
//             <span className="hidden xs:inline">Next</span>
//             <ChevronRight className="h-3.5 w-3.5" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FileSpreadsheet,
  Type,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type TripRecord } from "./columns";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
  data: TData[];
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  "use no memo";
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [textSize, setTextSize] = React.useState<"xs" | "sm" | "base">("xs");

  // eslint-disable-next-line react-hooks/incompatible-library
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
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize: 20 } },
  });

  const textSizeClass = { xs: "text-xs", sm: "text-sm", base: "text-base" }[
    textSize
  ];

  const getFormattedDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const extractReportMetadata = (rows: { original: TripRecord }[]) => {
    const truckSet = new Set(
      rows.map(
        (r) =>
          `${r.original.fleetCode || "N/A"} - ${r.original.plateNumber || "NO PLATE"}`,
      ),
    );
    const yearSet = new Set(
      rows.map((r) => new Date(r.original.date).getFullYear().toString()),
    );
    const customerSet = new Set(rows.map((r) => r.original.customerId));
    const routeSet = new Set(rows.map((r) => r.original.destination));

    let totalGross = 0;
    let totalExpenses = 0;
    rows.forEach((r) => {
      const d = r.original;
      totalGross += d.qtyHeads * d.rate;
      totalExpenses +=
        d.tollFees +
        d.dieselCash +
        d.dieselPo +
        d.meals +
        d.roroShip +
        d.salary +
        d.others;
    });

    const totalNet = totalGross - totalExpenses;
    const fmt = (n: number) =>
      `PHP ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return {
      truckName: truckSet.size === 1 ? Array.from(truckSet)[0] : "All Trucks",
      periodYear: yearSet.size === 1 ? Array.from(yearSet)[0] : "All Years",
      customerName:
        customerSet.size === 1 ? Array.from(customerSet)[0] : "All Customers",
      routeName: routeSet.size === 1 ? Array.from(routeSet)[0] : "All Routes",
      totalTrips: rows.length.toString(),
      totalGross: fmt(totalGross),
      totalExpenses: fmt(totalExpenses),
      totalNet: fmt(totalNet),
    };
  };

  const exportToCSV = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: TripRecord;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const meta = extractReportMetadata(rows);

      const metaHeader = [
        `"Fhernie Logistics - Trip Ledger"`,
        `"${meta.truckName}"`,
        `"Period / Year : ${meta.periodYear}"`,
        `"Customer / Client : ${meta.customerName}"`,
        `"Delivery Route: ${meta.routeName}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
        `"FINANCIAL SUMMARY"`,
        `"Total Trips: ${meta.totalTrips}"`,
        `"Collectibles: ${meta.totalGross}"`,
        `"Expenses: ${meta.totalExpenses}"`,
        `"Net Income: ${meta.totalNet}"`,
        `""`,
      ].join("\n");

      // ✨ UPDATED HEADERS TO INCLUDE NOTES
      const headers = [
        "Date",
        "Truck",
        "Plate No.",
        "Customer",
        "Farm Name",
        "Origin",
        "Destination",
        "Qty (Heads)",
        "Qty Note",
        "Rate",
        "Gross Collectible",
        "Toll Fees",
        "Diesel (Cash)",
        "Diesel (PO)",
        "Meals",
        "Roro",
        "Salary",
        "Salary Note",
        "Others",
        "Others Note",
        "Total Expenses",
        "Net Income",
      ];

      const csvData = rows.map((row: { original: TripRecord }) => {
        const d = row.original;
        const collectible = d.qtyHeads * d.rate;
        const expenses =
          d.tollFees +
          d.dieselCash +
          d.dieselPo +
          d.meals +
          d.roroShip +
          d.salary +
          d.others;

        return [
          new Date(d.date).toLocaleDateString(),
          d.fleetCode || "N/A",
          d.plateNumber || "N/A",
          `"${d.customerId}"`,
          `"${d.farmName || ""}"`,
          `"${d.origin}"`,
          `"${d.destination}"`,
          d.qtyHeads,
          `"${d.qtyNote || ""}"`, // ✨ ADDED QTY NOTE
          d.rate,
          collectible,
          d.tollFees,
          d.dieselCash,
          d.dieselPo,
          d.meals,
          d.roroShip,
          d.salary,
          `"${d.salaryNote || ""}"`, // ✨ ADDED SALARY NOTE
          d.others,
          `"${d.othersNote || ""}"`, // ✨ ADDED OTHERS NOTE
          expenses,
          collectible - expenses,
        ].join(",");
      });

      const blob = new Blob(
        [metaHeader + "\n" + [headers.join(","), ...csvData].join("\n")],
        { type: "text/csv;charset=utf-8;" },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Fhernie_Trips_Export_${getFormattedDate()}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate CSV.");
    }
  };

  const exportToPDF = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: TripRecord;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const meta = extractReportMetadata(rows);
      const doc = new jsPDF("l", "pt", [612, 936]);
      const fmt = (n: number) =>
        n.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Fhernie Logistics - Trip Ledger", 40, 40);
      doc.setFontSize(14);
      doc.text(meta.truckName, 40, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Period / Year : ${meta.periodYear}`, 40, 80);
      doc.text(`Customer / Client : ${meta.customerName}`, 40, 95);
      doc.text(`Delivery Route: ${meta.routeName}`, 40, 110);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US")}`,
        40,
        125,
      );
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FINANCIAL SUMMARY", 896, 60, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(`Total Trips: ${meta.totalTrips}`, 896, 75, { align: "right" });
      doc.text(`Collectibles: ${meta.totalGross}`, 896, 90, { align: "right" });
      doc.text(`Expenses: ${meta.totalExpenses}`, 896, 105, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(`Net Income: ${meta.totalNet}`, 896, 120, { align: "right" });

      const tableRows = rows.map((row: { original: TripRecord }) => {
        const d = row.original;
        const gross = d.qtyHeads * d.rate;
        const expenses =
          d.tollFees +
          d.dieselCash +
          d.dieselPo +
          d.meals +
          d.roroShip +
          d.salary +
          d.others;
        return [
          new Date(d.date).toLocaleDateString(),
          `${d.fleetCode || "N/A"}\n${d.plateNumber || ""}`,
          d.customerId,
          d.farmName || "-",
          d.origin,
          d.destination,
          d.qtyHeads.toString(),
          fmt(d.rate),
          fmt(gross),
          fmt(d.tollFees),
          fmt(d.dieselCash),
          fmt(d.dieselPo),
          fmt(d.meals),
          fmt(d.roroShip),
          fmt(d.salary),
          fmt(d.others),
          fmt(expenses),
          fmt(gross - expenses),
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Date",
            "Truck",
            "Customer",
            "Farm",
            "Origin",
            "Destination",
            "Qty HDS",
            "Rate",
            "Collectible",
            "Toll",
            "Diesel(Cash)",
            "Diesel(P.O)",
            "Meals",
            "Roro",
            "Salary",
            "Others",
            "Total Exp",
            "Net",
          ],
        ],
        body: tableRows,
        startY: 145,
        theme: "grid",
        styles: { fontSize: 6.5, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [37, 99, 235], fontSize: 7, halign: "center" },
        columnStyles: {
          6: { halign: "center" },
          7: { halign: "right" },
          8: { halign: "right", fontStyle: "bold" },
          9: { halign: "right" },
          10: { halign: "right" },
          11: { halign: "right" },
          12: { halign: "right" },
          13: { halign: "right" },
          14: { halign: "right" },
          15: { halign: "right" },
          16: { halign: "right", textColor: [225, 29, 72], fontStyle: "bold" },
          17: { halign: "right", textColor: [5, 150, 105], fontStyle: "bold" },
        },
      });

      doc.save(`Fhernie_Comprehensive_Ledger_${getFormattedDate()}.pdf`);
      toast.success("PDF downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.");
    }
  };

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const hasFilter = globalFilter.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar - Animated Expand (Laptop+ Only) */}
        <div
          className={cn(
            "group relative transition-all duration-500 ease-out ml-0.5 ",
            hasFilter
              ? "w-full sm:w-[320px]"
              : "w-full sm:w-11 sm:focus-within:w-[320px] pr-1",
          )}
        >
          <Search
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-500 z-10",
              hasFilter
                ? "text-blue-500"
                : "text-slate-500 dark:text-slate-400 sm:group-focus-within:text-blue-500",
            )}
          />
          <Input
            placeholder="Search trips, customers, routes…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={cn(
              "h-11 w-full rounded-xl! transition-all duration-500 ease-out border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-1 focus-visible:ring-blue-500/40",
              hasFilter
                ? "pl-10 pr-10 rounded-xl bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                : "pl-10 pr-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 sm:pr-0 sm:rounded-full sm:text-transparent sm:placeholder:text-transparent sm:cursor-pointer sm:hover:bg-slate-200/50 sm:dark:hover:bg-slate-800/80 sm:group-focus-within:bg-white sm:group-focus-within:dark:bg-slate-900 sm:group-focus-within:pr-10 sm:group-focus-within:rounded-xl sm:group-focus-within:text-foreground sm:group-focus-within:placeholder:text-slate-400 sm:group-focus-within:dark:placeholder:text-slate-500 sm:group-focus-within:cursor-text",
            )}
          />
          <div
            className={cn(
              "absolute right-2.5 top-1/2 -translate-y-1/2 transition-all duration-300",
              hasFilter
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50 pointer-events-none",
            )}
          >
            {hasFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Font Size, Density Controller and Export PDF */}
        <div className="flex items-center justify-end sm:justify-end w-full sm:w-auto gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-border/60 bg-background px-1.5 sm:px-2.5 h-8 sm:h-9">
            <Type className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-0.5">
              {(["xs", "sm", "base"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={cn(
                    "px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors",
                    textSize === size
                      ? "bg-blue-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {size === "xs" ? "S" : size === "sm" ? "M" : "L"}
                </button>
              ))}
            </div>
          </div>

          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 sm:h-9 w-[80px] sm:w-[90px] text-[10px] sm:text-xs bg-background border-border/60 rounded-lg focus:ring-1 focus:ring-blue-500/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-110">
              {[5, 10, 20, 30, 50, 100].map((n) => (
                <SelectItem key={n} value={`${n}`} className="text-xs">
                  {n} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[10px] sm:text-xs font-medium rounded-lg px-2 sm:px-3 shadow-none border-0"
              >
                <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl border-border/60 shadow-md z-110"
            >
              <DropdownMenuItem
                onClick={exportToPDF}
                className="cursor-pointer gap-2.5 py-2.5 text-sm font-medium"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 dark:bg-rose-950/40">
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium leading-none">
                    Save as PDF
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Printable ledger report
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={exportToCSV}
                className="cursor-pointer gap-2.5 py-2.5 text-sm font-medium"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/40">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium leading-none">
                    Export to CSV
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Open in Excel or Sheets
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasFilter && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filteredCount === 0
              ? "No results"
              : `${filteredCount} trip${filteredCount !== 1 ? "s" : ""} matching`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
            {globalFilter}
            <button
              onClick={() => setGlobalFilter("")}
              className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      <div className="rounded-lg border border-border/60 bg-card flex flex-col flex-1 min-h-0 overflow-hidden [&>div]:flex-1 [&>div]:overflow-auto [&>div]:custom-scrollbar">
        <Table className={cn(textSizeClass, "w-full min-w-[640px]")}>
          <TableHeader className="sticky top-0 z-20 bg-card">
            {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-muted/40 hover:bg-muted/40 border-b border-border/60"
                >
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        textSizeClass,
                        "h-9 py-0 font-semibold text-muted-foreground uppercase tracking-wide",
                        header.id === "actions" &&
                          "sticky right-0 bg-muted/40 z-10 shadow-[-1px_0_0_0_hsl(var(--border))] w-[56px] text-center",
                      )}
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
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-border/40 transition-colors",
                      i % 2 === 0 ? "bg-card" : "bg-muted",
                      "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          textSizeClass,
                          "py-2.5",
                          cell.column.id === "actions" &&
                            "sticky right-0 z-10 p-0 shadow-[-1px_0_0_0_hsl(var(--border))]",
                          cell.column.id === "actions" &&
                            (i % 2 === 0 ? "bg-card" : "bg-muted"),
                        )}
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
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">No trips found</p>
                      <p className="text-xs opacity-70">
                        {hasFilter
                          ? "Try adjusting your search."
                          : "Start encoding to see your data."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
          Showing{" "}
          <span className="font-medium text-foreground">
            {table.getRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{filteredCount}</span>{" "}
          trip{filteredCount !== 1 ? "s" : ""}
          {pageCount > 1 && (
            <span className="text-muted-foreground/60">
              {" "}
              · page {currentPage} of {pageCount}
            </span>
          )}
        </p>

        <div className="flex items-center gap-2 order-1 sm:order-2 justify-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Prev</span>
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
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
