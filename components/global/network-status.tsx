"use client";

import { useSyncExternalStore } from "react";
import { WifiOff, Loader2 } from "lucide-react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Always assume online during Server-Side Rendering
}

export function NetworkStatus() {
  // useSyncExternalStore automatically handles SSR hydration matching
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // If we are online, don't render anything
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card border border-border/60 shadow-2xl rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 delay-100">
        <div className="h-20 w-20 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-500 rounded-full flex items-center justify-center mb-6 relative">
          <WifiOff className="h-10 w-10" />
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Connection Lost
        </h2>
        <p className="text-muted-foreground mb-8">
          It looks like you&apos;re offline. Please check your internet
          connection. The system is temporarily disabled until your connection
          is restored.
        </p>

        <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 py-3 px-5 rounded-full">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          Waiting for network...
        </div>
      </div>
    </div>
  );
}
