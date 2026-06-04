"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Egg,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  ShoppingBag,
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

type Route = {
  label: string;
  icon: React.ElementType;
  href: string;
  subRoutes?: {
    label: string;
    icon?: React.ElementType;
    href: string;
  }[];
};

const routes: Route[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/egg-sales/dashboard",
  },
  {
    label: "Receiving",
    icon: Egg,
    href: "/egg-sales/receiving",
    subRoutes: [
      {
        label: "Receiving Egg",
        href: "/egg-sales/receiving/receiving-egg",
      },
      {
        label: "History",
        href: "/egg-sales/receiving/history",
      },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingBag,
    href: "/egg-sales/sales",
    subRoutes: [
      {
        label: "New Sale",
        href: "/egg-sales/sales/new-sale",
      },
      {
        label: "History",
        href: "/egg-sales/sales/history",
      },
    ],
  },
];

export function EggSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Auto-collapse on Tablet screens (< 1024px)
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
    <div className="flex flex-col h-full text-slate-300 relative group/sidebar">
      {/* Sidebar Header / Branding */}
      <div
        className={`h-16 flex items-center border-b border-slate-800 bg-slate-950 ${isCollapsed && !isMobile ? "justify-center px-0" : "px-6 justify-between"}`}
      >
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Egg className="w-5 h-5 text-amber-500" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
              <Egg className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-amber-500 leading-tight tracking-tight">
                Otso Dragon
              </p>
              <p className="text-[12px] text-slate-500 leading-tight tracking-wide uppercase">
                Egg Sales
              </p>
            </div>
          </div>
        )}
        {isMobile && (
          <SheetClose
            id="mobile-sheet-close"
            className="p-2 -mr-2 text-slate-400 hover:text-white rounded-md transition-colors focus:outline-none"
          >
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
        {(!isCollapsed || isMobile) && (
          <div className="px-3 pb-2 mb-1 mt-1">
            <h2 className="text-xs font-light text-slate-500 uppercase tracking-widest">
              Menu
            </h2>
          </div>
        )}
        {routes.map((route) => {
          // Check if current path starts with route href for parent highlighting
          const isActive =
            route.href === "/egg-sales/dashboard"
              ? pathname === route.href
              : pathname?.startsWith(route.href);

          const hasSubRoutes = !!route.subRoutes;
          const isChildActive =
            hasSubRoutes &&
            route.subRoutes!.some((sub) => pathname === sub.href);
          const isExpanded =
            hasSubRoutes &&
            (expandedMenus.includes(route.label) ||
              (isChildActive &&
                !expandedMenus.includes(`closed_${route.label}`)));

          const handleRouteClick = (e: React.MouseEvent) => {
            if (hasSubRoutes) {
              e.preventDefault(); // Prevent navigation
              if (isExpanded) {
                setExpandedMenus((prev) => [
                  ...prev.filter((l) => l !== route.label),
                  `closed_${route.label}`,
                ]);
              } else {
                setExpandedMenus((prev) => [
                  ...prev.filter((l) => l !== `closed_${route.label}`),
                  route.label,
                ]);
              }
            } else if (isMobile) {
              document.getElementById("mobile-sheet-close")?.click();
            }
          };

          const LinkContent = (
            <div key={route.href} className="flex flex-col">
              <Link
                href={hasSubRoutes ? "#" : route.href}
                onClick={handleRouteClick}
                className={`group flex items-center justify-between rounded-lg transition-all duration-200 text-[15px] ${
                  isCollapsed && !isMobile
                    ? "justify-center py-3"
                    : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-amber-600/10 text-amber-500 font-medium"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
                }`}
                title={isCollapsed && !isMobile ? route.label : undefined}
              >
                <div className="flex items-center">
                  <route.icon
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-400 ${
                      isCollapsed && !isMobile ? "" : "mr-3"
                    } ${isActive ? "text-amber-500" : ""}`}
                  />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-all duration-300 origin-left group-hover:scale-[1.02] group-hover:translate-x-1 group-hover:text-amber-400 inline-block">
                      {route.label}
                    </span>
                  )}
                </div>
                {hasSubRoutes && (!isCollapsed || isMobile) && (
                  <div className="text-slate-400 group-hover:text-amber-400 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </Link>

              {/* SubRoutes */}
              {hasSubRoutes && (!isCollapsed || isMobile) && (
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden flex flex-col mt-1 relative">
                    <div className="absolute left-[21px] top-0 bottom-[18px] w-px bg-slate-700" />

                    {route.subRoutes!.map((subRoute) => {
                      const isSubActive = pathname === subRoute.href;
                      return (
                        <Link
                          key={subRoute.href}
                          href={subRoute.href}
                          onClick={() => {
                            if (isMobile) {
                              document
                                .getElementById("mobile-sheet-close")
                                ?.click();
                            }
                          }}
                          className="relative flex items-center group py-1.5"
                        >
                          <div className="absolute left-[21px] top-1/2 w-3 h-px bg-slate-700 transition-colors group-hover:bg-amber-500/50" />
                          <div
                            className={`ml-[40px] flex-1 rounded-md px-3 py-1.5 text-[14px] flex items-center gap-2 transition-all duration-200 ${
                              isSubActive
                                ? "bg-amber-500/10 text-amber-400 font-medium"
                                : "text-slate-400 group-hover:bg-slate-800/50"
                            }`}
                          >
                            {subRoute.icon && (
                              <subRoute.icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-400" />
                            )}
                            <span className="transition-all duration-300 origin-left group-hover:translate-x-1 group-hover:text-amber-400 inline-block">
                              {subRoute.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );

          return LinkContent;
        })}
      </div>
    </div>
  );
}
