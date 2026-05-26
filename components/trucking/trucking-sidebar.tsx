// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Map,
//   Truck,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   PlusCircle,
//   PieChart, // ✨ ADDED: Icon for the new Reports menu
// } from "lucide-react";
// import { SheetClose } from "@/components/ui/sheet";

// const routes = [
//   {
//     label: "Dashboard",
//     icon: LayoutDashboard,
//     href: "/trucking/dashboard",
//   },
//   {
//     label: "Truck Fleet",
//     icon: Truck,
//     href: "/trucking/fleet",
//   },
//   {
//     label: "Trips History",
//     icon: Map,
//     href: "/trucking/trips",
//     subRoutes: [
//       {
//         label: "New Trips",
//         href: "/trucking/trips/new",
//         icon: PlusCircle,
//       },
//     ],
//   },
//   // ✨ ADDED: The new Reports & Analytics route
//   {
//     label: "Reports",
//     icon: PieChart,
//     href: "/trucking/reports",
//   },
// ];

// export function TruckingSidebar({ isMobile = false }: { isMobile?: boolean }) {
//   const pathname = usePathname();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Auto-collapse on Tablet screens (< 1024px)
//   useEffect(() => {
//     if (isMobile) return;

//     const handleResize = () => {
//       // If screen is smaller than standard desktop (1024px), automatically collapse it
//       if (window.innerWidth < 1024) {
//         setIsCollapsed(true);
//       } else {
//         setIsCollapsed(false);
//       }
//     };

//     // Run once on load
//     handleResize();

//     // Listen for window resizing (e.g., rotating an iPad)
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isMobile]);

//   // Update CSS variable for the main content padding
//   useEffect(() => {
//     if (!isMobile) {
//       document.documentElement.style.setProperty(
//         "--sidebar-width",
//         isCollapsed ? "5rem" : "16rem",
//       );
//     }
//   }, [isCollapsed, isMobile]);

//   return (
//     <div className="flex flex-col h-full text-slate-300 relative group">
//       {/* Sidebar Header / Branding */}
//       <div
//         className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed && !isMobile ? "justify-center px-0" : "px-6 justify-between"}`}
//       >
//         {isCollapsed && !isMobile ? (
//           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
//             <Truck className="w-5 h-5 text-blue-400" />
//           </div>
//         ) : (
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
//               <Truck className="w-4 h-4 text-blue-400" />
//             </div>
//             <div>
//               <p className="text-lg font-semibold text-blue-500 leading-tight">
//                 Trucking
//               </p>
//               <p className="text-[12px] text-slate-500 leading-tight tracking-wide uppercase">
//                 Management
//               </p>
//             </div>
//           </div>
//         )}
//         {isMobile && (
//           <SheetClose
//             id="mobile-sheet-close"
//             className="p-2 -mr-2 text-slate-400 hover:text-white rounded-md transition-colors focus:outline-none"
//           >
//             <X className="w-5 h-5" />
//             <span className="sr-only">Close</span>
//           </SheetClose>
//         )}
//       </div>

//       {/* Collapse Toggle Button (Desktop Only) */}
//       {!isMobile && (
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="absolute -right-3 top-20 bg-slate-800 text-slate-100 hover:text-white border border-slate-700 rounded-full p-1 transition-opacity z-50 shadow-md"
//         >
//           {isCollapsed ? (
//             <ChevronRight className="w-4 h-4" />
//           ) : (
//             <ChevronLeft className="w-4 h-4" />
//           )}
//         </button>
//       )}

//       {/* Navigation Links */}
//       <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
//         {routes.map((route) => {
//           // Check if current path starts with route href for parent highlighting (except dashboard to avoid matching everything)
//           const isActive =
//             route.href === "/trucking/dashboard"
//               ? pathname === route.href
//               : pathname.startsWith(route.href);

//           const hasSubRoutes = !!route.subRoutes;
//           // Only expand if the current pathname exactly matches one of the subRoutes
//           const isExpanded =
//             hasSubRoutes &&
//             route.subRoutes!.some((sub) => pathname === sub.href);

//           const LinkContent = (
//             <div key={route.href} className="flex flex-col">
//               <Link
//                 href={route.href}
//                 onClick={() => {
//                   if (isMobile) {
//                     document.getElementById("mobile-sheet-close")?.click();
//                   }
//                 }}
//                 className={`flex items-center justify-between rounded-lg transition-all duration-200 text-[15px] ${
//                   isCollapsed && !isMobile
//                     ? "justify-center py-3"
//                     : "px-3 py-2.5"
//                 } ${
//                   isActive
//                     ? "bg-blue-500/10 text-blue-500 font-medium"
//                     : "hover:bg-slate-800 hover:text-white"
//                 }`}
//                 title={isCollapsed && !isMobile ? route.label : undefined}
//               >
//                 <div className="flex items-center ">
//                   <route.icon
//                     className={`w-5 h-5 transition-transform duration-300 hover:scale-110 hover:text-blue-500 ${isCollapsed && !isMobile ? "" : "mr-3"} ${isActive ? "text-blue-500" : "text-slate-400"}`}
//                   />
//                   {(!isCollapsed || isMobile) && (
//                     <span className="transition-all duration-300 origin-left hover:scale-105 hover:translate-x-1 hover:text-blue-500 inline-block">
//                       {route.label}
//                     </span>
//                   )}
//                 </div>
//               </Link>

