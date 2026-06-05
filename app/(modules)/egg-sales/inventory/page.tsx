"use client";

import { useEffect, useState, useCallback } from "react";
import { getLiveEggInventory } from "@/app/actions/egg-actions";
import {
  RefreshCw,
  TrendingDown,
  Layers,
  TriangleAlert,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";

// ─── Constants ─────────────────────────────────────────────────────────────
const PIECES_PER_TRAY = 30;
const LOW_STOCK_TRAYS = 20; // warn if < 20 trays

// ─── Types ──────────────────────────────────────────────────────────────────
type InventoryItem = {
  id: number;
  classification: string;
  currentStockTrays: number; // actually stores pieces
  pricePerTray: number;
  lastUpdated: Date | string;
};

// ─── Classification Config ──────────────────────────────────────────────────
const CLASS_ORDER = [
  "PEEWEE",
  "XS",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "XL",
  "XXL",
  "CRACKED",
  "BROKEN",
  "DIRTY",
] as const;

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
      <div className="h-14 bg-slate-50 dark:bg-slate-800/80" />
      <div className="p-5 space-y-4">
        <div className="flex gap-3">
          <div className="h-20 flex-1 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-20 w-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 rounded-md bg-slate-100 dark:bg-slate-800 w-2/5 ml-auto" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function InventoryDashboardPageV2() {
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

  // ── Derived ──
  const grandTotalPieces = inventory.reduce(
    (sum, i) => sum + (i.currentStockTrays || 0),
    0,
  );
  const globalTrays = Math.floor(grandTotalPieces / PIECES_PER_TRAY);
  const globalLoose = grandTotalPieces % PIECES_PER_TRAY;

  const getStock = (cls: string) =>
    inventory.find((i) => i.classification === cls)?.currentStockTrays || 0;

  const lowCount = CLASS_ORDER.filter((s) => {
    const p = getStock(s);
    return p > 0 && Math.floor(p / PIECES_PER_TRAY) < LOW_STOCK_TRAYS;
  }).length;

  const activeCount = inventory.filter(
    (i) => (i.currentStockTrays || 0) > 0,
  ).length;

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Loading ──
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-44 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-60 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CLASS_ORDER.map((s) => (
            <SkeletonCard key={s} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="m:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-600 to-orange-500">
              Live Bodega Inventory
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Real-time physical stock distribution
            {lastSynced && (
              <span className="ml-2 text-slate-400 dark:text-slate-500">
                · Synced {fmtTime(lastSynced)}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {lowCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" aria-hidden />
              {lowCount} Low{lowCount === 1 ? " Stock" : " Stocks"}
            </span>
          )}
          <button
            onClick={() => fetchInventory()}
            disabled={refreshing}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold shadow-sm",
              "text-slate-700 dark:text-slate-300",
              "transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 text-blue-500",
                refreshing && "animate-spin",
              )}
              aria-hidden
            />
            Sync Data
          </button>
        </div>
      </div>

      {/* ── HERO CARD ── */}
      <div className="relative rounded-lg overflow-hidden bg-slate-900 dark:bg-[#080808] border border-slate-800 dark:border-slate-700/40">
        {/* Glow bg */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 65% 120% at 0% 50%, #3b82f6, transparent 65%), radial-gradient(ellipse 45% 80% at 100% 10%, #6366f1, transparent 55%)",
          }}
        />
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
          {/* Trays + Loose */}
          <div className="flex-1 px-6 sm:px-8 py-6 sm:py-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-4 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" aria-hidden />
              Total Global Volume
            </p>
            <div className="flex flex-wrap items-end gap-4 sm:gap-6">
              {/* Trays */}
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white tabular-nums leading-none">
                  <NumberTicker value={globalTrays} />
                </p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Full Trays
                </p>
              </div>
              {globalLoose > 0 && (
                <>
                  <span className="text-3xl text-slate-700 font-extralight pb-6 hidden sm:block select-none">
                    +
                  </span>
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-amber-400 tabular-nums leading-none">
                      <NumberTicker value={globalLoose} />
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Extra Eggs
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right stats */}
          <div className="flex sm:flex-col justify-around sm:justify-center gap-4 sm:w-48 xl:w-56 px-6 py-5 sm:p-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                Total Pieces
              </p>
              <p className="text-3xl sm:text-4xl font-black font-mono text-white tabular-nums">
                <NumberTicker value={grandTotalPieces} />
                <span className="ml-1 text-sm font-sans text-slate-500 font-normal">
                  eggs
                </span>
              </p>
            </div>
            <div className="hidden sm:block h-px bg-white/10 my-2" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                Active Sizes
              </p>
              <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                <NumberTicker value={activeCount} />
                <span className="ml-1 text-sm font-sans text-slate-500 font-normal">
                  / {CLASS_ORDER.length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CLASSIFICATION GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CLASS_ORDER.map((size) => {
          const totalPieces = getStock(size);
          const trays = Math.floor(totalPieces / PIECES_PER_TRAY);
          const loose = totalPieces % PIECES_PER_TRAY;
          const isEmpty = totalPieces === 0;
          const isLow = !isEmpty && trays < LOW_STOCK_TRAYS;

          return (
            <div
              key={size}
              className={cn(
                "group relative flex flex-col rounded-lg border p-5",
                "transition-all duration-200",
                "bg-white dark:bg-slate-900",
                isEmpty
                  ? "border-slate-100 dark:border-slate-800 opacity-60 grayscale-[0.5]"
                  : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                  {size}
                </span>
                {isLow && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fef3c7] dark:bg-amber-900/30 text-[#d97706] dark:text-amber-500 text-xs font-bold">
                    <TriangleAlert className="w-3.5 h-3.5" />
                    Low
                  </span>
                )}
                {isEmpty && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Middle section: Total Pieces */}
              <div className="flex flex-col mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Total Egg Pieces
                </span>
                <span className="text-3xl font-bold text-[#0f172a] dark:text-slate-50 tracking-tight mt-1">
                  <NumberTicker value={totalPieces} />
                </span>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4" />

              {/* Footer section: Trays & Extras */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    Full Trays
                  </span>
                  <span className="font-bold text-[#0f172a] dark:text-slate-50">
                    <NumberTicker value={trays} />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    Extra Eggs
                  </span>
                  <span className="font-bold text-[#0f172a] dark:text-slate-50">
                    <NumberTicker value={loose} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── LEGEND ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Legend
        </span>
        {[
          { Icon: Layers, text: `1 Tray = ${PIECES_PER_TRAY} eggs` },
          { Icon: Package, text: `Low stock = < ${LOW_STOCK_TRAYS} trays` },
        ].map(({ Icon, text }) => (
          <span
            key={text}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"
          >
            <Icon
              className="w-3 h-3 text-slate-400 dark:text-slate-500"
              aria-hidden
            />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
