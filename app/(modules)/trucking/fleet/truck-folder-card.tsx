// "use client";

// import { useState, useRef, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation"; // ✨ Added useRouter
// import {
//   Truck,
//   CheckCircle2,
//   Wrench,
//   XCircle,
//   FolderOpen,
//   Loader2,
//   DollarSign,
//   Activity,
//   FileSpreadsheet,
//   Settings,
//   ShieldCheck,
//   X,
//   FilterX,
//   BarChart3,
//   Edit,
//   Trash2,
//   MoreHorizontal,
//   MoreVertical,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";

// // ✨ Added Dialog, Input, and Label for the Edit Modal
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import { DataTable } from "../trips/data-table";
// import { columns } from "../trips/columns";

// // ✨ Imported our new Server Actions
// import {
//   getTruckTrips,
//   deleteTruck,
//   updateTruck,
// } from "@/app/actions/truck-actions";

// function AnimatedNumber({
//   value,
//   isCurrency = false,
// }: {
//   value: number;
//   isCurrency?: boolean;
// }) {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     let startTime: number;
//     const startValue = current;
//     const distance = value - startValue;

//     if (distance === 0) return;

//     const animate = (timestamp: number) => {
//       if (!startTime) startTime = timestamp;
//       const progress = timestamp - startTime;
//       const percentage = Math.min(progress / 1000, 1);

//       const easeOut = 1 - Math.pow(1 - percentage, 4);

//       setCurrent(startValue + distance * easeOut);

//       if (percentage < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         setCurrent(value);
//       }
//     };

//     const rafId = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId);
//   }, [value]);

//   if (isCurrency) {
//     return (
//       <>
//         {new Intl.NumberFormat("en-PH", {
//           style: "currency",
//           currency: "PHP",
//         }).format(current)}
//       </>
//     );
//   }

//   return <>{Math.round(current)}</>;
// }

// export function TruckFolderCard({
//   truck,
//   viewMode = "grid",
// }: {
//   truck: any;
//   viewMode?: "grid" | "list";
// }) {
//   const router = useRouter(); // ✨ Used to refresh the UI

//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isDashboardOpen, setIsDashboardOpen] = useState(false);

//   // ✨ NEW: States for Edit/Delete logic
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);

//   // ✨ State to hold the form data while editing
//   const [editForm, setEditForm] = useState({
//     fleetCode: truck.fleetCode || "",
//     plateNumber: truck.plateNumber || "",
//     status: truck.status || "active",
//   });

//   const [trips, setTrips] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const [selectedYear, setSelectedYear] = useState<string>("all");
//   const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
//   const [selectedDestination, setSelectedDestination] = useState<string>("all");

//   const dashboardRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (isDashboardOpen && dashboardRef.current) dashboardRef.current.focus();
//   }, [isDashboardOpen]);

//   // ✨ NEW: Listen for 'trip-updated' events to silently refresh data in real-time
//   useEffect(() => {
//     const handleTripUpdate = async () => {
//       if (isDashboardOpen || isProfileOpen) {
//         const result = await getTruckTrips(truck.id);
//         if (result.success && result.data) {
//           setTrips(result.data);
//         }
//       }
//     };

//     window.addEventListener("trip-updated", handleTripUpdate);
//     return () => window.removeEventListener("trip-updated", handleTripUpdate);
//   }, [isDashboardOpen, isProfileOpen, truck.id]);

//   const handleOpenProfile = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsProfileOpen(true);
//     setIsLoading(true);

//     setSelectedYear("all");
//     setSelectedCustomer("all");
//     setSelectedDestination("all");

//     const result = await getTruckTrips(truck.id);
//     if (result.success && result.data) {
//       setTrips(result.data);
//     } else {
//       toast.error("Failed to load truck history.");
//     }

//     setIsLoading(false);
//   };

//   // ✨ THE WORKING EDIT HANDLER
//   const handleEditTruck = () => {
//     setIsEditDialogOpen(true); // Opens the modal
//   };

//   const handleEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsUpdating(true);

//     const result = await updateTruck(truck.id, editForm);

//     if (result.success) {
//       toast.success("Truck details updated successfully!");
//       setIsEditDialogOpen(false); // Close the edit modal
//       router.refresh(); // Refresh the page to show new details
//     } else {
//       toast.error(result.error || "Failed to update truck.");
//     }

//     setIsUpdating(false);
//   };

//   // ✨ THE WORKING DELETE HANDLER
//   const confirmDelete = async () => {
//     setIsDeleting(true);
//     const toastId = toast.loading("Deleting truck...");

//     const result = await deleteTruck(truck.id);

//     if (result.success) {
//       toast.success(`Truck ${truck.fleetCode} deleted successfully.`, {
//         id: toastId,
//       });
//       setIsDeleteDialogOpen(false);
//       setIsProfileOpen(false); // Close the side panel
//       router.refresh(); // Tell Next.js to fetch fresh data
//     } else {
//       toast.error(result.error || "Failed to delete truck.", { id: toastId });
//     }

//     setIsDeleting(false);
//   };

//   const uniqueYears = useMemo(() => {
//     const years = new Set(
//       trips.map((t) => new Date(t.date).getFullYear().toString()),
//     );
//     return Array.from(years).sort().reverse();
//   }, [trips]);

//   const uniqueCustomers = useMemo(() => {
//     return Array.from(new Set(trips.map((t) => t.customerId))).sort();
//   }, [trips]);

//   const uniqueDestinations = useMemo(() => {
//     return Array.from(new Set(trips.map((t) => t.destination))).sort();
//   }, [trips]);

//   const filteredTrips = useMemo(() => {
//     return trips.filter((t) => {
//       const matchYear =
//         selectedYear === "all" ||
//         new Date(t.date).getFullYear().toString() === selectedYear;
//       const matchCustomer =
//         selectedCustomer === "all" || t.customerId === selectedCustomer;
//       const matchDestination =
//         selectedDestination === "all" || t.destination === selectedDestination;
//       return matchYear && matchCustomer && matchDestination;
//     });
//   }, [trips, selectedYear, selectedCustomer, selectedDestination]);

