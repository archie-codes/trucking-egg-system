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
  Bird,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type FlockData, getColumns } from "./columns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function HistoryTable({
  data,
  isAdmin = false,
}: {
  data: FlockData[];
  isAdmin?: boolean;
}) {
  return <DataTable columns={getColumns(isAdmin)} data={data} />;
}

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

  const [selectedFarm, setSelectedFarm] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<{
    type: "all" | "today" | "custom";
    date?: Date;
  }>({ type: "all" });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const [selectedFlock, setSelectedFlock] = React.useState<FlockData | null>(
    null,
  );

  // Extract farm options dynamically
  const farmOptions = React.useMemo(() => {
    const set = new Set<string>();
    (data as FlockData[]).forEach((item) => {
      if (item.farmName && item.farmName.trim() !== "") {
        set.add(item.farmName.trim().toUpperCase());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

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
      const search = String(filterValue || "")
        .trim()
        .toLowerCase();
      if (!search) return true;

      const item = row.original as FlockData;
      const batchName = String(item.batchName || "").toLowerCase();
      const farmName = String(item.farmName || "").toLowerCase();
      const buildingName = String(item.buildingName || "").toLowerCase();
      const recordedBy = String(item.recordedBy || "").toLowerCase();
      const dateLoaded = String(
        item.formattedDateLoaded || item.dateLoaded || "",
      ).toLowerCase();

      return (
        batchName.includes(search) ||
        farmName.includes(search) ||
        buildingName.includes(search) ||
        recordedBy.includes(search) ||
        dateLoaded.includes(search)
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

  // Handle Status Filter
  React.useEffect(() => {
    const col = table.getColumn("isActive");
    if (!col) return;
    if (selectedStatus === "all") {
      col.setFilterValue(undefined);
    } else if (selectedStatus === "active") {
      col.setFilterValue(true);
    } else if (selectedStatus === "depleted") {
      col.setFilterValue(false);
    }
  }, [selectedStatus, table]);

  // Handle Date Filter
  React.useEffect(() => {
    const col = table.getColumn("formattedDateLoaded");
    if (!col) return;
    if (dateFilter.type === "all") {
      col.setFilterValue(undefined);
    } else if (dateFilter.type === "today") {
      col.setFilterValue(format(new Date(), "MMM dd, yyyy"));
    } else if (dateFilter.type === "custom" && dateFilter.date) {
      col.setFilterValue(format(dateFilter.date, "MMM dd, yyyy"));
    }
  }, [dateFilter, table]);

  const textSizeClass = { xs: "text-xs", sm: "text-sm", base: "text-base" }[
    textSize
  ];

  const getFormattedDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Export CSV Function
  const exportToCSV = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: FlockData;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }

      let totalInitial = 0;
      let totalCurrent = 0;
      rows.forEach((r) => {
        totalInitial += r.original.initialHeadCount || 0;
        totalCurrent += r.original.currentHeadCount || 0;
      });

      const metaHeader = [
        `"Poultry Management - Flock Ledger"`,
        `"Farm Origin : ${selectedFarm === "all" ? "All Origin Farms" : selectedFarm}"`,
        `"Generated on: ${new Date().toLocaleDateString("en-US")}"`,
        `""`,
        `"FLOCK SUMMARY"`,
        `"Total Batches: ${rows.length}"`,
        `"Initial Headcount: ${totalInitial}"`,
        `"Current Headcount: ${totalCurrent}"`,
        `"Total Losses / Mortality: ${totalInitial - totalCurrent}"`,
        `""`,
      ].join("\n");

      const headers = [
        "Farm Name",
        "Building Name",
        "Batch Name",
        "Date Loaded",
        "Age (Weeks)",
        "Initial Headcount",
        "Current Headcount",
        "Mortality Count",
        "Status",
        "Recorded By",
      ];

      const csvData = rows.map((row: { original: FlockData }) => {
        const d = row.original;
        const mortality = d.initialHeadCount - d.currentHeadCount;
        return [
          `"${(d.farmName || "").replace(/"/g, '""')}"`,
          `"${(d.buildingName || "").replace(/"/g, '""')}"`,
          `"${(d.batchName || "").replace(/"/g, '""')}"`,
          d.dateLoaded,
          d.ageInWeeks,
          d.initialHeadCount,
          d.currentHeadCount,
          mortality,
          d.isActive ? "Active" : "Depleted",
          `"${(d.recordedBy || "System").replace(/"/g, '""')}"`,
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
        `Flock_Management_Export_${getFormattedDate()}.csv`,
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

  // Export PDF Function
  const exportToPDF = () => {
    try {
      const rows = table.getFilteredRowModel().rows as unknown as {
        original: FlockData;
      }[];
      if (!rows.length) {
        toast.error("No data to export.");
        return;
      }
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.text("Poultry Management - Flock Ledger", 40, 40);

      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(12);
      doc.text(
        selectedFarm === "all" ? "All Origin Farms" : selectedFarm,
        40,
        60,
      );
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US")}`,
        40,
        75,
      );

      let totalInitial = 0;
      let totalCurrent = 0;
      rows.forEach((r) => {
        totalInitial += r.original.initialHeadCount || 0;
        totalCurrent += r.original.currentHeadCount || 0;
      });
      const totalMortality = totalInitial - totalCurrent;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FLOCK SUMMARY", 800, 45, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(`Total Batches: ${rows.length}`, 800, 60, { align: "right" });
      doc.text(
        `Initial Headcount: ${totalInitial.toLocaleString()} birds`,
        800,
        75,
        { align: "right" },
      );
      doc.text(
        `Current Headcount: ${totalCurrent.toLocaleString()} birds`,
        800,
        90,
        { align: "right" },
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total Mortality: ${totalMortality.toLocaleString()} birds`,
        800,
        105,
        { align: "right" },
      );

      const tableRows = rows.map((row: { original: FlockData }) => {
        const d = row.original;
        const mortality = d.initialHeadCount - d.currentHeadCount;
        return [
          d.farmName,
          d.buildingName,
          d.batchName,
          d.formattedDateLoaded || d.dateLoaded,
          `${d.ageInWeeks} ${d.ageInWeeks === 1 ? "week" : "weeks"}`,
          d.initialHeadCount.toLocaleString(),
          d.currentHeadCount.toLocaleString(),
          mortality.toLocaleString(),
          d.isActive ? "Active" : "Depleted",
          d.recordedBy || "System",
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Farm Name",
            "Building",
            "Batch Name",
            "Date Loaded",
            "Age",
            "Initial Birds",
            "Current Birds",
            "Mortality",
            "Status",
            "Recorded By",
          ],
        ],
        body: tableRows,
        startY: 125,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
        headStyles: {
          fillColor: [16, 185, 129], // Emerald 500
          fontSize: 8.5,
          halign: "left",
        },
      });

      doc.save(`Flock_Management_Ledger_${getFormattedDate()}.pdf`);
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
      <div className="flex flex-col flex-1 min-h-0 gap-3 print:hidden">
        {/* ── TOOLBAR & FILTERS ── */}
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between shrink-0">
          {/* Animated Collapsing Search Input (Responsive - Dedicated row on tablet/small laptops) */}
          <div
            className={cn(
              "group relative transition-all duration-500 ease-out ml-0.5",
              hasFilter
                ? "w-full sm:w-[320px]"
                : "w-full sm:w-[320px] xl:w-11 xl:focus-within:w-[320px] pr-1",
            )}
          >
            <Search
              className={cn(
                "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-500 z-10",
                hasFilter
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 xl:group-focus-within:text-emerald-600",
              )}
            />
            <Input
              placeholder="Search batch, farm, building, user..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={cn(
                "h-11 w-full rounded-xl! transition-all duration-500 ease-out border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-1 focus-visible:ring-emerald-500/40",
                hasFilter
                  ? "pl-10 pr-10 rounded-xl bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  : "pl-10 pr-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 xl:pr-0 xl:rounded-full xl:text-transparent xl:placeholder:text-transparent xl:cursor-pointer xl:hover:bg-slate-200/50 xl:dark:hover:bg-slate-800/80 xl:group-focus-within:bg-white xl:group-focus-within:dark:bg-slate-900 xl:group-focus-within:pr-10 xl:group-focus-within:rounded-xl xl:group-focus-within:text-foreground xl:group-focus-within:placeholder:text-slate-400 xl:group-focus-within:dark:placeholder:text-slate-500 xl:group-focus-within:cursor-text",
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
                  type="button"
                  onClick={() => setGlobalFilter("")}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns & Controllers (Placed on row 2 on tablet/small laptops, right-aligned) */}
          <div className="flex items-center justify-start sm:justify-end w-full xl:w-auto gap-1.5 sm:gap-2 flex-wrap shrink-0">
            {/* Farm Origin Filter */}
            <Select
              value={selectedFarm}
              onValueChange={(val) => setSelectedFarm(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-9 w-[140px] sm:w-[160px] justify-start text-left font-semibold rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer",
                  selectedFarm !== "all" &&
                    "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold",
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <SelectValue placeholder="All Origin Farms" />
                </div>
              </SelectTrigger>
              <SelectContent align="end" className="z-110 w-[200px]">
                <SelectItem
                  value="all"
                  className="text-xs cursor-pointer font-medium"
                >
                  All Origin Farms
                </SelectItem>
                {farmOptions.map((farm) => (
                  <SelectItem
                    key={farm}
                    value={farm}
                    className="text-xs cursor-pointer font-bold uppercase"
                  >
                    {farm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => setSelectedStatus(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-9 w-[110px] sm:w-[125px] justify-start text-left font-semibold rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer",
                  selectedStatus !== "all" &&
                    "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold",
                )}
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent align="end" className="z-110">
                <SelectItem
                  value="all"
                  className="text-xs cursor-pointer font-medium"
                >
                  All Status
                </SelectItem>
                <SelectItem
                  value="active"
                  className="text-xs cursor-pointer font-medium"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="depleted"
                  className="text-xs cursor-pointer font-medium"
                >
                  Depleted
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
                    "h-8 sm:h-9 w-[130px] sm:w-[140px] justify-start text-left font-normal rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer",
                    dateFilter.type !== "all" &&
                      "text-emerald-600 dark:text-emerald-400 font-medium",
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
              <PopoverContent className="w-auto p-0 z-110" align="end">
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

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[10px] sm:text-xs font-medium rounded-lg px-2 sm:px-3 shadow-none border-0 cursor-pointer"
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
                      Printable flock ledger
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

        {/* ── SCROLLABLE TABLE CONTAINER (Exact match to receiving/history) ── */}
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
                        "h-9 py-0 font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
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
                    onClick={() => setSelectedFlock(row.original as FlockData)}
                    className={cn(
                      "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
                      "group/row border-b border-border/40 transition-all duration-300 cursor-pointer relative",
                      "hover:shadow-xs hover:z-20 hover:ring-1 hover:ring-emerald-400 dark:hover:ring-emerald-600",
                      i % 2 === 0
                        ? "bg-card hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30"
                        : "bg-muted/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
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
                    className="h-32 text-center text-xs text-muted-foreground"
                  >
                    No flock batches found matching filters.
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
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
        open={!!selectedFlock}
        onOpenChange={(open) => {
          if (!open) setSelectedFlock(null);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Bird className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedFlock?.batchName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    {selectedFlock?.farmName} &bull;{" "}
                    {selectedFlock?.buildingName}
                  </DialogDescription>
                </div>
              </div>
              {selectedFlock && (
                <Badge
                  variant={selectedFlock.isActive ? "default" : "secondary"}
                  className={
                    selectedFlock.isActive
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }
                >
                  {selectedFlock.isActive ? "Active" : "Depleted"}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedFlock && (
            <div className="space-y-4 my-2">
              {/* Headcount Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Initial Headcount
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedFlock.initialHeadCount.toLocaleString()} birds
                  </span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Current Headcount
                  </span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {selectedFlock.currentHeadCount.toLocaleString()} birds
                  </span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200/60 dark:border-rose-900/50 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
                    Mortality / Losses
                  </span>
                  <span className="text-sm font-bold text-rose-700 dark:text-rose-300 block">
                    {(
                      selectedFlock.initialHeadCount -
                      selectedFlock.currentHeadCount
                    ).toLocaleString()}{" "}
                    birds
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                    (
                    {(
                      ((selectedFlock.initialHeadCount -
                        selectedFlock.currentHeadCount) /
                        selectedFlock.initialHeadCount) *
                      100
                    ).toFixed(1)}
                    % rate)
                  </span>
                </div>
              </div>

              {/* Comprehensive Details Card */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    Batch Name:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedFlock.batchName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Farm Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedFlock.farmName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    Building Name:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedFlock.buildingName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    Date Loaded:
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedFlock.formattedDateLoaded}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Flock Age:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedFlock.ageInWeeks}{" "}
                    {selectedFlock.ageInWeeks === 1 ? "week" : "weeks"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">
                    Recorded By:
                  </span>
                  <Badge
                    variant="secondary"
                    className="font-medium text-xs gap-1 py-0.5 px-2"
                  >
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{selectedFlock.recordedBy || "System"}</span>
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedFlock(null)}
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
