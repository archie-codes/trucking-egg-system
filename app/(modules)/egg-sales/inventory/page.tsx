// //DESIGN 2
"use client";

import { useEffect, useState, useCallback } from "react";
import { getLiveEggInventory } from "@/app/actions/egg-actions";
import {
  RefreshCw,
  Layers,
  Package,
  Egg,
  Sparkles,
  Clock,
  Activity,
  Info,
  ShieldAlert,
  CheckCircle2,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";

// ─── Constants ───────────────────────────────────────────────────────────────
const PIECES_PER_TRAY = 30;
const LOW_STOCK_TRAYS = 5;

const formatTrayCount = (val: number): string => {
  if (isNaN(val) || val === 0) return "0";
  if (Number.isInteger(val)) return val.toString();
  return Number(val.toFixed(2)).toString();
};

// ─── Types ───────────────────────────────────────────────────────────────────
type InventoryItem = {
  id: number;
  classification: string;
  currentStockTrays: number; // stores pieces
  pricePerTray: number;
  lastUpdated: Date | string;
};

// ─── Classification Config ────────────────────────────────────────────────────
const CLASS_METADATA: Record<
  string,
  {
    label: string;
    description: string;
    accent: string;
    type: "standard" | "off-grade";
  }
> = {
  PEEWEE: {
    label: "Peewee",
    description: "40–45g per egg",
    accent: "#7F77DD",
    type: "standard",
  },
  XS: {
    label: "Extra Small",
    description: "45.1–50g per egg",
    accent: "#378ADD",
    type: "standard",
  },
  SMALL: {
    label: "Small",
    description: "50.1–55g per egg",
    accent: "#1D9E75",
    type: "standard",
  },
  MEDIUM: {
    label: "Medium",
    description: "55.1–60g per egg",
    accent: "#BA7517",
    type: "standard",
  },
  LARGE: {
    label: "Large",
    description: "60.1–65g per egg",
    accent: "#D85A30",
    type: "standard",
  },
  XL: {
    label: "Extra Large",
    description: "65.1–70g per egg",
    accent: "#D4537E",
    type: "standard",
  },
  XXL: {
    label: "XXL",
    description: "70.1g+ per egg",
    accent: "#639922",
    type: "standard",
  },
  CRACKED: {
    label: "Cracked",
    description: "Damaged shell, membrane intact",
    accent: "#888780",
    type: "off-grade",
  },
  BROKEN: {
    label: "Broken",
    description: "Leaking contents, handle fast",
    accent: "#E24B4A",
    type: "off-grade",
  },
  DIRTY: {
    label: "Dirty",
    description: "Stained shells, needs cleaning",
    accent: "#854F0B",
    type: "off-grade",
  },
  // --- BROWN EGGS ---
  BROWN_PEEWEE: {
    label: "Brown Peewee",
    description: "40–45g per egg",
    accent: "#7F77DD",
    type: "standard",
  },
  BROWN_XS: {
    label: "Brown Extra Small",
    description: "45.1–50g per egg",
    accent: "#378ADD",
    type: "standard",
  },
  BROWN_SMALL: {
    label: "Brown Small",
    description: "50.1–55g per egg",
    accent: "#1D9E75",
    type: "standard",
  },
  BROWN_MEDIUM: {
    label: "Brown Medium",
    description: "55.1–60g per egg",
    accent: "#BA7517",
    type: "standard",
  },
  BROWN_LARGE: {
    label: "Brown Large",
    description: "60.1–65g per egg",
    accent: "#D85A30",
    type: "standard",
  },
  BROWN_XL: {
    label: "Brown Extra Large",
    description: "65.1–70g per egg",
    accent: "#D4537E",
    type: "standard",
  },
  BROWN_XXL: {
    label: "Brown XXL",
    description: "70.1g+ per egg",
    accent: "#639922",
    type: "standard",
  },
  BROWN_ASSORTED: {
    label: "Brown Assorted",
    description: "Mixed brown eggs",
    accent: "#009688",
    type: "standard",
  },
  BROWN_CRACKED: {
    label: "Brown Cracked",
    description: "Damaged shell, membrane intact",
    accent: "#888780",
    type: "off-grade",
  },
  BROWN_BROKEN: {
    label: "Brown Broken",
    description: "Leaking contents, handle fast",
    accent: "#E24B4A",
    type: "off-grade",
  },
  BROWN_DIRTY: {
    label: "Brown Dirty",
    description: "Stained shells, needs cleaning",
    accent: "#854F0B",
    type: "off-grade",
  },
};

const STANDARD_SIZES = [
  "PEEWEE",
  "XS",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "XL",
  "XXL",
] as const;

const OFF_GRADE_SIZES = ["CRACKED", "BROKEN", "DIRTY"] as const;

const BROWN_STANDARD_SIZES = [
  "BROWN_PEEWEE",
  "BROWN_XS",
  "BROWN_SMALL",
  "BROWN_MEDIUM",
  "BROWN_LARGE",
  "BROWN_XL",
  "BROWN_XXL",
  "BROWN_ASSORTED",
] as const;

const BROWN_OFF_GRADE_SIZES = [
  "BROWN_CRACKED",
  "BROWN_BROKEN",
  "BROWN_DIRTY",
] as const;

const CLASS_ORDER = [
  ...STANDARD_SIZES,
  ...OFF_GRADE_SIZES,
  ...BROWN_STANDARD_SIZES,
  ...BROWN_OFF_GRADE_SIZES,
] as const;

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
      <div className="h-[3px] w-full bg-slate-200 dark:bg-slate-700" />
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-7 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="h-3 w-12 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-10 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Hero ────────────────────────────────────────────────────────────
function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 animate-pulse"
        >
          <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800 mb-4" />
          <div className="h-8 w-20 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
          <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

// ─── Stock Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "good" | "low" | "empty" }) {
  if (status === "good") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 whitespace-nowrap">
        Good stock
      </span>
    );
  }
  if (status === "low") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-700 whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.6)] dark:shadow-[0_0_12px_rgba(251,191,36,0.4)] animate-pulse">
        Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 whitespace-nowrap">
      Empty
    </span>
  );
}

