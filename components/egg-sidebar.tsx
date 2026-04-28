// components/egg-sidebar.tsx
import Link from "next/link";
import { Egg, LayoutDashboard } from "lucide-react";

export function EggSidebar() {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Otso Dragon Branding */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <Egg className="w-6 h-6 text-amber-500 mr-2" />
        <span className="font-bold text-lg tracking-tight">Otso Dragon</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/egg-sales/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-amber-600/10 text-amber-500 font-medium transition-colors hover:bg-amber-600/20"
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
      </nav>
    </div>
  );
}
