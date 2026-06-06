// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { getLiveEggInventory } from "@/app/actions/egg-actions";
// import {
//   RefreshCw,
//   TrendingDown,
//   Layers,
//   TriangleAlert,
//   Package,
//   Egg,
//   Sparkles,
//   Clock,
//   Activity,
//   Info,
//   ShieldAlert,
//   CheckCircle2,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { NumberTicker } from "@/components/ui/number-ticker";

// // ─── Constants ─────────────────────────────────────────────────────────────
// const PIECES_PER_TRAY = 30;
// const LOW_STOCK_TRAYS = 5; // warn if <= 5 trays

// // ─── Types ──────────────────────────────────────────────────────────────────
// type InventoryItem = {
//   id: number;
//   classification: string;
//   currentStockTrays: number; // actually stores pieces
//   pricePerTray: number;
//   lastUpdated: Date | string;
// };

// // ─── Classification Config ──────────────────────────────────────────────────
// const CLASS_METADATA: Record<
//   string,
//   {
//     label: string;
//     gradient: string;
//     glow: string;
//     badgeColor: string;
//     iconColor: string;
//     bgGlow: string;
//     description: string;
//     type: "standard" | "off-grade";
//   }
// > = {
//   PEEWEE: {
//     label: "Peewee Size",
//     gradient:
//       "from-violet-500/10 to-indigo-500/5 dark:from-violet-500/15 dark:to-indigo-500/5",
//     glow: "hover:border-violet-500/40 dark:hover:border-violet-500/30",
//     badgeColor:
//       "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50",
//     iconColor: "text-violet-500",
//     bgGlow: "rgba(139, 92, 246, 0.08)",
//     description: "Weight: 40-45g per egg",
//     type: "standard",
//   },
//   XS: {
//     label: "Extra Small",
//     gradient:
//       "from-sky-500/10 to-blue-500/5 dark:from-sky-500/15 dark:to-blue-500/5",
//     glow: "hover:border-sky-500/40 dark:hover:border-sky-500/30",
//     badgeColor:
//       "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50",
//     iconColor: "text-sky-500",
//     bgGlow: "rgba(14, 165, 233, 0.08)",
//     description: "Weight: 45-50g per egg",
//     type: "standard",
//   },
//   SMALL: {
//     label: "Small Size",
//     gradient:
//       "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/5",
//     glow: "hover:border-emerald-500/40 dark:hover:border-emerald-500/30",
//     badgeColor:
//       "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
//     iconColor: "text-emerald-500",
//     bgGlow: "rgba(16, 185, 129, 0.08)",
//     description: "Weight: 50-55g per egg",
//     type: "standard",
//   },
//   MEDIUM: {
//     label: "Medium Size",
//     gradient:
//       "from-yellow-500/10 to-amber-500/5 dark:from-yellow-500/15 dark:to-amber-500/5",
//     glow: "hover:border-yellow-500/40 dark:hover:border-yellow-500/30",
//     badgeColor:
//       "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/50",
//     iconColor: "text-yellow-600 dark:text-yellow-500",
//     bgGlow: "rgba(234, 179, 8, 0.08)",
//     description: "Weight: 55-60g per egg",
//     type: "standard",
//   },
//   LARGE: {
//     label: "Large Size",
//     gradient:
//       "from-orange-500/10 to-amber-500/5 dark:from-orange-500/15 dark:to-amber-500/5",
//     glow: "hover:border-orange-500/40 dark:hover:border-orange-500/30",
//     badgeColor:
//       "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
//     iconColor: "text-orange-500",
//     bgGlow: "rgba(249, 115, 22, 0.08)",
//     description: "Weight: 60-65g per egg",
//     type: "standard",
//   },
//   XL: {
//     label: "Extra Large",
//     gradient:
//       "from-rose-500/10 to-orange-500/5 dark:from-rose-500/15 dark:to-orange-500/5",
//     glow: "hover:border-rose-500/40 dark:hover:border-rose-500/30",
//     badgeColor:
//       "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
//     iconColor: "text-rose-500",
//     bgGlow: "rgba(244, 63, 94, 0.08)",
//     description: "Weight: 65-70g per egg",
//     type: "standard",
//   },
//   XXL: {
//     label: "XXL",
//     gradient:
//       "from-pink-500/10 to-rose-500/5 dark:from-pink-500/15 dark:to-rose-500/5",
//     glow: "hover:border-pink-500/40 dark:hover:border-pink-500/30",
//     badgeColor:
//       "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50",
//     iconColor: "text-pink-500",
//     bgGlow: "rgba(236, 72, 153, 0.08)",
//     description: "Weight: 70g+ per egg",
//     type: "standard",
//   },
//   CRACKED: {
//     label: "Cracked Eggs",
//     gradient:
//       "from-slate-500/10 to-zinc-500/5 dark:from-slate-500/15 dark:to-zinc-500/5",
//     glow: "hover:border-slate-500/40 dark:hover:border-slate-500/30",
//     badgeColor:
//       "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
//     iconColor: "text-slate-500",
//     bgGlow: "rgba(100, 116, 139, 0.08)",
//     description: "Damaged shell, membrane intact",
//     type: "off-grade",
//   },
//   BROKEN: {
//     label: "Broken Eggs",
//     gradient:
//       "from-red-500/10 to-neutral-500/5 dark:from-red-500/15 dark:to-neutral-500/5",
//     glow: "hover:border-red-500/40 dark:hover:border-red-500/30",
//     badgeColor:
//       "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
//     iconColor: "text-red-500",
//     bgGlow: "rgba(239, 68, 68, 0.08)",
//     description: "Leaking contents, handle fast",
//     type: "off-grade",
//   },
//   DIRTY: {
//     label: "Dirty Eggs",
//     gradient:
//       "from-stone-600/10 to-amber-900/5 dark:from-stone-600/15 dark:to-amber-900/5",
//     glow: "hover:border-stone-500/40 dark:hover:border-stone-500/30",
//     badgeColor:
//       "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
//     iconColor: "text-stone-600 dark:text-stone-400",
//     bgGlow: "rgba(120, 113, 108, 0.08)",
//     description: "Stained shells, requires cleaning",
//     type: "off-grade",
//   },
// };