// ─── Egg Inventory Card ───────────────────────────────────────────────────────
function EggCard({ size, pieces }: { size: string; pieces: number }) {
  const meta = CLASS_METADATA[size];
  if (!meta) return null;

  const trayCount = pieces / PIECES_PER_TRAY;
  const isEmpty = pieces === 0;
  const isLow = !isEmpty && trayCount <= LOW_STOCK_TRAYS;
  const status: "good" | "low" | "empty" = isEmpty
    ? "empty"
    : isLow
      ? "low"
      : "good";

  const progressPct = isEmpty
    ? 0
    : Math.min(100, Math.round((trayCount / LOW_STOCK_TRAYS) * 100));
  const progressColor = isLow ? "#E24B4A" : "#1D9E75";

  return (
    <div
      className={cn(
        "group relative rounded-lg border overflow-hidden transition-all duration-200",
        "bg-white dark:bg-slate-900",
        isEmpty
          ? "border-slate-100 dark:border-slate-800/50 opacity-50"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-sm dark:hover:shadow-black/20",
      )}
    >
      {/* Color accent stripe */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: meta.accent }}
      />

      <div className="p-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {meta.label}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {meta.description}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Primary metric: Trays */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
            {formatTrayCount(trayCount)}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            trays
          </span>
        </div>

        {/* Progress bar */}
        {!isEmpty && (
          <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        )}
        {isEmpty && <div className="mb-3" />}

        {/* Breakdown footer: Total Eggs */}
        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Egg className="w-3 h-3" aria-hidden />
            <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              <NumberTicker value={pieces} />
            </span>
            {" total eggs"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Card: Warehouse Volume ─────────────────────────────────────────────────
function HeroVolume({
  totalPieces,
}: {
  totalPieces: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
        <Store className="w-3.5 h-3.5" aria-hidden />
        Warehouse volume
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800/80">
        <div className="pr-4">
          <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Trays
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none">
            {formatTrayCount(totalPieces / PIECES_PER_TRAY)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            trays
          </p>
        </div>
        <div className="pl-4">
          <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Eggs
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none">
            <NumberTicker value={totalPieces} />
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            egg pieces
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Card: Quality Yield ─────────────────────────────────────────────────
function HeroYield({
  premiumPct,
  rejectPct,
  premiumPieces,
  rejectPieces,
}: {
  premiumPct: number;
  rejectPct: number;
  premiumPieces: number;
  rejectPieces: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
        <Sparkles className="w-3.5 h-3.5" aria-hidden />
        Quality yield
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none">
          {premiumPct}%
        </p>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
          Premium
        </span>
      </div>

      {/* Segmented yield bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-3">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${premiumPct}%`, backgroundColor: "#1D9E75" }}
        />
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${rejectPct}%`, backgroundColor: "#E24B4A" }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          {premiumPieces.toLocaleString()} standard
        </span>
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
          {rejectPieces.toLocaleString()} reject
        </span>
      </div>
    </div>
  );
}

// ─── Hero Card: Alert Console ─────────────────────────────────────────────────
function HeroAlerts({
  lowCount,
  lowStockNames,
  activeCount,
  totalCount,
}: {
  lowCount: number;
  lowStockNames: string[];
  activeCount: number;
  totalCount: number;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white dark:bg-slate-900 p-5 flex flex-col justify-between transition-colors",
        lowCount > 0
          ? "border-rose-200 dark:border-rose-900/40"
          : "border-slate-200 dark:border-slate-800",
      )}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
        <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
        Alert console
      </div>

      {lowCount > 0 ? (
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-semibold text-rose-600 dark:text-rose-500 tabular-nums leading-none">
              {lowCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              low stock alert{lowCount > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {lowStockNames.map((name) => (
              <span
                key={name}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 shadow-[0_0_12px_rgba(225,29,72,0.5)] dark:shadow-[0_0_12px_rgba(225,29,72,0.3)] animate-pulse"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
            <span className="text-sm font-medium">All stocks healthy</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            No items require immediate replenishment.
          </p>
        </div>
      )}

      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Activity className="w-3.5 h-3.5" aria-hidden />
          Active types
        </span>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-100 dark:border-slate-700/50 tabular-nums">
          {activeCount}
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            {" "}
            / {totalCount}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  count,
  description,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-4">
      <div className="flex items-center gap-2">
        <Icon
          className="w-4 h-4 text-slate-400 dark:text-slate-500"
          aria-hidden
        />
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {title}
        </h2>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {count} {description}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const fetchInventory = useCallback(async (isInitial = false) => {
    if (!isInitial) setRefreshing(true);
    const res = await getLiveEggInventory();
    if (res.success) {
      setInventory(res.data);
      setLastSynced(new Date());
    }
    if (isInitial) setLoading(false);
    else setTimeout(() => setRefreshing(false), 500);
  }, []);

  useEffect(() => {
    let mounted = true;
    getLiveEggInventory().then((res) => {
      if (!mounted) return;
      if (res.success) {
        setInventory(res.data);
        setLastSynced(new Date());
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // ── Derived values ──
  const getStock = (cls: string) =>
    inventory.find((i) => i.classification === cls)?.currentStockTrays ?? 0;

  const grandTotalPieces = inventory.reduce(
    (sum, i) => sum + (i.currentStockTrays || 0),
    0,
  );
  const globalTrays = inventory.reduce(
    (sum, i) => sum + Math.floor((i.currentStockTrays || 0) / PIECES_PER_TRAY),
    0,
  );
  const globalLoose = inventory.reduce(
    (sum, i) => sum + ((i.currentStockTrays || 0) % PIECES_PER_TRAY),
    0,
  );

  const standardPieces = inventory.reduce((sum, item) => {
    const meta = CLASS_METADATA[item.classification];
    return sum + (meta?.type === "standard" ? item.currentStockTrays || 0 : 0);
  }, 0);
  const offGradePieces = inventory.reduce((sum, item) => {
    const meta = CLASS_METADATA[item.classification];
    return sum + (meta?.type === "off-grade" ? item.currentStockTrays || 0 : 0);
  }, 0);

  const premiumPct =
    grandTotalPieces > 0
      ? Math.round((standardPieces / grandTotalPieces) * 100)
      : 0;
  const rejectPct = 100 - premiumPct;

  const lowStockNames = CLASS_ORDER.filter((s) => {
    const p = getStock(s);
    return p > 0 && Math.floor(p / PIECES_PER_TRAY) <= LOW_STOCK_TRAYS;
  });

  const activeCount = inventory.filter(
    (i) => (i.currentStockTrays || 0) > 0,
  ).length;

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Loading state ──
  if (loading) {
    return (
      <div className="w-full mx-auto space-y-6 pb-12 px-3 sm:px-4 md:px-0">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-52 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-64 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <SkeletonHero />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {CLASS_ORDER.map((s) => (
            <SkeletonCard key={s} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              Live Warehouse Inventory
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Real-time stock distribution
            {lastSynced && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <Clock className="w-3 h-3" aria-hidden />
                  Synced {fmtTime(lastSynced)}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchInventory()}
            disabled={refreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 h-11! rounded-xl text-sm font-medium transition-all",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "text-slate-700 dark:text-slate-300",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-slate-300 dark:hover:border-slate-600",
              "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-sm",
            )}
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5 text-slate-500 dark:text-slate-400",
                refreshing && "animate-spin",
              )}
              aria-hidden
            />
            Sync Warehouse
          </button>
        </div>
      </div>

      {/* ── HERO SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <HeroVolume
          totalPieces={grandTotalPieces}
        />
        <HeroYield
          premiumPct={premiumPct}
          rejectPct={rejectPct}
          premiumPieces={standardPieces}
          rejectPieces={offGradePieces}
        />
        <HeroAlerts
          lowCount={lowStockNames.length}
          lowStockNames={lowStockNames}
          activeCount={activeCount}
          totalCount={CLASS_ORDER.length}
        />
      </div>

      {/* ── WHITE PREMIUM GRADED SIZES ── */}
      <section aria-label="White premium graded egg sizes">
        <SectionHeader
          icon={Sparkles}
          title="White Premium Graded Sizes"
          count={STANDARD_SIZES.length}
          description="standard graded weights"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {STANDARD_SIZES.map((size) => (
            <EggCard key={size} size={size} pieces={getStock(size)} />
          ))}
        </div>
      </section>

      {/* ── WHITE OFF-GRADE & REJECTS ── */}
      <section aria-label="White off-grade and reject egg classifications">
        <SectionHeader
          icon={ShieldAlert}
          title="White Off-grade & Rejects"
          count={OFF_GRADE_SIZES.length}
          description="defective classifications"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {OFF_GRADE_SIZES.map((size) => (
            <EggCard key={size} size={size} pieces={getStock(size)} />
          ))}
        </div>
      </section>

      {/* ── BROWN PREMIUM GRADED SIZES ── */}
      <section aria-label="Brown premium graded egg sizes" className="mt-8">
        <SectionHeader
          icon={Sparkles}
          title="Brown Premium Graded Sizes"
          count={BROWN_STANDARD_SIZES.length}
          description="standard graded weights"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {BROWN_STANDARD_SIZES.map((size) => (
            <EggCard key={size} size={size} pieces={getStock(size)} />
          ))}
        </div>
      </section>

      {/* ── BROWN OFF-GRADE & REJECTS ── */}
      <section
        aria-label="Brown off-grade and reject egg classifications"
        className="mb-8"
      >
        <SectionHeader
          icon={ShieldAlert}
          title="Brown Off-grade & Rejects"
          count={BROWN_OFF_GRADE_SIZES.length}
          description="defective classifications"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {BROWN_OFF_GRADE_SIZES.map((size) => (
            <EggCard key={size} size={size} pieces={getStock(size)} />
          ))}
        </div>
      </section>

      {/* ── LEGEND ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
          Legend
        </span>
        {[
          { Icon: Layers, text: `1 tray = ${PIECES_PER_TRAY} pieces` },
          {
            Icon: Package,
            text: `Low stock = ≤ ${LOW_STOCK_TRAYS} trays`,
          },
          {
            Icon: Info,
            text: "Weights per standard sorting protocols",
          },
        ].map(({ Icon, text }) => (
          <span
            key={text}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
