"use client";

import React, { useMemo, useState } from "react";
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
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "partial" | "unpaid"
  >("all");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [textSize, setTextSize] = useState<"xs" | "sm" | "base">("xs");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

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

  // In-table search filter
  const searchedSales = useMemo(() => {
    if (!tableSearch.trim()) return filteredSales;
    const q = tableSearch.toLowerCase().trim();
    return filteredSales.filter((sale) => {
      const inv = String(sale.invoiceId || "").toLowerCase();
      const cust = String(sale.customerId || "").toLowerCase();
      const size = String(sale.classification || "").toLowerCase();
      let dateFormatted = "";
      try {
        dateFormatted = format(parseISO(sale.saleDate), "MMM dd, yyyy").toLowerCase();
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

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(searchedSales.length / pageSize));

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedSales.slice(start, start + pageSize);
  }, [searchedSales, currentPage, pageSize]);

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
          <Select
            value={selectedCustomer}
            onValueChange={(val) => {
              setSelectedCustomer(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border-border bg-background font-semibold w-[200px]">
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <SelectValue placeholder="All Customers" />
              </div>
            </SelectTrigger>
            <SelectContent align="start" className="z-110 w-[240px] p-0">
              <div className="p-2 border-b border-border">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2 text-muted-foreground" />
                  <Input
                    placeholder="Search customer name..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="h-7 text-xs pl-7"
                  />
                  {customerSearch && (
                    <button
                      onClick={() => setCustomerSearch("")}
                      className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-[220px] overflow-y-auto p-1">
                <SelectItem value="all" className="text-xs cursor-pointer">
                  All Customers ({customerList.length})
                </SelectItem>
                {filteredCustomerOptions.map((cust) => (
                  <SelectItem
                    key={cust}
                    value={cust}
                    className="text-xs cursor-pointer"
                  >
                    {cust}
                  </SelectItem>
                ))}
                {filteredCustomerOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3 text-center">
                    No matching customers found.
                  </p>
                )}
              </div>
            </SelectContent>
          </Select>

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

      {/* FILTERED SALES BREAKDOWN TABLE WITH SEARCH & DENSITY CONTROLS */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              Sales Records
              <span className="text-xs font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                <NumberTicker value={searchedSales.length} />{" "}
                {searchedSales.length === 1 ? "record" : "records"}
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
            {/* Search Input inside Sales Records Header */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
              <Input
                placeholder="Search invoice, size..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 w-44 sm:w-48 text-xs pl-8 pr-7 bg-background"
              />
              {tableSearch && (
                <button
                  onClick={() => {
                    setTableSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Font Size Density Toggle - Matching History Tables */}
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

            {/* Three dots Actions Menu */}
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
          <table className={cn("w-full text-left border-collapse", textSizeClass)}>
            <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-xs text-muted-foreground uppercase font-bold text-[10px] border-b border-border shadow-2xs">
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
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {paginatedSales.map((sale, idx) => {
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
              })}
              {searchedSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageOpen className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">No sales records found</p>
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

        {/* PAGINATION FOOTER - MATCHING SALES HISTORY DESIGN WITH ROWS PER PAGE */}
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
                {paginatedSales.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {searchedSales.length}
              </span>{" "}
              record{searchedSales.length !== 1 ? "s" : ""}
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
    </div>
  );
}