//   const lifetimeTrips = trips.length;
//   const lifetimeGross = trips.reduce((sum, t) => sum + t.qtyHeads * t.rate, 0);
//   const lifetimeExpenses = trips.reduce(
//     (sum, t) =>
//       sum +
//       (t.tollFees +
//         t.dieselCash +
//         t.dieselPo +
//         t.meals +
//         t.roroShip +
//         t.salary +
//         t.others),
//     0,
//   );
//   const lifetimeNet = lifetimeGross - lifetimeExpenses;

//   const filteredTotalTrips = filteredTrips.length;
//   const filteredTotalGross = filteredTrips.reduce(
//     (sum, t) => sum + t.qtyHeads * t.rate,
//     0,
//   );
//   const filteredTotalExpenses = filteredTrips.reduce(
//     (sum, t) =>
//       sum +
//       (t.tollFees +
//         t.dieselCash +
//         t.dieselPo +
//         t.meals +
//         t.roroShip +
//         t.salary +
//         t.others),
//     0,
//   );
//   const filteredTotalNet = filteredTotalGross - filteredTotalExpenses;

//   const formatPHP = (amount: number) =>
//     new Intl.NumberFormat("en-PH", {
//       style: "currency",
//       currency: "PHP",
//     }).format(amount);

//   const hasActiveFilters =
//     selectedYear !== "all" ||
//     selectedCustomer !== "all" ||
//     selectedDestination !== "all";

//   const renderCardUI = () => {
//     if (viewMode === "list") {
//       return (
//         <div
//           onClick={handleOpenProfile}
//           className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group gap-4 w-full"
//         >
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
//               <Truck className="w-5 h-5" />
//             </div>
//             <div>
//               <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
//                 {truck.fleetCode}{" "}
//                 <span className="text-slate-400 font-normal">-</span>{" "}
//                 <span className="font-mono text-slate-600 dark:text-slate-400">
//                   {truck.plateNumber}
//                 </span>
//               </h3>
//               <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
//                 <FolderOpen className="w-3 h-3" /> Digital Logistics Asset
//               </p>
//             </div>
//           </div>
//           <div>
//             {truck.status === "active" && (
//               <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-none px-2.5 py-1 text-xs font-bold">
//                 <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
//               </Badge>
//             )}
//             {truck.status === "maintenance" && (
//               <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-none px-2.5 py-1 text-xs font-bold">
//                 <Wrench className="w-3.5 h-3.5 mr-1.5" /> Garage
//               </Badge>
//             )}
//             {truck.status === "inactive" && (
//               <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-none px-2.5 py-1 text-xs font-bold">
//                 <XCircle className="w-3.5 h-3.5 mr-1.5" /> Inactive
//               </Badge>
//             )}
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div
//         onClick={handleOpenProfile}
//         className="relative group flex flex-col items-center justify-center w-full max-w-[260px] sm:max-w-[270px] mx-auto h-[150px] sm:h-[160px] cursor-pointer transition-transform duration-300 hover:scale-105"
//       >
//         <div className="file relative w-full h-full origin-bottom perspective-[1500px] z-10">
//           <div className="work-5 bg-amber-600 dark:bg-amber-700 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[35%] after:h-4 after:bg-amber-600 dark:after:bg-amber-700 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-15px] before:left-[calc(35%-4px)] before:w-4 before:h-4 before:bg-amber-600 dark:before:bg-amber-700 before:[clip-path:polygon(0_35%,0%_100%,50%_100%)]" />

//           <div className="work-4 absolute inset-1 bg-zinc-400 dark:bg-zinc-600 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:transform-[rotateX(-20deg)]" />
//           <div className="work-3 absolute inset-1 bg-zinc-300 dark:bg-zinc-500 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-30deg)]" />
//           <div className="work-2 absolute inset-1 bg-zinc-100 dark:bg-slate-200 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-38deg)] p-4 sm:p-5 flex flex-col gap-1.5 sm:gap-2 shadow-inner overflow-hidden">
//             <div className="w-1/3 h-2 sm:h-2.5 bg-zinc-200 dark:bg-slate-300 rounded-full mb-1"></div>
//             <div className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
//             <div className="w-5/6 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
//             <div className="w-4/5 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
//             <div className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full mt-2"></div>
//             <div className="w-3/4 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
//             <div className="mt-auto flex justify-end">
//               <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-zinc-200 dark:border-slate-300 rounded-full flex items-center justify-center opacity-50 transform -rotate-12">
//                 <span className="text-[7px] sm:text-[9px] font-bold text-zinc-300 dark:text-slate-400">
//                   OK
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="work-1 absolute bottom-0 bg-linear-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500 w-full h-[calc(100%-4px)] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[50%] after:h-[16px] after:bg-amber-400 dark:after:bg-amber-500 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-10px] before:right-[calc(50%-4px)] before:size-3 before:bg-amber-400 dark:before:bg-amber-500 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%)] transition-all ease duration-300 origin-bottom flex flex-col justify-between p-3 sm:p-4 group-hover:shadow-[inset_0_20px_40px_#fbbf24,inset_0_-20px_40px_#d97706] dark:group-hover:shadow-[inset_0_20px_40px_#b45309,inset_0_-20px_40px_#92400e] group-hover:transform-[rotateX(-46deg)_translateY(1px)]">
//             <div className="flex justify-between items-start">
//               <div className="p-1.5 sm:p-2 bg-white/20 dark:bg-black/20 rounded-md sm:rounded-lg text-amber-50 dark:text-amber-100 group-hover:bg-white/30 transition-colors">
//                 <FolderOpen
//                   className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110"
//                   strokeWidth={2}
//                 />
//               </div>
//               <div>
//                 {truck.status === "active" && (
//                   <Badge className="bg-emerald-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
//                     <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
//                     Active
//                   </Badge>
//                 )}
//                 {truck.status === "maintenance" && (
//                   <Badge className="bg-orange-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
//                     <Wrench className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> Garage
//                   </Badge>
//                 )}
//                 {truck.status === "inactive" && (
//                   <Badge className="bg-slate-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
//                     <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
//                     Inactive
//                   </Badge>
//                 )}
//               </div>
//             </div>