// const STANDARD_SIZES = [
//   "PEEWEE",
//   "XS",
//   "SMALL",
//   "MEDIUM",
//   "LARGE",
//   "XL",
//   "XXL",
// ] as const;

// const OFF_GRADE_SIZES = ["CRACKED", "BROKEN", "DIRTY"] as const;

// const CLASS_ORDER = [...STANDARD_SIZES, ...OFF_GRADE_SIZES] as const;

// // ─── Skeleton Card ───────────────────────────────────────────────────────────
// function SkeletonCard() {
//   return (
//     <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
//       <div className="h-16 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 p-4 flex justify-between items-center">
//         <div className="h-5 bg-slate-200 dark:bg-slate-700 w-1/3 rounded" />
//         <div className="h-5 bg-slate-200 dark:bg-slate-700 w-1/4 rounded-full" />
//       </div>
//       <div className="p-5 space-y-4">
//         <div className="space-y-1">
//           <div className="h-4 bg-slate-100 dark:bg-slate-800 w-1/4 rounded" />
//           <div className="h-9 bg-slate-200 dark:bg-slate-700 w-1/2 rounded" />
//         </div>
//         <div className="space-y-1.5">
//           <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
//           <div className="h-3 bg-slate-100 dark:bg-slate-800 w-1/3 rounded" />
//         </div>
//         <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
//           <div className="flex justify-between">
//             <div className="h-4 bg-slate-100 dark:bg-slate-800 w-1/3 rounded" />
//             <div className="h-4 bg-slate-200 dark:bg-slate-700 w-1/4 rounded" />
//           </div>
//           <div className="flex justify-between">
//             <div className="h-4 bg-slate-100 dark:bg-slate-800 w-1/3 rounded" />
//             <div className="h-4 bg-slate-200 dark:bg-slate-700 w-1/4 rounded" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ──────────────────────────────────────────────────────────
// export default function InventoryDashboardPageV2() {
//   const [inventory, setInventory] = useState<InventoryItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [lastSynced, setLastSynced] = useState<Date | null>(null);

