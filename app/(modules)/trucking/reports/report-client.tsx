"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  PieChart,
  Truck,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  FileText,
  FileSpreadsheet,
  X,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Trip = {
  id: number;
  truckId: number;
  date: string;
  qtyHeads: number;
  rate: number;
  tollFees: number;
  dieselCash: number;
  dieselPo: number;
  meals: number;
  roroShip: number;
  salary: number;
  others: number;
};

type TruckData = {
  id: number;
  fleetCode: string;
  plateNumber: string;
};

interface ReportClientProps {
  trips: Trip[];
  trucks: TruckData[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

// ─── Animated Number ───────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [current, setCurrent] = useState(value);
  const ref = useRef(current);

  useEffect(() => {
    const start = ref.current;
    const dist = value - start;
    if (dist === 0) return;
    let startTime: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const pct = Math.min((ts - startTime) / 900, 1);
      const eased = 1 - Math.pow(1 - pct, 4);
      const next = start + dist * eased;
      setCurrent(next);
      ref.current = next;
      if (pct < 1) requestAnimationFrame(animate);
      else {
        setCurrent(value);
        ref.current = value;
      }
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [value]);

  return <>{fmt(current)}</>;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  variant = "default",
  note,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "rose" | "emerald" | "blue";
  note?: string;
}) {
  const colors = {
    default: {
      card: "bg-card border-border/50",
      icon: "bg-muted text-muted-foreground",
      value: "text-foreground",
      label: "text-muted-foreground",
    },
    rose: {
      card: "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30",
      icon: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
      value: "text-rose-700 dark:text-rose-400",
      label: "text-rose-600/80 dark:text-rose-400/70",
    },
    emerald: {
      card: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30",
      icon: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-400",
      label: "text-emerald-600/80 dark:text-emerald-400/70",
    },
    blue: {
      card: "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30",
      icon: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
      value: "text-blue-700 dark:text-blue-400",
      label: "text-blue-600/80 dark:text-blue-400/70",
    },
  };

  const c = colors[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-all duration-200 hover:shadow-sm",
        c.card,
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            c.label,
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            c.icon,
          )}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className={cn(
            "text-xl sm:text-2xl font-bold font-mono leading-tight tabular-nums",
            c.value,
          )}
        >
          <AnimatedNumber value={value} />
        </p>
        {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ReportClient({ trips, trucks }: ReportClientProps) {
  const [selectedTruckId, setSelectedTruckId] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const { tableData, totals, availableYears } = useMemo(() => {
    const byTruck =
      selectedTruckId === "all"
        ? trips
        : trips.filter((t) => t.truckId.toString() === selectedTruckId);

    const yearsSet = new Set(
      byTruck.map((t) => new Date(t.date).getFullYear().toString()),
    );
    const availableYears = Array.from(yearsSet).sort((a, b) =>
      b.localeCompare(a),
    );

    const isYearly = selectedYear === "all";
    const byYear = isYearly
      ? byTruck
      : byTruck.filter(
          (t) => new Date(t.date).getFullYear().toString() === selectedYear,
        );

    const grouped = byYear.reduce(
      (acc, trip) => {
        const d = new Date(trip.date);
        const key = isYearly
          ? d.getFullYear().toString()
          : d.getMonth().toString();
        const label = isYearly ? key : MONTH_NAMES[d.getMonth()];
        const sort = isYearly ? d.getFullYear() : d.getMonth();
        const collectible = trip.qtyHeads * trip.rate;
        const expenses =
          trip.tollFees +
          trip.dieselCash +
          trip.dieselPo +
          trip.meals +
          trip.roroShip +
          trip.salary +
          trip.others;
        const net = collectible - expenses;

        if (!acc[key])
          acc[key] = {
            periodLabel: label,
            sortValue: sort,
            collectible: 0,
            expenses: 0,
            netIncome: 0,
          };
        acc[key].collectible += collectible;
        acc[key].expenses += expenses;
        acc[key].netIncome += net;
        return acc;
      },
      {} as Record<
        string,
        {
          periodLabel: string;
          sortValue: number;
          collectible: number;
          expenses: number;
          netIncome: number;
        }
      >,
    );

    const sorted = Object.values(grouped).sort(
      (a, b) => a.sortValue - b.sortValue,
    );
    const totals = sorted.reduce(
      (s, d) => ({
        collectible: s.collectible + d.collectible,
        expenses: s.expenses + d.expenses,
        netIncome: s.netIncome + d.netIncome,
      }),
      { collectible: 0, expenses: 0, netIncome: 0 },
    );

    return { tableData: sorted, totals, availableYears };
  }, [trips, selectedTruckId, selectedYear]);

  const [prevYears, setPrevYears] = useState(availableYears);
  if (availableYears !== prevYears) {
    setPrevYears(availableYears);
    if (selectedYear !== "all" && !availableYears.includes(selectedYear)) {
      setSelectedYear("all");
    }
  }

  const selectedTruck = trucks.find((t) => t.id.toString() === selectedTruckId);
  const selectedTruckName =
    selectedTruckId === "all"
      ? "Entire Fleet"
      : `${selectedTruck?.fleetCode} (${selectedTruck?.plateNumber})`;

  // Margin ratio for the summary note
  const marginPct =
    totals.collectible > 0
      ? ((totals.netIncome / totals.collectible) * 100).toFixed(1)
      : "0.0";

  const isYearly = selectedYear === "all";

  const exportSummaryToPDF = () => {
    try {
      const doc = new jsPDF("p", "pt", "letter");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`SUMMARY SALES — ${selectedTruckName.toUpperCase()}`, 40, 50);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        isYearly
          ? "Yearly Aggregated Summary"
          : `Monthly Breakdown for ${selectedYear}`,
        40,
        70,
      );
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, 40, 85);

      const rows = [
        ...tableData.map((r) => [
          r.periodLabel,
          fmt(r.collectible),
          fmt(r.expenses),
          fmt(r.netIncome),
        ]),
        [
          "TOTAL",
          fmt(totals.collectible),
          fmt(totals.expenses),
          fmt(totals.netIncome),
        ],
      ];

      autoTable(doc, {
        head: [
          [
            isYearly ? "Year" : "Month",
            "Collectible",
            "Expenses",
            "Net Income",
          ],
        ],
        body: rows,
        startY: 105,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], halign: "center" },
        columnStyles: {
          0: { halign: "center", fontStyle: "bold" },
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
        },
        willDrawCell: (data) => {
          if (data.row.index === rows.length - 1) {
            doc.setTextColor(220, 38, 38);
            doc.setFont("helvetica", "bold");
          }
        },
      });

      doc.save(
        `Summary_${selectedTruckName.replace(/ /g, "_")}_${selectedYear}.pdf`,
      );
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("Failed to generate PDF.");
    }
  };

  const exportSummaryToCSV = () => {
    try {
      const headers = [
        isYearly ? "Year" : "Month",
        "Collectible",
        "Expenses",
        "Net Income",
      ];
      const rows = tableData.map((r) => [
        `"${r.periodLabel}"`,
        `"${fmt(r.collectible).replace(/,/g, "")}"`,
        `"${fmt(r.expenses).replace(/,/g, "")}"`,
        `"${fmt(r.netIncome).replace(/,/g, "")}"`,
      ]);
      rows.push([
        `"TOTAL"`,
        `"${fmt(totals.collectible).replace(/,/g, "")}"`,
        `"${fmt(totals.expenses).replace(/,/g, "")}"`,
        `"${fmt(totals.netIncome).replace(/,/g, "")}"`,
      ]);

      const csvContent =
        headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Summary_${selectedTruckName.replace(/ /g, "_")}_${selectedYear}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to generate CSV.");
    }
  };

  const bestPeriod = tableData.length
    ? tableData.reduce(
        (best, row) => (row.netIncome > best.netIncome ? row : best),
        tableData[0],
      )
    : null;

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* ── Filter + Export bar ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-3 rounded-xl shadow-sm relative z-20">
        <div className="flex flex-col lg:flex-row gap-3 w-full">
          {/* Left side: Grid of filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-3 w-full flex-1">
            {[
              {
                label: "Fleet Asset",
                value: selectedTruckId,
                setter: setSelectedTruckId,
                options: [...trucks]
                  .sort((a, b) =>
                    a.fleetCode.localeCompare(b.fleetCode, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    }),
                  )
                  .map((t) => ({
                    value: t.id.toString(),
                    label: (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{t.fleetCode}</span>
                        <span className="text-slate-400 font-normal ml-1 shrink-0">
                          ({t.plateNumber})
                        </span>
                      </div>
                    ),
                  })),
                placeholder: "Combine Entire Fleet",
                placeholderNode: (
                  <div className="flex items-center gap-2 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                    <PieChart className="w-3.5 h-3.5 shrink-0" />
                    Combine Entire Fleet
                  </div>
                ),
              },
              {
                label: "Period / Year",
                value: selectedYear,
                setter: setSelectedYear,
                options: availableYears.map((y) => ({
                  value: y,
                  label: (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {y}{" "}
                      <span className="text-[10px] font-normal text-slate-400 ml-1 shrink-0">
                        (Monthly View)
                      </span>
                    </div>
                  ),
                })),
                placeholder: "All Years",
                placeholderNode: (
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    All Years{" "}
                    <span className="text-[10px] font-normal text-blue-500/60 ml-1 shrink-0">
                      (Yearly View)
                    </span>
                  </div>
                ),
              },
            ].map(
              ({
                label,
                value,
                setter,
                options,
                placeholder,
                placeholderNode,
              }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 ml-1">
                      {label}
                    </p>
                    {label === "Fleet Asset" &&
                      (selectedTruckId !== "all" || selectedYear !== "all") && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedTruckId("all");
                            setSelectedYear("all");
                          }}
                          className="h-5 px-2 text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors sm:hidden"
                        >
                          Clear Filter
                        </Button>
                      )}
                  </div>
                  <Select value={value} onValueChange={setter}>
                    <SelectTrigger className="h-11! w-full text-sm rounded-xl bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 focus:ring-1 focus:ring-blue-500/40 shadow-sm transition-colors [&>span]:flex-1 [&>span]:text-left">
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent className="z-110 rounded-xl border-slate-200/60 dark:border-slate-800/60 shadow-md p-1">
                      <SelectItem
                        value="all"
                        className="rounded-xl h-11! mb-1 cursor-pointer"
                      >
                        {placeholderNode}
                      </SelectItem>
                      {options.map((o) => (
                        <SelectItem
                          key={o.value}
                          value={o.value}
                          className="rounded-xl cursor-pointer"
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}

            {/* Clear Filter Button - Tablet & Desktop */}
            {(selectedTruckId !== "all" || selectedYear !== "all") && (
              <div className="hidden sm:flex w-full items-end sm:col-start-2 lg:col-start-auto justify-end pb-0.5">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedTruckId("all");
                    setSelectedYear("all");
                  }}
                  className="h-10 px-3 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0 font-semibold"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary KPI cards ── */}
      {tableData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total collectible"
            value={totals.collectible}
            variant="blue"
            icon={<ArrowUpRight className="w-4 h-4" />}
            note={`${tableData.length} ${isYearly ? "year" : "month"}${tableData.length !== 1 ? "s" : ""} recorded`}
          />
          <StatCard
            label="Total expenses"
            value={totals.expenses}
            variant="rose"
            icon={<TrendingDown className="w-4 h-4" />}
            note={`${(totals.collectible > 0 ? (totals.expenses / totals.collectible) * 100 : 0).toFixed(1)}% of collectible`}
          />
          <StatCard
            label="Net income"
            value={totals.netIncome}
            variant={totals.netIncome >= 0 ? "emerald" : "rose"}
            icon={
              totals.netIncome >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )
            }
            note={`${marginPct}% margin${bestPeriod ? ` · Best: ${bestPeriod.periodLabel}` : ""}`}
          />
        </div>
      )}

      {/* ── Results table card ── */}
      <Card className="border border-border/50 shadow-sm rounded-lg overflow-hidden bg-card">
        {/* Card header */}
        <CardHeader className="px-5 py-4 border-b border-border/40 bg-muted/20 space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground leading-tight">
                  {selectedTruckName}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isYearly
                    ? "Aggregated yearly performance"
                    : `Monthly breakdown — ${selectedYear}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {tableData.length > 0 && (
                <div
                  className={cn(
                    "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                    totals.netIncome >= 0
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40",
                  )}
                >
                  {totals.netIncome >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {marginPct}% margin
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={tableData.length === 0}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MoreVertical className="w-5 h-5" />
                    <span className="sr-only">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl z-50"
                >
                  <DropdownMenuItem
                    onClick={exportSummaryToPDF}
                    className="p-3 rounded-lg cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-950/30 transition-colors"
                  >
                    <div className="p-2 rounded-md bg-rose-100 dark:bg-rose-900/30 mr-3 shrink-0">
                      <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Export PDF
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Presentation format
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={exportSummaryToCSV}
                    className="p-3 rounded-lg cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/30 transition-colors mt-1"
                  >
                    <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/30 mr-3 shrink-0">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Export CSV
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Spreadsheet format
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent bg-muted/30">
                <TableHead className="w-[160px] py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {isYearly ? "Year" : "Month"}
                </TableHead>
                <TableHead className="py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Collectible
                </TableHead>
                <TableHead className="py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Expenses
                </TableHead>
                <TableHead className="py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Net income
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No data for this selection</p>
                      <p className="text-xs opacity-60">
                        Try changing the fleet asset or period filter
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row, i) => {
                  const isBest =
                    bestPeriod?.periodLabel === row.periodLabel &&
                    tableData.length > 1;
                  return (
                    <TableRow
                      key={row.periodLabel}
                      className={cn(
                        "border-border/30 transition-colors duration-100",
                        "hover:bg-muted/40",
                        i % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                      )}
                    >
                      <TableCell className="py-3.5 px-5 font-semibold text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          {row.periodLabel}
                          {isBest && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 uppercase tracking-wide leading-none">
                              Best
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-right font-mono text-sm text-foreground/80 tabular-nums">
                        <AnimatedNumber value={row.collectible} />
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-right font-mono text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                        <AnimatedNumber value={row.expenses} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-3.5 px-5 text-right font-mono text-sm font-semibold tabular-nums",
                          row.netIncome >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {row.netIncome < 0 && (
                          <span className="mr-0.5 opacity-70">−</span>
                        )}
                        <AnimatedNumber value={Math.abs(row.netIncome)} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>

            {/* Footer totals aligned with columns */}
            {tableData.length > 0 && (
              <TableFooter className="bg-transparent border-t-0">
                <TableRow className="border-t border-slate-200 dark:border-slate-800 relative hover:bg-transparent overflow-hidden shadow-sm">
                  {/* Label */}
                  <TableCell className="px-5 py-4 font-black text-sm uppercase tracking-widest relative z-10 bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-900/90 border-r border-slate-200/50 dark:border-slate-800/50">
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-slate-600 to-slate-900 dark:from-slate-300 dark:to-white">
                      Total
                    </span>
                  </TableCell>

                  {/* Collectible total */}
                  <TableCell className="px-5 py-4 text-right relative z-10 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Collectible
                    </p>
                    <p className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tabular-nums">
                      <AnimatedNumber value={totals.collectible} />
                    </p>
                  </TableCell>

                  {/* Expenses total */}
                  <TableCell className="px-5 py-4 text-right relative z-10 bg-slate-50/80 dark:bg-slate-900/80 border-r border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Expenses
                    </p>
                    <p className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                      <AnimatedNumber value={totals.expenses} />
                    </p>
                  </TableCell>

                  {/* Net income total */}
                  <TableCell
                    className={cn(
                      "px-5 py-4 text-right relative z-10",
                      totals.netIncome >= 0
                        ? "bg-linear-to-br from-emerald-500/15 via-emerald-500/5 to-teal-500/10 dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-teal-500/20"
                        : "bg-linear-to-br from-rose-500/15 via-rose-500/5 to-red-500/10 dark:from-rose-500/20 dark:via-rose-500/10 dark:to-red-500/20",
                    )}
                  >
                    <div className="relative z-10">
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1",
                          totals.netIncome >= 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400",
                        )}
                      >
                        Net income
                      </p>
                      <p
                        className={cn(
                          "font-mono font-black text-base tabular-nums",
                          totals.netIncome >= 0
                            ? "bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400"
                            : "bg-clip-text text-transparent bg-linear-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400",
                        )}
                      >
                        {totals.netIncome < 0 && (
                          <span className="mr-0.5 opacity-70 text-rose-600 dark:text-rose-400">
                            −
                          </span>
                        )}
                        <AnimatedNumber value={Math.abs(totals.netIncome)} />
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Card>
    </div>
  );
}
