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
  ChevronsLeft,
  ChevronsRight,
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
  LayoutList,
  LayoutGrid,
  Printer,
  User,
  PartyPopper,
  RotateCcw,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type EggSaleRecord,
  getColumns,
  ActionCell,
  RemarksCell,
} from "./columns";
import { getInvoiceTheme } from "./invoice-theme";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { updateEggSale, postInvoicePayment } from "@/app/actions/egg-actions";
import { useRouter } from "next/navigation";
import { triggerConfetti } from "@/components/ui/confetti";

export function DataTable({
  data,
  isAdmin,
}: {
  data: EggSaleRecord[];
  isAdmin: boolean;
}) {
  "use no memo";

  const [glowingRowId, setGlowingRowId] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<"table" | "grouped">(
    "grouped",
  );

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
  const [dateFilter, setDateFilter] = React.useState<{
    type: "all" | "today" | "custom";
    date?: Date;
  }>({ type: "all" });
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "paid" | "partial" | "unpaid"
  >("all");
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const [paymentAmount, setPaymentAmount] = React.useState<number | "">("");
  const [paymentDate, setPaymentDate] = React.useState<string>("");
  const [isPaymentCalendarOpen, setIsPaymentCalendarOpen] =
    React.useState(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState(false);
  const router = useRouter();

  const handleOpenViewData = (record: EggSaleRecord | null) => {
    setViewData(record);
    if (record) {
      setPaymentAmount("");
      setPaymentDate("");
    }
  };

  const [celebrationDetails, setCelebrationDetails] = React.useState<{
    invoiceId: string | null;
    customerName: string;
    amountSettled: number;
    datePaid: string;
  } | null>(null);

  React.useEffect(() => {
    if (celebrationDetails) {
      triggerConfetti();
    }
  }, [celebrationDetails]);

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
      quantityPieces: viewData.quantityPieces,
      palitBasag: viewData.palitBasag || 0,
      pricePerTray: viewData.pricePerTray,
      amountPaid: newTotalPaid,
      datePaid: paymentDate,
      remarks: viewData.remarks || "",
    });

    if (result.success) {
      toast.dismiss(toastId);
      const isFull = newTotalPaid >= viewData.totalAmount;
      if (isFull) {
        setViewData(null);
        setCelebrationDetails({
          invoiceId: viewData.invoiceId,
          customerName: viewData.customerId,
          amountSettled: viewData.totalAmount,
          datePaid: paymentDate,
        });
      } else {
        toast.success("Payment updated successfully.");
        setViewData(null);
        handleRowUpdate(viewData.id);
        router.refresh();
      }
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

  React.useEffect(() => {
    const col = table.getColumn("saleDate");
    if (!col) return;
    if (dateFilter.type === "all") {
      col.setFilterValue(undefined);
    } else if (dateFilter.type === "today") {
      col.setFilterValue(format(new Date(), "yyyy-MM-dd"));
    } else if (dateFilter.type === "custom" && dateFilter.date) {
      col.setFilterValue(format(dateFilter.date, "yyyy-MM-dd"));
    }
  }, [dateFilter, table]);

  React.useEffect(() => {
    const col = table.getColumn("paymentStatus");
    if (!col) return;
    if (statusFilter === "all") {
      col.setFilterValue(undefined);
    } else {
      col.setFilterValue(statusFilter);
    }
  }, [statusFilter, table]);

  const filteredTableRows = table.getFilteredRowModel().rows;

  const groupedInvoices = React.useMemo(() => {
    const filteredRows = filteredTableRows.map(
      (r) => r.original as EggSaleRecord,
    );
    const groupsMap = new Map<string, EggSaleRecord[]>();

    filteredRows.forEach((item) => {
      const key = item.invoiceId || `NO_INV_${item.id}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(item);
    });

    const allGroups = Array.from(groupsMap.entries()).map(([key, items]) => {
      const isNoInvoice = key.startsWith("NO_INV_");
      const invoiceId = isNoInvoice ? null : key;
      const first = items[0];

      const totalAmount = items.reduce(
        (acc, curr) => acc + curr.totalAmount,
        0,
      );
      const amountPaid = items.reduce((acc, curr) => acc + curr.amountPaid, 0);
      const rawBalance = totalAmount - amountPaid;
      const balance = Math.max(0, Math.round(rawBalance * 100) / 100);
      const totalTrays = items.reduce(
        (acc, curr) => acc + curr.quantityTrays,
        0,
      );
      const totalPieces = items.reduce(
        (acc, curr) => acc + curr.quantityPieces,
        0,
      );
      const totalPalitBasag = items.reduce(
        (acc, curr) => acc + (curr.palitBasag || 0),
        0,
      );
      const totalEggs = (totalTrays + totalPalitBasag) * 30 + totalPieces;

      let paymentStatus: "paid" | "partial" | "unpaid" = "unpaid";
      if (
        balance <= 0.01 ||
        items.every(
          (i) =>
            i.paymentStatus === "paid" || i.totalAmount - i.amountPaid <= 0.01,
        )
      ) {
        paymentStatus = "paid";
      } else if (amountPaid > 0) {
        paymentStatus = "partial";
      }

      const paidDates = items
        .map((i) => i.datePaid)
        .filter((d): d is string => Boolean(d));
      const latestDatePaid =
        paidDates.length > 0
          ? paidDates.sort(
              (a, b) => new Date(b).getTime() - new Date(a).getTime(),
            )[0]
          : first.datePaid;

      return {
        groupKey: key,
        invoiceId,
        customerId: first.customerId,
        saleDate: first.saleDate,
        preparedBy: first.preparedBy || "System",
        datePaid: latestDatePaid,
        paymentStatus,
        totalAmount,
        amountPaid,
        balance,
        totalTrays,
        totalPieces,
        totalPalitBasag,
        totalEggs,
        items,
        theme: getInvoiceTheme(invoiceId),
      };
    });

    if (statusFilter !== "all") {
      return allGroups.filter((g) => g.paymentStatus === statusFilter);
    }

    return allGroups;
  }, [filteredTableRows, statusFilter]);

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalGroupedCount = groupedInvoices.length;
  const groupedPageCount = Math.ceil(totalGroupedCount / pageSize) || 1;

  const paginatedGroups = React.useMemo(() => {
    return groupedInvoices.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize,
    );
  }, [groupedInvoices, pageIndex, pageSize]);

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
        `"Otso Dragon - Sales Ledger (${viewMode === "grouped" ? "Grouped View" : "Table View"})"`,
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
        "Invoice No.",
        "Date Delivered",
        "Customer Name",
        "Size",
        "Trays Sold",
        "Extra Pcs",
        "Palit Basag",
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
          `"${d.invoiceId || "-"}"`,
          new Date(d.saleDate).toLocaleDateString(),
          `"${d.customerId}"`,
          `"${d.classification}"`,
          d.quantityTrays,
          d.quantityPieces,
          d.palitBasag || 0,
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
        `Bodega_Sales_Export_${viewMode}_${getFormattedDate()}.csv`,
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
      doc.text(
        `Otso Dragon - ${viewMode === "grouped" ? "Grouped Invoice Sales Ledger" : "Sales Ledger"}`,
        40,
        40,
      );

      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(14);
      doc.text(meta.customerName, 40, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US")} (${viewMode === "grouped" ? "Grouped Invoice View" : "Standard Table View"})`,
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

      if (viewMode === "grouped") {
        // Grouped View PDF Export
        const pdfBody: RowInput[] = [];
        groupedInvoices.forEach((group) => {
          const formattedDate = format(
            new Date(group.saleDate),
            "MMM dd, yyyy",
          );
          // Group Section Header
          pdfBody.push([
            {
              content: `INVOICE #${group.invoiceId || "NO-INV"}   |   Customer: ${group.customerId}   |   Date: ${formattedDate}   |   Status: ${group.paymentStatus === "paid" ? "FULLY PAID" : group.paymentStatus.toUpperCase()}   |   Gross: P${group.totalAmount.toLocaleString()}   |   Paid: P${group.amountPaid.toLocaleString()}   |   Balance: P${group.balance.toLocaleString()}`,
              colSpan: 11,
              styles: {
                fillColor: [230, 242, 238],
                textColor: [15, 23, 42],
                fontStyle: "bold",
                fontSize: 8.5,
              },
            },
          ]);

          // Itemized rows
          group.items.forEach((d) => {
            const itemTotalPcs =
              (d.quantityTrays + (d.palitBasag || 0)) * 30 + d.quantityPieces;

            pdfBody.push([
              d.invoiceId || "-",
              format(new Date(d.saleDate), "MM/dd/yyyy"),
              d.customerId,
              d.classification.toUpperCase(),
              d.quantityTrays.toLocaleString(),
              d.quantityPieces > 0 ? `+${d.quantityPieces}` : "-",
              d.palitBasag ? `${d.palitBasag}` : "-",
              itemTotalPcs.toLocaleString(),
              d.pricePerTray.toLocaleString(),
              d.totalAmount.toLocaleString(),
              d.paymentStatus.toUpperCase(),
            ]);
          });
        });

        autoTable(doc, {
          head: [
            [
              "Invoice No.",
              "Date",
              "Customer Name",
              "Size",
              "Trays",
              "Pcs",
              "Palit Basag",
              "Total Pcs",
              "Price (P)",
              "Total (P)",
              "Status",
            ],
          ],
          body: pdfBody,
          startY: 145,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
          headStyles: {
            fillColor: [16, 185, 129], // Emerald 500
            fontSize: 8.5,
            halign: "center",
          },
          columnStyles: {
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right" },
            8: { halign: "right" },
            9: { halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
            10: { halign: "center", fontStyle: "bold" },
          },
        });
      } else {
        // Standard Table View PDF Export
        const tableRows = rows.map((row: { original: EggSaleRecord }) => {
          const d = row.original;
          const balance = d.totalAmount - d.amountPaid;
          const totalPcs =
            (d.quantityTrays + (d.palitBasag || 0)) * 30 + d.quantityPieces;

          return [
            d.invoiceId || "-",
            new Date(d.saleDate).toLocaleDateString(),
            d.customerId,
            d.classification.toUpperCase(),
            d.quantityTrays.toLocaleString(),
            d.quantityPieces > 0 ? `+${d.quantityPieces}` : "-",
            d.palitBasag ? `${d.palitBasag}` : "-",
            totalPcs.toLocaleString(),
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
              "Invoice No.",
              "Date",
              "Customer Name",
              "Size",
              "Trays",
              "Pcs",
              "Palit Basag",
              "Total Pcs",
              "Price (P)",
              "Total (P)",
              "Paid (P)",
              "Balance (P)",
              "Status",
            ],
          ],
          body: tableRows,
          startY: 145,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
          headStyles: {
            fillColor: [16, 185, 129], // Emerald 500
            fontSize: 8.5,
            halign: "center",
          },
          columnStyles: {
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right" },
            8: { halign: "right" },
            9: { halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
            10: { halign: "right", textColor: [16, 185, 129] }, // emerald
            11: {
              halign: "right",
              fontStyle: "bold",
              textColor: [225, 29, 72],
            }, // rose
            12: { halign: "center", fontStyle: "bold" },
          },
        });
      }

      doc.save(`Bodega_Sales_Ledger_${viewMode}_${getFormattedDate()}.pdf`);
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
  const isAnyFilterActive =
    globalFilter.length > 0 ||
    statusFilter !== "all" ||
    dateFilter.type !== "all";

  const resetAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter("all");
    setDateFilter({ type: "all" });
  };

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
        {/* ── TOOLBAR & FILTERS ── */}
        <div className="flex flex-col gap-2.5 shrink-0">
          {/* Top Row: Search & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search customers, dates, status..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9.5 w-full pl-9 pr-8 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-xs text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-emerald-500/40"
              />
              {globalFilter.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Actions (Reset Filters) */}
            {isAnyFilterActive && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAllFilters}
                  className="h-8.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 font-medium cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Row: Filter Dropdowns Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-1.5 uppercase tracking-wider hidden md:inline-block">
              Filters:
            </span>

            {/* Status Filter Dropdown */}
            <Select
              value={statusFilter}
              onValueChange={(val: "all" | "paid" | "partial" | "unpaid") =>
                setStatusFilter(val)
              }
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-8.5 w-auto min-w-[125px] sm:min-w-[140px] text-[10px] sm:text-xs rounded-lg border-border/60 bg-background font-normal cursor-pointer px-2.5",
                  statusFilter !== "all" &&
                    "text-emerald-600 dark:text-emerald-500 font-semibold bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40",
                )}
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent align="start" className="z-110">
                <SelectItem value="all" className="cursor-pointer text-xs">
                  All Statuses
                </SelectItem>
                <SelectItem value="paid" className="cursor-pointer text-xs">
                  Fully Paid
                </SelectItem>
                <SelectItem value="partial" className="cursor-pointer text-xs">
                  Partial
                </SelectItem>
                <SelectItem value="unpaid" className="cursor-pointer text-xs">
                  Unpaid
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter Selector */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 sm:h-8.5 w-auto min-w-[130px] sm:min-w-[140px] justify-start text-left font-normal rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer px-2.5",
                    dateFilter.type !== "all" &&
                      "text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40",
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {dateFilter.type === "all"
                      ? "View All Dates"
                      : dateFilter.type === "today"
                        ? "Today"
                        : dateFilter.date
                          ? format(dateFilter.date, "MMM dd, yyyy")
                          : "Custom Date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-110" align="start">
                <div className="flex flex-col sm:flex-row sm:divide-x divide-border">
                  <div className="p-2 space-y-1 flex flex-col sm:w-32 shrink-0">
                    <Button
                      variant={
                        dateFilter.type === "all" ? "secondary" : "ghost"
                      }
                      className="w-full justify-start text-xs h-8 cursor-pointer"
                      onClick={() => {
                        setDateFilter({ type: "all" });
                        setIsDatePickerOpen(false);
                      }}
                    >
                      View All
                    </Button>
                    <Button
                      variant={
                        dateFilter.type === "today" ? "secondary" : "ghost"
                      }
                      className="w-full justify-start text-xs h-8 cursor-pointer"
                      onClick={() => {
                        setDateFilter({ type: "today" });
                        setIsDatePickerOpen(false);
                      }}
                    >
                      Today
                    </Button>
                  </div>
                  <div className="p-2 border-t sm:border-t-0 border-border">
                    <Calendar
                      mode="single"
                      selected={dateFilter.date}
                      defaultMonth={dateFilter.date}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={new Date().getFullYear() + 1}
                      onSelect={(date) => {
                        if (date) {
                          setDateFilter({ type: "custom", date });
                          setIsDatePickerOpen(false);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      className="rounded-md border-0"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border/60 bg-background p-0.5 h-8 sm:h-8.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
                title="Standard Table View"
              >
                <LayoutList className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all cursor-pointer",
                  viewMode === "grouped"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
                title="Group by Invoice View"
              >
                <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline font-semibold">Grouped</span>
              </button>
            </div>

            {/* Text Size Control */}
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-border/60 bg-background px-1.5 sm:px-2.5 h-8 sm:h-8.5">
              <Type className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-0.5">
                {(["xs", "sm", "base"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={cn(
                      "px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer",
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

            {/* Rows Per Page */}
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 sm:h-8.5 w-[80px] sm:w-[90px] text-[10px] sm:text-xs bg-background border-border/60 rounded-lg focus:ring-1 focus:ring-emerald-500/40 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-110">
                {[5, 10, 20, 30, 50, 100].map((n) => (
                  <SelectItem
                    key={n}
                    value={`${n}`}
                    className="text-xs cursor-pointer"
                  >
                    {n} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export 3-Dot Dropdown at right end of filter row */}
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 sm:h-8.5 w-8 sm:w-8.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Export Options"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Export options</span>
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
          {viewMode === "table" ? (
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
                  table.getRowModel().rows.map((row, i) => {
                    const currentInvoiceId = row.original.invoiceId;
                    const prevInvoiceId =
                      i > 0
                        ? table.getRowModel().rows[i - 1].original.invoiceId
                        : null;
                    const isNewInvoiceGroup =
                      i > 0 &&
                      currentInvoiceId &&
                      currentInvoiceId !== prevInvoiceId;
                    const theme = getInvoiceTheme(currentInvoiceId);

                    return (
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
                          currentInvoiceId && `border-l-4 ${theme.border}`,
                          isNewInvoiceGroup && `${theme.borderTop} border-t-2`,
                          glowingRowId === row.original.id
                            ? "animate-glow-pulse ring-1 ring-blue-400 dark:ring-blue-600 z-10"
                            : i % 2 === 0
                              ? "bg-card hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30"
                              : "bg-muted hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30",
                        )}
                        onClick={() =>
                          handleOpenViewData(row.original as EggSaleRecord)
                        }
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
                    );
                  })
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
          ) : (
            <div className="p-3 sm:p-4 space-y-4 overflow-auto custom-scrollbar flex-1 min-h-0">
              {paginatedGroups.length ? (
                paginatedGroups.map((group) => (
                  <InvoiceGroupCard
                    key={group.groupKey}
                    group={group}
                    isAdmin={isAdmin}
                    onRowClick={(item) => handleOpenViewData(item)}
                    onRowUpdate={handleRowUpdate}
                    glowingRowId={glowingRowId}
                    textSizeClass={textSizeClass}
                    onSuccessPayment={(details) =>
                      setCelebrationDetails(details)
                    }
                  />
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <PackageOpen className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-medium">No sales records found</p>
                  <p className="text-xs opacity-70">
                    {hasFilter
                      ? "Try adjusting your search."
                      : "Start selling eggs to see your data."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
            {viewMode === "table" ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {table.getRowModel().rows.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredCount}
                </span>{" "}
                record{filteredCount !== 1 ? "s" : ""}
                {pageCount > 1 && (
                  <span className="text-muted-foreground/60">
                    {" "}
                    · page {currentPage} of {pageCount}
                  </span>
                )}
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {paginatedGroups.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalGroupedCount}
                </span>{" "}
                invoice transaction{totalGroupedCount !== 1 ? "s" : ""} (
                {filteredCount} total records)
                {groupedPageCount > 1 && (
                  <span className="text-muted-foreground/60">
                    {" "}
                    · page {currentPage} of {groupedPageCount}
                  </span>
                )}
              </>
            )}
          </p>

          <div className="flex items-center gap-2 order-1 sm:order-2 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={
                viewMode === "table"
                  ? !table.getCanPreviousPage()
                  : pageIndex === 0
              }
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(Math.max(0, pageIndex - 1))}
              disabled={
                viewMode === "table"
                  ? !table.getCanPreviousPage()
                  : pageIndex === 0
              }
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                {
                  length: Math.min(
                    viewMode === "table" ? pageCount : groupedPageCount,
                    5,
                  ),
                },
                (_, i) => {
                  const activePageCount =
                    viewMode === "table" ? pageCount : groupedPageCount;
                  let page = i;
                  if (activePageCount > 5) {
                    let startPage = Math.max(0, currentPage - 1 - 2);
                    if (startPage + 4 >= activePageCount) {
                      startPage = Math.max(0, activePageCount - 5);
                    }
                    page = startPage + i;
                  }
                  const isActive = page === currentPage - 1;
                  return (
                    <button
                      key={page}
                      onClick={() => table.setPageIndex(page)}
                      className={cn(
                        "w-7 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {page + 1}
                    </button>
                  );
                },
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(pageIndex + 1)}
              disabled={
                viewMode === "table"
                  ? !table.getCanNextPage()
                  : pageIndex >= groupedPageCount - 1
              }
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                table.setPageIndex(
                  (viewMode === "table" ? pageCount : groupedPageCount) - 1,
                )
              }
              disabled={
                viewMode === "table"
                  ? !table.getCanNextPage()
                  : pageIndex >= groupedPageCount - 1
              }
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
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
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex flex-col gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-32 shrink-0">
                            INVOICE NO:
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                            {viewData.invoiceId || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-32 shrink-0">
                            DATE DELIVERED:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {new Date(viewData.saleDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-32 shrink-0">
                            CUSTOMER NAME:
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate">
                            {viewData.customerId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-32 shrink-0">
                            PREPARED BY:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                            {viewData.preparedBy || "System"}
                          </span>
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
                            {viewData.quantityTrays === 1 ? "tray" : "trays"}
                          </span>
                          {viewData.quantityPieces > 0 && (
                            <>
                              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                                + {viewData.quantityPieces}
                              </span>{" "}
                              <span className="text-sm text-blue-600/70 dark:text-blue-400/70 mr-2">
                                pcs
                              </span>
                            </>
                          )}
                          {(viewData.palitBasag || 0) > 0 && (
                            <>
                              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                                + {viewData.palitBasag}
                              </span>{" "}
                              <span className="text-sm text-purple-600/70 dark:text-purple-400/70 mr-2 font-bold">
                                free (palit basag)
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                            @ ₱{viewData.pricePerTray.toLocaleString()}
                          </span>{" "}
                          <span>/ tray</span>
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

        {/* Fully Paid Success Celebration Modal */}
        <Dialog
          open={!!celebrationDetails}
          onOpenChange={(open) => {
            if (!open) {
              setCelebrationDetails(null);
              router.refresh();
            }
          }}
        >
          <DialogContent className="max-w-sm rounded-2xl p-6 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 shadow-xl text-center space-y-4 z-200">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <PartyPopper className="w-7 h-7" />
            </div>

            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Invoice Fully Paid!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                All balance for this transaction has been cleared successfully
              </DialogDescription>
            </div>

            {/* Invoice Summary Details Box */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Invoice No:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {celebrationDetails?.invoiceId
                    ? `# ${celebrationDetails.invoiceId}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Customer Name:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate max-w-[160px]">
                  {celebrationDetails?.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Date Settled:
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {celebrationDetails?.datePaid
                    ? format(
                        new Date(celebrationDetails.datePaid),
                        "MMM dd, yyyy",
                      )
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-100 uppercase text-[11px]">
                  Total Settled:
                </span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                  ₱{celebrationDetails?.amountSettled.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                setCelebrationDetails(null);
                router.refresh();
              }}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md"
            >
              OK
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

interface InvoiceGroupCardProps {
  group: {
    groupKey: string;
    invoiceId: string | null;
    customerId: string;
    saleDate: string;
    preparedBy?: string | null;
    datePaid: string | null;
    paymentStatus: "paid" | "partial" | "unpaid";
    totalAmount: number;
    amountPaid: number;
    balance: number;
    totalTrays: number;
    totalPieces: number;
    totalPalitBasag: number;
    totalEggs: number;
    items: EggSaleRecord[];
    theme: ReturnType<typeof getInvoiceTheme>;
  };
  isAdmin: boolean;
  onRowClick: (record: EggSaleRecord) => void;
  onRowUpdate?: (id: number) => void;
  glowingRowId: number | null;
  textSizeClass: string;
  onSuccessPayment: (details: {
    invoiceId: string | null;
    customerName: string;
    amountSettled: number;
    datePaid: string;
  }) => void;
}

function InvoiceGroupCard({
  group,
  isAdmin,
  onRowClick,
  onRowUpdate,
  glowingRowId,
  textSizeClass,
  onSuccessPayment,
}: InvoiceGroupCardProps) {
  const router = useRouter();

  const [isGroupPaymentOpen, setIsGroupPaymentOpen] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState<number | "">(
    group.balance,
  );
  const [paymentDate, setPaymentDate] = React.useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleGroupPaymentOpenChange = (open: boolean) => {
    setIsGroupPaymentOpen(open);
    if (open) {
      setPaymentAmount(group.balance);
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
    }
  };

  const handleGroupPaymentSubmit = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    if (!paymentDate) {
      toast.error("Date Paid is required.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing group payment...");

    const itemIds = group.items.map((i) => i.id);
    const result = await postInvoicePayment({
      invoiceId: group.invoiceId,
      itemIds: group.invoiceId ? undefined : itemIds,
      additionalAmountPaid: Number(paymentAmount),
      datePaid: paymentDate,
    });

    if (result.success) {
      toast.dismiss(toastId);
      const isFull = Number(paymentAmount) >= group.balance;
      setIsGroupPaymentOpen(false);

      if (isFull) {
        onSuccessPayment({
          invoiceId: group.invoiceId,
          customerName: group.customerId,
          amountSettled: group.totalAmount,
          datePaid: paymentDate,
        });
      } else {
        toast.success("Group payment posted successfully!");
        router.refresh();
      }
    } else {
      toast.error(result.error || "Failed to post payment.", { id: toastId });
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-xs transition-all duration-300 overflow-hidden flex flex-col",
        group.theme.cardBorder,
        group.theme.border,
        "border-l-4",
      )}
    >
      {/* Card Header */}
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 border-b",
          group.theme.cardHeaderBg,
          group.theme.cardBorder,
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={cn(
                "font-mono text-xs font-bold px-2.5 py-1 rounded-md border shadow-2xs whitespace-nowrap",
                group.theme.badgeBg,
                group.theme.badgeText,
                group.theme.badgeBorder,
              )}
            >
              {group.invoiceId ? `# ${group.invoiceId}` : "No Invoice No."}
            </div>

            <div className="flex items-center gap-1.5 font-black uppercase text-slate-800 dark:text-slate-100 text-sm">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{group.customerId}</span>
            </div>

            {/* Payment Status Badge */}
            {group.paymentStatus === "paid" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                  strokeWidth={3}
                />{" "}
                Fully Paid
              </span>
            ) : group.paymentStatus === "partial" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <Clock
                  className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"
                  strokeWidth={3}
                />{" "}
                Partial
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800/50 animate-pulse">
                <AlertCircle
                  className="w-3.5 h-3.5 text-red-600 dark:text-red-400"
                  strokeWidth={3}
                />{" "}
                Unpaid
              </span>
            )}
          </div>

          {/* Dates Subtitle: Delivered Date | Paid Date | Prepared By */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
              Delivered: {format(new Date(group.saleDate), "MMM dd, yyyy")}
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">
              |
            </span>
            <span className="flex items-center gap-1">
              Paid:{" "}
              {group.datePaid
                ? format(new Date(group.datePaid), "MMM dd, yyyy")
                : "-"}
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">
              |
            </span>
            <span className="flex items-center gap-1">
              Prepared By:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                {group.preparedBy || "System"}
              </span>
            </span>
          </div>
        </div>

        {/* Financial Summary & Actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                Gross Total
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                ₱{group.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Paid
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ₱{group.amountPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wide">
                Balance
              </span>
              <span
                className={cn(
                  "font-mono font-bold",
                  group.balance > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-400",
                )}
              >
                ₱{group.balance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && group.balance > 0 && (
              <Button
                size="sm"
                onClick={() => handleGroupPaymentOpenChange(true)}
                className="h-8 gap-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Pay Invoice</span>
              </Button>
            )}

            {group.invoiceId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/egg-sales/sales/receipt/${group.invoiceId}?from=history`,
                  )
                }
                className="h-8 gap-1.5 text-xs font-semibold rounded-lg bg-background hover:bg-muted border-border/80 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Receipt</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Egg Breakdown */}
      <div className="overflow-x-auto">
        <Table className={cn(textSizeClass, "w-full min-w-[600px]")}>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40 text-[10px] uppercase font-bold text-slate-400">
              <TableHead className="py-2 h-7 font-bold">
                Size / Classification
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-right">
                Trays
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-right">
                Extra Pcs
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-right text-purple-600 dark:text-purple-400">
                Palit Basag
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-right">
                Total Pcs
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-right">
                Price (₱)
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-right">
                Line Total (₱)
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-center">
                Status
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-center">
                Remarks
              </TableHead>
              <TableHead className="py-2 h-7 font-bold text-center w-12">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.items.map((item) => {
              const cls = item.classification.toUpperCase();
              let colorClass = "text-blue-600 dark:text-blue-400";
              if (cls === "CRACKED" || cls === "BROWN_CRACKED")
                colorClass = "text-red-600 dark:text-red-400";
              else if (cls === "BROKEN" || cls === "BROWN_BROKEN")
                colorClass = "text-rose-600 dark:text-rose-400";
              else if (cls === "DIRTY" || cls === "BROWN_DIRTY")
                colorClass = "text-stone-600 dark:text-stone-400";
              else if (cls.startsWith("BROWN_"))
                colorClass = "text-amber-700 dark:text-amber-500";

              const itemTotalPcs =
                (item.quantityTrays + (item.palitBasag || 0)) * 30 +
                item.quantityPieces;

              return (
                <TableRow
                  key={item.id}
                  onClick={() => onRowClick(item)}
                  className={cn(
                    "border-b border-border/30 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors",
                    glowingRowId === item.id &&
                      "animate-glow-pulse ring-1 ring-blue-400 dark:ring-blue-600",
                  )}
                >
                  <TableCell className="py-2 font-black uppercase">
                    <span className={colorClass}>{cls}</span>
                  </TableCell>
                  <TableCell className="py-2 text-right font-black text-slate-700 dark:text-slate-300">
                    {item.quantityTrays}
                  </TableCell>
                  <TableCell className="py-2 text-right font-black text-amber-600 dark:text-amber-500">
                    {item.quantityPieces > 0 ? `+${item.quantityPieces}` : "-"}
                  </TableCell>
                  <TableCell className="py-2 text-right font-black text-purple-600 dark:text-purple-400">
                    {item.palitBasag
                      ? `${item.palitBasag} ${item.palitBasag === 1 ? "tray" : "trays"}`
                      : "-"}
                  </TableCell>
                  <TableCell className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-500">
                    {itemTotalPcs.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2 text-right font-mono text-slate-500">
                    {item.pricePerTray.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {item.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className="py-2 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.paymentStatus === "paid" ||
                    item.totalAmount - item.amountPaid <= 0.01 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Paid
                      </span>
                    ) : item.amountPaid > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 cursor-help"
                        title={`Paid: ₱${item.amountPaid.toLocaleString()} / ₱${item.totalAmount.toLocaleString()}`}
                      >
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Partial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        Unpaid
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="py-2 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RemarksCell note={item.remarks} />
                  </TableCell>
                  <TableCell
                    className="py-2 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionCell
                      sale={item}
                      isAdmin={isAdmin}
                      onRowUpdate={onRowUpdate}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Card Footer Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-muted/20 border-t border-border/40 text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          <strong className="text-slate-700 dark:text-slate-300">
            {group.items.length}
          </strong>{" "}
          {group.items.length === 1
            ? "egg classification"
            : "egg classifications"}
        </span>
        <div className="flex items-center gap-3">
          <span>
            Total Volume:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {group.totalTrays} {group.totalTrays === 1 ? "Tray" : "Trays"}
            </strong>{" "}
            {group.totalPieces > 0 ? `+ ${group.totalPieces} pcs` : ""} (
            {group.totalEggs.toLocaleString()} pcs total)
          </span>
        </div>
      </div>
      {/* Group Payment Modal */}
      <Dialog
        open={isGroupPaymentOpen}
        onOpenChange={handleGroupPaymentOpenChange}
      >
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Post Group Payment
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Apply payment to entire invoice #{group.invoiceId || "Group"}{" "}
                  ({group.items.length}{" "}
                  {group.items.length === 1 ? "item" : "items"})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Group Info Summary */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {group.customerId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Gross Total:</span>
                <span className="font-mono font-bold">
                  ₱{group.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Already Paid:
                </span>
                <span className="font-mono font-bold text-emerald-600">
                  ₱{group.amountPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Remaining Balance:
                </span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  ₱{group.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Inputs */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">
                  Payment Amount (₱)
                </Label>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(group.balance)}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Full Balance (₱{group.balance.toLocaleString()})
                </button>
              </div>
              <Input
                type="number"
                placeholder={`Max: ₱${group.balance.toLocaleString()}`}
                value={
                  paymentAmount === 0 && paymentAmount.toString() !== "0"
                    ? ""
                    : paymentAmount
                }
                onChange={(e) =>
                  setPaymentAmount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                onClick={(e) => e.currentTarget.select()}
                className={cn(
                  "h-11 border-slate-200 dark:border-slate-800 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold text-base",
                  Number(paymentAmount) > group.balance &&
                    "border-rose-500 text-rose-600 bg-rose-50",
                )}
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">
                Date Paid
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 h-11 text-sm font-medium"
                  >
                    <span>
                      {paymentDate
                        ? format(new Date(paymentDate), "MMM dd, yyyy")
                        : "Select Date Paid"}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-xl z-200"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={paymentDate ? new Date(paymentDate) : undefined}
                    disabled={(date) => date > new Date()}
                    onSelect={(date) => {
                      if (date) {
                        setPaymentDate(format(date, "yyyy-MM-dd"));
                        setIsCalendarOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsGroupPaymentOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGroupPaymentSubmit}
              disabled={
                isSubmitting ||
                Number(paymentAmount) <= 0 ||
                Number(paymentAmount) > group.balance
              }
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : Number(paymentAmount) >= group.balance ? (
                "Pay Full Invoice"
              ) : (
                "Submit Partial Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
