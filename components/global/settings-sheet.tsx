
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