//   const fetchInventory = useCallback(async (isInitial = false) => {
//     if (!isInitial) setRefreshing(true);
//     const res = await getLiveEggInventory();
//     if (res.success) {
//       setInventory(res.data);
//       setLastSynced(new Date());
//     }
//     if (isInitial) setLoading(false);
//     else setTimeout(() => setRefreshing(false), 500);
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     getLiveEggInventory().then((res) => {
//       if (!mounted) return;
//       if (res.success) {
//         setInventory(res.data);
//         setLastSynced(new Date());
//       }
//       setLoading(false);
//     });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ── Derived ──
//   const grandTotalPieces = inventory.reduce(
//     (sum, i) => sum + (i.currentStockTrays || 0),
//     0,
//   );

//   // Calculate total trays and loose eggs by summing the breakdown of each classification
//   // because different egg sizes cannot be mixed in the same tray.
//   const globalTrays = inventory.reduce(
//     (sum, i) => sum + Math.floor((i.currentStockTrays || 0) / PIECES_PER_TRAY),
//     0,
//   );

//   const globalLoose = inventory.reduce(
//     (sum, i) => sum + ((i.currentStockTrays || 0) % PIECES_PER_TRAY),
//     0,
//   );

//   const getStock = (cls: string) =>
//     inventory.find((i) => i.classification === cls)?.currentStockTrays || 0;

//   const lowCount = CLASS_ORDER.filter((s) => {
//     const p = getStock(s);
//     return p > 0 && Math.floor(p / PIECES_PER_TRAY) <= LOW_STOCK_TRAYS;
//   }).length;

//   const lowStockNames = CLASS_ORDER.filter((s) => {
//     const p = getStock(s);
//     return p > 0 && Math.floor(p / PIECES_PER_TRAY) <= LOW_STOCK_TRAYS;
//   });

//   const activeCount = inventory.filter(
//     (i) => (i.currentStockTrays || 0) > 0,
//   ).length;

//   // Premium Yield breakdown
//   const standardPieces = inventory.reduce((sum, item) => {
//     const meta = CLASS_METADATA[item.classification];
//     return sum + (meta?.type === "standard" ? item.currentStockTrays || 0 : 0);
//   }, 0);

//   const offGradePieces = inventory.reduce((sum, item) => {
//     const meta = CLASS_METADATA[item.classification];
//     return sum + (meta?.type === "off-grade" ? item.currentStockTrays || 0 : 0);
//   }, 0);

//   const premiumPercent =
//     grandTotalPieces > 0
//       ? Math.round((standardPieces / grandTotalPieces) * 100)
//       : 0;
//   const offGradePercent =
//     grandTotalPieces > 0
//       ? Math.round((offGradePieces / grandTotalPieces) * 100)
//       : 0;

//   const fmtTime = (d: Date) =>
//     d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   // ── Loading ──
//   if (loading) {
//     return (
//       <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
//         <div className="flex justify-between items-center">
//           <div className="space-y-2">
//             <div className="h-6 w-44 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
//             <div className="h-4 w-60 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
//           </div>
//           <div className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
//         </div>
//         <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {CLASS_ORDER.map((s) => (
//             <SkeletonCard key={s} />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   const renderCard = (size: string) => {
//     const totalPieces = getStock(size);
//     const trays = Math.floor(totalPieces / PIECES_PER_TRAY);
//     const loose = totalPieces % PIECES_PER_TRAY;
//     const isEmpty = totalPieces === 0;
//     const isLow = !isEmpty && trays <= LOW_STOCK_TRAYS;
//     const meta = CLASS_METADATA[size];

//     if (!meta) return null;

//     // Progress math
//     const stockPercentage = Math.min(
//       100,
//       Math.round((trays / LOW_STOCK_TRAYS) * 100),
//     );
//     const progressColor =
//       trays <= LOW_STOCK_TRAYS
//         ? "bg-gradient-to-r from-rose-500 to-amber-500"
//         : "bg-gradient-to-r from-emerald-500 to-teal-500";

//     return (
//       <div
//         key={size}
//         className={cn(
//           "group relative flex flex-col rounded-xl border transition-all duration-300 ease-out",
//           "bg-white/80 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden",
//           isEmpty
//             ? "border-slate-200/50 dark:border-slate-800/50 opacity-60 grayscale-[0.2]"
//             : cn(
//                 "border-slate-200/70 dark:border-slate-800/70 shadow-xs hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30",
//                 meta.glow,
//               ),
//         )}
//       >
//         {/* Classification Color Accent Top Line */}
//         <div
//           className={cn(
//             "h-1.5 w-full bg-gradient-to-r",
//             size === "PEEWEE" && "from-violet-500 to-indigo-500",
//             size === "XS" && "from-sky-400 to-blue-500",
//             size === "SMALL" && "from-emerald-400 to-teal-500",
//             size === "MEDIUM" && "from-yellow-400 to-amber-500",
//             size === "LARGE" && "from-orange-400 to-amber-600",
//             size === "XL" && "from-rose-400 to-orange-500",
//             size === "XXL" && "from-pink-500 to-rose-500",
//             size === "CRACKED" && "from-slate-400 to-zinc-500",
//             size === "BROKEN" && "from-red-400 to-orange-600",
//             size === "DIRTY" && "from-stone-500 to-amber-700",
//           )}
//         />

//         {/* Backdrop Ambient Glow */}
//         {!isEmpty && (
//           <div
//             className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-10 dark:opacity-15 pointer-events-none transition-all duration-500 group-hover:scale-125"
//             style={{ backgroundColor: meta.bgGlow }}
//           />
//         )}

//         {/* Card Body */}
//         <div className="p-5 flex flex-col flex-1 relative z-10">
//           {/* Status Badge (Tag) */}
//           <div className="absolute top-4 right-4 z-20">
//             {isLow && (
//               <span className="flex items-center gap-1 px-2 py-1 rounded-md rounded-tr-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-wider border border-amber-500/20 shadow-sm backdrop-blur-md">
//                 Low Stock
//               </span>
//             )}
//             {isEmpty && (
//               <span className="flex items-center gap-1 px-2 py-1 rounded-md rounded-tr-xl bg-slate-500/10 text-slate-550 dark:bg-slate-800 dark:text-slate-400 text-[9px] font-extrabold uppercase tracking-wider border border-slate-700/20 shadow-sm backdrop-blur-md">
//                 Empty
//               </span>
//             )}
//             {!isEmpty && !isLow && (
//               <span className="flex items-center gap-1 px-2 py-1 rounded-md rounded-tr-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider border border-emerald-500/20 shadow-sm backdrop-blur-md">
//                 Good Stock
//               </span>
//             )}
//           </div>

//           {/* Header */}
//           <div className="flex flex-col gap-0.5 mb-4 pr-16">
//             <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-wide block">
//               {meta.label}
//             </span>
//             <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
//               {meta.description}
//             </span>
//           </div>

//           {/* Metric section: Total Pieces */}
//           <div className="flex flex-col mb-4">
//             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
//               Total Pieces
//             </span>
//             <div className="flex items-baseline gap-1 mt-1">
//               <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
//                 <NumberTicker value={totalPieces} />
//               </span>
//               <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
//                 eggs
//               </span>
//             </div>

//             {/* Visual Stock Progress Bar */}
//             {!isEmpty && (
//               <div className="mt-3.5 space-y-1">
//                 <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
//                   <div
//                     className={cn(
//                       "h-full rounded-full transition-all duration-500 ease-out",
//                       progressColor,
//                     )}
//                     style={{ width: `${stockPercentage}%` }}
//                   />
//                 </div>
//                 <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
//                   <span>Stock Health</span>
//                   <span>
//                     {trays > LOW_STOCK_TRAYS
//                       ? "Secure"
//                       : `${stockPercentage}% of threshold`}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Divider */}
//           <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80 my-3" />

//           {/* Detailed breakdown */}
//           <div className="flex flex-col gap-2.5 text-xs mt-auto">
//             <div className="flex justify-between items-center">
//               <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
//                 <Layers className="w-3.5 h-3.5 text-slate-400" />
//                 Full Trays
//               </span>
//               <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 px-2 py-0.5 rounded font-mono">
//                 <NumberTicker value={trays} />
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
//                 <Egg className="w-3.5 h-3.5 text-slate-400" />
//                 Extra Loose
//               </span>
//               <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 px-2 py-0.5 rounded font-mono">
//                 <NumberTicker value={loose} />
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="w-full mx-auto space-y-6 pb-12 px-3 sm:px-4 md:px-0 animate-in fade-in duration-300">
//       {/* ── HEADER ── */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <div className="flex items-center gap-2">
//             <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
//               <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
//                 Live Bodega Inventory
//               </span>
//             </h1>
//           </div>
//           <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
//             Real-time physical stock distribution
//             {lastSynced && (
//               <span className="ml-2 inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
//                 · <Clock className="w-3 h-3" /> Synced {fmtTime(lastSynced)}
//               </span>
//             )}
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
//           {lowCount > 0 && (
//             <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-1.5 text-xs font-black text-rose-600 dark:text-rose-400 shadow-2xs">
//               <TrendingDown className="w-3.5 h-3.5" aria-hidden />
//               {lowCount} Sizes Low
//             </span>
//           )}

//           <button
//             onClick={() => fetchInventory()}
//             disabled={refreshing}
//             className={cn(
//               "inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800",
//               "bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-black shadow-2xs",
//               "text-slate-700 dark:text-slate-300 transition-all cursor-pointer",
//               "hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:scale-95",
//               "disabled:opacity-50 disabled:cursor-not-allowed",
//             )}
//           >
//             <RefreshCw
//               className={cn(
//                 "w-4 h-4 text-orange-500",
//                 refreshing && "animate-spin",
//               )}
//               aria-hidden
//             />
//             Sync Bodega
//           </button>
//         </div>
//       </div>

//       {/* ── HERO CONTAINER ── */}
//       <div className="relative rounded-2xl overflow-hidden bg-slate-50/55 dark:bg-[#090b11] border border-slate-200 dark:border-slate-800/80 shadow-xs">
//         {/* Glow bg - extremely subtle and clean */}
//         <div
//           aria-hidden
//           className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-20"
//           style={{
//             backgroundImage:
//               "radial-gradient(ellipse 50% 100% at 0% 50%, #f97316, transparent 65%), radial-gradient(circle at 100% 20%, #3b82f6, transparent 55%)",
//           }}
//         />
//         {/* Dot grid */}
//         <div
//           aria-hidden
//           className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
//           style={{
//             backgroundImage:
//               "radial-gradient(circle, currentColor 1px, transparent 1px)",
//             backgroundSize: "24px 24px",
//           }}
//         />

//         {/* HERO CONTENT */}
//         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-8">
//           {/* Card 1: Grand Total & Trays Stock */}
//           <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-2xs relative overflow-hidden">
//             {/* Soft inner glows under both columns */}
//             <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-orange-500/5 dark:bg-orange-500/10 blur-3xl pointer-events-none" />
//             <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

//             <div className="relative z-10">
//               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4">
//                 <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
//                   <Layers className="w-4 h-4" />
//                 </div>
//                 <span className="text-[10px] font-black uppercase tracking-[0.15em]">
//                   Bodega Volume
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100 dark:divide-white/[0.08]">
//                 {/* Grand Total Pieces */}
//                 <div className="space-y-1">
//                   <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-tight">
//                     Grand Total
//                   </span>
//                   <div className="flex items-baseline gap-1 mt-1">
//                     <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-yellow-300 tabular-nums leading-none tracking-tight">
//                       <NumberTicker value={grandTotalPieces} />
//                     </span>
//                   </div>
//                   <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block">
//                     egg pieces
//                   </span>
//                 </div>

//                 {/* Total Trays */}
//                 <div className="space-y-1 pl-4">
//                   <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-tight">
//                     Total Trays
//                   </span>
//                   <div className="flex items-baseline gap-1 mt-1">
//                     <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-500 dark:from-sky-400 dark:to-indigo-300 tabular-nums leading-none tracking-tight">
//                       <NumberTicker value={globalTrays} />
//                     </span>
//                   </div>
//                   <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block">
//                     full trays
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Footer with Extra Loose Eggs if any */}
//             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 relative z-10 gap-2 flex-wrap">
//               <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
//                 <Egg className="w-3.5 h-3.5 text-slate-400" /> Loose Extra Eggs:
//               </span>
//               <span className="font-mono text-orange-600 dark:text-orange-400 text-xs font-black bg-orange-50 dark:bg-white/[0.04] px-2.5 py-0.5 rounded border border-orange-100 dark:border-transparent">
//                 <NumberTicker value={globalLoose} />{" "}
//                 <span className="text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400">
//                   pcs
//                 </span>
//               </span>
//             </div>
//           </div>

//           {/* Card 2: Stock Quality Yield */}
//           <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] rounded-xl p-5 flex flex-col justify-between transition-all duration-305 shadow-2xs">
//             <div>
//               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4">
//                 <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
//                   <Sparkles className="w-4 h-4" />
//                 </div>
//                 <span className="text-[10px] font-black uppercase tracking-[0.15em]">
//                   Quality Yield
//                 </span>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-3xl font-black text-slate-900 dark:text-white">
//                     {premiumPercent}%
//                   </span>
//                   <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
//                     Premium
//                   </span>
//                 </div>

//                 {/* Segmented yield bar */}
//                 <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden flex">
//                   <div
//                     className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
//                     style={{ width: `${premiumPercent}%` }}
//                     title={`Premium Retail: ${premiumPercent}%`}
//                   />
//                   <div
//                     className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
//                     style={{ width: `${offGradePercent}%` }}
//                     title={`Off-Grade / Reject: ${offGradePercent}%`}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest gap-2 flex-wrap">
//               <span className="flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
//                 Premium ({standardPieces.toLocaleString()})
//               </span>
//               <span className="flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Reject
//                 ({offGradePieces.toLocaleString()})
//               </span>
//             </div>
//           </div>

//           {/* Card 3: Operational Console / Alerts */}
//           <div
//             className={cn(
//               "bg-white/80 dark:bg-white/[0.02] backdrop-blur-md border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-2xs md:col-span-2 lg:col-span-1",
//               lowCount > 0
//                 ? "border-rose-500/20 dark:border-rose-500/20 hover:border-rose-500/40 dark:hover:border-rose-500/40"
//                 : "border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15]",
//             )}
//           >
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
//                   <div
//                     className={cn(
//                       "p-1.5 rounded-lg",
//                       lowCount > 0
//                         ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
//                         : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
//                     )}
//                   >
//                     <ShieldAlert className="w-4 h-4" />
//                   </div>
//                   <span className="text-[10px] font-black uppercase tracking-[0.15em]">
//                     Alert Console
//                   </span>
//                 </div>
//               </div>

//               {lowCount > 0 ? (
//                 <div>
//                   <div className="flex items-baseline gap-1.5">
//                     <span className="text-3xl font-black text-rose-600 dark:text-rose-500">
//                       {lowCount}
//                     </span>
//                     <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
//                       Low Stock Alert{lowCount > 1 ? "s" : ""}
//                     </span>
//                   </div>

//                   {/* List of low stock sizes */}
//                   <div className="flex flex-wrap gap-1 mt-2.5 max-h-[50px] overflow-y-auto custom-scrollbar">
//                     {lowStockNames.map((name) => (
//                       <span
//                         key={name}
//                         className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/25 tracking-wide"
//                       >
//                         {name}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-start gap-1 py-1">
//                   <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
//                     <CheckCircle2 className="w-4 h-4" />
//                     All Stocks Healthy
//                   </div>
//                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
//                     No items require immediate replenishment.
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
//               <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
//                 <Activity className="w-3.5 h-3.5 text-slate-400" /> Active
//                 Types:
//               </span>
//               <span className="font-mono text-slate-900 dark:text-white text-xs font-black">
//                 {activeCount}{" "}
//                 <span className="text-[10px] font-sans font-medium text-slate-500">
//                   / {CLASS_ORDER.length}
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── SECTION 1: PREMIUM RETAIL SIZES ── */}
//       <div className="space-y-4">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5 gap-2">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
//               <Sparkles className="w-4.5 h-4.5" />
//             </div>
//             <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
//               Premium Graded Sizes
//             </h2>
//           </div>
//           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:text-right">
//             {STANDARD_SIZES.length} Standard Graded Weights
//           </span>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {STANDARD_SIZES.map((size) => renderCard(size))}
//         </div>
//       </div>

