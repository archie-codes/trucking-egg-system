"use client";

import { useState, useEffect, useMemo } from "react";
import { getFarmFlocks, getFarmFlockReport } from "@/app/actions/farm-actions";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BarChart3,
  Activity,
  Egg,
  DollarSign,
  Building2,
  Loader2,
  Search,
  Check,
  ChevronsUpDown,
  X,
  Layers,
  MoreVertical,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

type Flock = NonNullable<
  Awaited<ReturnType<typeof getFarmFlocks>>["data"]
>[number];
type ReportData = NonNullable<
  Awaited<ReturnType<typeof getFarmFlockReport>>["data"]
>;

function PaginatedCategoryCard<T>({
  title,
  icon,
  badgeText,
  headerExtra,
  headerBg = "bg-slate-50 dark:bg-slate-800/60",
  items,
  pageSize = 8,
  defaultOpen = true,
  renderTable,
}: {
  title: string;
  icon?: React.ReactNode;
  badgeText: string;
  headerExtra?: React.ReactNode;
  headerBg?: string;
  items: T[];
  pageSize?: number;
  defaultOpen?: boolean;
  renderTable: (paginatedItems: T[]) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize],
  );

  return (
    <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      <CardHeader
        className={cn(
          "border-b border-slate-200/80 dark:border-slate-800 py-3 px-4 flex flex-row items-center justify-between cursor-pointer select-none transition-colors hover:opacity-95",
          headerBg,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {title}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] bg-white dark:bg-slate-900"
          >
            {badgeText}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {headerExtra}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <>
          <CardContent className="p-0 overflow-x-auto">
            {renderTable(paginatedItems)}
          </CardContent>
          {items.length > pageSize && (
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing{" "}
                <strong className="font-semibold text-slate-700 dark:text-slate-300">
                  {startIndex + 1}
                </strong>{" "}
                to{" "}
                <strong className="font-semibold text-slate-700 dark:text-slate-300">
                  {Math.min(startIndex + pageSize, items.length)}
                </strong>{" "}
                of{" "}
                <strong className="font-semibold text-slate-700 dark:text-slate-300">
                  {items.length}
                </strong>{" "}
                entries
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={currentPage === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <span className="px-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={currentPage === totalPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export default function ReportsDashboardPage() {
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [selectedFlockId, setSelectedFlockId] = useState<number>(0);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loadingFlocks, setLoadingFlocks] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  // Filters for scalable batch selection
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setLoadingFlocks(true);
      const res = await getFarmFlocks();
      if (res.success && res.data && res.data.length > 0) {
        setFlocks(res.data);
        // Default select first active flock if available, else first flock
        const firstActive = res.data.find((f) => f.isActive) || res.data[0];
        setSelectedFlockId(firstActive.id);
      } else {
        toast.error("No farm flocks found");
      }
      setLoadingFlocks(false);
    }
    loadInitialData();
  }, []);

  // Extract farm origin options dynamically
  const farmOptions = useMemo(() => {
    const set = new Set<string>();
    flocks.forEach((item) => {
      if (item.farmName && item.farmName.trim() !== "") {
        set.add(item.farmName.trim().toUpperCase());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [flocks]);

  // Filtered flocks based on status and farm origin
  const filteredFlocks = useMemo(() => {
    return flocks.filter((flock) => {
      // Farm filter
      if (
        selectedFarm !== "all" &&
        flock.farmName.trim().toUpperCase() !== selectedFarm
      ) {
        return false;
      }
      // Status filter
      if (selectedStatus === "active" && !flock.isActive) {
        return false;
      }
      if (selectedStatus === "depleted" && flock.isActive) {
        return false;
      }
      // Search query inside combobox
      if (batchSearchQuery.trim() !== "") {
        const query = batchSearchQuery.trim().toLowerCase();
        const batch = (flock.batchName || "").toLowerCase();
        const farm = (flock.farmName || "").toLowerCase();
        const bldg = (flock.buildingName || "").toLowerCase();
        return (
          batch.includes(query) || farm.includes(query) || bldg.includes(query)
        );
      }
      return true;
    });
  }, [flocks, selectedFarm, selectedStatus, batchSearchQuery]);

  // Effective selected flock ID based on active filters
  const effectiveSelectedFlockId = useMemo(() => {
    if (filteredFlocks.length === 0) return 0;
    const isCurrentlySelectedInFiltered = filteredFlocks.some(
      (f) => f.id === selectedFlockId,
    );
    if (isCurrentlySelectedInFiltered) {
      return selectedFlockId;
    }
    const firstActive =
      filteredFlocks.find((f) => f.isActive) || filteredFlocks[0];
    return firstActive.id;
  }, [filteredFlocks, selectedFlockId]);

  // Selected flock object
  const selectedFlockObj = useMemo(() => {
    return flocks.find((f) => f.id === effectiveSelectedFlockId) || null;
  }, [flocks, effectiveSelectedFlockId]);

  useEffect(() => {
    if (!effectiveSelectedFlockId) return;

    async function loadReport() {
      setLoadingReport(true);
      const res = await getFarmFlockReport(effectiveSelectedFlockId);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        toast.error(res.error || "Failed to load report data");
        setReport(null);
      }
      setLoadingReport(false);
    }
    loadReport();
  }, [effectiveSelectedFlockId]);

  // Export Report to PDF with Categorized Transactions (Landscape Mode & Clean Formatting)
  const exportToPDF = () => {
    if (!report) {
      toast.error("No report data to export.");
      return;
    }

    try {
      // Landscape mode A4: 841.89 pt width x 595.28 pt height
      const doc = new jsPDF("l", "pt", "a4");

      // Helper to clean any Peso sign ₱ or special chars that break standard PDF WinAnsi font
      const sanitizePdfText = (str: string | null | undefined): string => {
        if (!str) return "—";
        return str
          .replace(/₱|\u20B1/g, "PHP ")
          .replace(/\s+/g, " ")
          .trim();
      };

      // Header Banner
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text("Farm Operations - Batch Detailed Transaction Report", 40, 40);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US")} | Location: ${sanitizePdfText(report.flock.farmName)} - ${sanitizePdfText(report.flock.buildingName)}`,
        40,
        55,
      );

      // Summary Header Box (Width: 762 pt across landscape page)
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, 68, 762, 50, 6, 6, "F");

      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(`BATCH: ${sanitizePdfText(report.flock.batchName)}`, 52, 85);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Date Loaded: ${format(new Date(report.flock.dateLoaded), "MMM dd, yyyy")} | Status: ${report.flock.isActive ? "Active Production" : "Completed / Depleted"}`,
        52,
        101,
      );

      doc.text(
        `Headcount: ${report.flock.currentHeadCount.toLocaleString()} / ${report.flock.initialHeadCount.toLocaleString()} birds`,
        300,
        85,
      );
      doc.text(`Survival Rate: ${report.health.survivalRate}%`, 300, 101);

      doc.text(
        `Total Eggs: ${report.production.totalEggsInPieces.toLocaleString()} pcs`,
        550,
        85,
      );
      doc.text(
        `Grand Expenses: PHP ${report.expenses.grandTotalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        550,
        101,
      );

      let currentY = 135;

      // Group Operating Expenses by Category
      const opExGrouped: Record<
        string,
        typeof report.expenses.operatingExpenses
      > = {};
      (report.expenses.operatingExpenses || []).forEach((item) => {
        const catName = item.category
          ? item.category.trim().toUpperCase()
          : "GENERAL OPERATING EXPENSES";
        if (!opExGrouped[catName]) {
          opExGrouped[catName] = [];
        }
        opExGrouped[catName].push(item);
      });

      // 1. FEEDS CONSUMPTION CATEGORY TABLE
      const feedItems = report.expenses.feedConsumptions || [];
      if (feedItems.length > 0) {
        const feedTotal = feedItems.reduce(
          (acc, f) => acc + (f.totalCost || 0),
          0,
        );

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(13, 148, 136); // teal-600
        doc.text(
          `CATEGORY: FEEDS & FEEDING (Total: PHP ${feedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
          40,
          currentY,
        );
        currentY += 8;

        const feedRows = feedItems.map((f) => [
          format(new Date(f.dateGiven), "MMM dd, yyyy"),
          sanitizePdfText(f.feedType),
          `${f.quantityBags} bags`,
          sanitizePdfText(f.recordedBy || "System"),
          `PHP ${f.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [
            [
              "Date Given",
              "Feed Type / Formula",
              "Quantity",
              "Recorded By",
              "Total Cost",
            ],
          ],
          body: feedRows,
          theme: "striped",
          headStyles: {
            fillColor: [13, 148, 136],
            textColor: 255,
            fontSize: 9,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 8, cellPadding: 5 },
          styles: { overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 100 },
            3: { cellWidth: 160 },
            4: { cellWidth: 120, halign: "right" },
          },
          margin: { left: 40, right: 40 },
        });

        currentY = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 18;
      }

      // 2. OPERATING EXPENSE CATEGORIES TABLES (e.g. DIESEL, TOLL, SUPPLIES, UTILITIES, REPAIRS)
      const categoryNames = Object.keys(opExGrouped).sort();
      categoryNames.forEach((catName) => {
        const items = opExGrouped[catName];
        const catTotal = items.reduce((acc, i) => acc + (i.amount || 0), 0);

        if (currentY > 480) {
          doc.addPage();
          currentY = 40;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(
          `CATEGORY: ${sanitizePdfText(catName)} (Total: PHP ${catTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
          40,
          currentY,
        );
        currentY += 8;

        const catRows = items.map((item) => [
          format(new Date(item.dateIncurred), "MMM dd, yyyy"),
          sanitizePdfText(item.remarks),
          sanitizePdfText(item.recordedBy || "System"),
          `PHP ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [
            ["Date Incurred", "Remarks / Description", "Recorded By", "Amount"],
          ],
          body: catRows,
          theme: "striped",
          headStyles: {
            fillColor: [51, 65, 85],
            textColor: 255,
            fontSize: 9,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 8, cellPadding: 5 },
          styles: { overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 160 },
            3: { cellWidth: 120, halign: "right" },
          },
          margin: { left: 40, right: 40 },
        });

        currentY = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 18;
      });

      // 3. DAILY EGG PRODUCTION & HEALTH LOGS TABLE
      const dailyRecords = report.production.records || [];
      if (dailyRecords.length > 0) {
        if (currentY > 460) {
          doc.addPage();
          currentY = 40;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(217, 119, 6); // amber-600
        doc.text(
          `CATEGORY: DAILY EGG PRODUCTION & HEALTH LOGS (${dailyRecords.length} Entries)`,
          40,
          currentY,
        );
        currentY += 8;

        const dailyRows = dailyRecords.map((r) => [
          format(new Date(r.recordDate), "MMM dd, yyyy"),
          `${r.quantityTrays} trays`,
          `${r.quantityPieces} pcs`,
          `${(r.quantityTrays * 30 + r.quantityPieces).toLocaleString()} pcs`,
          `${r.mortalityCount} birds`,
          sanitizePdfText(r.remarks),
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [
            [
              "Record Date",
              "Trays",
              "Extra Pcs",
              "Total Eggs",
              "Mortality",
              "Remarks",
            ],
          ],
          body: dailyRows,
          theme: "striped",
          headStyles: {
            fillColor: [217, 119, 6],
            textColor: 255,
            fontSize: 9,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 8, cellPadding: 5 },
          styles: { overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80 },
            2: { cellWidth: 80 },
            3: { cellWidth: 100 },
            4: { cellWidth: 90 },
            5: { cellWidth: "auto" },
          },
          margin: { left: 40, right: 40 },
        });
      }

      const safeBatchName = report.flock.batchName.replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      doc.save(
        `Batch_Report_${safeBatchName}_${format(new Date(), "yyyyMMdd")}.pdf`,
      );
      toast.success("Categorized PDF report downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report.");
    }
  };

  // Export Report to CSV
  const exportToCSV = () => {
    if (!report) {
      toast.error("No report data to export.");
      return;
    }

    try {
      const metaHeader = [
        `"Farm Operations - Batch Detailed Transaction Report"`,
        `"Location: ${report.flock.farmName} - ${report.flock.buildingName}"`,
        `"Batch Name: ${report.flock.batchName}"`,
        `"Date Loaded: ${format(new Date(report.flock.dateLoaded), "yyyy-MM-dd")}"`,
        `"Status: ${report.flock.isActive ? "Active Production" : "Completed / Depleted"}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
      ].join("\n");

      const headers = [
        "Category",
        "Transaction Date",
        "Item / Description / Feed Type",
        "Quantity / Details",
        "Recorded By",
        "Amount (PHP)",
      ];

      const rows: (string | number)[][] = [];

      // Feeds Category Transactions
      (report.expenses.feedConsumptions || []).forEach((f) => {
        rows.push([
          "FEEDS & FEEDING",
          format(new Date(f.dateGiven), "yyyy-MM-dd"),
          `"${f.feedType.replace(/"/g, '""')}"`,
          `"${f.quantityBags} bags"`,
          `"${(f.recordedBy || "System").replace(/"/g, '""')}"`,
          f.totalCost,
        ]);
      });

      // Operating Expenses Category Transactions (Diesel, Supplies, Repairs, etc.)
      (report.expenses.operatingExpenses || []).forEach((item) => {
        const catName = item.category
          ? item.category.trim().toUpperCase()
          : "GENERAL OPERATING EXPENSES";
        rows.push([
          `"${catName.replace(/"/g, '""')}"`,
          format(new Date(item.dateIncurred), "yyyy-MM-dd"),
          `"${(item.remarks || "Operating Expense").replace(/"/g, '""')}"`,
          `"-"`,
          `"${(item.recordedBy || "System").replace(/"/g, '""')}"`,
          item.amount,
        ]);
      });

      // Daily Production Category Transactions
      (report.production.records || []).forEach((r) => {
        rows.push([
          "DAILY PRODUCTION & HEALTH LOGS",
          format(new Date(r.recordDate), "yyyy-MM-dd"),
          `"${(r.remarks || "Daily Egg Collection & Mortality").replace(/"/g, '""')}"`,
          `"${r.quantityTrays} trays, ${r.quantityPieces} pcs (${r.quantityTrays * 30 + r.quantityPieces} eggs), ${r.mortalityCount} mortality"`,
          `"${(r.recordedBy || "System").replace(/"/g, '""')}"`,
          0,
        ]);
      });

      const csvContent =
        metaHeader +
        "\n" +
        headers.join(",") +
        "\n" +
        rows.map((r) => r.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeBatchName = report.flock.batchName.replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Batch_Report_${safeBatchName}_${format(new Date(), "yyyyMMdd")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV transaction report downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate CSV report.");
    }
  };

  if (loadingFlocks) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
        <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading farm reports...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-3 animate-in fade-in duration-300">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-0.5 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-teal-600 to-emerald-500">
              Farm Dashboard & Reports
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View aggregated production, expenses, and health metrics for a
            specific batch.
          </p>
        </div>
      </div>

      {/* ── SCALABLE BATCH FILTER BAR (Farm Origin, Status, Searchable Batch Combobox) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
        {/* Left side: Origin Farm & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Farm Origin Filter */}
          <Select
            value={selectedFarm}
            onValueChange={(val) => setSelectedFarm(val)}
          >
            <SelectTrigger className="h-9 w-[150px] sm:w-[170px] text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 cursor-pointer">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <SelectValue placeholder="All Origin Farms" />
              </div>
            </SelectTrigger>
            <SelectContent align="start" className="z-200 w-[200px] rounded-xl">
              <SelectItem
                value="all"
                className="text-xs font-medium cursor-pointer"
              >
                All Origin Farms
              </SelectItem>
              {farmOptions.map((farm) => (
                <SelectItem
                  key={farm}
                  value={farm}
                  className="text-xs font-bold uppercase cursor-pointer"
                >
                  {farm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter Toggle */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => setSelectedStatus(val)}
          >
            <SelectTrigger className="h-9 w-[130px] sm:w-[150px] text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 cursor-pointer">
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <SelectValue placeholder="Active Batches" />
              </div>
            </SelectTrigger>
            <SelectContent align="start" className="z-200 rounded-xl">
              <SelectItem
                value="active"
                className="text-xs font-medium cursor-pointer"
              >
                Active Batches Only
              </SelectItem>
              <SelectItem
                value="depleted"
                className="text-xs font-medium cursor-pointer"
              >
                Depleted Only
              </SelectItem>
              <SelectItem
                value="all"
                className="text-xs font-medium cursor-pointer"
              >
                All Batches
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right side: Searchable Batch Selector Combobox & 3-Dot Export Menu */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
          <div className="w-full sm:w-80 md:w-96 shrink-0">
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  className="h-10 w-full justify-between rounded-xl border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-3 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Badge
                      variant={
                        selectedFlockObj?.isActive ? "default" : "secondary"
                      }
                      className={cn(
                        "text-[10px] px-1.5 py-0 rounded-full font-bold shrink-0",
                        selectedFlockObj?.isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                      )}
                    >
                      {selectedFlockObj?.isActive ? "Active" : "Depleted"}
                    </Badge>
                    <span className="truncate">
                      {selectedFlockObj
                        ? `${selectedFlockObj.farmName} • ${selectedFlockObj.buildingName} (${selectedFlockObj.batchName})`
                        : "Select batch..."}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[340px] sm:w-[400px] p-2 rounded-2xl z-200 shadow-xl border-slate-200 dark:border-slate-800"
              >
                {/* Search Box inside Popover */}
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search batch or farm name..."
                    value={batchSearchQuery}
                    onChange={(e) => setBatchSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                  />
                  {batchSearchQuery && (
                    <button
                      onClick={() => setBatchSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Batches List */}
                <div className="max-h-[260px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {filteredFlocks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching batches found. Try adjusting filters or
                      search.
                    </div>
                  ) : (
                    filteredFlocks.map((flock) => {
                      const isSelected = flock.id === effectiveSelectedFlockId;
                      return (
                        <button
                          key={flock.id}
                          type="button"
                          onClick={() => {
                            setSelectedFlockId(flock.id);
                            setIsComboboxOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer",
                            isSelected
                              ? "bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold border border-teal-200/60 dark:border-teal-900/60"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300",
                          )}
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="font-bold text-slate-900 dark:text-white uppercase truncate">
                              {flock.farmName} &bull; {flock.buildingName}
                            </span>
                            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                              {flock.batchName} (
                              {flock.currentHeadCount.toLocaleString()} birds)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-full font-semibold",
                                flock.isActive
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                              )}
                            >
                              {flock.isActive ? "Active" : "Depleted"}
                            </Badge>
                            {isSelected && (
                              <Check className="h-4 w-4 text-teal-600 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Actions Menu (Vertical 3-dot button - clean ghost style without background) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={!report}
                className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer shrink-0"
                title="Export Options"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-200 w-44 rounded-xl">
              <DropdownMenuItem
                onClick={exportToCSV}
                className="cursor-pointer gap-2 text-xs font-medium py-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToPDF}
                className="cursor-pointer gap-2 text-xs font-medium py-2"
              >
                <FileDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading State */}
      {loadingReport && (
        <div className="flex flex-1 w-full items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="ml-2 text-sm text-slate-500 font-medium">
            Updating metrics for selected batch...
          </span>
        </div>
      )}

      {/* Report Dashboard Display */}
      {!loadingReport && report && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {/* BATCH INFORMATION BAR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Location
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                    {report.flock.farmName} - {report.flock.buildingName}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date Loaded
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {format(new Date(report.flock.dateLoaded), "MMM dd, yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Current Headcount
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {report.flock.currentHeadCount.toLocaleString()} /{" "}
                    {report.flock.initialHeadCount.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Batch Status
                  </div>
                  <div className="mt-1">
                    {report.flock.isActive ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 rounded-full font-semibold">
                        Active Production
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 rounded-full font-semibold">
                        Completed / Depleted
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CATEGORIZED METRICS GRID (4 Distinct Category Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Category: Batch Overview & Location */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  Batch Overview & Location
                </CardTitle>
                <CardDescription>
                  Origin farm, house location, and loaded date
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Farm Origin</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {report.flock.farmName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Building / Coop
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {report.flock.buildingName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Batch Identifier
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {report.flock.batchName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Date Loaded</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {format(
                        new Date(report.flock.dateLoaded),
                        "MMM dd, yyyy",
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 bg-slate-50 dark:bg-slate-800/60 px-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Batch Status
                  </span>
                  {report.flock.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full font-bold text-[10px]">
                      Active Production
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 rounded-full font-bold text-[10px]">
                      Completed / Depleted
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Category: Flock Population & Health */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  Flock Population & Health
                </CardTitle>
                <CardDescription>
                  Bird headcount, mortality count, and survival rate
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Initial Headcount
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {report.flock.initialHeadCount.toLocaleString()} birds
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Current Headcount
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {report.flock.currentHeadCount.toLocaleString()} birds
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Total Mortality
                    </span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {report.health.totalMortality.toLocaleString()} birds
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Mortality Rate
                    </span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {(100 - Number(report.health.survivalRate || 0)).toFixed(
                        2,
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 bg-emerald-50 dark:bg-emerald-950/40 px-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60">
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    Survival Rate
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {report.health.survivalRate}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Category: Egg Production Summary */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Egg className="w-4 h-4" />
                  </div>
                  Egg Production Summary
                </CardTitle>
                <CardDescription>
                  Trays collected and total eggs produced
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Trays Collected
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {report.production.totalTrays.toLocaleString()} trays
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Extra Eggs (Loose)
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {report.production.totalPieces.toLocaleString()} pcs
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 bg-amber-50 dark:bg-amber-950/40 px-3 rounded-xl border border-amber-200/60 dark:border-amber-900/60 mt-auto">
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                    Grand Total Eggs (Pieces)
                  </span>
                  <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                    {report.production.totalEggsInPieces.toLocaleString()} pcs
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Category: Expenses & Financials */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  Expenses & Financials
                </CardTitle>
                <CardDescription>
                  Feed costs, operating expenses, and unit cost
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Total Feed Cost
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ₱{" "}
                      {report.expenses.totalFeedCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Total Operating Expenses (OpEx)
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ₱{" "}
                      {report.expenses.totalOpEx.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center py-1.5 bg-red-50 dark:bg-red-950/40 px-3 rounded-xl border border-red-200/60 dark:border-red-900/60">
                    <span className="text-xs font-semibold text-red-900 dark:text-red-300">
                      Grand Total Expenses
                    </span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      ₱{" "}
                      {report.expenses.grandTotalExpenses.toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 bg-teal-50 dark:bg-teal-950/40 px-3 rounded-xl border border-teal-200/60 dark:border-teal-900/60">
                    <span className="text-xs font-semibold text-teal-900 dark:text-teal-300">
                      Est. Cost per Egg
                    </span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                      ₱ {report.expenses.costPerEgg}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CATEGORIZED TRANSACTION BREAKDOWN SECTION */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Categorized Transaction History
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed breakdown of all transactions grouped by expense &
                  activity category.
                </p>
              </div>
            </div>

            {/* FEEDS CONSUMPTION CATEGORY */}
            {(report.expenses.feedConsumptions || []).length > 0 && (
              <PaginatedCategoryCard
                title="Category: Feeds & Feeding"
                icon={
                  <div className="p-1 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                }
                badgeText={`${report.expenses.feedConsumptions.length} transactions`}
                headerBg="bg-teal-50/50 dark:bg-teal-950/20"
                headerExtra={
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap">
                    Total: ₱&nbsp;
                    {report.expenses.totalFeedCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                }
                items={report.expenses.feedConsumptions}
                renderTable={(paginatedItems) => (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4 whitespace-nowrap">
                          Date Given
                        </th>
                        <th className="py-2.5 px-4 min-w-[140px]">Feed Type</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">
                          Quantity
                        </th>
                        <th className="py-2.5 px-4 whitespace-nowrap">
                          Recorded By
                        </th>
                        <th className="py-2.5 px-4 text-right whitespace-nowrap">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedItems.map((feed) => (
                        <tr
                          key={feed.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        >
                          <td className="py-2 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {format(new Date(feed.dateGiven), "MMM dd, yyyy")}
                          </td>
                          <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">
                            {feed.feedType}
                          </td>
                          <td className="py-2 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {feed.quantityBags} bags
                          </td>
                          <td className="py-2 px-4 text-slate-500 whitespace-nowrap">
                            {feed.recordedBy || "System"}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            ₱&nbsp;
                            {feed.totalCost.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              />
            )}

            {/* OPERATING EXPENSE CATEGORIES (e.g. DIESEL, SUPPLIES, REPAIRS, UTILITIES) */}
            {(() => {
              const opExGrouped: Record<
                string,
                typeof report.expenses.operatingExpenses
              > = {};
              (report.expenses.operatingExpenses || []).forEach((item) => {
                const catName = item.category
                  ? item.category.trim().toUpperCase()
                  : "GENERAL OPERATING EXPENSES";
                if (!opExGrouped[catName]) {
                  opExGrouped[catName] = [];
                }
                opExGrouped[catName].push(item);
              });

              const categoryNames = Object.keys(opExGrouped).sort();

              if (
                categoryNames.length === 0 &&
                (report.expenses.feedConsumptions || []).length === 0
              ) {
                return (
                  <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    No operating expense transactions recorded for this batch
                    yet.
                  </div>
                );
              }

              return categoryNames.map((catName) => {
                const items = opExGrouped[catName];
                const catTotal = items.reduce(
                  (acc, i) => acc + (i.amount || 0),
                  0,
                );

                return (
                  <PaginatedCategoryCard
                    key={catName}
                    title={`Category: ${catName}`}
                    icon={
                      <div className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                    }
                    badgeText={`${items.length} ${items.length === 1 ? "transaction" : "transactions"}`}
                    headerBg="bg-slate-50 dark:bg-slate-800/60"
                    headerExtra={
                      <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        Total: ₱&nbsp;
                        {catTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    }
                    items={items}
                    renderTable={(paginatedItems) => (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-4 whitespace-nowrap">
                              Date Incurred
                            </th>
                            <th className="py-2.5 px-4 min-w-[200px]">
                              Remarks / Description
                            </th>
                            <th className="py-2.5 px-4 whitespace-nowrap">
                              Recorded By
                            </th>
                            <th className="py-2.5 px-4 text-right whitespace-nowrap min-w-[120px]">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {paginatedItems.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                            >
                              <td className="py-2 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                                {format(
                                  new Date(item.dateIncurred),
                                  "MMM dd, yyyy",
                                )}
                              </td>
                              <td className="py-2 px-4 text-slate-900 dark:text-white font-medium">
                                {item.remarks || "—"}
                              </td>
                              <td className="py-2 px-4 text-slate-500 whitespace-nowrap">
                                {item.recordedBy || "System"}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                ₱&nbsp;
                                {item.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  />
                );
              });
            })()}

            {/* DAILY EGG PRODUCTION LOGS CATEGORY */}
            {(report.production.records || []).length > 0 && (
              <PaginatedCategoryCard
                title="Category: Daily Egg Production & Health Logs"
                icon={
                  <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                    <Egg className="w-3.5 h-3.5" />
                  </div>
                }
                badgeText={`${report.production.records.length} records`}
                headerBg="bg-amber-50/50 dark:bg-amber-950/20"
                items={report.production.records}
                renderTable={(paginatedItems) => (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Record Date</th>
                        <th className="py-2.5 px-4">Trays</th>
                        <th className="py-2.5 px-4">Extra Pcs</th>
                        <th className="py-2.5 px-4">Total Eggs</th>
                        <th className="py-2.5 px-4">Mortality</th>
                        <th className="py-2.5 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedItems.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        >
                          <td className="py-2 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {format(new Date(r.recordDate), "MMM dd, yyyy")}
                          </td>
                          <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">
                            {r.quantityTrays} trays
                          </td>
                          <td className="py-2 px-4 text-slate-600 dark:text-slate-400">
                            {r.quantityPieces} pcs
                          </td>
                          <td className="py-2 px-4 font-bold text-amber-600 dark:text-amber-400">
                            {(
                              r.quantityTrays * 30 +
                              r.quantityPieces
                            ).toLocaleString()}{" "}
                            pcs
                          </td>
                          <td className="py-2 px-4 font-bold text-rose-600 dark:text-rose-400">
                            {r.mortalityCount} birds
                          </td>
                          <td className="py-2 px-4 text-slate-500">
                            {r.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
