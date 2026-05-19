// "use client";

// import { useEffect, useState } from "react";
// import { useTheme } from "next-themes";
// import {
//   Settings,
//   Moon,
//   Sun,
//   Monitor,
//   CheckCircle2,
//   Info,
//   ChevronRight,
//   X,
// } from "lucide-react";

// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// interface SettingsSheetProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// // ── Shared UI Components ─────────────────────────────────────────────────────

// function SectionLabel({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex items-center gap-3 mb-4">
//       <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 whitespace-nowrap">
//         {children}
//       </span>
//       <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/60" />
//     </div>
//   );
// }

// // ── Configuration Data ────────────────────────────────────────────────────────

// const THEMES = [
//   {
//     value: "light",
//     label: "Light",
//     icon: Sun,
//     description: "Clean & bright",
//     previewBg: "bg-slate-100",
//     previewBorder: "border-slate-200",
//     previewElements: "bg-white",
//     previewAccent: "bg-amber-400",
//   },
//   {
//     value: "dark",
//     label: "Dark",
//     icon: Moon,
//     description: "Easy on eyes",
//     previewBg: "bg-slate-950",
//     previewBorder: "border-slate-800",
//     previewElements: "bg-slate-800",
//     previewAccent: "bg-blue-500",
//   },
//   {
//     value: "system",
//     label: "System",
//     icon: Monitor,
//     description: "Auto sync OS",
//     previewBg: "bg-linear-to-br from-slate-100 to-slate-900",
//     previewBorder: "border-slate-300 dark:border-slate-700",
//     previewElements: "bg-white/50 dark:bg-slate-800/50",
//     previewAccent: "bg-slate-400",
//   },
// ] as const;

// type AppInfoItem = {
//   label: string;
//   value: string;
//   isHighlight?: boolean;
// };

// const APP_INFO: AppInfoItem[] = [
//   { label: "Application", value: "Trucking System", isHighlight: true },
//   { label: "Version", value: "v2.4.0 (Stable)" },
//   { label: "Build", value: "Fhernie Logistics" },
// ];

// // ── Main Component ────────────────────────────────────────────────────────────

// export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
//   const { theme, setTheme, systemTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   // Prevent hydration mismatch
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const currentTheme = theme === "system" ? systemTheme : theme;
//   const isDark = currentTheme === "dark";

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent
//         showCloseButton={false}
//         className="flex flex-col p-0 w-full sm:max-w-[420px] bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800/60 z-200 h-full overflow-hidden shadow-2xl"
//       >
//         {/* Dynamic Top Gradient Bar */}
//         <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-amber-400 via-orange-500 to-rose-500 z-10" />

//         {/* Subtle Background Glow (Dark Mode Only) */}
//         <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-0 dark:opacity-100 transition-opacity duration-1000" />

//         {/* ── Header ───────────────────────────────────────────────────────── */}
//         <SheetHeader className="relative shrink-0 px-6 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-md">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onClose}
//             className="absolute top-4 right-4 h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
//           >
//             <X className="h-4 w-4" />
//           </Button>

//           <div className="flex items-center gap-4">
//             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm">
//               <Settings className="h-6 w-6 text-amber-600 dark:text-amber-400" />
//             </div>
//             <div className="flex flex-col text-left">
//               <SheetTitle className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
//                 Preferences
//               </SheetTitle>
//               <SheetDescription className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
//                 Customize your application experience.
//               </SheetDescription>
//             </div>
//           </div>
//         </SheetHeader>

//         {/* ── Scrollable Body ───────────────────────────────────────────────── */}
//         <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar relative z-10">
//           {/* Theme Section */}
//           <section>
//             <SectionLabel>Appearance</SectionLabel>