//       {/* ── SECTION 2: OFF-GRADE & REJECTS ── */}
//       <div className="space-y-4 pt-4">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5 gap-2">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
//               <ShieldAlert className="w-4.5 h-4.5" />
//             </div>
//             <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
//               Off-Grade & Rejects
//             </h2>
//           </div>
//           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:text-right">
//             {OFF_GRADE_SIZES.length} Defective Classifications
//           </span>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {OFF_GRADE_SIZES.map((size) => renderCard(size))}
//         </div>
//       </div>

//       {/* ── LEGEND ── */}
//       <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
//         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
//           Legend / Parameters
//         </span>
//         <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
//           {[
//             { Icon: Layers, text: `1 Tray = ${PIECES_PER_TRAY} pieces` },
//             {
//               Icon: Package,
//               text: `Low stock threshold = <= ${LOW_STOCK_TRAYS} trays`,
//             },
//             {
//               Icon: Info,
//               text: `Weights strictly based on standard sorting protocols`,
//             },
//           ].map(({ Icon, text }) => (
//             <span
//               key={text}
//               className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
//             >
//               <Icon
//                 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
//                 aria-hidden
//               />
//               {text}
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

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

const CLASS_ORDER = [...STANDARD_SIZES, ...OFF_GRADE_SIZES] as const;

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
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
          className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 animate-pulse"
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

  const trays = Math.floor(pieces / PIECES_PER_TRAY);
  const loose = pieces % PIECES_PER_TRAY;
  const isEmpty = pieces === 0;
  const isLow = !isEmpty && trays <= LOW_STOCK_TRAYS;
  const status: "good" | "low" | "empty" = isEmpty
    ? "empty"
    : isLow
      ? "low"
      : "good";

  const progressPct = isEmpty
    ? 0
    : Math.min(100, Math.round((trays / LOW_STOCK_TRAYS) * 100));
  const progressColor = isLow ? "#E24B4A" : "#1D9E75";

  return (
    <div
      className={cn(
        "group relative rounded-xl border overflow-hidden transition-all duration-200",
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

        {/* Piece count */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
            <NumberTicker value={pieces} />
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            pcs
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

        {/* Breakdown footer */}
        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Layers className="w-3 h-3" aria-hidden />
            <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              <NumberTicker value={trays} />
            </span>
            {" trays"}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Egg className="w-3 h-3" aria-hidden />
            <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              <NumberTicker value={loose} />
            </span>
            {" loose"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Card: Bodega Volume ─────────────────────────────────────────────────
function HeroVolume({
  totalPieces,
  totalTrays,
  totalLoose,
}: {
  totalPieces: number;
  totalTrays: number;
  totalLoose: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
        <Store className="w-3.5 h-3.5" aria-hidden />
        Bodega volume
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800/80">
        <div className="pr-4">
          <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-1">
            Pieces
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none">
            <NumberTicker value={totalPieces} />
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            egg pieces
          </p>
        </div>
        <div className="pl-4">
          <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-1">
            Trays
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none">
            <NumberTicker value={totalTrays} />
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            full trays
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-500">
          <Egg className="w-3.5 h-3.5" aria-hidden />
          Loose extra
        </span>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-100 dark:border-slate-700/50 tabular-nums">
          <NumberTicker value={totalLoose} /> pcs
        </span>
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
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
        "rounded-xl border bg-white dark:bg-slate-900 p-5 flex flex-col justify-between transition-colors",
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
          <div className="h-9 w-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
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
              Live Bodega Inventory
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
            Sync Bodega
          </button>
        </div>
      </div>

      {/* ── HERO SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <HeroVolume
          totalPieces={grandTotalPieces}
          totalTrays={globalTrays}
          totalLoose={globalLoose}
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

      {/* ── PREMIUM GRADED SIZES ── */}
      <section aria-label="Premium graded egg sizes">
        <SectionHeader
          icon={Sparkles}
          title="Premium graded sizes"
          count={STANDARD_SIZES.length}
          description="standard graded weights"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {STANDARD_SIZES.map((size) => (
            <EggCard key={size} size={size} pieces={getStock(size)} />
          ))}
        </div>
      </section>

      {/* ── OFF-GRADE & REJECTS ── */}
      <section aria-label="Off-grade and reject egg classifications">
        <SectionHeader
          icon={ShieldAlert}
          title="Off-grade & rejects"
          count={OFF_GRADE_SIZES.length}
          description="defective classifications"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {OFF_GRADE_SIZES.map((size) => (
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
