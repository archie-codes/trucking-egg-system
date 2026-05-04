// components/egg-sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Egg, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/egg-sales/dashboard",
  },
];

export function EggSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        isCollapsed ? "5rem" : "16rem"
      );
    }
  }, [isCollapsed, isMobile]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative group">
      {/* Otso Dragon Branding */}
      <div className={`h-16 flex items-center border-b border-slate-800 bg-slate-950 ${isCollapsed && !isMobile ? 'justify-center px-0' : 'px-6'}`}>
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Egg className="w-5 h-5 text-amber-500" />
          </div>
        ) : (
          <>
            <Egg className="w-6 h-6 text-amber-500 mr-2" />
            <span className="font-bold text-lg tracking-tight">Otso Dragon</span>
          </>
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

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname?.startsWith(route.href);
          
          const LinkContent = (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center rounded-lg transition-all duration-200 ${
                isCollapsed && !isMobile ? 'justify-center py-3' : 'px-3 py-2.5'
              } ${
                isActive
                  ? "bg-amber-600/10 text-amber-500 font-medium"
                  : "hover:bg-slate-800 hover:text-white text-slate-300"
              }`}
              title={isCollapsed && !isMobile ? route.label : undefined}
            >
              <route.icon
                className={`w-5 h-5 ${isCollapsed && !isMobile ? '' : 'mr-3'} ${isActive ? "text-amber-500" : "text-slate-400"}`}
              />
              {(!isCollapsed || isMobile) && <span>{route.label}</span>}
            </Link>
          );

          if (isMobile) {
            return (
              <SheetClose asChild key={route.href}>
                {LinkContent}
              </SheetClose>
            );
          }

          return LinkContent;
        })}
      </nav>
    </div>
  );
}
