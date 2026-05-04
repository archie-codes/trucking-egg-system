// components/trucking-sidebar.tsx (or wherever you placed it)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ReceiptText,
  BarChart3,
  Truck, // 1. ADDED: Truck icon for the Fleet menu
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/trucking/dashboard",
  },
  // 2. ADDED: The new Fleet Registration route
  {
    label: "Truck Fleet",
    icon: Truck,
    href: "/trucking/fleet",
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

export function TruckingSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        isCollapsed ? "5rem" : "16rem",
      );
    }
  }, [isCollapsed, isMobile]);

  return (
    <div className="flex flex-col h-full text-slate-300 relative group">
      {/* Sidebar Header / Branding */}
      <div
        className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed && !isMobile ? "justify-center px-0" : "px-6"}`}
      >
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
        ) : (
          <h2 className="text-xl font-bold text-white tracking-tight">
            Trucking<span className="text-primary"> History</span>
          </h2>
        )}
      </div>

      {/* Collapse Toggle Button (Desktop Only) */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-full p-1 transition-opacity z-50 shadow-md"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {routes.map((route) => {
          const isActive = pathname === route.href;

          const LinkContent = (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center rounded-lg transition-all duration-200 ${
                isCollapsed && !isMobile ? "justify-center py-3" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
              title={isCollapsed && !isMobile ? route.label : undefined}
            >
              <route.icon
                className={`w-5 h-5 ${isCollapsed && !isMobile ? "" : "mr-3"} ${isActive ? "text-primary" : "text-slate-400"}`}
              />
              {(!isCollapsed || isMobile) && <span>{route.label}</span>}
            </Link>
          );

          // If in mobile Sheet, close the Sheet when link is clicked
          if (isMobile) {
            return (
              <SheetClose asChild key={route.href}>
                {LinkContent}
              </SheetClose>
            );
          }

          return LinkContent;
        })}
      </div>
    </div>
  );
}