//             <div className="mt-1 sm:mt-2">
//               <h3 className="text-sm sm:text-base font-black text-white flex flex-wrap items-center gap-x-1.5 gap-y-0.5 tracking-tight drop-shadow-sm">
//                 <span className="truncate max-w-full">{truck.fleetCode}</span>
//                 <span className="text-white font-normal shrink-0">-</span>
//                 <span className="font-mono text-sm sm:text-base text-white truncate max-w-full">
//                   {truck.plateNumber}
//                 </span>
//               </h3>
//               <p className="text-[9px] sm:text-[10px] text-white font-medium mt-0.5 sm:mt-1 flex items-center gap-1">
//                 <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Logistics Asset
//               </p>
//             </div>

//             <div className="mt-auto pt-2 sm:pt-3 border-t border-amber-300/30 dark:border-amber-700/50 flex justify-between items-center">
//               {truck.isActive ? (
//                 <div className="flex items-center gap-1.5">
//                   <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-400"></span>
//                   </span>
//                   <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-emerald-100 uppercase">
//                     Operational
//                   </span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-1.5">
//                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-400"></span>
//                   <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-red-100 uppercase">
//                     Disabled
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       {/* 1. THE ASSET RENDER */}
//       {renderCardUI()}

//       {/* 2. THE SLIDE-OUT ASSET PROFILE */}
//       <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
//         <SheetContent className="sm:max-w-[450px] w-full flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-0">
//           <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-90 z-10" />

//           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
//             <SheetHeader className="mb-6 sm:mb-8 relative bg-linear-to-br from-blue-600 to-indigo-700 p-4 sm:p-5 rounded-2xl shadow-md mt-2 sm:mt-0 overflow-hidden text-white">
//               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

//               <div className="flex justify-between items-center w-full gap-2 relative z-10">
//                 <SheetTitle className="flex items-center gap-3 font-black text-white min-w-0">
//                   <div className="p-2 sm:p-2.5 shrink-0">
//                     <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                   </div>
//                   <div className="text-left min-w-0">
//                     <div className="text-lg sm:text-xl truncate drop-shadow-md">
//                       {truck.fleetCode}{" "}
//                       <span className="text-white/60 font-normal shrink-0">
//                         -
//                       </span>{" "}
//                       {truck.plateNumber}
//                     </div>
//                   </div>
//                 </SheetTitle>

//                 <div className="flex items-center gap-1.5 shrink-0">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-white/20 text-white border-0 shadow-none focus-visible:ring-transparent"
//                         title="Options"
//                       >
//                         <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 " />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent
//                       align="end"
//                       className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-lg"
//                     >
//                       <DropdownMenuItem
//                         onClick={handleEditTruck}
//                         className="cursor-pointer gap-2 py-2"
//                       >
//                         <Edit className="w-4 h-4 text-slate-500" />
//                         <span className="font-medium text-slate-700 dark:text-slate-300">
//                           Edit Details
//                         </span>
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator className="bg-slate-100 dark:border-slate-800" />
//                       <DropdownMenuItem
//                         onClick={(e) => {
//                           e.preventDefault();
//                           setIsDeleteDialogOpen(true);
//                         }}
//                         className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 gap-2 py-2"
//                       >
//                         {isDeleting ? (
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Trash2 className="w-4 h-4" />
//                         )}
//                         <span className="font-medium">Delete Truck</span>
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               </div>
//             </SheetHeader>

//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center py-20 text-slate-500">
//                 <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
//                 <p className="font-medium animate-pulse">
//                   Loading asset metrics...
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-8 pb-4">
//                 <div className="space-y-3">
//                   <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
//                     Lifetime Overview
//                   </h4>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
//                       <div className="text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase mb-1">
//                         Total Trips
//                       </div>
//                       <div className="text-sm font-black text-slate-800 dark:text-slate-100">
//                         {lifetimeTrips}
//                       </div>
//                     </div>
//                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
//                       <div className="text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase mb-1">
//                         Net Income
//                       </div>
//                       <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
//                         {formatPHP(lifetimeNet)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
//                     Hardware Details
//                   </h4>
//                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
//                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
//                       <span className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-2 shrink-0">
//                         <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
//                         Engine No.
//                       </span>
//                       <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-slate-200 text-right truncate">
//                         4HF1-88392A
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
//                       <span className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-2 shrink-0">
//                         <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
//                         Chassis No.
//                       </span>
//                       <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-slate-200 text-right truncate">
//                         NKR66E-72819
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center gap-3">
//                       <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
//                         LTO Expiry
//                       </span>
//                       <span className="text-xs sm:text-sm font-bold text-rose-600 text-right">
//                         Oct 2026
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Fixed Footer */}
//           {!isLoading && (
//             <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
//               <Button
//                 onClick={() => {
//                   setIsDashboardOpen(true);
//                   setIsProfileOpen(false);
//                 }}
//                 className="relative w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-bold text-sm sm:text-base"
//               >
//                 <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
//                 <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
//                 Open Analytics & Ledgers
//               </Button>
//             </div>
//           )}
//         </SheetContent>
//       </Sheet>

