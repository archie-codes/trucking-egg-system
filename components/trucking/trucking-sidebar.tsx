"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Truck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/trucking/dashboard",
  },
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
];

export function TruckingSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✨ FIX: Auto-collapse on Tablet screens (< 1024px)
  useEffect(() => {
    if (isMobile) return;

    const handleResize = () => {
      // If screen is smaller than standard desktop (1024px), automatically collapse it
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Run once on load
    handleResize();

    // Listen for window resizing (e.g., rotating an iPad)
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  // Update CSS variable for the main content padding
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
        className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed && !isMobile ? "justify-center px-0" : "px-6 justify-between"}`}
      >
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
        ) : (
          <h2 className="text-[18px] font-bold text-white tracking-tight">
            Trucking<span className="text-blue-500"> History</span>
          </h2>
        )}
        {isMobile && (
          <SheetClose className="p-2 -mr-2 text-slate-400 hover:text-white rounded-md transition-colors focus:outline-none">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        )}
      </div>

      {/* Collapse Toggle Button (Desktop Only) */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-slate-800 text-slate-100 hover:text-white border border-slate-700 rounded-full p-1 transition-opacity z-50 shadow-md"
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
              className={`flex items-center rounded-lg transition-all duration-200 text-[15px] ${
                isCollapsed && !isMobile ? "justify-center py-3" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-blue-500/10 text-blue-500 font-medium"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
              title={isCollapsed && !isMobile ? route.label : undefined}
            >
              <route.icon
                className={`w-5 h-5 ${isCollapsed && !isMobile ? "" : "mr-3"} ${isActive ? "text-blue-500" : "text-slate-400"}`}
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