//             {mounted ? (
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 {THEMES.map((t) => {
//                   const isActive = theme === t.value;
//                   const Icon = t.icon;

//                   return (
//                     <button
//                       key={t.value}
//                       onClick={() => setTheme(t.value)}
//                       className={cn(
//                         "group relative flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-300",
//                         isActive
//                           ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20"
//                           : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm",
//                       )}
//                     >
//                       {/* Active Indicator */}
//                       {isActive && (
//                         <div className="absolute top-3 right-3 flex items-center justify-center">
//                           <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20 animate-ping"></span>
//                           <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 relative z-10" />
//                         </div>
//                       )}

//                       {/* Mini Preview UI */}
//                       <div
//                         className={cn(
//                           "w-full h-12 rounded-xl border flex flex-col gap-1.5 p-2 transition-colors",
//                           t.previewBg,
//                           t.previewBorder,
//                         )}
//                       >
//                         <div className="flex items-center gap-1 w-full">
//                           <div
//                             className={cn(
//                               "h-1.5 w-1.5 rounded-full",
//                               t.previewAccent,
//                             )}
//                           />
//                           <div
//                             className={cn(
//                               "h-1.5 w-1.5 rounded-full",
//                               t.previewElements,
//                             )}
//                           />
//                           <div
//                             className={cn(
//                               "h-1.5 flex-1 rounded-full",
//                               t.previewElements,
//                             )}
//                           />
//                         </div>
//                         <div
//                           className={cn(
//                             "h-4 w-full rounded-md mt-0.5",
//                             t.previewElements,
//                           )}
//                         />
//                       </div>

//                       {/* Info */}
//                       <div>
//                         <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
//                           <Icon
//                             className={cn(
//                               "h-3.5 w-3.5 transition-colors",
//                               isActive
//                                 ? "text-amber-600 dark:text-amber-400"
//                                 : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200",
//                             )}
//                           />
//                           <span className="text-[13px] font-semibold">
//                             {t.label}
//                           </span>
//                         </div>
//                         <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
//                           {t.description}
//                         </p>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             ) : (
//               // Skeleton Loader
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 {[1, 2, 3].map((i) => (
//                   <div
//                     key={i}
//                     className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
//                   />
//                 ))}
//               </div>
//             )}

//             <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-4 flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
//               <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
//               <span>
//                 Theme changes are applied globally and instantly across the
//                 entire dashboard interface.
//               </span>
//             </p>
//           </section>

//           {/* System Info Section */}
//           <section>
//             <SectionLabel>System Information</SectionLabel>
//             <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
//               <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
//                 {APP_INFO.map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
//                   >
//                     <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
//                       {item.label}
//                     </span>
//                     <div className="flex items-center gap-2">
//                       <span
//                         className={cn(
//                           "text-[13px] font-semibold",
//                           item.isHighlight
//                             ? "text-slate-900 dark:text-white"
//                             : "text-slate-700 dark:text-slate-300",
//                         )}
//                       >
//                         {item.value}
//                       </span>
//                       {item.isHighlight && (
//                         <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </div>

//         {/* ── Footer ───────────────────────────────────────────────────────── */}
//         <div className="shrink-0 p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-md">
//           <Button
//             onClick={onClose}
//             className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-lg transition-all active:scale-[0.98]"
//           >
//             Done
//           </Button>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

// components/settings-sheet.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings, Moon, Sun, Monitor, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// ── Theme option ──────────────────────────────────────────────────────────────
const THEMES = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Clean white interface",
    preview: "bg-white border-slate-200",
    previewDots: ["bg-slate-200", "bg-slate-200", "bg-blue-300"],
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes",
    preview: "bg-slate-900 border-slate-700",
    previewDots: ["bg-slate-700", "bg-slate-700", "bg-blue-500"],
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follows your OS",
    preview: "bg-gradient-to-br from-white to-slate-900 border-slate-400",
    previewDots: ["bg-slate-400", "bg-slate-400", "bg-blue-400"],
  },
] as const;

export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-[400px] bg-background border-l border-border/60 z-200 h-full">
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-linear-to-r from-amber-500 to-orange-400 z-10" />

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <SheetHeader className="shrink-0 px-5 pt-8 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
              <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <SheetTitle className="text-[15px] font-semibold text-foreground leading-tight">
                App Settings
              </SheetTitle>
              <SheetDescription className="text-[12px] text-muted-foreground mt-0.5">
                Customize your OtsoTrack experience.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Appearance */}
          <div className="space-y-3">
            <SectionLabel>Appearance</SectionLabel>

            {mounted && (
              <div className="grid grid-cols-3 gap-2.5">
                {THEMES.map(
                  ({
                    value,
                    label,
                    icon: Icon,
                    description,
                    preview,
                    previewDots,
                  }) => {
                    const isActive = theme === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={cn(
                          "relative flex flex-col items-center gap-2.5 p-3 rounded-xl border transition-all text-left group",
                          isActive
                            ? "border-amber-400/70 dark:border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/20"
                            : "border-border/50 bg-card hover:border-border hover:bg-muted/40",
                        )}
                      >
                        {/* Active check */}
                        {isActive && (
                          <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        )}

                        {/* Mini theme preview */}
                        <div
                          className={cn(
                            "w-full h-10 rounded-lg border overflow-hidden flex flex-col gap-1 p-1.5",
                            preview,
                          )}
                        >
                          <div className="flex gap-0.5">
                            {previewDots.map((dot, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1 rounded-full",
                                  dot,
                                  i === 2 ? "flex-1" : "w-3",
                                )}
                              />
                            ))}
                          </div>
                          <div
                            className={cn(
                              "h-1 w-4/5 rounded-full",
                              previewDots[0],
                            )}
                          />
                          <div
                            className={cn(
                              "h-1 w-3/5 rounded-full",
                              previewDots[0],
                            )}
                          />
                        </div>

                        {/* Icon + label */}
                        <div className="flex flex-col items-center gap-1 w-full">
                          <Icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              isActive
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[12px] font-semibold leading-none",
                              isActive
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}

            {/* Loading skeleton while unmounted */}
            {!mounted && (
              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl bg-muted/40 border border-border/40 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Active theme hint */}
            {mounted && (
              <p className="text-[11px] text-muted-foreground/60 text-center">
                Currently using{" "}
                <span className="font-medium text-muted-foreground">
                  {THEMES.find((t) => t.value === theme)?.label ?? theme}
                </span>{" "}
                mode
              </p>
            )}
          </div>

          {/* App info */}
          <div className="space-y-3">
            <SectionLabel>About</SectionLabel>
            <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/40">
              {[
                { label: "Application", value: "Trucking History System" },
                { label: "Version", value: "1.0.0" },
                { label: "Build", value: "Fhernie Logistics" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-[13px] text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-[13px] font-medium text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-4 border-t border-border/60 bg-muted/10">
          <button
            onClick={onClose}
            className="flex-2 relative w-full h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold"
          >
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
