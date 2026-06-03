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
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type EggBatchRecord } from "./columns";

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

  const extractReportMetadata = (rows: { original: EggBatchRecord }[]) => {
    const farmSet = new Set(rows.map((r) => r.original.farmName));
    const yearSet = new Set(
      rows.map((r) =>
        new Date(r.original.arrivalDate).getFullYear().toString(),
      ),
    );

    let totalGood = 0;
    let totalLosses = 0;

    rows.forEach((r) => {
      const d = r.original;
      totalGood += d.qtySmall + d.qtyMedium + d.qtyLarge + d.qtyXl + d.qtyXxl;
      totalLosses += d.qtyCracked + d.qtyBroken + d.qtyDirty;
    });

    return {
      farmName: farmSet.size === 1 ? Array.from(farmSet)[0] : "All Farms",
      periodYear: yearSet.size === 1 ? Array.from(yearSet)[0] : "All Years",
      totalDeliveries: rows.length.toString(),
      totalGoodPieces: totalGood.toLocaleString(),
      totalLosses: totalLosses.toLocaleString(),
      grandTotal: (totalGood + totalLosses).toLocaleString(),
    };
  };

  const exportToCSV = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: EggBatchRecord;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const meta = extractReportMetadata(rows);

      const metaHeader = [
        `"Otso Dragon - Receiving Ledger"`,
        `"Farm Origin : ${meta.farmName}"`,
        `"Period / Year : ${meta.periodYear}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
        `"QA SUMMARY"`,
        `"Total Deliveries: ${meta.totalDeliveries}"`,
        `"Good Inventory (Pcs): ${meta.totalGoodPieces}"`,
        `"Total Losses (Pcs): ${meta.totalLosses}"`,
        `"Grand Total Volume: ${meta.grandTotal}"`,
        `""`,
      ].join("\n");

      const headers = [
        "Date",
        "Batch ID",
        "Farm Name",
        "Raw Cases",
        "Raw Trays",
        "Small",
        "Medium",
        "Large",
        "XL",
        "XXL",
        "Cracked",
        "Broken",
        "Dirty",
        "Total Good Pcs",
        "Total Bad Egg",
      ];

      const csvData = rows.map((row: { original: EggBatchRecord }) => {
        const d = row.original;
        const totalGood =
          d.qtySmall + d.qtyMedium + d.qtyLarge + d.qtyXl + d.qtyXxl;
        const totalLoss = d.qtyCracked + d.qtyBroken + d.qtyDirty;

        return [
          new Date(d.arrivalDate).toLocaleDateString(),
          `"${d.batchId}"`,
          `"${d.farmName}"`,
          d.rawCasesPickedUp,
          d.rawTraysPickedUp,
          d.qtySmall,
          d.qtyMedium,
          d.qtyLarge,
          d.qtyXl,
          d.qtyXxl,
          d.qtyCracked,
          d.qtyBroken,
          d.qtyDirty,
          totalGood,
          totalLoss,
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
        `Bodega_Receiving_Export_${getFormattedDate()}.csv`,
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
        original: EggBatchRecord;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const meta = extractReportMetadata(rows);
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(245, 158, 11); // Amber 500
      doc.text("Otso Dragon - Receiving Ledger", 40, 40);

      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(14);
      doc.text(meta.farmName, 40, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Period / Year : ${meta.periodYear}`, 40, 80);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US")}`,
        40,
        95,
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("QA SUMMARY", 800, 60, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(`Total Deliveries: ${meta.totalDeliveries}`, 800, 75, {
        align: "right",
      });
      doc.text(`Good Inventory (Pcs): ${meta.totalGoodPieces}`, 800, 90, {
        align: "right",
      });
      doc.text(`Losses (Pcs): ${meta.totalLosses}`, 800, 105, {
        align: "right",
      });
      doc.setFont("helvetica", "bold");
      doc.text(`Grand Total (Pcs): ${meta.grandTotal}`, 800, 120, {
        align: "right",
      });

      const tableRows = rows.map((row: { original: EggBatchRecord }) => {
        const d = row.original;
        const totalGood =
          d.qtySmall + d.qtyMedium + d.qtyLarge + d.qtyXl + d.qtyXxl;
        const totalLoss = d.qtyCracked + d.qtyBroken + d.qtyDirty;

        return [
          new Date(d.arrivalDate).toLocaleDateString(),
          d.batchId,
          d.farmName,
          d.rawCasesPickedUp.toString(),
          d.rawTraysPickedUp.toString(),
          d.qtySmall > 0 ? d.qtySmall.toString() : "-",
          d.qtyMedium > 0 ? d.qtyMedium.toString() : "-",
          d.qtyLarge > 0 ? d.qtyLarge.toString() : "-",
          d.qtyXl > 0 ? d.qtyXl.toString() : "-",
          d.qtyXxl > 0 ? d.qtyXxl.toString() : "-",
          d.qtyCracked > 0 ? d.qtyCracked.toString() : "-",
          d.qtyBroken > 0 ? d.qtyBroken.toString() : "-",
          d.qtyDirty > 0 ? d.qtyDirty.toString() : "-",
          totalGood.toLocaleString(),
          totalLoss.toLocaleString(),
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Date",
            "Batch ID",
            "Farm",
            "Cases",
            "Trays",
            "S",
            "M",
            "L",
            "XL",
            "XXL",
            "Cracked",
            "Broken",
            "Dirty",
            "Total Good",
            "Total Bad Egg",
          ],
        ],
        body: tableRows,
        startY: 145,
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
        headStyles: {
          fillColor: [245, 158, 11],
          fontSize: 8,
          halign: "center",
        }, // Amber 500
        columnStyles: {
          3: { halign: "right", textColor: [217, 119, 6] },
          4: { halign: "right", textColor: [217, 119, 6] },
          5: { halign: "right", textColor: [37, 99, 235] },
          6: { halign: "right", textColor: [37, 99, 235] },
          7: { halign: "right", textColor: [37, 99, 235] },
          8: { halign: "right", textColor: [37, 99, 235] },
          9: { halign: "right", textColor: [37, 99, 235] },
          10: { halign: "right", textColor: [225, 29, 72] },
          11: { halign: "right", textColor: [225, 29, 72] },
          12: { halign: "right", textColor: [234, 88, 12] },
          13: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
          14: { halign: "right", fontStyle: "bold", textColor: [225, 29, 72] },
        },
      });

      doc.save(`Bodega_Receiving_Ledger_${getFormattedDate()}.pdf`);
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
                ? "text-amber-500"
                : "text-slate-500 dark:text-slate-400 sm:group-focus-within:text-amber-500",
            )}
          />
          <Input
            placeholder="Search batches, farms..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={cn(
              "h-11 w-full rounded-xl! transition-all duration-500 ease-out border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-1 focus-visible:ring-amber-500/40",
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
                      ? "bg-amber-600 text-white"
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
            <SelectTrigger className="h-8 sm:h-9 w-[80px] sm:w-[90px] text-[10px] sm:text-xs bg-background border-border/60 rounded-lg focus:ring-1 focus:ring-amber-500/40">
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
                className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-[10px] sm:text-xs font-medium rounded-lg px-2 sm:px-3 shadow-none border-0"
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
              : `${filteredCount} record${filteredCount !== 1 ? "s" : ""} matching`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
            {globalFilter}
            <button
              onClick={() => setGlobalFilter("")}
              className="ml-0.5 hover:text-amber-900 dark:hover:text-amber-100"
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
                    "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
                    "animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both"
                  )}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(textSizeClass, "py-2.5")}
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
                    <PackageOpen className="h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No records found</p>
                    <p className="text-xs opacity-70">
                      {hasFilter
                        ? "Try adjusting your search."
                        : "Start receiving eggs to see your data."}
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
          record{filteredCount !== 1 ? "s" : ""}
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
                      ? "bg-amber-600 text-white"
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
