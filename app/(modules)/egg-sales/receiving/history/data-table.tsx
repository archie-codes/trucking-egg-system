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

const formatTrayCount = (val: number): string => {
  if (isNaN(val) || val === 0) return "0";
  if (Number.isInteger(val)) return val.toString();
  return Number(val.toFixed(2)).toString();
};
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
  PackageOpen,
  CalendarIcon,
  Printer,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type EggBatchRecord, getColumns } from "./columns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function HistoryTable({
  data,
  isAdmin,
}: {
  data: EggBatchRecord[];
  isAdmin: boolean;
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
  const [viewData, setViewData] = React.useState<EggBatchRecord | null>(null);
  const [dateFilter, setDateFilter] = React.useState<{
    type: "all" | "today" | "custom";
    date?: Date;
  }>({ type: "all" });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const [selectedFarm, setSelectedFarm] = React.useState<string>("all");

  // Extract farm options, ensuring SJK FARM and BARACBAC are present
  const farmOptions = React.useMemo(() => {
    const set = new Set<string>(["SJK FARM", "BARACBAC"]);
    (data as EggBatchRecord[]).forEach((item) => {
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

      const item = row.original as EggBatchRecord;
      const batchId = String(item.batchId || "").toLowerCase();
      const farmName = String(item.farmName || "").toLowerCase();
      const arrivalDateRaw = String(item.arrivalDate || "").toLowerCase();

      let dateFormatted1 = "";
      let dateFormatted2 = "";
      let dateFormatted3 = "";

      try {
        if (item.arrivalDate) {
          const d = new Date(item.arrivalDate);
          dateFormatted1 = format(d, "MMM dd, yyyy").toLowerCase(); // e.g. "aug 02, 2026"
          dateFormatted2 = format(d, "MMMM dd, yyyy").toLowerCase(); // e.g. "august 02, 2026"
          dateFormatted3 = format(d, "MM/dd/yyyy").toLowerCase(); // e.g. "08/02/2026"
        }
      } catch {}

      return (
        batchId.includes(search) ||
        farmName.includes(search) ||
        arrivalDateRaw.includes(search) ||
        dateFormatted1.includes(search) ||
        dateFormatted2.includes(search) ||
        dateFormatted3.includes(search)
      );
    },
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize: 20 } },
  });

  React.useEffect(() => {
    const col = table.getColumn("arrivalDate");
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
    const col = table.getColumn("farmName");
    if (!col) return;
    if (selectedFarm === "all") {
      col.setFilterValue(undefined);
    } else {
      col.setFilterValue(selectedFarm);
    }
  }, [selectedFarm, table]);

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
      totalGood +=
        (d.qtyPeewee || 0) +
        (d.qtyXs || 0) +
        (d.qtySmall || 0) +
        (d.qtyMedium || 0) +
        (d.qtyLarge || 0) +
        (d.qtyXl || 0) +
        (d.qtyXxl || 0) +
        (d.brownQtyPeewee || 0) +
        (d.brownQtyXs || 0) +
        (d.brownQtySmall || 0) +
        (d.brownQtyMedium || 0) +
        (d.brownQtyLarge || 0) +
        (d.brownQtyXl || 0) +
        (d.brownQtyXxl || 0) +
        (d.brownQtyAssorted || 0);

      totalLosses +=
        (d.qtyCracked || 0) +
        (d.qtyBroken || 0) +
        (d.qtyDirty || 0) +
        (d.brownQtyCracked || 0) +
        (d.brownQtyBroken || 0) +
        (d.brownQtyDirty || 0);
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
        "Total Trays",
        "Extra Option",
        "Extra Pieces",
        "Peewee",
        "XS",
        "Small",
        "Medium",
        "Large",
        "XL",
        "XXL",
        "Cracked",
        "Broken",
        "Dirty",
        "Br PW",
        "Br XS",
        "Br S",
        "Br M",
        "Br L",
        "Br XL",
        "Br XXL",
        "Br ASST",
        "Br CRK",
        "Br BRK",
        "Br DRT",
        "Total Good Pcs",
        "Total Bad Egg",
        "Grand Total Pcs",
      ];

      const csvData = rows.map((row: { original: EggBatchRecord }) => {
        const d = row.original;
        const totalGood =
          (d.qtyPeewee || 0) +
          (d.qtyXs || 0) +
          (d.qtySmall || 0) +
          (d.qtyMedium || 0) +
          (d.qtyLarge || 0) +
          (d.qtyXl || 0) +
          (d.qtyXxl || 0) +
          (d.brownQtyPeewee || 0) +
          (d.brownQtyXs || 0) +
          (d.brownQtySmall || 0) +
          (d.brownQtyMedium || 0) +
          (d.brownQtyLarge || 0) +
          (d.brownQtyXl || 0) +
          (d.brownQtyXxl || 0) +
          (d.brownQtyAssorted || 0);

        const totalLoss =
          (d.qtyCracked || 0) +
          (d.qtyBroken || 0) +
          (d.qtyDirty || 0) +
          (d.brownQtyCracked || 0) +
          (d.brownQtyBroken || 0) +
          (d.brownQtyDirty || 0);

        return [
          new Date(d.arrivalDate).toLocaleDateString(),
          `"${d.batchId}"`,
          `"${d.farmName}"`,
          d.totalTraysPickedUp,
          `"${d.extraType || "NONE"}"`,
          d.extraPiecesPickedUp || 0,
          d.qtyPeewee || 0,
          d.qtyXs || 0,
          d.qtySmall || 0,
          d.qtyMedium || 0,
          d.qtyLarge || 0,
          d.qtyXl || 0,
          d.qtyXxl || 0,
          d.qtyCracked || 0,
          d.qtyBroken || 0,
          d.qtyDirty || 0,
          d.brownQtyPeewee || 0,
          d.brownQtyXs || 0,
          d.brownQtySmall || 0,
          d.brownQtyMedium || 0,
          d.brownQtyLarge || 0,
          d.brownQtyXl || 0,
          d.brownQtyXxl || 0,
          d.brownQtyAssorted || 0,
          d.brownQtyCracked || 0,
          d.brownQtyBroken || 0,
          d.brownQtyDirty || 0,
          totalGood,
          totalLoss,
          totalGood + totalLoss,
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
          (d.qtyPeewee || 0) +
          (d.qtyXs || 0) +
          (d.qtySmall || 0) +
          (d.qtyMedium || 0) +
          (d.qtyLarge || 0) +
          (d.qtyXl || 0) +
          (d.qtyXxl || 0) +
          (d.brownQtyPeewee || 0) +
          (d.brownQtyXs || 0) +
          (d.brownQtySmall || 0) +
          (d.brownQtyMedium || 0) +
          (d.brownQtyLarge || 0) +
          (d.brownQtyXl || 0) +
          (d.brownQtyXxl || 0) +
          (d.brownQtyAssorted || 0);

        const totalLoss =
          (d.qtyCracked || 0) +
          (d.qtyBroken || 0) +
          (d.qtyDirty || 0) +
          (d.brownQtyCracked || 0) +
          (d.brownQtyBroken || 0) +
          (d.brownQtyDirty || 0);

        const extraPcs =
          d.extraType === "HALF_TRAY"
            ? 15
            : d.extraType === "PIECES"
              ? d.extraPiecesPickedUp || 0
              : 0;
        const totalTraysDisplay =
          extraPcs > 0
            ? `${d.totalTraysPickedUp} (+${extraPcs}pcs)`
            : `${d.totalTraysPickedUp}`;

        return [
          new Date(d.arrivalDate).toLocaleDateString(),
          d.batchId,
          d.farmName,
          totalTraysDisplay,
          d.qtyPeewee > 0 ? d.qtyPeewee.toString() : "-",
          d.qtyXs > 0 ? d.qtyXs.toString() : "-",
          d.qtySmall > 0 ? d.qtySmall.toString() : "-",
          d.qtyMedium > 0 ? d.qtyMedium.toString() : "-",
          d.qtyLarge > 0 ? d.qtyLarge.toString() : "-",
          d.qtyXl > 0 ? d.qtyXl.toString() : "-",
          d.qtyXxl > 0 ? d.qtyXxl.toString() : "-",
          d.qtyCracked > 0 ? d.qtyCracked.toString() : "-",
          d.qtyBroken > 0 ? d.qtyBroken.toString() : "-",
          d.qtyDirty > 0 ? d.qtyDirty.toString() : "-",
          d.brownQtyPeewee > 0 ? d.brownQtyPeewee.toString() : "-",
          d.brownQtyXs > 0 ? d.brownQtyXs.toString() : "-",
          d.brownQtySmall > 0 ? d.brownQtySmall.toString() : "-",
          d.brownQtyMedium > 0 ? d.brownQtyMedium.toString() : "-",
          d.brownQtyLarge > 0 ? d.brownQtyLarge.toString() : "-",
          d.brownQtyXl > 0 ? d.brownQtyXl.toString() : "-",
          d.brownQtyXxl > 0 ? d.brownQtyXxl.toString() : "-",
          d.brownQtyAssorted > 0 ? d.brownQtyAssorted.toString() : "-",
          d.brownQtyCracked > 0 ? d.brownQtyCracked.toString() : "-",
          d.brownQtyBroken > 0 ? d.brownQtyBroken.toString() : "-",
          d.brownQtyDirty > 0 ? d.brownQtyDirty.toString() : "-",
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
            "Total Trays",
            "PW",
            "XS",
            "S",
            "M",
            "L",
            "XL",
            "XXL",
            "Crk",
            "Brk",
            "Drt",
            "Br PW",
            "Br XS",
            "Br S",
            "Br M",
            "Br L",
            "Br XL",
            "Br XXL",
            "Br ASST",
            "Br CRK",
            "Br BRK",
            "Br DRT",
            "Total Good",
            "Total Bad",
          ],
        ],
        body: tableRows,
        startY: 145,
        theme: "grid",
        styles: { fontSize: 5.5, cellPadding: 2, overflow: "linebreak" },
        headStyles: {
          fillColor: [245, 158, 11],
          fontSize: 6,
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
          10: { halign: "right", textColor: [37, 99, 235] },
          11: { halign: "right", textColor: [37, 99, 235] },
          12: { halign: "right", textColor: [225, 29, 72] },
          13: { halign: "right", textColor: [225, 29, 72] },
          14: { halign: "right", textColor: [234, 88, 12] },
          15: { halign: "right", textColor: [180, 83, 9] },
          16: { halign: "right", textColor: [180, 83, 9] },
          17: { halign: "right", textColor: [180, 83, 9] },
          18: { halign: "right", textColor: [180, 83, 9] },
          19: { halign: "right", textColor: [180, 83, 9] },
          20: { halign: "right", textColor: [180, 83, 9] },
          21: { halign: "right", textColor: [180, 83, 9] },
          22: { halign: "right", textColor: [180, 83, 9] },
          23: { halign: "right", textColor: [225, 29, 72] },
          24: { halign: "right", textColor: [225, 29, 72] },
          25: { halign: "right", textColor: [234, 88, 12] },
          26: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
          27: { halign: "right", fontStyle: "bold", textColor: [225, 29, 72] },
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
                : "w-full sm:w-[320px] xl:w-11 xl:focus-within:w-[320px] pr-1"
            )}
          >
            <Search
              className={cn(
                "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-500 z-10",
                hasFilter
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-500 dark:text-slate-400 xl:group-focus-within:text-amber-600"
              )}
            />
            <Input
              placeholder="Search batches, farms, dates..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={cn(
                "h-11 w-full rounded-xl! transition-all duration-500 ease-out border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-1 focus-visible:ring-amber-500/40",
                hasFilter
                  ? "pl-10 pr-10 rounded-xl bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  : "pl-10 pr-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 xl:pr-0 xl:rounded-full xl:text-transparent xl:placeholder:text-transparent xl:cursor-pointer xl:hover:bg-slate-200/50 xl:dark:hover:bg-slate-800/80 xl:group-focus-within:bg-white xl:group-focus-within:dark:bg-slate-900 xl:group-focus-within:pr-10 xl:group-focus-within:rounded-xl xl:group-focus-within:text-foreground xl:group-focus-within:placeholder:text-slate-400 xl:group-focus-within:dark:placeholder:text-slate-500 xl:group-focus-within:cursor-text"
              )}
            />
            <div
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2 transition-all duration-300",
                hasFilter
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50 pointer-events-none"
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

          {/* Font Size, Density Controller, Origin Farm Filter, and Export PDF (Placed on row 2 on tablet/small laptops, right-aligned) */}
          <div className="flex items-center justify-start sm:justify-end w-full xl:w-auto gap-1.5 sm:gap-2 flex-wrap shrink-0">


            {/* Origin Farm Selection Dropdown */}
            <Select
              value={selectedFarm}
              onValueChange={(val) => setSelectedFarm(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 sm:h-9 w-[150px] sm:w-[170px] justify-start text-left font-semibold rounded-lg border-border/60 bg-background text-[10px] sm:text-xs cursor-pointer",
                  selectedFarm !== "all" &&
                    "text-amber-600 dark:text-amber-500 border-amber-500/40 font-bold",
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
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
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 sm:h-9 w-[130px] sm:w-[140px] justify-start text-left font-normal rounded-lg border-border/60 bg-background text-[10px] sm:text-xs",
                    dateFilter.type !== "all" &&
                      "text-amber-600 dark:text-amber-500 font-medium",
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
                      className="w-full justify-start text-xs h-8"
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
                      className="w-full justify-start text-xs h-8"
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
                      "hover:shadow-md hover:z-20 hover:ring-1 hover:ring-amber-400 dark:hover:ring-amber-600",
                      i % 2 === 0
                        ? "bg-card hover:bg-amber-50/80 dark:hover:bg-amber-900/30"
                        : "bg-muted hover:bg-amber-50/80 dark:hover:bg-amber-900/30",
                    )}
                    onClick={() => setViewData(row.original as EggBatchRecord)}
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
                              ? "bg-card group-hover/row:bg-amber-50/80 dark:group-hover/row:bg-amber-900/30"
                              : "bg-muted dark:bg-slate-900/50 group-hover/row:bg-amber-50/80 dark:group-hover/row:bg-amber-900/30"),
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
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 px-2 gap-1 text-xs rounded-lg border-border/60 hover:bg-muted disabled:opacity-40 hidden sm:flex"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
      {/* View Details Modal */}
      <Dialog
        open={!!viewData}
        onOpenChange={(open) => {
          if (!open) setViewData(null);
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-xl border-0 shadow-2xl flex flex-col max-h-[90vh] print:hidden">
          <style>{`
            @media print {
              [data-slot="dialog-overlay"] { display: none !important; }
              body { background-color: white !important; }
            }
          `}</style>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-500 to-orange-500" />

          <DialogHeader className="px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <PackageOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Batch Details
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  Comprehensive breakdown of received inventory
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewData &&
            (() => {
              const extraPcs =
                viewData.extraType === "HALF_TRAY"
                  ? 15
                  : viewData.extraType === "PIECES"
                    ? viewData.extraPiecesPickedUp || 0
                    : 0;
              const expectedTotalTrays =
                viewData.totalTraysPickedUp + extraPcs / 30;
              const expectedTotalEggs =
                viewData.totalTraysPickedUp * 30 + extraPcs;

              const whiteGoodTotal =
                viewData.qtyPeewee +
                viewData.qtyXs +
                viewData.qtySmall +
                viewData.qtyMedium +
                viewData.qtyLarge +
                viewData.qtyXl +
                viewData.qtyXxl;
              const whiteSpoilageTotal =
                viewData.qtyCracked + viewData.qtyBroken + viewData.qtyDirty;
              const whiteTotal = whiteGoodTotal + whiteSpoilageTotal;

              const brownGoodTotal =
                viewData.brownQtyPeewee +
                viewData.brownQtyXs +
                viewData.brownQtySmall +
                viewData.brownQtyMedium +
                viewData.brownQtyLarge +
                viewData.brownQtyXl +
                viewData.brownQtyXxl +
                viewData.brownQtyAssorted;
              const brownSpoilageTotal =
                viewData.brownQtyCracked +
                viewData.brownQtyBroken +
                viewData.brownQtyDirty;
              const brownTotal = brownGoodTotal + brownSpoilageTotal;

              return (
                <div className="p-4 sm:p-5 space-y-3 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  {/* Info Bar */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex flex-col gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-28 shrink-0">
                          BATCH ID:
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {viewData.batchId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-28 shrink-0">
                          ARRIVAL DATE:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {viewData.arrivalDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-28 shrink-0">
                          FARM ORIGIN:
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase truncate">
                          {viewData.farmName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px] w-28 shrink-0">
                          RECORDED BY:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                          {viewData.receivedBy || "System"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manifest Summary Banner */}
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                      <div className="text-xs font-bold text-indigo-800/60 dark:text-indigo-400/60 uppercase tracking-wider mb-2">
                        EGG DELIVERY DETAILS
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                          {viewData.totalTraysPickedUp}
                        </span>{" "}
                        <span className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mr-2">
                          trays
                        </span>
                        {viewData.extraType === "HALF_TRAY" ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            + Half Tray (15 Pcs)
                          </span>
                        ) : viewData.extraType === "PIECES" && extraPcs > 0 ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            + {extraPcs} Pcs
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-indigo-200/60 dark:bg-indigo-800/60"></div>
                    <div className="border-t border-indigo-200/60 dark:border-indigo-800/60 sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto text-center sm:text-right">
                      <div className="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-400 leading-none">
                        {formatTrayCount(expectedTotalTrays)}{" "}
                        <span className="text-sm font-sans font-medium opacity-70">
                          trays
                        </span>
                      </div>
                      <div className="text-[15px] font-bold text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                        {expectedTotalEggs.toLocaleString()} total eggs
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    {/* White Eggs */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 h-11 border-b border-slate-200 dark:border-slate-800 flex items-center">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          White Eggs Breakdown
                        </span>
                      </div>
                      <div className="p-3 space-y-1 flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1.5">
                          Good Eggs
                        </div>
                        {[
                          { label: "Jumbo (XXL)", value: viewData.qtyXxl },
                          { label: "Extra Large", value: viewData.qtyXl },
                          { label: "Large", value: viewData.qtyLarge },
                          { label: "Medium", value: viewData.qtyMedium },
                          { label: "Small", value: viewData.qtySmall },
                          { label: "XS", value: viewData.qtyXs },
                          { label: "Peewee", value: viewData.qtyPeewee },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-[13px] p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                          >
                            <span className="text-slate-600 dark:text-slate-400">
                              {item.label}
                            </span>
                            <span className="font-medium font-mono text-slate-700 dark:text-slate-200">
                              {item.value}
                            </span>
                          </div>
                        ))}

                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-4 mb-2 pl-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                          Spoiled Eggs
                        </div>
                        {[
                          { label: "Cracked", value: viewData.qtyCracked },
                          { label: "Broken", value: viewData.qtyBroken },
                          { label: "Dirty", value: viewData.qtyDirty },
                        ].map((item, idx) => (
                          <div
                            key={`spoil-white-${idx}`}
                            className="flex justify-between items-center text-[13px] p-1.5 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                          >
                            <span className="text-slate-600 dark:text-slate-400">
                              {item.label}
                            </span>
                            <span className="font-medium font-mono text-rose-600 dark:text-rose-400">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center mt-auto">
                        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-400">
                          Total White
                        </span>
                        <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          {whiteTotal}
                        </span>
                      </div>
                    </div>

                    {/* Brown Eggs */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-amber-200/50 dark:border-amber-900/30 overflow-hidden flex flex-col">
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 px-4 h-11 border-b border-amber-100 dark:border-amber-900/30 flex items-center">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">
                          Brown Eggs Breakdown
                        </span>
                      </div>
                      <div className="p-3 space-y-1 flex-1">
                        <div className="text-[10px] font-bold text-amber-700/60 dark:text-amber-500/60 uppercase tracking-widest mb-2 pl-1.5">
                          Good Eggs
                        </div>
                        {[
                          { label: "Jumbo (XXL)", value: viewData.brownQtyXxl },
                          { label: "Extra Large", value: viewData.brownQtyXl },
                          { label: "Large", value: viewData.brownQtyLarge },
                          { label: "Medium", value: viewData.brownQtyMedium },
                          { label: "Small", value: viewData.brownQtySmall },
                          { label: "XS", value: viewData.brownQtyXs },
                          { label: "Peewee", value: viewData.brownQtyPeewee },
                          {
                            label: "Assorted",
                            value: viewData.brownQtyAssorted,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-[13px] p-1.5 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                          >
                            <span className="text-amber-700/80 dark:text-amber-500/80">
                              {item.label}
                            </span>
                            <span className="font-medium font-mono text-amber-600 dark:text-amber-500">
                              {item.value}
                            </span>
                          </div>
                        ))}

                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-4 mb-2 pl-1.5 border-t border-amber-100 dark:border-amber-900/30 pt-3">
                          Spoiled Eggs
                        </div>
                        {[
                          { label: "Cracked", value: viewData.brownQtyCracked },
                          { label: "Broken", value: viewData.brownQtyBroken },
                          { label: "Dirty", value: viewData.brownQtyDirty },
                        ].map((item, idx) => (
                          <div
                            key={`spoil-brown-${idx}`}
                            className="flex justify-between items-center text-[13px] p-1.5 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                          >
                            <span className="text-amber-700/80 dark:text-amber-500/80">
                              {item.label}
                            </span>
                            <span className="font-medium font-mono text-rose-600 dark:text-rose-400">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 px-4 py-2.5 border-t border-amber-100 dark:border-amber-900/30 flex justify-between items-center mt-auto">
                        <span className="text-[13px] font-bold text-amber-700 dark:text-amber-500">
                          Total Brown
                        </span>
                        <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                          {brownTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800 flex justify-end gap-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="h-9 rounded-xl font-medium shadow-xs print:hidden"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewData(null)}
              className="h-9 rounded-xl font-medium shadow-xs print:hidden"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {viewData && (
        <div
          className="hidden print:block fixed inset-0 bg-white z-99999 p-8 text-black w-full h-full text-sm font-sans"
          style={{ background: "white", color: "black" }}
        >
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-black uppercase tracking-wider">
              Otso Dragon Corp
            </h1>
            <p className="text-lg font-semibold text-gray-700">
              Batch Receiving Report
            </p>
          </div>

          <div className="flex justify-between mb-8">
            <div className="space-y-1">
              <div>
                <strong>Batch ID:</strong> {viewData.batchId}
              </div>
              <div>
                <strong>Arrival Date:</strong> {viewData.arrivalDate}
              </div>
              <div>
                <strong>Farm Origin:</strong> {viewData.farmName}
              </div>
              <div>
                <strong>Recorded By:</strong> {viewData.receivedBy || "System"}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-xl font-bold">
                {formatTrayCount(
                  viewData.totalTraysPickedUp +
                    (viewData.extraType === "HALF_TRAY"
                      ? 0.5
                      : (viewData.extraPiecesPickedUp || 0) / 30),
                )}{" "}
                trays
              </div>
              <div className="text-gray-500">
                {viewData.totalTraysPickedUp * 30 +
                  (viewData.extraType === "HALF_TRAY"
                    ? 15
                    : viewData.extraPiecesPickedUp || 0)}{" "}
                total eggs
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* White Eggs */}
            <div>
              <h3 className="font-bold border-b border-black mb-2 pb-1 text-lg">
                White Eggs Breakdown
              </h3>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Jumbo (XXL)</span>
                <span>{viewData.qtyXxl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Extra Large</span>
                <span>{viewData.qtyXl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Large</span>
                <span>{viewData.qtyLarge}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Medium</span>
                <span>{viewData.qtyMedium}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Small</span>
                <span>{viewData.qtySmall}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>XS</span>
                <span>{viewData.qtyXs}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-300">
                <span>Peewee</span>
                <span>{viewData.qtyPeewee}</span>
              </div>

              <h4 className="font-semibold text-xs text-gray-500 mt-3 mb-1 uppercase">
                Spoiled
              </h4>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Cracked</span>
                <span>{viewData.qtyCracked}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Broken</span>
                <span>{viewData.qtyBroken}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Dirty</span>
                <span>{viewData.qtyDirty}</span>
              </div>

              <div className="flex justify-between font-bold mt-2 pt-2 border-t-2 border-black text-base">
                <span>Total White</span>
                <span>
                  {viewData.qtyXxl +
                    viewData.qtyXl +
                    viewData.qtyLarge +
                    viewData.qtyMedium +
                    viewData.qtySmall +
                    viewData.qtyXs +
                    viewData.qtyPeewee +
                    viewData.qtyCracked +
                    viewData.qtyBroken +
                    viewData.qtyDirty}
                </span>
              </div>
            </div>
            {/* Brown Eggs */}
            <div>
              <h3 className="font-bold border-b border-black mb-2 pb-1 text-lg">
                Brown Eggs Breakdown
              </h3>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Jumbo (XXL)</span>
                <span>{viewData.brownQtyXxl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Extra Large</span>
                <span>{viewData.brownQtyXl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Large</span>
                <span>{viewData.brownQtyLarge}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Medium</span>
                <span>{viewData.brownQtyMedium}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Small</span>
                <span>{viewData.brownQtySmall}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>XS</span>
                <span>{viewData.brownQtyXs}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Peewee</span>
                <span>{viewData.brownQtyPeewee}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-300">
                <span>Assorted</span>
                <span>{viewData.brownQtyAssorted}</span>
              </div>

              <h4 className="font-semibold text-xs text-gray-500 mt-3 mb-1 uppercase">
                Spoiled
              </h4>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Cracked</span>
                <span>{viewData.brownQtyCracked}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Broken</span>
                <span>{viewData.brownQtyBroken}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Dirty</span>
                <span>{viewData.brownQtyDirty}</span>
              </div>

              <div className="flex justify-between font-bold mt-2 pt-2 border-t-2 border-black text-base">
                <span>Total Brown</span>
                <span>
                  {viewData.brownQtyXxl +
                    viewData.brownQtyXl +
                    viewData.brownQtyLarge +
                    viewData.brownQtyMedium +
                    viewData.brownQtySmall +
                    viewData.brownQtyXs +
                    viewData.brownQtyPeewee +
                    viewData.brownQtyAssorted +
                    viewData.brownQtyCracked +
                    viewData.brownQtyBroken +
                    viewData.brownQtyDirty}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-gray-500 flex justify-between">
            <span>
              Generated on{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>Otso Dragon Corp - Receiving Department</span>
          </div>
        </div>
      )}
    </>
  );
}
