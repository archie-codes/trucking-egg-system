"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ReceiptText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/trucking/dashboard",
  },
  {
    label: "Trips History",
    icon: Map,
    href: "/trucking/trips",
  },
  {
    label: "Expenses",
    icon: ReceiptText,
    href: "/trucking/expenses",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/trucking/reports",
  },
];

export function TruckingSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full text-slate-300">
      {/* Sidebar Header / Branding */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Otso<span className="text-primary">Track</span>
        </h2>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <route.icon
                className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-slate-400"}`}
              />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* Footer / Exit to Main Menu */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/trucking/settings"
          className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5 mr-3 text-slate-400" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 text-red-400/70" />
          Switch Module
        </Link>
      </div>
    </div>
  );
}
