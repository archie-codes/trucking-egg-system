"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  parseISO,
  isToday,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  Banknote,
  TrendingUp,
  PackageOpen,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  User,
  Search,
  CalendarIcon,
  X,
  CreditCard,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Type,
  Layers,
  List,
  Eye,
  Printer,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getInvoiceTheme } from "../history/invoice-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EggSaleRecord = {
  id: number;
  invoiceId?: string | null;
  saleDate: string; // YYYY-MM-DD
  customerId: string;
  classification: string;
  quantityTrays: number;
  quantityPieces?: number;
  palitBasag?: number;
  pricePerTray: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  datePaid?: string | null;
  preparedBy?: string | null;
};

export type GroupedInvoice = {
  id: string;
  invoiceId?: string | null;
  customerId: string;
  saleDate: string;
  datePaid?: string | null;
  preparedBy?: string | null;
  items: EggSaleRecord[];
  totalTrays: number;
  totalPieces: number;
  totalPalitBasag: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  effectiveStatus: "paid" | "partial" | "unpaid";
};

// Compact number formatter for millions/billions
function formatCompactAmount(value: number): {
  formatted: string;
  full: string;
} {
  const full = `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

  if (value >= 1_000_000_000) {
    const bVal = (value / 1_000_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return { formatted: `₱${bVal}B`, full };
  }

  if (value >= 1_000_000) {
    const mVal = (value / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return { formatted: `₱${mVal}M`, full };
  }

  return { formatted: full, full };
}

function formatCompactVolume(trays: number): {
  formatted: string;
  full: string;
} {
  const label = trays === 1 ? "tray" : "trays";
  const full = `${trays.toLocaleString()} ${label}`;

  if (trays >= 1_000_000_000) {
    const bVal = (trays / 1_000_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return { formatted: `${bVal}B`, full };
  }

  if (trays >= 1_000_000) {
    const mVal = (trays / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return { formatted: `${mVal}M`, full };
  }

  return { formatted: trays.toLocaleString(), full };
}

export function SummaryDashboard({
  data,
}: {
  data: EggSaleRecord[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customerPage, setCustomerPage] = useState<number>(1);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState<boolean>(false);
  const CUSTOMERS_PER_PAGE = 12;

  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "partial" | "unpaid"
  >("all");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [textSize, setTextSize] = useState<"xs" | "sm" | "base">("xs");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // View Mode: Grouped Invoices vs Itemized Lines
  const [viewMode, setViewMode] = useState<"invoices" | "itemized">("invoices");
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<GroupedInvoice | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const textSizeClass = { xs: "text-xs", sm: "text-sm", base: "text-base" }[
    textSize
  ];

  // Extract unique customer list
  const customerList = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.customerId && d.customerId.trim() !== "") {
        set.add(d.customerId.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  // Filter customer list by search query
  const filteredCustomerOptions = useMemo(() => {
    if (!customerSearch.trim()) return customerList;
    return customerList.filter((c) =>
      c.toLowerCase().includes(customerSearch.toLowerCase()),
    );
  }, [customerList, customerSearch]);

  const totalCustomerPages =
    Math.ceil(filteredCustomerOptions.length / CUSTOMERS_PER_PAGE) || 1;

  const paginatedCustomerOptions = useMemo(() => {
    const start = (customerPage - 1) * CUSTOMERS_PER_PAGE;
    return filteredCustomerOptions.slice(start, start + CUSTOMERS_PER_PAGE);
  }, [filteredCustomerOptions, customerPage]);

  // Main Filtering Logic
  const filteredSales = useMemo(() => {
    return data.filter((sale) => {
      // 1. Customer Filter
      if (
        selectedCustomer !== "all" &&
        sale.customerId.toLowerCase() !== selectedCustomer.toLowerCase()
      ) {
        return false;
      }

      // 2. Payment Status Filter
      if (statusFilter !== "all") {
        const totalAmount = sale.totalAmount;
        const amountPaid = sale.amountPaid;
        const balance = totalAmount - amountPaid;
        let effectiveStatus = (sale.paymentStatus || "").toLowerCase();
        if (balance <= 0.01) {
          effectiveStatus = "paid";
        } else if (amountPaid > 0) {
          effectiveStatus = "partial";
        } else {
          effectiveStatus = "unpaid";
        }

        if (effectiveStatus !== statusFilter) {
          return false;
        }
      }

      const saleDate = parseISO(sale.saleDate);
      if (isNaN(saleDate.getTime())) return true;

      // 3. Date Range Filter
      if (dateRange.from) {
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);
        if (saleDate < fromDate || saleDate > toDate) return false;
      }

      return true;
    });
  }, [data, selectedCustomer, statusFilter, dateRange]);

  // In-table search filter for itemized view
  const searchedSales = useMemo(() => {
    if (!tableSearch.trim()) return filteredSales;
    const q = tableSearch.toLowerCase().trim();
    return filteredSales.filter((sale) => {
      const inv = String(sale.invoiceId || "").toLowerCase();
      const cust = String(sale.customerId || "").toLowerCase();
      const size = String(sale.classification || "").toLowerCase();
      let dateFormatted = "";
      try {
        dateFormatted = format(
          parseISO(sale.saleDate),
          "MMM dd, yyyy",
        ).toLowerCase();
      } catch {}

      return (
        inv.includes(q) ||
        cust.includes(q) ||
        size.includes(q) ||
        dateFormatted.includes(q) ||
        sale.saleDate.includes(q)
      );
    });
  }, [filteredSales, tableSearch]);

  // Grouped Invoices (1 Row Per Invoice)
  const groupedInvoices = useMemo<GroupedInvoice[]>(() => {
    const map = new Map<string, GroupedInvoice>();

    filteredSales.forEach((sale) => {
      const key = sale.invoiceId ? sale.invoiceId : `single_${sale.id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          invoiceId: sale.invoiceId,
          customerId: sale.customerId,
          saleDate: sale.saleDate,
          datePaid: sale.datePaid,
          preparedBy: sale.preparedBy || null,
          items: [],
          totalTrays: 0,
          totalPieces: 0,
          totalPalitBasag: 0,
          totalAmount: 0,
          amountPaid: 0,
          balance: 0,
          effectiveStatus: "unpaid",
        });
      }

      const group = map.get(key)!;
      group.items.push(sale);
      group.totalTrays += sale.quantityTrays;
      group.totalPieces += sale.quantityPieces || 0;
      group.totalPalitBasag += sale.palitBasag || 0;
      group.totalAmount += sale.totalAmount;
      group.amountPaid += sale.amountPaid;
    });

    const list: GroupedInvoice[] = [];
    map.forEach((g) => {
      const bal = Math.max(0, Math.round((g.totalAmount - g.amountPaid) * 100) / 100);
      g.balance = bal;
      if (bal <= 0.01) {
        g.effectiveStatus = "paid";
      } else if (g.amountPaid > 0) {
        g.effectiveStatus = "partial";
      } else {
        g.effectiveStatus = "unpaid";
      }
      list.push(g);
    });

    // Sort by saleDate descending
    list.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

    return list;
  }, [filteredSales]);

  // Search filtered grouped invoices
  const searchedGroupedInvoices = useMemo(() => {
    if (!tableSearch.trim()) return groupedInvoices;
    const q = tableSearch.toLowerCase().trim();
    return groupedInvoices.filter((inv) => {
      const invoiceStr = String(inv.invoiceId || "").toLowerCase();
      const custStr = String(inv.customerId || "").toLowerCase();
      let dateStr = "";
      try {
        dateStr = format(parseISO(inv.saleDate), "MMM dd, yyyy").toLowerCase();
      } catch {}

      const matchesItem = inv.items.some((item) =>
        item.classification.toLowerCase().includes(q)
      );

      return (
        invoiceStr.includes(q) ||
        custStr.includes(q) ||
        dateStr.includes(q) ||
        inv.saleDate.includes(q) ||
        matchesItem
      );
    });
  }, [groupedInvoices, tableSearch]);

  // Aggregate Totals (for filtered records)
  const totals = useMemo(() => {
    return filteredSales.reduce(
      (acc, curr) => {
        const totalAmount = curr.totalAmount;
        const amountPaid = curr.amountPaid;
        const balance = Math.max(
          0,
          Math.round((totalAmount - amountPaid) * 100) / 100,
        );

        acc.gross += totalAmount;
        acc.paid += amountPaid;
        acc.balance += balance;
        acc.trays += curr.quantityTrays;
        acc.pieces += curr.quantityPieces || 0;
        return acc;
      },
      { gross: 0, paid: 0, balance: 0, trays: 0, pieces: 0 },
    );
  }, [filteredSales]);

  // Formatted Compact KPI values
  const grossFormatted = useMemo(
    () => formatCompactAmount(totals.gross),
    [totals.gross],
  );
  const paidFormatted = useMemo(
    () => formatCompactAmount(totals.paid),
    [totals.paid],
  );
  const balanceFormatted = useMemo(
    () => formatCompactAmount(totals.balance),
    [totals.balance],
  );
  const traysFormatted = useMemo(
    () => formatCompactVolume(totals.trays),
    [totals.trays],
  );

  // Pagination Slice based on active view mode
  const currentRecordsCount =
    viewMode === "invoices"
      ? searchedGroupedInvoices.length
      : searchedSales.length;

  const totalPages = Math.max(1, Math.ceil(currentRecordsCount / pageSize));

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedSales.slice(start, start + pageSize);
  }, [searchedSales, currentPage, pageSize]);

  const paginatedGroupedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedGroupedInvoices.slice(start, start + pageSize);
  }, [searchedGroupedInvoices, currentPage, pageSize]);

  // Specific Customer Pending Credit Records (All time for selected customer)
  const customerUnpaidRecords = useMemo(() => {
    if (selectedCustomer === "all") return [];
    return data.filter((sale) => {
      if (sale.customerId.toLowerCase() !== selectedCustomer.toLowerCase()) {
        return false;
      }
      const balance = sale.totalAmount - sale.amountPaid;
      return balance > 0.01;
    });
  }, [data, selectedCustomer]);

  const customerTotalUnpaidCredit = useMemo(() => {
    return customerUnpaidRecords.reduce(
      (acc, curr) => acc + (curr.totalAmount - curr.amountPaid),
      0,
    );
  }, [customerUnpaidRecords]);

  const customerCreditFormatted = useMemo(
    () => formatCompactAmount(customerTotalUnpaidCredit),
    [customerTotalUnpaidCredit],
  );

  // Dynamic filter label text for header/PDF
  const filterLabelText = useMemo(() => {
    if (dateRange.from) {
      return dateRange.to
        ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
        : format(dateRange.from, "MMM dd, yyyy");
    }
    return "All Dates";
  }, [dateRange]);

  // CSV Export
  const exportToCSV = () => {
    try {
      if (!searchedSales.length) {
        toast.error("No data to export.");
        return;
      }

      const metaHeader = [
        `"Otso Dragon - Sales Summary Ledger"`,
        `"Date Filter: ${filterLabelText}"`,
        `"Customer Filter: ${selectedCustomer === "all" ? "All Customers" : selectedCustomer}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
        `"FINANCIAL SUMMARY"`,
        `"Gross Sales (Php): ${totals.gross.toLocaleString()}"`,
        `"Total Collections (Php): ${totals.paid.toLocaleString()}"`,
        `"Outstanding A/R (Php): ${totals.balance.toLocaleString()}"`,
        `""`,
      ].join("\n");

      const headers = [
        "Sale Date",
        "Invoice No.",
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

      const csvData = searchedSales.map((d) => {
        const balance = Math.max(
          0,
          Math.round((d.totalAmount - d.amountPaid) * 100) / 100,
        );
        const status =
          d.paymentStatus === "paid" || balance <= 0.01
            ? "FULLY PAID"
            : d.amountPaid > 0
              ? "PARTIAL"
              : "UNPAID";

        return [
          new Date(d.saleDate).toLocaleDateString(),
          `"${d.invoiceId || "-"}"`,
          `"${d.customerId}"`,
          `"${d.classification.toUpperCase()}"`,
          d.quantityTrays,
          d.quantityPieces || 0,
          d.palitBasag || 0,
          d.pricePerTray,
          d.totalAmount,
          d.amountPaid,
          balance,
          status,
          d.datePaid ? new Date(d.datePaid).toLocaleDateString() : "-",
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
        `sales_summary_${selectedCustomer === "all" ? "all" : selectedCustomer}.csv`,
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

  // PDF Export
  const exportToPDF = () => {
    try {
      if (!searchedSales.length) {
        toast.error("No data to export.");
        return;
      }
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136); // Teal 600
      doc.text("Otso Dragon - Sales & Credit Summary Report", 40, 40);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105); // Slate 600

      doc.text(`Date Filter: ${filterLabelText}`, 40, 60);
      doc.text(
        `Customer Filter: ${selectedCustomer === "all" ? "All Customers" : selectedCustomer}`,
        40,
        75,
      );
      doc.text(
        `Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`,
        40,
        90,
      );

      doc.setFont("helvetica", "bold");
      doc.text(`Gross Sales: P${totals.gross.toLocaleString()}`, 750, 60, {
        align: "right",
      });
      doc.text(`Paid: P${totals.paid.toLocaleString()}`, 750, 75, {
        align: "right",
      });
      doc.setTextColor(225, 29, 72);
      doc.text(
        `Outstanding Balance: P${totals.balance.toLocaleString()}`,
        750,
        90,
        {
          align: "right",
        },
      );

      autoTable(doc, {
        startY: 110,
        head: [
          [
            "Date",
            "Invoice No.",
            "Customer Name",
            "Size",
            "Trays",
            "Pcs",
            "Gross (P)",
            "Paid (P)",
            "Balance (P)",
            "Status",
          ],
        ],
        body: searchedSales.map((d) => {
          const itemBalance = Math.max(
            0,
            Math.round((d.totalAmount - d.amountPaid) * 100) / 100,
          );
          const status =
            d.paymentStatus === "paid" || itemBalance <= 0.01
              ? "FULLY PAID"
              : d.amountPaid > 0
                ? "PARTIAL"
                : "UNPAID";

          return [
            format(parseISO(d.saleDate), "MM/dd/yyyy"),
            d.invoiceId || "-",
            d.customerId,
            d.classification.toUpperCase(),
            d.quantityTrays.toLocaleString(),
            (d.quantityPieces || 0) > 0 ? `+${d.quantityPieces}` : "-",
            d.totalAmount.toLocaleString(),
            d.amountPaid.toLocaleString(),
            itemBalance.toLocaleString(),
            status,
          ];
        }),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [13, 148, 136], halign: "center" },
        columnStyles: {
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
          7: { halign: "right" },
          8: { halign: "right", fontStyle: "bold" },
          9: { halign: "center", fontStyle: "bold" },
        },
      });

      doc.save(
        `sales_summary_${selectedCustomer === "all" ? "all" : selectedCustomer}.pdf`,
      );
      toast.success("PDF downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 overflow-hidden">
      {/* FILTER TOOLBAR */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        {/* Left: Customer Search Dropdown & Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Enhanced Customer Filter with 12 items/page & search */}
          <Popover
            open={isCustomerPopoverOpen}
            onOpenChange={setIsCustomerPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 text-xs rounded-lg border-border bg-background font-semibold w-[210px] justify-between px-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">
                    {selectedCustomer === "all"
                      ? `All Customers (${customerList.length})`
                      : selectedCustomer}
                  </span>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="z-110 w-[260px] p-0 rounded-xl shadow-xl border-border bg-popover"
            >
              {/* Search Header */}
              <div className="p-2 border-b border-border bg-muted/20">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2 text-muted-foreground" />
                  <Input
                    placeholder="Search customer name..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomerPage(1);
                    }}
                    className="h-7 text-xs pl-7 pr-7 bg-background"
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSearch("");
                        setCustomerPage(1);
                      }}
                      className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List (12 items per page) */}
              <div className="max-h-[320px] overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer("all");
                    setCurrentPage(1);
                    setIsCustomerPopoverOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer",
                    selectedCustomer === "all"
                      ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold"
                      : "hover:bg-muted text-foreground",
                  )}
                >
                  <span className="truncate">All Customers ({customerList.length})</span>
                  {selectedCustomer === "all" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 ml-1" />
                  )}
                </button>

                {paginatedCustomerOptions.map((cust) => {
                  const isSelected =
                    selectedCustomer.toLowerCase() === cust.toLowerCase();
                  return (
                    <button
                      key={cust}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setCurrentPage(1);
                        setIsCustomerPopoverOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer",
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold"
                          : "hover:bg-muted text-foreground",
                      )}
                    >
                      <span className="truncate">{cust}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}

                {filteredCustomerOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3 text-center">
                    No matching customers found.
                  </p>
                )}
              </div>

              {/* Dropdown Pagination Footer */}
              {totalCustomerPages > 1 && (
                <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-border bg-muted/40 text-[11px] text-muted-foreground select-none">
                  <span className="font-medium text-[10px]">
                    {(customerPage - 1) * CUSTOMERS_PER_PAGE + 1}–
                    {Math.min(
                      customerPage * CUSTOMERS_PER_PAGE,
                      filteredCustomerOptions.length,
                    )}{" "}
                    of {filteredCustomerOptions.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md hover:bg-muted text-foreground cursor-pointer disabled:opacity-30"
                      disabled={customerPage <= 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCustomerPage((p) => Math.max(1, p - 1));
                      }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-[10px] font-bold text-foreground px-1">
                      {customerPage} / {totalCustomerPages}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md hover:bg-muted text-foreground cursor-pointer disabled:opacity-30"
                      disabled={customerPage >= totalCustomerPages}
                      onClick={(e) => {
                        e.preventDefault();
                        setCustomerPage((p) =>
                          Math.min(totalCustomerPages, p + 1),
                        );
                      }}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Status Filter Dropdown */}
          <Select
            value={statusFilter}
            onValueChange={(val: "all" | "paid" | "partial" | "unpaid") => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border-border bg-background font-semibold w-[150px]">
              <div className="flex items-center gap-1.5 truncate">
                {statusFilter === "paid" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : statusFilter === "partial" ? (
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : statusFilter === "unpaid" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <Banknote className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                )}
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent align="start" className="z-110">
              <SelectItem value="all" className="text-xs cursor-pointer">
                All Statuses
              </SelectItem>
              <SelectItem value="paid" className="text-xs cursor-pointer">
                Fully Paid
              </SelectItem>
              <SelectItem value="partial" className="text-xs cursor-pointer">
                Partial Payment
              </SelectItem>
              <SelectItem value="unpaid" className="text-xs cursor-pointer">
                Unpaid
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Date Selector Popover (Flush Right) */}
        <div className="flex items-center justify-end gap-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 text-xs rounded-lg border-border bg-background font-medium gap-2",
                  dateRange.from &&
                    "text-teal-600 dark:text-teal-400 font-bold border-teal-500/40",
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>
                  {dateRange.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                      : format(dateRange.from, "MMM dd, yyyy")
                    : "Select Date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-110" align="end">
              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                {/* Quick Presets Side Panel */}
                <div className="p-2 space-y-1 flex flex-col sm:w-36 shrink-0 bg-muted/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1">
                    Quick Presets
                  </span>
                  <Button
                    variant={!dateRange.from ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs h-8 cursor-pointer"
                    onClick={() => {
                      setDateRange({ from: undefined, to: undefined });
                      setCurrentPage(1);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    All Dates
                  </Button>
                  <Button
                    variant={
                      dateRange.from &&
                      isToday(dateRange.from) &&
                      dateRange.to &&
                      isToday(dateRange.to)
                        ? "secondary"
                        : "ghost"
                    }
                    className="w-full justify-start text-xs h-8 cursor-pointer"
                    onClick={() => {
                      setDateRange({
                        from: startOfDay(new Date()),
                        to: endOfDay(new Date()),
                      });
                      setCurrentPage(1);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs h-8 cursor-pointer"
                    onClick={() => {
                      setDateRange({
                        from: subDays(new Date(), 14),
                        to: new Date(),
                      });
                      setCurrentPage(1);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last 14 Days
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs h-8 cursor-pointer"
                    onClick={() => {
                      setDateRange({
                        from: startOfMonth(new Date()),
                        to: endOfMonth(new Date()),
                      });
                      setCurrentPage(1);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs h-8 cursor-pointer"
                    onClick={() => {
                      setDateRange({
                        from: startOfYear(new Date()),
                        to: endOfYear(new Date()),
                      });
                      setCurrentPage(1);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    This Year
                  </Button>
                </div>

                {/* Calendar Range Picker with captionLayout="dropdown" */}
                <div className="p-2">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                      setCurrentPage(1);
                    }}
                    captionLayout="dropdown"
                    startMonth={new Date(2020, 0)}
                    endMonth={new Date(2030, 11)}
                    disabled={(date) => date > new Date()}
                    className="rounded-md border-0"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {dateRange.from && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateRange({ from: undefined, to: undefined });
                setCurrentPage(1);
              }}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset date filter"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* SINGLE CUSTOMER CREDIT STATUS ALERT CARD */}
      {selectedCustomer !== "all" && (
        <div
          className={cn(
            "rounded-xl border p-4 shadow-2xs transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0",
            customerTotalUnpaidCredit > 0.01
              ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
              : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "p-2.5 rounded-xl border shrink-0 mt-0.5",
                customerTotalUnpaidCredit > 0.01
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
              )}
            >
              {customerTotalUnpaidCredit > 0.01 ? (
                <CreditCard className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                  {selectedCustomer}
                </h3>
                {customerTotalUnpaidCredit > 0.01 ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200 shrink-0">
                    Has Pending Credit
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 shrink-0">
                    Clean Credit Record
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {customerTotalUnpaidCredit > 0.01
                  ? `This customer has ${customerUnpaidRecords.length} unpaid / partial transactions with outstanding balance.`
                  : "All sales transactions for this customer have been fully paid!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/50 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Pending Credit
              </span>
              <span
                className={cn(
                  "text-xl font-mono font-bold truncate block",
                  customerTotalUnpaidCredit > 0.01
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400",
                )}
                title={customerCreditFormatted.full}
              >
                ₱
                <NumberTicker
                  value={customerTotalUnpaidCredit}
                  decimalPlaces={2}
                />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI METRICS GRID - RESPONSIVE & MILLION/BILLION COMPACT READY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {/* Gross Sales */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">Gross Sales</span>
          </div>
          <div className="min-w-0">
            <p
              className="text-xl font-bold font-mono text-foreground truncate"
              title={grossFormatted.full}
            >
              ₱<NumberTicker value={totals.gross} decimalPlaces={2} />
            </p>
            <p
              className="text-[11px] text-muted-foreground mt-1 truncate"
              title={grossFormatted.full}
            >
              Total invoiced value
            </p>
          </div>
        </div>

        {/* Net Collections */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <Banknote className="w-4 h-4 text-teal-500 shrink-0" />
            <span className="truncate">Amount Paid</span>
          </div>
          <div className="min-w-0">
            <p
              className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 truncate"
              title={paidFormatted.full}
            >
              ₱<NumberTicker value={totals.paid} decimalPlaces={2} />
            </p>
            <p
              className="text-[11px] text-muted-foreground mt-1 truncate"
              title={paidFormatted.full}
            >
              Total cash collected
            </p>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">Pending Balance</span>
          </div>
          <div className="min-w-0">
            <p
              className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 truncate"
              title={balanceFormatted.full}
            >
              ₱<NumberTicker value={totals.balance} decimalPlaces={2} />
            </p>
            <p
              className="text-[11px] text-muted-foreground mt-1 truncate"
              title={balanceFormatted.full}
            >
              Uncollected credit
            </p>
          </div>
        </div>

        {/* Total Volume */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <PackageOpen className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">Trays Sold</span>
          </div>
          <div className="min-w-0">
            <p
              className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 truncate"
              title={traysFormatted.full}
            >
              <NumberTicker value={totals.trays} />{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {totals.trays === 1 ? "tray" : "trays"}
              </span>
            </p>
            <p
              className="text-[11px] text-muted-foreground mt-1 truncate"
              title={traysFormatted.full}
            >
              {totals.pieces > 0
                ? `+ ${totals.pieces} pcs extra`
                : "Volume dispatches"}
            </p>
          </div>
        </div>
      </div>

      {/* FILTERED SALES BREAKDOWN TABLE WITH SEARCH & VIEW MODE CONTROLS */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              Sales Records
              <span className="text-xs font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                <NumberTicker
                  value={
                    viewMode === "invoices"
                      ? searchedGroupedInvoices.length
                      : searchedSales.length
                  }
                />{" "}
                {viewMode === "invoices"
                  ? searchedGroupedInvoices.length === 1
                    ? "invoice"
                    : "invoices"
                  : searchedSales.length === 1
                    ? "record"
                    : "records"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Filtered by:{" "}
              <span className="font-semibold text-foreground">
                {filterLabelText}
              </span>{" "}
              | Customer:{" "}
              <span className="font-semibold text-foreground">
                {selectedCustomer === "all"
                  ? "All Customers"
                  : selectedCustomer}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* View Mode Toggle: Invoices vs Itemized */}
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setViewMode("invoices");
                  setCurrentPage(1);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "invoices"
                    ? "bg-background text-teal-700 dark:text-teal-400 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Group multiple sizes into 1 invoice row"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>By Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("itemized");
                  setCurrentPage(1);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "itemized"
                    ? "bg-background text-teal-700 dark:text-teal-400 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Show each egg classification row separately"
              >
                <List className="w-3.5 h-3.5" />
                <span>Itemized</span>
              </button>
            </div>

            {/* Search Input inside Sales Records Header */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
              <Input
                placeholder={
                  viewMode === "invoices"
                    ? "Search invoice, customer..."
                    : "Search invoice, size..."
                }
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 w-44 sm:w-48 text-xs pl-8 pr-7 bg-background"
              />
              {tableSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setTableSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Font Size Density Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-1.5 h-8">
              <Type className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-0.5">
                {(["xs", "sm", "base"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
                      textSize === size
                        ? "bg-teal-600 text-white font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Actions Menu"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-110 w-44">
                <DropdownMenuItem
                  onClick={exportToCSV}
                  className="cursor-pointer gap-2 text-xs font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={exportToPDF}
                  className="cursor-pointer gap-2 text-xs font-medium"
                >
                  <FileDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 min-h-0">
          <table
            className={cn("w-full text-left border-collapse", textSizeClass)}
          >
            <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-xs text-muted-foreground uppercase font-bold text-[10px] border-b border-border shadow-2xs">
              {viewMode === "invoices" ? (
                <tr>
                  <th className="px-4 py-3">Sale Date</th>
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Sizes / Breakdown</th>
                  <th className="px-4 py-3 text-right">Total Volume</th>
                  <th className="px-4 py-3 text-right">Gross (₱)</th>
                  <th className="px-4 py-3 text-right">Paid (₱)</th>
                  <th className="px-4 py-3 text-right">Balance (₱)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3">Sale Date</th>
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3 text-right">Trays</th>
                  <th className="px-4 py-3 text-right">Gross (₱)</th>
                  <th className="px-4 py-3 text-right">Paid (₱)</th>
                  <th className="px-4 py-3 text-right">Balance (₱)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {viewMode === "invoices" ? (
                /* GROUPED INVOICES VIEW (1 ROW PER INVOICE) */
                paginatedGroupedInvoices.map((inv, idx) => {
                  const isPaid = inv.effectiveStatus === "paid";
                  const isPartial = inv.effectiveStatus === "partial";
                  const invoiceTheme = getInvoiceTheme(inv.invoiceId);
                  const distinctSizes = Array.from(
                    new Set(inv.items.map((it) => it.classification.toUpperCase()))
                  );

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoiceModal(inv)}
                      className={cn(
                        "transition-colors duration-200 hover:bg-teal-50/80 dark:hover:bg-teal-950/30 cursor-pointer group",
                        idx % 2 === 0 ? "bg-card" : "bg-muted/40",
                      )}
                    >
                      <td className="px-4 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                        {format(parseISO(inv.saleDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-2.5 font-mono whitespace-nowrap">
                        {inv.invoiceId ? (
                          <span
                            className={cn(
                              "font-mono text-xs font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 group-hover:shadow-xs transition-shadow",
                              invoiceTheme.badgeBg,
                              invoiceTheme.badgeText,
                              invoiceTheme.badgeBorder,
                            )}
                          >
                            #{inv.invoiceId}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-bold uppercase text-foreground whitespace-nowrap">
                        {inv.customerId}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                            {inv.items.length} {inv.items.length === 1 ? "size" : "sizes"}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            ({distinctSizes.slice(0, 2).join(", ")}
                            {distinctSizes.length > 2 ? ` +${distinctSizes.length - 2}` : ""})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {inv.totalTrays.toLocaleString()}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {inv.totalTrays === 1 ? "tray" : "trays"}
                        </span>
                        {inv.totalPieces > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-normal">
                            +{inv.totalPieces} pcs
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground whitespace-nowrap">
                        ₱{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                        ₱{inv.amountPaid.toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right font-mono font-bold whitespace-nowrap",
                          inv.balance > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground",
                        )}
                      >
                        ₱{inv.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Paid
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceModal(inv);
                          }}
                          title="View Invoice Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* ITEMIZED VIEW (ORIGINAL 1 ROW PER EGG SIZE) */
                paginatedSales.map((sale, idx) => {
                  const itemBalance = Math.max(
                    0,
                    Math.round((sale.totalAmount - sale.amountPaid) * 100) / 100,
                  );
                  const isPaid =
                    sale.paymentStatus === "paid" || itemBalance <= 0.01;
                  const isPartial = !isPaid && sale.amountPaid > 0;

                  return (
                    <tr
                      key={sale.id}
                      className={cn(
                        "transition-colors duration-200 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30",
                        idx % 2 === 0 ? "bg-card" : "bg-muted/40",
                      )}
                    >
                      <td className="px-4 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                        {format(parseISO(sale.saleDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-foreground whitespace-nowrap">
                        {sale.invoiceId ? (
                          <span className="px-1.5 py-0.5 rounded bg-muted border border-border font-bold text-teal-700 dark:text-teal-400">
                            #{sale.invoiceId}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-bold uppercase text-foreground whitespace-nowrap">
                        {sale.customerId}
                      </td>
                      <td className="px-4 py-2.5 font-bold uppercase text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {sale.classification}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">
                        {sale.quantityTrays}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {sale.quantityTrays === 1 ? "tray" : "trays"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">
                        ₱{sale.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                        ₱{sale.amountPaid.toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right font-mono font-bold",
                          itemBalance > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground",
                        )}
                      >
                        ₱{itemBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Paid
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              {currentRecordsCount === 0 && (
                <tr>
                  <td
                    colSpan={viewMode === "invoices" ? 10 : 9}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageOpen className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">
                        No {viewMode === "invoices" ? "invoices" : "sales records"} found
                      </p>
                      <p className="text-xs opacity-70">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 border-t border-border bg-card shrink-0">
          <div className="flex flex-wrap items-center gap-3 order-2 sm:order-1 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" className="z-110">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {viewMode === "invoices"
                  ? paginatedGroupedInvoices.length
                  : paginatedSales.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {currentRecordsCount}
              </span>{" "}
              {viewMode === "invoices"
                ? currentRecordsCount === 1
                  ? "invoice"
                  : "invoices"
                : currentRecordsCount === 1
                  ? "record"
                  : "records"}
              {totalPages > 1 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  · page {currentPage} of {totalPages}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  let startPage = Math.max(1, currentPage - 2);
                  if (startPage + 4 > totalPages) {
                    startPage = Math.max(1, totalPages - 4);
                  }
                  page = startPage + i;
                }
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-7 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 cursor-pointer"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* INVOICE DETAILS MODAL DIALOG */}
      <Dialog
        open={!!selectedInvoiceModal}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoiceModal(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
          {selectedInvoiceModal && (
            <>
              {/* Modal Header */}
              <div className="p-5 border-b border-border bg-card flex items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                      <span>Invoice Details</span>
                      {selectedInvoiceModal.invoiceId && (
                        <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold">
                          #{selectedInvoiceModal.invoiceId}
                        </span>
                      )}
                    </DialogTitle>
                    {selectedInvoiceModal.effectiveStatus === "paid" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Fully Paid
                      </span>
                    ) : selectedInvoiceModal.effectiveStatus === "partial" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Partial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        Unpaid
                      </span>
                    )}
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      Customer: <strong className="text-foreground uppercase">{selectedInvoiceModal.customerId}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Date: <strong className="text-foreground">{format(parseISO(selectedInvoiceModal.saleDate), "MMMM dd, yyyy")}</strong>
                    </span>
                    {selectedInvoiceModal.preparedBy && (
                      <>
                        <span>•</span>
                        <span>
                          Prepared by: <strong className="text-foreground capitalize">{selectedInvoiceModal.preparedBy}</strong>
                        </span>
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/80 text-muted-foreground uppercase font-bold text-[10px] border-b border-border">
                      <tr>
                        <th className="px-3.5 py-2.5">Size / Item</th>
                        <th className="px-3.5 py-2.5 text-center">Qty (Trays + Pcs)</th>
                        <th className="px-3.5 py-2.5 text-right">Price (₱)</th>
                        <th className="px-3.5 py-2.5 text-right">Amount (₱)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {selectedInvoiceModal.items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="px-3.5 py-2.5 font-bold uppercase text-foreground">
                            {item.classification}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-center">
                            {item.quantityTrays}{" "}
                            {item.quantityTrays === 1 ? "tray" : "trays"}
                            {(item.quantityPieces || 0) > 0 && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                (+{item.quantityPieces} pcs)
                              </span>
                            )}
                            {(item.palitBasag || 0) > 0 && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold ml-1">
                                (+{item.palitBasag} free)
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-muted-foreground">
                            ₱{item.pricePerTray.toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-foreground">
                            ₱{item.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/80">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Total Items: <strong className="text-foreground">{selectedInvoiceModal.items.length} sizes</strong></p>
                    <p>Total Volume: <strong className="text-foreground font-mono">{selectedInvoiceModal.totalTrays} trays {selectedInvoiceModal.totalPieces > 0 ? `+ ${selectedInvoiceModal.totalPieces} pcs` : ""}</strong></p>
                  </div>
                  <div className="w-full sm:w-60 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground font-medium">
                      <span>Grand Total:</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        ₱{selectedInvoiceModal.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-teal-600 dark:text-teal-400 font-medium">
                      <span>Amount Paid:</span>
                      <span className="font-mono font-bold">
                        ₱{selectedInvoiceModal.amountPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-1 font-bold text-foreground">
                      <span>Balance Due:</span>
                      <span
                        className={cn(
                          "font-mono font-black text-sm",
                          selectedInvoiceModal.balance > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        )}
                      >
                        ₱{selectedInvoiceModal.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-border bg-card flex justify-end gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 text-xs px-4 cursor-pointer"
                  onClick={() => setSelectedInvoiceModal(null)}
                >
                  Close
                </Button>
                {selectedInvoiceModal.invoiceId && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl h-9 text-xs px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1.5 cursor-pointer shadow-md shadow-teal-500/20"
                  >
                    <a
                      href={`/egg-sales/sales/receipt/${selectedInvoiceModal.invoiceId}?from=summary`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print Receipt</span>
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