//       {/* 3. ✨ THE UNIFIED FULL-SCREEN DASHBOARD MODAL */}
//       {isDashboardOpen && (
//         <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
//           <div
//             ref={dashboardRef}
//             tabIndex={0}
//             className="bg-slate-50 dark:bg-slate-950 w-full h-full sm:h-[95vh] max-w-[1500px] rounded-none sm:rounded-lg shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-800 outline-none animate-in zoom-in-95 sm:zoom-in-100 duration-200"
//           >
//             <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
//               <div>
//                 <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
//                   <FileSpreadsheet className="w-5 h-5 text-blue-600 hidden sm:block" />
//                   Asset Dashboard: {truck.fleetCode}
//                 </h2>
//                 <p className="text-[11px] sm:text-sm font-medium text-slate-500 mt-0.5">
//                   Plate:{" "}
//                   <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
//                     {truck.plateNumber}
//                   </span>
//                 </p>
//               </div>
//               <button
//                 onClick={() => setIsDashboardOpen(false)}
//                 className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 outline-none"
//               >
//                 <X className="w-5 h-5 sm:w-6 sm:h-6" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar bg-slate-50 dark:bg-slate-950 space-y-4">
//               {/* SECTION A: FILTERS */}
//               <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
//                 <div className="flex justify-between items-center mb-5">
//                   <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
//                     <FilterX className="w-4 h-4 text-slate-400 hidden sm:block" />{" "}
//                     Filter Records
//                   </h4>
//                   {hasActiveFilters && (
//                     <button
//                       onClick={() => {
//                         setSelectedYear("all");
//                         setSelectedCustomer("all");
//                         setSelectedDestination("all");
//                       }}
//                       className="text-xs flex items-center gap-1 font-bold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-lg"
//                     >
//                       <FilterX className="w-3.5 h-3.5" /> Clear All Filters
//                     </button>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
//                       Period / Year
//                     </label>
//                     <Select
//                       value={selectedYear}
//                       onValueChange={setSelectedYear}
//                     >
//                       <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl font-semibold focus:ring-blue-500/50">
//                         <SelectValue placeholder="All Years" />
//                       </SelectTrigger>
//                       <SelectContent className="z-110 rounded-xl border-slate-200 dark:border-slate-800">
//                         <SelectItem value="all" className="font-bold">
//                           All Years
//                         </SelectItem>
//                         {uniqueYears.map((year) => (
//                           <SelectItem key={year} value={year}>
//                             {year}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
//                       Customer / Client
//                     </label>
//                     <Select
//                       value={selectedCustomer}
//                       onValueChange={setSelectedCustomer}
//                     >
//                       <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl font-semibold focus:ring-blue-500/50">
//                         <SelectValue placeholder="All Customers" />
//                       </SelectTrigger>
//                       <SelectContent className="z-110 rounded-xl border-slate-200 dark:border-slate-800">
//                         <SelectItem value="all" className="font-bold">
//                           All Customers
//                         </SelectItem>
//                         {uniqueCustomers.map((c) => (
//                           <SelectItem key={c} value={c}>
//                             {c}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
//                       Delivery Route
//                     </label>
//                     <Select
//                       value={selectedDestination}
//                       onValueChange={setSelectedDestination}
//                     >
//                       <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl font-semibold truncate focus:ring-blue-500/50">
//                         <SelectValue placeholder="All Routes" />
//                       </SelectTrigger>
//                       <SelectContent className="z-110 rounded-xl border-slate-200 dark:border-slate-800">
//                         <SelectItem value="all" className="font-bold">
//                           All Routes
//                         </SelectItem>
//                         {uniqueDestinations.map((d) => (
//                           <SelectItem key={d} value={d}>
//                             {d}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </div>

//               {/* SECTION B: ANALYTICS METRICS (✨ Unified Card Design) */}
//               {filteredTrips.length === 0 ? (
//                 <div className="bg-slate-50 dark:bg-[#0a1520] border border-slate-200 dark:border-white/10 rounded-xl p-8 text-center shrink-0">
//                   <Activity className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-3" />
//                   <p className="text-sm font-medium text-slate-500 dark:text-white/40">
//                     No trips match these specific filters.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 shrink-0">
//                   {/* Net Income */}
//                   <div className="bg-emerald-50 dark:bg-[#0a2e1a] rounded-lg p-4 border border-emerald-200/60 dark:border-[#3dff9a]/15 relative overflow-hidden">
//                     <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-emerald-500 dark:bg-[#3dff9a] opacity-10 pointer-events-none" />
//                     <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 dark:text-[#3dff9a] mb-2 relative z-10">
//                       Net Income
//                     </p>
//                     <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
//                       <AnimatedNumber
//                         value={filteredTotalNet}
//                         isCurrency={true}
//                       />
//                     </div>
//                   </div>

//                   {/* Gross */}
//                   <div className="bg-blue-50 dark:bg-[#0d1f3c] rounded-lg p-4 border border-blue-200/60 dark:border-[#5cabff]/15 relative overflow-hidden">
//                     <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-blue-500 dark:bg-[#5cabff] opacity-10 pointer-events-none" />
//                     <p className="text-[10px] font-bold tracking-widest uppercase text-blue-700 dark:text-[#5cabff] mb-2 relative z-10">
//                       Collectibles
//                     </p>
//                     <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
//                       <AnimatedNumber
//                         value={filteredTotalGross}
//                         isCurrency={true}
//                       />
//                     </div>
//                   </div>

//                   {/* Expenses */}
//                   <div className="bg-rose-50 dark:bg-[#2d0d1a] rounded-lg p-4 border border-rose-200/60 dark:border-[#ff5c8a]/15 relative overflow-hidden">
//                     <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-rose-500 dark:bg-[#ff5c8a] opacity-10 pointer-events-none" />
//                     <p className="text-[10px] font-bold tracking-widest uppercase text-rose-700 dark:text-[#ff5c8a] mb-2 relative z-10">
//                       Expenses
//                     </p>
//                     <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
//                       <AnimatedNumber
//                         value={filteredTotalExpenses}
//                         isCurrency={true}
//                       />
//                     </div>
//                   </div>

