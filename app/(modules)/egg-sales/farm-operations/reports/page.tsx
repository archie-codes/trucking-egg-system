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
  TrendingUp,
  Search,
  Check,
  ChevronsUpDown,
  X,
  Layers,
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
import { cn } from "@/lib/utils";

type Flock = NonNullable<
  Awaited<ReturnType<typeof getFarmFlocks>>["data"]
>[number];
type ReportData = NonNullable<
  Awaited<ReturnType<typeof getFarmFlockReport>>["data"]
>;

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

  // Selected flock object
  const selectedFlockObj = useMemo(() => {
    return flocks.find((f) => f.id === selectedFlockId) || null;
  }, [flocks, selectedFlockId]);

  // Auto-sync selected batch if current selection is not in filtered list
  useEffect(() => {
    if (
      filteredFlocks.length > 0 &&
      !filteredFlocks.some((f) => f.id === selectedFlockId)
    ) {
      setSelectedFlockId(filteredFlocks[0].id);
    }
  }, [filteredFlocks, selectedFlockId]);

  useEffect(() => {
    if (!selectedFlockId) return;

    async function loadReport() {
      setLoadingReport(true);
      const res = await getFarmFlockReport(selectedFlockId);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        toast.error(res.error || "Failed to load report data");
        setReport(null);
      }
      setLoadingReport(false);
    }
    loadReport();
  }, [selectedFlockId]);

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

        {/* Right side: Searchable Batch Selector Combobox */}
        <div className="w-full sm:w-96 shrink-0">
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
                    No matching batches found. Try adjusting filters or search.
                  </div>
                ) : (
                  filteredFlocks.map((flock) => {
                    const isSelected = flock.id === selectedFlockId;
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

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Production Metrics */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Egg className="w-5 h-5 text-amber-500" />
                  Egg Production Summary
                </CardTitle>
                <CardDescription>Total eggs collected to date</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">
                    Trays Collected
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {report.production.totalTrays.toLocaleString()} trays
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">Loose Eggs</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {report.production.totalPieces.toLocaleString()} pcs
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-amber-50 dark:bg-amber-950/40 px-3 rounded-xl border border-amber-200/60 dark:border-amber-900/60">
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                    Grand Total (Pieces)
                  </span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {report.production.totalEggsInPieces.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Financial Metrics */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-500" />
                  Expenses & Financials
                </CardTitle>
                <CardDescription>Cumulative operational costs</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">
                    Total Feed Cost
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₱{" "}
                    {report.expenses.totalFeedCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">
                    Total Operating Expenses
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₱{" "}
                    {report.expenses.totalOpEx.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-red-50 dark:bg-red-950/40 px-3 rounded-xl border border-red-200/60 dark:border-red-900/60">
                  <span className="text-sm font-semibold text-red-900 dark:text-red-300">
                    Grand Total Expenses
                  </span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    ₱{" "}
                    {report.expenses.grandTotalExpenses.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Flock Health & Cost Per Egg */}
            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  Health & Key Performance
                </CardTitle>
                <CardDescription>Flock health and cost per egg</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">Mortality Rate</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {(100 - Number(report.health.survivalRate || 0)).toFixed(2)}
                    % ({report.health.totalMortality.toLocaleString()} birds)
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">Survival Rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {report.health.survivalRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-teal-50 dark:bg-teal-950/40 px-3 rounded-xl border border-teal-200/60 dark:border-teal-900/60">
                  <span className="text-sm font-semibold text-teal-900 dark:text-teal-300">
                    Est. Cost per Egg
                  </span>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    ₱ {report.expenses.costPerEgg}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