//               {/* SubRoutes */}
//               {hasSubRoutes && (!isCollapsed || isMobile) && (
//                 <div
//                   className={`grid transition-all duration-300 ease-in-out ${
//                     isExpanded
//                       ? "grid-rows-[1fr] opacity-100"
//                       : "grid-rows-[0fr] opacity-0"
//                   }`}
//                 >
//                   <div className="overflow-hidden flex flex-col mt-1 relative">
//                     {/* Vertical line connecting to children */}
//                     <div className="absolute left-[21px] top-0 bottom-[18px] w-px bg-slate-700" />

//                     {route.subRoutes!.map((subRoute) => {
//                       const isSubActive = pathname === subRoute.href;
//                       return (
//                         <Link
//                           key={subRoute.href}
//                           href={subRoute.href}
//                           onClick={() => {
//                             if (isMobile) {
//                               document
//                                 .getElementById("mobile-sheet-close")
//                                 ?.click();
//                             }
//                           }}
//                           className="relative flex items-center group py-2"
//                         >
//                           {/* Horizontal branch 'L' */}
//                           <div className="absolute left-[21px] top-1/2 w-3 h-px bg-slate-700 transition-colors group-hover:bg-slate-500" />
//                           <div
//                             className={`ml-[40px] flex-1 rounded-md px-3 py-1.5 text-[14px] flex items-center gap-2 transition-all duration-200 ${
//                               isSubActive
//                                 ? "bg-blue-500/10 text-blue-400 font-medium"
//                                 : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
//                             }`}
//                           >
//                             {subRoute.icon && (
//                               <subRoute.icon className="w-3.5 h-3.5 transition-transform duration-300 hover:scale-110 hover:text-blue-500" />
//                             )}
//                             <span className="transition-all duration-300 origin-left hover:scale-105 hover:translate-x-1 hover:text-blue-500 inline-block">
//                               {subRoute.label}
//                             </span>
//                           </div>
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );

//           return LinkContent;
//         })}
//       </div>
//     </div>
//   );
// }

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
  PlusCircle,
  PieChart,
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
    subRoutes: [
      {
        label: "New Trips",
        href: "/trucking/trips/new",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "Reports",
    icon: PieChart,
    href: "/trucking/reports",
  },
];

export function TruckingSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed && !isMobile ? "justify-center px-0" : "px-6 justify-between"}`}
      >
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-500 leading-tight">
                Trucking
              </p>
              <p className="text-[12px] text-slate-500 leading-tight tracking-wide uppercase">
                Management
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
        {routes.map((route) => {
          // Check if current path starts with route href for parent highlighting
          const isActive =
            route.href === "/trucking/dashboard"
              ? pathname === route.href
              : pathname.startsWith(route.href);

          const hasSubRoutes = !!route.subRoutes;
          const isExpanded =
            hasSubRoutes &&
            route.subRoutes!.some((sub) => pathname === sub.href);

          const LinkContent = (
            <div key={route.href} className="flex flex-col">
              <Link
                href={route.href}
                onClick={() => {
                  if (isMobile) {
                    document.getElementById("mobile-sheet-close")?.click();
                  }
                }}
                // ✨ ADDED 'group' class here
                className={`group flex items-center justify-between rounded-lg transition-all duration-200 text-[15px] ${
                  isCollapsed && !isMobile
                    ? "justify-center py-3"
                    : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-blue-500/10 text-blue-500 font-medium"
                    : "text-slate-50 hover:bg-slate-800/60"
                }`}
                title={isCollapsed && !isMobile ? route.label : undefined}
              >
                <div className="flex items-center">
                  <route.icon
                    // ✨ UPDATED to group-hover
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-400 ${
                      isCollapsed && !isMobile ? "" : "mr-3"
                    } ${isActive ? "text-blue-500" : ""}`}
                  />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-all duration-300 origin-left group-hover:scale-[1.02] group-hover:translate-x-1 group-hover:text-blue-400 inline-block">
                      {route.label}
                    </span>
                  )}
                </div>
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
                          <div className="absolute left-[21px] top-1/2 w-3 h-px bg-slate-700 transition-colors group-hover:bg-blue-500/50" />
                          <div
                            // ✨ The inner div gets the background, letting the group-hover trigger the text/icon
                            className={`ml-[40px] flex-1 rounded-md px-3 py-1.5 text-[14px] flex items-center gap-2 transition-all duration-200 ${
                              isSubActive
                                ? "bg-blue-500/10 text-blue-400 font-medium"
                                : "text-slate-400 group-hover:bg-slate-800/50"
                            }`}
                          >
                            {subRoute.icon && (
                              <subRoute.icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-400" />
                            )}
                            <span className="transition-all duration-300 origin-left group-hover:translate-x-1 group-hover:text-blue-400 inline-block">
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