//                   {/* Trips */}
//                   <div className="bg-purple-50 dark:bg-[#160b2e] rounded-lg p-4 border border-purple-200/60 dark:border-[#b97aff]/15 relative overflow-hidden">
//                     <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-purple-500 dark:bg-[#b97aff] opacity-10 pointer-events-none" />
//                     <p className="text-[10px] font-bold tracking-widest uppercase text-purple-700 dark:text-[#b97aff] mb-2 relative z-10">
//                       Trips
//                     </p>
//                     <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
//                       <AnimatedNumber value={filteredTotalTrips} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* SECTION C: THE FILTERED DATA TABLE */}
//               <div className="shrink-0 w-full mt-2">
//                 <DataTable columns={columns} data={filteredTrips} />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 4. ✨ NEW: THE EDIT TRUCK MODAL */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-black">
//               Edit Asset Details
//             </DialogTitle>
//             <DialogDescription>
//               Update the registration and operational status of this truck.
//             </DialogDescription>
//           </DialogHeader>

//           <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label
//                 htmlFor="fleetCode"
//                 className="text-xs font-bold uppercase tracking-wider text-slate-500"
//               >
//                 Fleet Code / Name
//               </Label>
//               <Input
//                 id="fleetCode"
//                 value={editForm.fleetCode}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, fleetCode: e.target.value })
//                 }
//                 className="w-full h-[46px]! border-slate-200 dark:border-slate-800/80  rounded-xl bg-white dark:bg-slate-900"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label
//                 htmlFor="plateNumber"
//                 className="text-xs font-bold uppercase tracking-wider text-slate-500"
//               >
//                 Plate Number
//               </Label>
//               <Input
//                 id="plateNumber"
//                 value={editForm.plateNumber}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, plateNumber: e.target.value })
//                 }
//                 className="w-full h-11 border-slate-200 dark:border-slate-800/80  rounded-xl font-mono uppercase bg-white dark:bg-slate-900"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
//                 Operational Status
//               </Label>
//               <Select
//                 value={editForm.status}
//                 onValueChange={(val) =>
//                   setEditForm({ ...editForm, status: val })
//                 }
//               >
//                 <SelectTrigger className="w-full h-[46px]! border-slate-200 dark:border-slate-800/80  rounded-xl bg-white dark:bg-slate-900">
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent className="rounded-xl z-150">
//                   <SelectItem value="active">
//                     <div className="flex items-center text-emerald-600 font-bold">
//                       <CheckCircle2 className="w-4 h-4 mr-2" /> Active
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="maintenance">
//                     <div className="flex items-center text-orange-500 font-bold">
//                       <Wrench className="w-4 h-4 mr-2" /> Garage / Maintenance
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="inactive">
//                     <div className="flex items-center text-slate-500 font-bold">
//                       <XCircle className="w-4 h-4 mr-2" /> Inactive
//                     </div>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsEditDialogOpen(false)}
//                 className="rounded-xl h-11 w-full sm:w-auto"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={isUpdating}
//                 className="rounded-xl h-11 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold"
//               >
//                 {isUpdating ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
//                   </>
//                 ) : (
//                   "Save Changes"
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* 5. ✨ NEW: THE DELETE CONFIRMATION ALERT */}
//       <AlertDialog
//         open={isDeleteDialogOpen}
//         onOpenChange={setIsDeleteDialogOpen}
//       >
//         <AlertDialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl max-w-md">
//           <AlertDialogHeader className="flex flex-row items-start gap-4 text-left sm:text-left">
//             <div className="shrink-0 w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mt-1">
//               <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
//             </div>
//             <div className="flex flex-col flex-1">
//               <AlertDialogTitle className="text-xl font-black text-slate-800 dark:text-slate-100">
//                 Delete Truck Asset
//               </AlertDialogTitle>
//               <AlertDialogDescription className="text-slate-500 mt-1.5 text-sm sm:text-base leading-relaxed">
//                 Are you sure you want to permanently delete{" "}
//                 <span className="font-bold text-slate-700 dark:text-slate-300">
//                   {truck.fleetCode} ({truck.plateNumber})
//                 </span>
//                 ? This action cannot be undone and will remove the truck from
//                 your fleet.
//               </AlertDialogDescription>
//             </div>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-center">
//             <AlertDialogCancel
//               disabled={isDeleting}
//               className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
//             >
//               Cancel
//             </AlertDialogCancel>
//             <Button
//               variant="destructive"
//               disabled={isDeleting}
//               onClick={confirmDelete}
//               className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
//                 </>
//               ) : (
//                 "Yes, Delete Asset"
//               )}
//             </Button>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  CheckCircle2,
  Wrench,
  XCircle,
  FolderOpen,
  Loader2,
  DollarSign,
  Activity,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  X,
  FilterX,
  BarChart3,
  Edit,
  Trash2,
  MoreHorizontal,
  MoreVertical,
  Save, // ✨ Added Save icon for the button
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DataTable } from "../trips/data-table";
import { columns } from "../trips/columns";

import {
  getTruckTrips,
  deleteTruck,
  updateTruck,
} from "@/app/actions/truck-actions";

function AnimatedNumber({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = current;
    const distance = value - startValue;

    if (distance === 0) return;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / 1000, 1);

      const easeOut = 1 - Math.pow(1 - percentage, 4);

      setCurrent(startValue + distance * easeOut);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(value);
      }
    };

    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  if (isCurrency) {
    return (
      <>
        {new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(current)}
      </>
    );
  }

  return <>{Math.round(current)}</>;
}

