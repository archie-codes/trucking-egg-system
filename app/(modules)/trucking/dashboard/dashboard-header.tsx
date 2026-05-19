"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string | null;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function DashboardHeader({ userName, avatarUrl }: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = String(hours % 12 || 12).padStart(2, "0");
  const displayMin = String(time.getMinutes()).padStart(2, "0");
  const displaySec = String(time.getSeconds()).padStart(2, "0");

  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-lg p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-white/10 dark:shadow-none relative overflow-hidden mb-3">
      {/* Background glows */}
      <div className="absolute -top-16 -left-10 w-[220px] h-[220px] rounded-full bg-emerald-500 dark:bg-[#3dff9a] opacity-5 pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[180px] h-[180px] rounded-full bg-blue-500 dark:bg-[#5cabff] opacity-5 pointer-events-none" />

      {/* Left — Avatar + Greeting */}
      <div className="flex items-center gap-3.5 relative z-10">
        <Avatar className="w-[52px] h-[52px] border-[1.5px] border-slate-200 dark:border-white/10 shrink-0 shadow-sm dark:shadow-none">
          <AvatarImage
            src={avatarUrl || ""}
            alt={userName}
            className="object-cover"
          />
          <AvatarFallback className="bg-linear-to-br from-emerald-100 to-blue-100 dark:from-[#3dff9a]/15 dark:to-[#5cabff]/20 text-slate-800 dark:text-white font-sans text-xl font-extrabold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="font-sans text-[clamp(17px,2.5vw,20px)] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
            Welcome back,{" "}
            <span className="text-emerald-600 dark:text-[#3dff9a]">
              {userName}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/40 font-normal tracking-[0.01em]">
            Here's what's happening with your trucking logistics today.
          </p>
        </div>
      </div>

      {/* Right — Date + Clock */}
      <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[14px] px-4 py-3 relative z-10 shrink-0 shadow-inner dark:shadow-none">
        {/* Calendar tile */}
        <div className="flex flex-col items-center bg-emerald-50 dark:bg-[#0a2e1a] border border-emerald-200/60 dark:border-[#3dff9a]/15 rounded-[10px] overflow-hidden w-11 shrink-0">
          <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-emerald-700 dark:text-[#3dff9a] bg-emerald-100/80 dark:bg-[#3dff9a]/10 w-full text-center py-[3px]">
            {mounted ? MONTHS[time.getMonth()] : "---"}
          </div>
          <div className="font-mono text-[22px] font-medium text-slate-800 dark:text-white pt-1 pb-[5px] leading-none">
            {mounted ? String(time.getDate()).padStart(2, "0") : "--"}
          </div>
        </div>

        {/* Separator */}
        <div className="w-[0.5px] h-9 bg-slate-200 dark:bg-white/10 shrink-0" />

        {/* Time */}
        <div className="flex flex-col justify-center">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/35 mb-[3px]">
            {mounted ? format(time, "EEEE") : "Loading..."}
          </div>
          <div className="font-mono text-[20px] font-medium text-slate-800 dark:text-white tracking-[-0.02em] leading-none">
            {mounted
              ? `${displayHour}:${displayMin}:${displaySec}`
              : "--:--:--"}
            {mounted && (
              <span className="text-slate-400 dark:text-white/35 text-[13px] ml-1">
                {ampm}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
