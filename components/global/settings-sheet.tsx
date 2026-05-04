// components/settings-sheet.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // We use this to prevent a Next.js hydration mismatch on the icons
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-hidden w-full sm:max-w-md bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-l border-white/20 dark:border-slate-800/50 shadow-2xl p-0 flex flex-col h-full">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 opacity-90 z-10" />

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8">
          <SheetHeader className="mt-2">
            <SheetTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-500" />
              App Settings
            </SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              Customize your OtsoTrack experience.
            </SheetDescription>
          </SheetHeader>

          {/* Theme Selection */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
              Appearance
            </h4>

            {/* Only render the buttons once mounted to avoid server/client mismatch */}
            {mounted && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === "light" ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-xs font-semibold">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-500" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-xs font-semibold">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === "system" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs font-semibold">System</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
