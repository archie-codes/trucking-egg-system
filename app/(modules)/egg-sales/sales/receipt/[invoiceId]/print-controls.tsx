"use client";

import { useState, useEffect, useTransition } from "react";
import { Printer, ZoomIn, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SCALE_OPTIONS = [
  { label: "Auto Fit (1 Page)", value: "auto" },
  { label: "100% (Default)", value: "1.0" },
  { label: "95%", value: "0.95" },
  { label: "90% (Compact)", value: "0.90" },
  { label: "85%", value: "0.85" },
  { label: "80% (Super Compact)", value: "0.80" },
];

export function PrintControls({ itemCount = 0 }: { itemCount?: number }) {
  const [scale, setScale] = useState<string>("auto");
  const [activeScaleValue, setActiveScaleValue] = useState<number>(1);
  const [, startTransition] = useTransition();

  // Calculate and apply print scale
  useEffect(() => {
    const applyScale = () => {
      const receiptEl = document.getElementById("invoice-receipt");
      if (!receiptEl) return;

      let computedScale = 1;

      if (scale === "auto") {
        // Approximate printable height for Letter paper (11in at 96 DPI - margins ≈ 980px)
        const maxPrintableHeight = 960;
        const currentHeight = receiptEl.offsetHeight;

        if (currentHeight > maxPrintableHeight) {
          computedScale = Math.max(
            0.7,
            Math.floor((maxPrintableHeight / currentHeight) * 100) / 100,
          );
        } else if (itemCount > 10) {
          // Proactively apply slight reduction if many items
          computedScale = 0.92;
        } else {
          computedScale = 1;
        }
      } else {
        computedScale = parseFloat(scale) || 1;
      }

      setActiveScaleValue(computedScale);
      receiptEl.style.setProperty("--print-scale", computedScale.toString());
    };

    applyScale();
    window.addEventListener("resize", applyScale);
    return () => window.removeEventListener("resize", applyScale);
  }, [scale, itemCount]);

  const handlePrint = () => {
    // Re-verify auto fit before opening print dialog
    const receiptEl = document.getElementById("invoice-receipt");
    if (receiptEl && scale === "auto") {
      const maxPrintableHeight = 960;
      const currentHeight = receiptEl.offsetHeight;
      let computedScale = 1;
      if (currentHeight > maxPrintableHeight) {
        computedScale = Math.max(
          0.7,
          Math.floor((maxPrintableHeight / currentHeight) * 100) / 100,
        );
      } else if (itemCount > 10) {
        computedScale = 0.92;
      }
      receiptEl.style.setProperty("--print-scale", computedScale.toString());
    }

    window.print();
  };

  const selectedOption =
    SCALE_OPTIONS.find((opt) => opt.value === scale) || SCALE_OPTIONS[0];

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Paper Indicator */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 h-10  text-xs font-semibold text-slate-600 dark:text-slate-300 ">
        <FileText className="w-3.5 h-3.5 text-blue-500" />
        <span>Letter (8.5 × 11&quot;)</span>
      </div>

      {/* Scale Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold h-10 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>
              {scale === "auto"
                ? `Auto (${Math.round(activeScaleValue * 100)}%)`
                : selectedOption.label}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl">
          <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Page Fit & Scale
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SCALE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                startTransition(() => {
                  setScale(option.value);
                });
              }}
              className="flex items-center justify-between text-xs py-2 cursor-pointer rounded-lg font-medium"
            >
              <span>{option.label}</span>
              {scale === option.value && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Print Button */}
      <Button
        onClick={handlePrint}
        className="relative h-10 px-5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 overflow-hidden group/btn font-semibold cursor-pointer"
      >
        <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
        <Printer className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110 duration-300 relative z-10" />
        <span className="relative z-10">Print Receipt</span>
      </Button>
    </div>
  );
}
