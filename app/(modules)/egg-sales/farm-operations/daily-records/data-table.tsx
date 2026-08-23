"use client";

import * as React from "react";
import {
  ColumnDef,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  FileSpreadsheet,
  Type,
  X,
  CalendarIcon,
  Egg,
  User,
  Building2,
  Layers,
  Home,
  RotateCcw,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DailyRecordData } from "./columns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  "use no memo";
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [textSize, setTextSize] = React.useState<"xs" | "sm" | "base">("xs");

  const [selectedFarm, setSelectedFarm] = React.useState<string>("all");
  const [selectedBuilding, setSelectedBuilding] = React.useState<string>("all");
  const [selectedBatch, setSelectedBatch] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<{
    type: "all" | "today" | "custom";
    date?: Date;
  }>({ type: "all" });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const [selectedRecord, setSelectedRecord] = React.useState<DailyRecordData | null>(null);

  // Extract farm options dynamically
  const farmOptions = React.useMemo(() => {
    const set = new Set<string>();
    (data as DailyRecordData[]).forEach((item) => {
      const name = item.flock?.farmName;
      if (name && name.trim() !== "") {
        set.add(name.trim().toUpperCase());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  // Extract building options dynamically based on selected farm
  const buildingOptions = React.useMemo(() => {
    const set = new Set<string>();
    (data as DailyRecordData[]).forEach((item) => {
      const farm = item.flock?.farmName?.trim().toUpperCase();
      const building = item.flock?.buildingName;
      if (
        building &&
        building.trim() !== "" &&
        (selectedFarm === "all" || farm === selectedFarm)
      ) {
        set.add(building.trim().toUpperCase());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data, selectedFarm]);

  // Extract batch options dynamically based on selected farm and building
  const batchOptions = React.useMemo(() => {
    const set = new Set<string>();
    (data as DailyRecordData[]).forEach((item) => {
      const farm = item.flock?.farmName?.trim().toUpperCase();
      const building = item.flock?.buildingName?.trim().toUpperCase();
      const batch = item.flock?.batchName;
      if (
        batch &&
        batch.trim() !== "" &&
        (selectedFarm === "all" || farm === selectedFarm) &&
        (selectedBuilding === "all" || building === selectedBuilding)
      ) {
        set.add(batch.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data, selectedFarm, selectedBuilding]);

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
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue || "").trim().toLowerCase();
      if (!search) return true;

      const item = row.original as DailyRecordData;
      const batchName = String(item.flock?.batchName || "").toLowerCase();
      const farmName = String(item.flock?.farmName || "").toLowerCase();
      const buildingName = String(item.flock?.buildingName || "").toLowerCase();
      const recordedBy = String(item.recordedBy || "").toLowerCase();
      const remarks = String(item.remarks || "").toLowerCase();
      const recordDate = String(item.recordDate || "").toLowerCase();

      return (
        batchName.includes(search) ||
        farmName.includes(search) ||
        buildingName.includes(search) ||
        recordedBy.includes(search) ||
        remarks.includes(search) ||
        recordDate.includes(search)
      );
    },
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize: 20 } },
  });

  // Handle Farm Name Filter
  React.useEffect(() => {
    const col = table.getColumn("farmName");
    if (!col) return;
    if (selectedFarm === "all") {
      col.setFilterValue(undefined);
    } else {
      col.setFilterValue(selectedFarm);
    }
  }, [selectedFarm, table]);

  // Handle Building Name Filter
  React.useEffect(() => {
    const col = table.getColumn("buildingName");
    if (!col) return;
    if (selectedBuilding === "all") {
      col.setFilterValue(undefined);
    } else {
      col.setFilterValue(selectedBuilding);
    }
  }, [selectedBuilding, table]);

  // Handle Batch Name Filter
  React.useEffect(() => {
    const col = table.getColumn("batchName");
    if (!col) return;
    if (selectedBatch === "all") {
      col.setFilterValue(undefined);
    } else {
      col.setFilterValue(selectedBatch);
    }
  }, [selectedBatch, table]);

  // Auto-reset building selection if not valid under current farm
  React.useEffect(() => {
    if (selectedBuilding !== "all" && !buildingOptions.includes(selectedBuilding)) {
      setSelectedBuilding("all");
    }
  }, [selectedFarm, buildingOptions, selectedBuilding]);

  // Auto-reset batch selection if not valid under current farm/building
  React.useEffect(() => {
    if (selectedBatch !== "all" && !batchOptions.includes(selectedBatch)) {
      setSelectedBatch("all");
    }
  }, [selectedFarm, selectedBuilding, batchOptions, selectedBatch]);

  // Handle Date Filter
  React.useEffect(() => {
    const col = table.getColumn("recordDate");
    if (!col) return;
    if (dateFilter.type === "all") {
      col.setFilterValue(undefined);
    } else if (dateFilter.type === "today") {
      col.setFilterValue(format(new Date(), "yyyy-MM-dd"));
    } else if (dateFilter.type === "custom" && dateFilter.date) {
      col.setFilterValue(format(dateFilter.date, "yyyy-MM-dd"));
    }
  }, [dateFilter, table]);

  const textSizeClass = { xs: "text-xs", sm: "text-sm", base: "text-base" }[textSize];

  const getFormattedDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Export CSV Function
  const exportToCSV = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: DailyRecordData;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }

      let totalTrays = 0;
      let totalPieces = 0;
      let totalMortality = 0;
      rows.forEach((r) => {
        totalTrays += r.original.quantityTrays || 0;
        totalPieces += r.original.quantityPieces || 0;
        totalMortality += r.original.mortalityCount || 0;
      });
      const totalEggs = totalTrays * 30 + totalPieces;

      const metaHeader = [
        `"Poultry Operations - Daily Records Log"`,
        `"Farm Filter: ${selectedFarm === "all" ? "All Origin Farms" : selectedFarm}"`,
        `"Batch Filter: ${selectedBatch === "all" ? "All Batches" : selectedBatch}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
        `"DAILY PRODUCTION & MORTALITY SUMMARY"`,
        `"Total Logged Records: ${rows.length}"`,
        `"Total Egg Production: ${totalTrays.toLocaleString()} Trays (${totalEggs.toLocaleString()} Total Eggs)"`,
        `"Total Losses / Mortality: ${totalMortality.toLocaleString()} Birds"`,
        `""`,
      ].join("\n");

      const headers = [
        "Record Date",
        "Farm Name",
        "Building",
        "Batch Name",
        "Egg Production (Trays)",
        "Loose Eggs (Pcs)",
        "Total Eggs",
        "Mortality Count",
        "Remarks",
        "Recorded By",
      ];

      const csvData = rows.map((row) => {
        const d = row.original;
        const total = (d.quantityTrays || 0) * 30 + (d.quantityPieces || 0);
        return [
          d.recordDate ? format(new Date(d.recordDate), "yyyy-MM-dd") : "",
          `"${(d.flock?.farmName || "N/A").replace(/"/g, '""')}"`,
          `"${(d.flock?.buildingName || "N/A").replace(/"/g, '""')}"`,
          `"${(d.flock?.batchName || "N/A").replace(/"/g, '""')}"`,
          d.quantityTrays || 0,
          d.quantityPieces || 0,
          total,
          d.mortalityCount || 0,
          `"${(d.remarks || "").replace(/"/g, '""')}"`,
          `"${(d.recordedBy || "System").replace(/"/g, '""')}"`,
        ].join(",");
      });

      const blob = new Blob(
        [metaHeader + "\n" + [headers.join(","), ...csvData].join("\n")],
        { type: "text/csv;charset=utf-8;" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Daily_Records_Export_${getFormattedDate()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate CSV.");
    }
  };

  // Export PDF Function
  const exportToPDF = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: DailyRecordData;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const doc = new jsPDF("l", "pt", "a4");

      let totalTrays = 0;
      let totalPieces = 0;
      let totalMortality = 0;
      rows.forEach((r) => {
        totalTrays += r.original.quantityTrays || 0;
        totalPieces += r.original.quantityPieces || 0;
        totalMortality += r.original.mortalityCount || 0;
      });
      const totalEggs = totalTrays * 30 + totalPieces;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text("Daily Egg Production & Mortality Log", 40, 45);

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US")} | Farm: ${
          selectedFarm === "all" ? "All Origin Farms" : selectedFarm
        } | Batch: ${selectedBatch === "all" ? "All Batches" : selectedBatch}`,
        40,
        62
      );

      // Summary Cards Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, 75, 762, 45, 6, 6, "F");

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL RECORDS", 55, 93);
      doc.text("TOTAL EGG PRODUCTION", 260, 93);
      doc.text("MORTALITY / LOSSES", 540, 93);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${rows.length} logs`, 55, 110);
      doc.text(`${totalTrays.toLocaleString()} trays (${totalEggs.toLocaleString()} pcs)`, 260, 110);
      doc.text(`${totalMortality.toLocaleString()} birds`, 540, 110);

      const tableData = rows.map((r) => {
        const d = r.original;
        const total = (d.quantityTrays || 0) * 30 + (d.quantityPieces || 0);
        return [
          d.recordDate ? format(new Date(d.recordDate), "MMM dd, yyyy") : "",
          d.flock?.farmName || "N/A",
          d.flock?.buildingName || "N/A",
          d.flock?.batchName || "N/A",
          `${(d.quantityTrays || 0).toLocaleString()} trays`,
          `${(d.quantityPieces || 0).toLocaleString()} pcs`,
          `${total.toLocaleString()} pcs`,
          `${(d.mortalityCount || 0).toLocaleString()} birds`,
          d.recordedBy || "System",
        ];
      });

      autoTable(doc, {
        startY: 132,
        head: [
          [
            "Date",
            "Farm Origin",
            "Building",
            "Batch Name",
            "Trays",
            "Pieces",
            "Total Eggs",
            "Mortality",
            "Recorded By",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8, cellPadding: 5 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });

      doc.save(`Daily_Records_Report_${getFormattedDate()}.pdf`);
      toast.success("PDF report generated successfully.");
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
    selectedFarm !== "all" ||
    selectedBuilding !== "all" ||
    selectedBatch !== "all" ||
    dateFilter.type !== "all";

  const resetAllFilters = () => {
    setGlobalFilter("");
    setSelectedFarm("all");
    setSelectedBuilding("all");
    setSelectedBatch("all");
    setDateFilter({ type: "all" });
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 gap-3 print:hidden">
        {/* ── TOOLBAR & FILTERS ── */}
        <div className="flex flex-col gap-2.5 shrink-0">
          {/* Top Row: Search & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search batch, farm, building, user, remarks..."
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

            {/* Farm Origin Filter */}
            <Select
              value={selectedFarm}
              onValueChange={(val) => setSelectedFarm(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-8.5 w-auto min-w-[130px] sm:min-w-[150px] justify-start text-left font-semibold rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer px-2.5",
                  selectedFarm !== "all" &&
                    "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold bg-emerald-50/40 dark:bg-emerald-950/20"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <SelectValue placeholder="All Origin Farms" />
                </div>
              </SelectTrigger>
              <SelectContent align="start" className="z-110 w-[200px]">
                <SelectItem value="all" className="text-xs cursor-pointer font-medium">
                  All Origin Farms
                </SelectItem>
                {farmOptions.map((farm) => (
                  <SelectItem key={farm} value={farm} className="text-xs cursor-pointer font-bold uppercase">
                    {farm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Building Filter */}
            <Select
              value={selectedBuilding}
              onValueChange={(val) => setSelectedBuilding(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-8.5 w-auto min-w-[120px] sm:min-w-[140px] justify-start text-left font-semibold rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer px-2.5",
                  selectedBuilding !== "all" &&
                    "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold bg-emerald-50/40 dark:bg-emerald-950/20"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Home className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <SelectValue placeholder="All Buildings" />
                </div>
              </SelectTrigger>
              <SelectContent align="start" className="z-110 w-[190px]">
                <SelectItem value="all" className="text-xs cursor-pointer font-medium">
                  All Buildings
                </SelectItem>
                {buildingOptions.map((bldg) => (
                  <SelectItem key={bldg} value={bldg} className="text-xs cursor-pointer font-bold uppercase">
                    {bldg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Flock Batch Filter */}
            <Select
              value={selectedBatch}
              onValueChange={(val) => setSelectedBatch(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-8.5 w-auto min-w-[130px] sm:min-w-[150px] justify-start text-left font-semibold rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer px-2.5",
                  selectedBatch !== "all" &&
                    "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold bg-emerald-50/40 dark:bg-emerald-950/20"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <SelectValue placeholder="All Flock Batches" />
                </div>
              </SelectTrigger>
              <SelectContent align="start" className="z-110 w-[190px]">
                <SelectItem value="all" className="text-xs cursor-pointer font-medium">
                  All Flock Batches
                </SelectItem>
                {batchOptions.map((batch) => (
                  <SelectItem key={batch} value={batch} className="text-xs cursor-pointer font-bold">
                    {batch}
                  </SelectItem>
                ))}
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
                      "text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40"
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
                      variant={dateFilter.type === "all" ? "secondary" : "ghost"}
                      className="w-full justify-start text-xs h-8 cursor-pointer"
                      onClick={() => {
                        setDateFilter({ type: "all" });
                        setIsDatePickerOpen(false);
                      }}
                    >
                      View All
                    </Button>
                    <Button
                      variant={dateFilter.type === "today" ? "secondary" : "ghost"}
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
                      <p className="text-[13px] font-medium leading-none">Save as PDF</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Printable production log
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
                      <p className="text-[13px] font-medium leading-none">Export to CSV</p>
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

        {/* Filter Indicator Banner */}
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
                className="hover:opacity-75 cursor-pointer ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* ── TABLE CONTAINER ── */}
        <div className="rounded-lg border border-border/60 bg-card flex flex-col flex-1 min-h-0 overflow-hidden [&>div]:flex-1 [&>div]:overflow-auto [&>div]:custom-scrollbar">
          <Table className={cn(textSizeClass, "w-full min-w-[750px]")}>
            <TableHeader className="sticky top-0 z-20 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/40 hover:bg-muted/40 border-b border-border/60"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        textSizeClass,
                        "h-9 py-0 font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                    onClick={() => setSelectedRecord(row.original as DailyRecordData)}
                    className={cn(
                      "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
                      "group/row border-b border-border/40 transition-all duration-300 cursor-pointer relative",
                      "hover:shadow-xs hover:z-20 hover:ring-1 hover:ring-emerald-400 dark:hover:ring-emerald-600",
                      i % 2 === 0
                        ? "bg-card hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30"
                        : "bg-muted/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-xs text-muted-foreground"
                  >
                    No daily records found matching filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── PAGINATION & FOOTER ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 order-2 sm:order-1 justify-center sm:justify-start">
            <p className="text-xs text-muted-foreground text-center sm:text-left whitespace-nowrap">
              Showing{" "}
              <span className="font-medium text-foreground">
                {table.getRowModel().rows.length}
              </span>{" "}
              of <span className="font-medium text-foreground">{filteredCount}</span>{" "}
              record{filteredCount !== 1 ? "s" : ""}
              {pageCount > 1 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  · page {currentPage} of {pageCount}
                </span>
              )}
            </p>

            {/* Density / Font Size Controller */}
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-border/60 bg-background px-1.5 sm:px-2 h-8">
              <Type className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-0.5">
                {(["xs", "sm", "base"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
                      textSize === size
                        ? "bg-emerald-600 text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {size === "xs" ? "S" : size === "sm" ? "M" : "L"}
                  </button>
                ))}
              </div>
            </div>

            {/* Rows Per Page Selector */}
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[85px] text-[10px] sm:text-xs bg-background border-border/60 rounded-lg focus:ring-1 focus:ring-emerald-500/40 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-110">
                {[5, 10, 20, 30, 50, 100].map((n) => (
                  <SelectItem key={n} value={`${n}`} className="text-xs cursor-pointer">
                    {n} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let page = i;
                if (pageCount > 5) {
                  let startPage = Math.max(0, currentPage - 1 - 2);
                  if (startPage + 4 >= pageCount) {
                    startPage = Math.max(0, pageCount - 5);
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
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              className="h-8 px-3 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 cursor-pointer"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── ROW-CLICK DETAILS MODAL ── */}
      <Dialog
        open={!!selectedRecord}
        onOpenChange={(open) => {
          if (!open) setSelectedRecord(null);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Egg className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Daily Record Details
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    {selectedRecord?.recordDate
                      ? format(new Date(selectedRecord.recordDate), "MMMM dd, yyyy")
                      : ""}
                  </DialogDescription>
                </div>
              </div>
              {selectedRecord && (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {selectedRecord.flock?.batchName}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 my-2">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Egg Production
                  </span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300 block">
                    {(selectedRecord.quantityTrays || 0).toLocaleString()} trays
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                    ({((selectedRecord.quantityTrays || 0) * 30 + (selectedRecord.quantityPieces || 0)).toLocaleString()} total eggs)
                  </span>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200/60 dark:border-rose-900/50 text-center">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
                    Mortality / Losses
                  </span>
                  <span className="text-base font-bold text-rose-700 dark:text-rose-300 block">
                    {(selectedRecord.mortalityCount || 0).toLocaleString()} birds
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                    {selectedRecord.mortalityCount > 0 ? "Losses recorded" : "No losses recorded"}
                  </span>
                </div>
              </div>

              {/* Comprehensive Details Card */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Farm Origin:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedRecord.flock?.farmName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Building Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedRecord.flock?.buildingName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Batch Name:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedRecord.flock?.batchName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Trays Collected:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {(selectedRecord.quantityTrays || 0).toLocaleString()} trays
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Loose Eggs (Pcs):</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {(selectedRecord.quantityPieces || 0).toLocaleString()} pcs
                  </span>
                </div>
                {selectedRecord.remarks && (
                  <div className="flex justify-between items-start pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 font-medium shrink-0 mr-2">Remarks:</span>
                    <span className="font-normal text-slate-700 dark:text-slate-300 text-right">
                      {selectedRecord.remarks}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Recorded By:</span>
                  <Badge
                    variant="secondary"
                    className="font-medium text-xs gap-1 py-0.5 px-2"
                  >
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{selectedRecord.recordedBy || "System"}</span>
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedRecord(null)}
              className="rounded-xl cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
