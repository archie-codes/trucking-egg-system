"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Wrench } from "lucide-react";

export default function FlocksPage() {
  return (
    <div className="w-full mx-auto space-y-4 animate-in fade-in duration-300 pb-16">
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
        <h1 className="text-lg lg:text-xl font-black tracking-tight text-slate-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">
            Flock / Batch Management
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
          Manage chicken batches, flock details, house assignment, starting
          quantity, and batch status.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl mt-6 overflow-hidden relative min-h-[300px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <CardContent className="flex flex-col items-center justify-center text-center relative z-10 py-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center relative shadow-xl">
              <Settings className="w-10 h-10 text-amber-500 animate-[spin_4s_linear_infinite]" />
              <Wrench className="w-6 h-6 text-emerald-500 absolute bottom-3 right-3 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            Coming Soon
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
            This module is currently under development. We're building something
            awesome for your farm operations!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