export function TruckFolderCard({
  truck,
  viewMode = "grid",
}: {
  truck: any;
  viewMode?: "grid" | "list";
}) {
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [editForm, setEditForm] = useState({
    fleetCode: truck.fleetCode || "",
    plateNumber: truck.plateNumber || "",
    status: truck.status || "active",
  });

  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDashboardOpen && dashboardRef.current) dashboardRef.current.focus();
  }, [isDashboardOpen]);

  useEffect(() => {
    const handleTripUpdate = async () => {
      if (isDashboardOpen || isProfileOpen) {
        const result = await getTruckTrips(truck.id);
        if (result.success && result.data) {
          setTrips(result.data);
        }
      }
    };

    window.addEventListener("trip-updated", handleTripUpdate);
    return () => window.removeEventListener("trip-updated", handleTripUpdate);
  }, [isDashboardOpen, isProfileOpen, truck.id]);

  const handleOpenProfile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileOpen(true);
    setIsLoading(true);

    setSelectedYear("all");
    setSelectedCustomer("all");
    setSelectedDestination("all");

    const result = await getTruckTrips(truck.id);
    if (result.success && result.data) {
      setTrips(result.data);
    } else {
      toast.error("Failed to load truck history.");
    }

    setIsLoading(false);
  };

  const handleEditTruck = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const result = await updateTruck(truck.id, editForm);

    if (result.success) {
      toast.success("Truck details updated successfully!");
      setIsEditDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update truck.");
    }

    setIsUpdating(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting truck...");

    const result = await deleteTruck(truck.id);

    if (result.success) {
      toast.success(`Truck ${truck.fleetCode} deleted successfully.`, {
        id: toastId,
      });
      setIsDeleteDialogOpen(false);
      setIsProfileOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete truck.", { id: toastId });
    }

    setIsDeleting(false);
  };

  const uniqueYears = useMemo(() => {
    const years = new Set(
      trips.map((t) => new Date(t.date).getFullYear().toString()),
    );
    return Array.from(years).sort().reverse();
  }, [trips]);

  const uniqueCustomers = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.customerId))).sort();
  }, [trips]);

  const uniqueDestinations = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.destination))).sort();
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchYear =
        selectedYear === "all" ||
        new Date(t.date).getFullYear().toString() === selectedYear;
      const matchCustomer =
        selectedCustomer === "all" || t.customerId === selectedCustomer;
      const matchDestination =
        selectedDestination === "all" || t.destination === selectedDestination;
      return matchYear && matchCustomer && matchDestination;
    });
  }, [trips, selectedYear, selectedCustomer, selectedDestination]);

  const lifetimeTrips = trips.length;
  const lifetimeGross = trips.reduce((sum, t) => sum + t.qtyHeads * t.rate, 0);
  const lifetimeExpenses = trips.reduce(
    (sum, t) =>
      sum +
      (t.tollFees +
        t.dieselCash +
        t.dieselPo +
        t.meals +
        t.roroShip +
        t.salary +
        t.others),
    0,
  );
  const lifetimeNet = lifetimeGross - lifetimeExpenses;

  const filteredTotalTrips = filteredTrips.length;
  const filteredTotalGross = filteredTrips.reduce(
    (sum, t) => sum + t.qtyHeads * t.rate,
    0,
  );
  const filteredTotalExpenses = filteredTrips.reduce(
    (sum, t) =>
      sum +
      (t.tollFees +
        t.dieselCash +
        t.dieselPo +
        t.meals +
        t.roroShip +
        t.salary +
        t.others),
    0,
  );
  const filteredTotalNet = filteredTotalGross - filteredTotalExpenses;

  const formatPHP = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const hasActiveFilters =
    selectedYear !== "all" ||
    selectedCustomer !== "all" ||
    selectedDestination !== "all";

  const renderCardUI = () => {
    if (viewMode === "list") {
      return (
        <div
          onClick={handleOpenProfile}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group gap-4 w-full"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {truck.fleetCode}{" "}
                <span className="text-slate-400 font-normal">-</span>{" "}
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {truck.plateNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Digital Logistics Asset
              </p>
            </div>
          </div>
          <div>
            {truck.status === "active" && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-none px-2.5 py-1 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
              </Badge>
            )}
            {truck.status === "maintenance" && (
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-none px-2.5 py-1 text-xs font-bold">
                <Wrench className="w-3.5 h-3.5 mr-1.5" /> Garage
              </Badge>
            )}
            {truck.status === "inactive" && (
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-none px-2.5 py-1 text-xs font-bold">
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Inactive
              </Badge>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={handleOpenProfile}
        className="relative group flex flex-col items-center justify-center w-full max-w-[260px] sm:max-w-[270px] mx-auto h-[150px] sm:h-[160px] cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        <div className="file relative w-full h-full origin-bottom perspective-[1500px] z-10">
          <div className="work-5 bg-amber-600 dark:bg-amber-700 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[35%] after:h-4 after:bg-amber-600 dark:after:bg-amber-700 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-15px] before:left-[calc(35%-4px)] before:w-4 before:h-4 before:bg-amber-600 dark:before:bg-amber-700 before:[clip-path:polygon(0_35%,0%_100%,50%_100%)]" />

          <div className="work-4 absolute inset-1 bg-zinc-400 dark:bg-zinc-600 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:transform-[rotateX(-20deg)]" />
          <div className="work-3 absolute inset-1 bg-zinc-300 dark:bg-zinc-500 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-30deg)]" />
          <div className="work-2 absolute inset-1 bg-zinc-100 dark:bg-slate-200 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-38deg)] p-4 sm:p-5 flex flex-col gap-1.5 sm:gap-2 shadow-inner overflow-hidden">
            <div className="w-1/3 h-2 sm:h-2.5 bg-zinc-200 dark:bg-slate-300 rounded-full mb-1"></div>
            <div className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
            <div className="w-5/6 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
            <div className="w-4/5 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
            <div className="w-full h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full mt-2"></div>
            <div className="w-3/4 h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full"></div>
            <div className="mt-auto flex justify-end">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-zinc-200 dark:border-slate-300 rounded-full flex items-center justify-center opacity-50 transform -rotate-12">
                <span className="text-[7px] sm:text-[9px] font-bold text-zinc-300 dark:text-slate-400">
                  OK
                </span>
              </div>
            </div>
          </div>

          <div className="work-1 absolute bottom-0 bg-linear-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500 w-full h-[calc(100%-4px)] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[50%] after:h-[16px] after:bg-amber-400 dark:after:bg-amber-500 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-10px] before:right-[calc(50%-4px)] before:size-3 before:bg-amber-400 dark:before:bg-amber-500 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%)] transition-all ease duration-300 origin-bottom flex flex-col justify-between p-3 sm:p-4 group-hover:shadow-[inset_0_20px_40px_#fbbf24,inset_0_-20px_40px_#d97706] dark:group-hover:shadow-[inset_0_20px_40px_#b45309,inset_0_-20px_40px_#92400e] group-hover:transform-[rotateX(-46deg)_translateY(1px)]">
            <div className="flex justify-between items-start">
              <div className="p-1.5 sm:p-2 bg-white/20 dark:bg-black/20 rounded-md sm:rounded-lg text-amber-50 dark:text-amber-100 group-hover:bg-white/30 transition-colors">
                <FolderOpen
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110"
                  strokeWidth={2}
                />
              </div>
              <div>
                {truck.status === "active" && (
                  <Badge className="bg-emerald-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
                    Active
                  </Badge>
                )}
                {truck.status === "maintenance" && (
                  <Badge className="bg-orange-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
                    <Wrench className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> Garage
                  </Badge>
                )}
                {truck.status === "inactive" && (
                  <Badge className="bg-slate-500 text-white border-none shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-[10px]">
                    <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{" "}
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-1 sm:mt-2">
              <h3 className="text-sm sm:text-base font-black text-white flex flex-wrap items-center gap-x-1.5 gap-y-0.5 tracking-tight drop-shadow-sm">
                <span className="truncate max-w-full">{truck.fleetCode}</span>
                <span className="text-white font-normal shrink-0">-</span>
                <span className="font-mono text-sm sm:text-base text-white truncate max-w-full">
                  {truck.plateNumber}
                </span>
              </h3>
              <p className="text-[9px] sm:text-[10px] text-white font-medium mt-0.5 sm:mt-1 flex items-center gap-1">
                <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Logistics Asset
              </p>
            </div>

            <div className="mt-auto pt-2 sm:pt-3 border-t border-amber-300/30 dark:border-amber-700/50 flex justify-between items-center">
              {truck.isActive ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-emerald-100 uppercase">
                    Operational
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-400"></span>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-red-100 uppercase">
                    Disabled
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. THE ASSET RENDER */}
      {renderCardUI()}

      {/* 2. THE SLIDE-OUT ASSET PROFILE */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="sm:max-w-[450px] w-full flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-0">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-90 z-10" />

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <SheetHeader className="mb-6 sm:mb-8 relative bg-linear-to-br from-blue-600 to-indigo-700 p-4 sm:p-5 rounded-2xl shadow-md mt-2 sm:mt-0 overflow-hidden text-white">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

              <div className="flex justify-between items-center w-full gap-2 relative z-10">
                <SheetTitle className="flex items-center gap-3 font-black text-white min-w-0">
                  <div className="p-2 sm:p-2.5 shrink-0">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-lg sm:text-xl truncate drop-shadow-md">
                      {truck.fleetCode}{" "}
                      <span className="text-white/60 font-normal shrink-0">
                        -
                      </span>{" "}
                      {truck.plateNumber}
                    </div>
                  </div>
                </SheetTitle>

                <div className="flex items-center gap-1.5 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-white/20 text-white border-0 shadow-none focus-visible:ring-transparent"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 " />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-lg"
                    >
                      <DropdownMenuItem
                        onClick={handleEditTruck}
                        className="cursor-pointer gap-2 py-2"
                      >
                        <Edit className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Edit Details
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100 dark:border-slate-800" />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDeleteDialogOpen(true);
                        }}
                        className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 gap-2 py-2"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span className="font-medium">Delete Truck</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SheetHeader>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p className="font-medium animate-pulse">
                  Loading asset metrics...
                </p>
              </div>
            ) : (
              <div className="space-y-8 pb-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Lifetime Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                      <div className="text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase mb-1">
                        Total Trips
                      </div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {lifetimeTrips}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                      <div className="text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase mb-1">
                        Net Income
                      </div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {formatPHP(lifetimeNet)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                    Hardware Details
                  </h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
                      <span className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-2 shrink-0">
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                        Engine No.
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-slate-200 text-right truncate">
                        4HF1-88392A
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
                      <span className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-2 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                        Chassis No.
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-slate-200 text-right truncate">
                        NKR66E-72819
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
                        LTO Expiry
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-rose-600 text-right">
                        Oct 2026
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {!isLoading && (
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
              <Button
                onClick={() => {
                  setIsDashboardOpen(true);
                  setIsProfileOpen(false);
                }}
                className="relative w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-bold text-sm sm:text-base"
              >
                <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                Open Analytics & Ledgers
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 3. ✨ THE UNIFIED FULL-SCREEN DASHBOARD MODAL */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div
            ref={dashboardRef}
            tabIndex={0}
            className="bg-slate-50 dark:bg-slate-950 w-full h-full sm:h-[95vh] max-w-[1500px] rounded-none sm:rounded-lg shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-800 outline-none animate-in zoom-in-95 sm:zoom-in-100 duration-200"
          >
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 hidden sm:block" />
                  Asset Dashboard: {truck.fleetCode}
                </h2>
                <p className="text-[11px] sm:text-sm font-medium text-slate-500 mt-0.5">
                  Plate:{" "}
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                    {truck.plateNumber}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsDashboardOpen(false)}
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 outline-none"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar bg-slate-50 dark:bg-slate-950 space-y-4">
              {/* SECTION A: FILTERS */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FilterX className="w-4 h-4 text-slate-400 hidden sm:block" />{" "}
                    Filter Records
                  </h4>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedCustomer("all");
                        setSelectedDestination("all");
                      }}
                      className="text-xs flex items-center gap-1 font-bold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-lg"
                    >
                      <FilterX className="w-3.5 h-3.5" /> Clear All Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Period / Year
                    </label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl font-semibold focus:ring-blue-500/50">
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent className="z-110 rounded-xl border-slate-200 dark:border-slate-800">
                        <SelectItem value="all" className="font-bold">
                          All Years
                        </SelectItem>
                        {uniqueYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Customer / Client
                    </label>
                    <Select
                      value={selectedCustomer}
                      onValueChange={setSelectedCustomer}
                    >
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl font-semibold focus:ring-blue-500/50">
                        <SelectValue placeholder="All Customers" />
                      </SelectTrigger>
                      <SelectContent className="z-110 rounded-xl border-slate-200 dark:border-slate-800">
                        <SelectItem value="all" className="font-bold">
                          All Customers
                        </SelectItem>
                        {uniqueCustomers.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Delivery Route
                    </label>
                    <Select
                      value={selectedDestination}
                      onValueChange={setSelectedDestination}
                    >
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl font-semibold truncate focus:ring-blue-500/50">
                        <SelectValue placeholder="All Routes" />
                      </SelectTrigger>
                      <SelectContent className="z-110 rounded-xl border-slate-200 dark:border-slate-800">
                        <SelectItem value="all" className="font-bold">
                          All Routes
                        </SelectItem>
                        {uniqueDestinations.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SECTION B: ANALYTICS METRICS */}
              {filteredTrips.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#0a1520] border border-slate-200 dark:border-white/10 rounded-xl p-8 text-center shrink-0">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500 dark:text-white/40">
                    No trips match these specific filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 shrink-0">
                  {/* Net Income */}
                  <div className="bg-emerald-50 dark:bg-[#0a2e1a] rounded-lg p-4 border border-emerald-200/60 dark:border-[#3dff9a]/15 relative overflow-hidden">
                    <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-emerald-500 dark:bg-[#3dff9a] opacity-10 pointer-events-none" />
                    <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 dark:text-[#3dff9a] mb-2 relative z-10">
                      Net Income
                    </p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
                      <AnimatedNumber
                        value={filteredTotalNet}
                        isCurrency={true}
                      />
                    </div>
                  </div>

                  {/* Gross */}
                  <div className="bg-blue-50 dark:bg-[#0d1f3c] rounded-lg p-4 border border-blue-200/60 dark:border-[#5cabff]/15 relative overflow-hidden">
                    <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-blue-500 dark:bg-[#5cabff] opacity-10 pointer-events-none" />
                    <p className="text-[10px] font-bold tracking-widest uppercase text-blue-700 dark:text-[#5cabff] mb-2 relative z-10">
                      Collectibles
                    </p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
                      <AnimatedNumber
                        value={filteredTotalGross}
                        isCurrency={true}
                      />
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="bg-rose-50 dark:bg-[#2d0d1a] rounded-lg p-4 border border-rose-200/60 dark:border-[#ff5c8a]/15 relative overflow-hidden">
                    <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-rose-500 dark:bg-[#ff5c8a] opacity-10 pointer-events-none" />
                    <p className="text-[10px] font-bold tracking-widest uppercase text-rose-700 dark:text-[#ff5c8a] mb-2 relative z-10">
                      Expenses
                    </p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
                      <AnimatedNumber
                        value={filteredTotalExpenses}
                        isCurrency={true}
                      />
                    </div>
                  </div>

                  {/* Trips */}
                  <div className="bg-purple-50 dark:bg-[#160b2e] rounded-lg p-4 border border-purple-200/60 dark:border-[#b97aff]/15 relative overflow-hidden">
                    <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full bg-purple-500 dark:bg-[#b97aff] opacity-10 pointer-events-none" />
                    <p className="text-[10px] font-bold tracking-widest uppercase text-purple-700 dark:text-[#b97aff] mb-2 relative z-10">
                      Trips
                    </p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-mono relative z-10">
                      <AnimatedNumber value={filteredTotalTrips} />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: THE FILTERED DATA TABLE */}
              <div className="shrink-0 w-full mt-2">
                <DataTable columns={columns} data={filteredTrips} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ✨ THE UPGRADED EDIT TRUCK MODAL */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Edit Asset Details
            </DialogTitle>
            <DialogDescription>
              Update the registration and operational status of this truck.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="fleetCode"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Fleet Code / Name
              </Label>
              <Input
                id="fleetCode"
                value={editForm.fleetCode}
                onChange={(e) =>
                  setEditForm({ ...editForm, fleetCode: e.target.value })
                }
                className="w-full h-[46px]! border-slate-200 dark:border-slate-800/80  rounded-xl bg-white dark:bg-slate-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="plateNumber"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Plate Number
              </Label>
              <Input
                id="plateNumber"
                value={editForm.plateNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, plateNumber: e.target.value })
                }
                className="w-full h-11 border-slate-200 dark:border-slate-800/80  rounded-xl font-mono uppercase bg-white dark:bg-slate-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operational Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(val) =>
                  setEditForm({ ...editForm, status: val })
                }
              >
                <SelectTrigger className="w-full h-[46px]! border-slate-200 dark:border-slate-800/80  rounded-xl bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl z-150">
                  <SelectItem value="active">
                    <div className="flex items-center text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Active
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center text-orange-500 font-bold">
                      <Wrench className="w-4 h-4 mr-2" /> Garage / Maintenance
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center text-slate-500 font-bold">
                      <XCircle className="w-4 h-4 mr-2" /> Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-12 w-full sm:w-auto font-bold border-slate-200 dark:border-white/10 dark:text-white dark:bg-transparent dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="relative rounded-xl h-12 w-full sm:flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-lg transition-all duration-300 overflow-hidden group/btn border-none disabled:opacity-70 disabled:pointer-events-none px-6"
              >
                <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. THE DELETE CONFIRMATION ALERT */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl max-w-md">
          <AlertDialogHeader className="flex flex-row items-start gap-4 text-left sm:text-left">
            <div className="shrink-0 w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mt-1">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex flex-col flex-1">
              <AlertDialogTitle className="text-xl font-black text-slate-800 dark:text-slate-100">
                Delete Truck Asset
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 mt-1.5 text-sm sm:text-base leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {truck.fleetCode} ({truck.plateNumber})
                </span>
                ? This action cannot be undone and will remove the truck from
                your fleet.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-center">
            <AlertDialogCancel
              disabled={isDeleting}
              className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Yes, Delete Asset"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
