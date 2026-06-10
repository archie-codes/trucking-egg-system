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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type EggSaleRecord, getColumns } from "./columns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { updateEggSale } from "@/app/actions/egg-actions";
import { useRouter } from "next/navigation";

export function DataTable({
  data,
  isAdmin,
}: {
  data: EggSaleRecord[];
  isAdmin: boolean;
}) {
  "use no memo";

  const [glowingRowId, setGlowingRowId] = React.useState<number | null>(null);

  const handleRowUpdate = React.useCallback((id: number) => {
    setGlowingRowId(id);
    setTimeout(() => setGlowingRowId(null), 3000);
  }, []);

  const columns = React.useMemo(
    () => getColumns(isAdmin, handleRowUpdate),
    [isAdmin, handleRowUpdate],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [textSize, setTextSize] = React.useState<"xs" | "sm" | "base">("xs");
  const [viewData, setViewData] = React.useState<EggSaleRecord | null>(null);

  const [paymentAmount, setPaymentAmount] = React.useState<number | "">("");
  const [paymentDate, setPaymentDate] = React.useState<string>("");
  const [isPaymentCalendarOpen, setIsPaymentCalendarOpen] =
    React.useState(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (viewData) {
      setPaymentAmount("");
      setPaymentDate("");
    }
  }, [viewData]);

  const [shakeDate, setShakeDate] = React.useState(false);

  const handlePaymentSubmit = async () => {
    if (!viewData) return;
    if (paymentAmount === "" || paymentAmount === 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!paymentDate) {
      toast.error("Date Paid is required.");
      setShakeDate(true);
      setTimeout(() => setShakeDate(false), 600);
      return;
    }

    setIsSavingPayment(true);
    const toastId = toast.loading("Updating payment...");

    const newTotalPaid = viewData.amountPaid + Number(paymentAmount);

    const result = await updateEggSale({
      id: viewData.id,
      saleDate: viewData.saleDate,
      customerId: viewData.customerId,
      quantityTrays: viewData.quantityTrays,
      pricePerTray: viewData.pricePerTray,
      amountPaid: newTotalPaid,
      datePaid: paymentDate,
      remarks: viewData.remarks || "",
    });

    if (result.success) {
      toast.success("Payment updated successfully.", { id: toastId });
      setViewData(null);
      handleRowUpdate(viewData.id);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update payment.", { id: toastId });
    }
    setIsSavingPayment(false);
  };

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

  const extractReportMetadata = (rows: { original: EggSaleRecord }[]) => {
    const customerSet = new Set(rows.map((r) => r.original.customerId));
    let totalSales = 0;
    let totalPaid = 0;

    rows.forEach((r) => {
      totalSales += r.original.totalAmount;
      totalPaid += r.original.amountPaid;
    });

    return {
      customerName:
        customerSet.size === 1 ? Array.from(customerSet)[0] : "All Customers",
      totalTransactions: rows.length.toString(),
      totalSales: totalSales.toLocaleString(),
      totalPaid: totalPaid.toLocaleString(),
      totalBalance: (totalSales - totalPaid).toLocaleString(),
    };
  };

  const exportToCSV = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: EggSaleRecord;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const meta = extractReportMetadata(rows);

      const metaHeader = [
        `"Otso Dragon - Sales Ledger"`,
        `"Customer: ${meta.customerName}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
        `"FINANCIAL SUMMARY"`,
        `"Total Transactions: ${meta.totalTransactions}"`,
        `"Gross Sales (Php): ${meta.totalSales}"`,
        `"Total Collections (Php): ${meta.totalPaid}"`,
        `"Outstanding A/R (Php): ${meta.totalBalance}"`,
        `""`,
      ].join("\n");

      const headers = [
        "Date Delivered",
        "Customer Name",
        "Size",
        "Trays Sold",
        "Price Per Tray",
        "Total Amount",
        "Amount Paid",
        "Balance",
        "Status",
        "Date Paid",
      ];

      const csvData = rows.map((row: { original: EggSaleRecord }) => {
        const d = row.original;
        const balance = d.totalAmount - d.amountPaid;

        return [
          new Date(d.saleDate).toLocaleDateString(),
          `"${d.customerId}"`,
          `"${d.classification}"`,
          d.quantityTrays,
          d.pricePerTray,
          d.totalAmount,
          d.amountPaid,
          balance,
          `"${d.paymentStatus}"`,
          d.datePaid ? new Date(d.datePaid).toLocaleDateString() : '""',
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
        `Bodega_Sales_Export_${getFormattedDate()}.csv`,
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
        original: EggSaleRecord;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const meta = extractReportMetadata(rows);
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.text("Otso Dragon - Sales Ledger", 40, 40);

      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(14);
      doc.text(meta.customerName, 40, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US")}`,
        40,
        80,
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FINANCIAL SUMMARY", 800, 60, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(`Total Transactions: ${meta.totalTransactions}`, 800, 75, {
        align: "right",
      });
      doc.text(`Gross Sales (Php): ${meta.totalSales}`, 800, 90, {
        align: "right",
      });
      doc.text(`Total Collections (Php): ${meta.totalPaid}`, 800, 105, {
        align: "right",
      });
      doc.setFont("helvetica", "bold");
      doc.setTextColor(225, 29, 72); // Rose 600 for balance
      doc.text(`Outstanding A/R (Php): ${meta.totalBalance}`, 800, 120, {
        align: "right",
      });
      doc.setTextColor(51, 65, 85); // Reset

      const tableRows = rows.map((row: { original: EggSaleRecord }) => {
        const d = row.original;
        const balance = d.totalAmount - d.amountPaid;

        return [
          new Date(d.saleDate).toLocaleDateString(),
          d.customerId,
          d.classification,
          d.quantityTrays.toLocaleString(),
          d.pricePerTray.toLocaleString(),
          d.totalAmount.toLocaleString(),
          d.amountPaid.toLocaleString(),
          balance > 0 ? balance.toLocaleString() : "-",
          d.paymentStatus.toUpperCase(),
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Date",
            "Customer Name",
            "Size",
            "Trays",
            "Price",
            "Total",
            "Paid",
            "Balance",
            "Status",
          ],
        ],
        body: tableRows,
        startY: 145,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
        headStyles: {
          fillColor: [16, 185, 129], // Emerald 500
          fontSize: 9,
          halign: "center",
        },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
          6: { halign: "right", textColor: [16, 185, 129] }, // emerald
          7: { halign: "right", fontStyle: "bold", textColor: [225, 29, 72] }, // rose
          8: { halign: "center", fontStyle: "bold" },
        },
      });

      doc.save(`Bodega_Sales_Ledger_${getFormattedDate()}.pdf`);
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
    <>
      <style>
        {`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 3;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: inset 0 0 10px rgba(59,130,246,0.1); background-color: rgba(59,130,246,0.05); }
          50% { box-shadow: inset 0 0 30px rgba(59,130,246,0.5); background-color: rgba(59,130,246,0.25); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 1s ease-in-out infinite;
        }
        `}
      </style>
      <div className="flex flex-col flex-1 min-h-0 gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar - Animated Expand */}
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
                  ? "text-emerald-500"
                  : "text-slate-500 dark:text-slate-400 sm:group-focus-within:text-emerald-500",
              )}
            />
            <Input
              placeholder="Search customers, dates, status..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={cn(
                "h-11 w-full rounded-xl! transition-all duration-500 ease-out border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-1 focus-visible:ring-emerald-500/40",
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

          {/* Font Size, Density Controller and Export */}
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
                        ? "bg-emerald-600 text-white"
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
              <SelectTrigger className="h-8 sm:h-9 w-[80px] sm:w-[90px] text-[10px] sm:text-xs bg-background border-border/60 rounded-lg focus:ring-1 focus:ring-emerald-500/40">
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
                  className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[10px] sm:text-xs font-medium rounded-lg px-2 sm:px-3 shadow-none border-0"
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
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-950/40">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-teal-500" />
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
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
              {globalFilter}
              <button
                onClick={() => setGlobalFilter("")}
                className="ml-0.5 hover:text-emerald-900 dark:hover:text-emerald-100"
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
                          "sticky right-0 bg-card dark:bg-slate-900 z-30 shadow-[-1px_0_0_0_hsl(var(--border))] w-[56px] text-center",
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
            <TableBody className="group/tbody">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    style={{
                      animationFillMode: "both",
                      animationDelay: `${i * 40}ms`,
                    }}
                    className={cn(
                      "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
                      "group/row border-b border-border/40 transition-all duration-300 cursor-pointer relative",
                      "hover:shadow-md hover:z-20 hover:ring-1 hover:ring-emerald-400 dark:hover:ring-emerald-600",
                      glowingRowId === row.original.id
                        ? "animate-glow-pulse ring-1 ring-blue-400 dark:ring-blue-600 z-10"
                        : i % 2 === 0
                          ? "bg-card hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30"
                          : "bg-muted hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30"
                    )}
                    onClick={() => setViewData(row.original as EggSaleRecord)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          textSizeClass,
                          "py-2.5 transition-colors duration-300",
                          cell.column.id === "actions" &&
                            "sticky right-0 z-20 p-0 shadow-[-1px_0_0_0_hsl(var(--border))]",
                          cell.column.id === "actions" &&
                            (i % 2 === 0
                              ? "bg-card group-hover/row:bg-emerald-50/80 dark:group-hover/row:bg-emerald-900/30"
                              : "bg-muted dark:bg-slate-900/50 group-hover/row:bg-emerald-50/80 dark:group-hover/row:bg-emerald-900/30"),
                        )}
                        onClick={(e) => {
                          if (cell.column.id === "actions") {
                            e.stopPropagation();
                          }
                        }}
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
                      <p className="text-sm font-medium">
                        No sales records found
                      </p>
                      <p className="text-xs opacity-70">
                        {hasFilter
                          ? "Try adjusting your search."
                          : "Start selling eggs to see your data."}
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
                        ? "bg-emerald-600 text-white"
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

        {/* View Details Modal */}
        <Dialog
          open={!!viewData}
          onOpenChange={(open) => {
            if (!open) setViewData(null);
          }}
        >
          <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-xl border-0 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-500 to-teal-500" />

            <DialogHeader className="px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Sale Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400">
                    Comprehensive breakdown of outbound transaction
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {viewData &&
              (() => {
                const balance = viewData.totalAmount - viewData.amountPaid;
                const isPaid = balance <= 0;
                const isPartial = balance > 0 && viewData.amountPaid > 0;

                return (
                  <div className="p-4 sm:p-5 space-y-3 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {/* Info Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Customer Name
                        </span>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate text-sm">
                          {viewData.customerId}
                        </div>
                      </div>
                      <div className="space-y-1 sm:border-l sm:border-t-0 border-t border-slate-100 dark:border-slate-800 sm:pl-4 pt-3 sm:pt-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Date Delivered
                        </span>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(viewData.saleDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Breakdown Banner */}
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                      <div>
                        <div className="text-xs font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-wider mb-2">
                          DELIVERY DETAILS
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                            {viewData.quantityTrays}
                          </span>{" "}
                          <span className="text-sm text-blue-600/70 dark:text-blue-400/70 mr-2">
                            trays
                          </span>
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                            @ ₱{viewData.pricePerTray.toLocaleString()}
                          </span>{" "}
                          <span className="text-sm text-blue-600/70 dark:text-blue-400/70">
                            / tray
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block w-px h-10 bg-blue-200/60 dark:bg-blue-800/60"></div>
                      <div className="border-t border-blue-200/60 dark:border-blue-800/60 sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto text-center sm:text-right">
                        <div className="text-sm font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-wider mb-1">
                          EGG SIZE
                        </div>
                        <div className="text-xl font-bold font-sans text-blue-700 dark:text-blue-400 leading-none">
                          {viewData.classification}
                        </div>
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg mt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Payment Status
                      </span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" /> Paid in Full
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                          <Clock className="w-4 h-4" /> Partial Payment
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse">
                          <AlertCircle className="w-4 h-4" /> Unpaid
                        </span>
                      )}
                    </div>

                    {/* Financials Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 h-11 border-b border-slate-200 dark:border-slate-800 flex items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Accounts Receivable
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">
                            Gross Amount
                          </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            ₱{viewData.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-slate-500 font-medium">
                            Total Paid
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-500">
                            - ₱{viewData.amountPaid.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Remaining Balance
                          </span>
                          <span
                            className={cn(
                              "font-mono text-lg font-black",
                              balance > 0
                                ? "text-rose-600 dark:text-rose-500"
                                : "text-slate-400",
                            )}
                          >
                            ₱{balance > 0 ? balance.toLocaleString() : "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financials Breakdown */}

                    {viewData.datePaid && (
                      <div className="text-xs text-center text-slate-500 mt-4">
                        Last payment recorded on:{" "}
                        {new Date(viewData.datePaid).toLocaleDateString()}
                      </div>
                    )}

                    {isAdmin && balance > 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mt-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                          Post Additional Payment
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-500 uppercase">
                              Add Payment (₱)
                            </Label>
                            <Input
                              type="number"
                              placeholder={`Balance: ₱${balance.toLocaleString()}`}
                              value={
                                paymentAmount === 0 &&
                                paymentAmount.toString() !== "0"
                                  ? ""
                                  : paymentAmount
                              }
                              onChange={(e) =>
                                setPaymentAmount(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              onClick={(e) => e.currentTarget.select()}
                              className={cn(
                                "h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold placeholder:font-normal placeholder:text-slate-400",
                                Number(paymentAmount) > balance &&
                                  "animate-shake border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] focus-visible:ring-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600",
                              )}
                            />
                            <p
                              className={cn(
                                "text-[10px] font-medium text-rose-500 mt-1 flex items-center gap-1 transition-opacity",
                                Number(paymentAmount) > balance
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            >
                              <AlertCircle className="w-3 h-3" />
                              Amount exceeds remaining balance
                            </p>
                          </div>
                          <div className="space-y-1.5 flex flex-col">
                            <Label className="text-[11px] font-bold text-slate-500 uppercase">
                              Date Paid
                            </Label>
                            <Popover
                              open={isPaymentCalendarOpen}
                              onOpenChange={setIsPaymentCalendarOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-11 justify-start text-left font-normal rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors",
                                    !paymentDate && "text-muted-foreground",
                                    shakeDate &&
                                      "animate-shake border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] text-rose-500",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                  {paymentDate ? (
                                    format(
                                      new Date(paymentDate),
                                      "MMMM d, yyyy",
                                    )
                                  ) : (
                                    <span>No payment date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 z-200 rounded-xl"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    paymentDate
                                      ? new Date(paymentDate)
                                      : undefined
                                  }
                                  defaultMonth={
                                    paymentDate
                                      ? new Date(paymentDate)
                                      : undefined
                                  }
                                  disabled={(date) => date > new Date()}
                                  onSelect={(date) => {
                                    if (date) {
                                      setPaymentDate(
                                        format(date, "yyyy-MM-dd"),
                                      );
                                      setIsPaymentCalendarOpen(false);
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={handlePaymentSubmit}
                            disabled={
                              isSavingPayment ||
                              Number(paymentAmount) > balance ||
                              Number(paymentAmount) <= 0
                            }
                            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSavingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                Saving...
                              </>
                            ) : Number(paymentAmount) >= balance ? (
                              "Mark as Paid"
                            ) : (
                              "Submit Partial Payment"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
