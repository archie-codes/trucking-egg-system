"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // ✨ Added useRouter
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

// ✨ Added Dialog, Input, and Label for the Edit Modal
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

// ✨ Imported our new Server Actions
import {
  getTruckTrips,
  deleteTruck,
  updateTruck,
} from "@/app/actions/truck-actions";

export function TruckFolderCard({ truck }: { truck: any }) {
  const router = useRouter(); // ✨ Used to refresh the UI

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // ✨ NEW: States for Edit/Delete logic
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ✨ State to hold the form data while editing
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

  // ✨ THE WORKING EDIT HANDLER
  const handleEditTruck = () => {
    setIsEditDialogOpen(true); // Opens the modal
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const result = await updateTruck(truck.id, editForm);

    if (result.success) {
      toast.success("Truck details updated successfully!");
      setIsEditDialogOpen(false); // Close the edit modal
      router.refresh(); // Refresh the page to show new details
    } else {
      toast.error(result.error || "Failed to update truck.");
    }

    setIsUpdating(false);
  };

  // ✨ THE WORKING DELETE HANDLER
  const confirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting truck...");

    const result = await deleteTruck(truck.id);

    if (result.success) {
      toast.success(`Truck ${truck.fleetCode} deleted successfully.`, {
        id: toastId,
      });
      setIsDeleteDialogOpen(false);
      setIsProfileOpen(false); // Close the side panel
      router.refresh(); // Tell Next.js to fetch fresh data
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

  return (
    <>
      {/* 1. THE 3D FOLDER CARD */}
      <div
        onClick={handleOpenProfile}
        className="relative group flex flex-col items-center justify-center w-full max-w-[260px] sm:max-w-[300px] mx-auto h-[150px] sm:h-[180px] cursor-pointer transition-transform duration-300 hover:scale-105"
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

      {/* 2. THE SLIDE-OUT ASSET PROFILE */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="sm:max-w-[450px] w-full flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-0">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-90 z-10" />

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <SheetHeader className="mb-6 sm:mb-8 relative bg-gradient-to-br from-blue-600 to-indigo-700 p-4 sm:p-5 rounded-2xl shadow-md mt-2 sm:mt-0 overflow-hidden text-white">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

              <div className="flex justify-between items-center w-full gap-2 relative z-10">
                <SheetTitle className="flex items-center gap-3 font-black text-white min-w-0">
                  <div className="p-2 sm:p-2.5 shrink-0">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xl sm:text-2xl truncate drop-shadow-md">
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
                className="relative w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-bold text-sm sm:text-base"
              >
                <div className="absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                Open Analytics & Ledgers
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 3. ✨ THE UNIFIED FULL-SCREEN DASHBOARD MODAL */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
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
                      <SelectContent className="z-[110] rounded-xl border-slate-200 dark:border-slate-800">
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
                      <SelectContent className="z-[110] rounded-xl border-slate-200 dark:border-slate-800">
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
                      <SelectContent className="z-[110] rounded-xl border-slate-200 dark:border-slate-800">
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

              {/* SECTION B: ANALYTICS METRICS (✨ Unified Card Design) */}
              {filteredTrips.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center shrink-0">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-slate-500">
                    No trips match these specific filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0">
                  {/* ✨ COMBINED FINANCIAL CARD */}
                  <div className="col-span-1 lg:col-span-3 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg p-2 sm:p-5 shadow-sm flex items-center relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-black/20 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-4 relative z-10">
                      <div className="flex flex-col justify-center">
                        <div className="text-emerald-100 font-bold text-[10px] sm:text-xs tracking-wider uppercase mb-0.5 drop-shadow-sm">
                          Collectibles
                        </div>
                        <div className="text-md sm:text-lg font-black text-white truncate">
                          {formatPHP(filteredTotalGross)}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center sm:border-l sm:border-emerald-400/30 sm:pl-4">
                        <div className="text-emerald-100 font-bold text-[10px] sm:text-xs tracking-wider uppercase mb-0.5 drop-shadow-sm">
                          Expenses
                        </div>
                        <div className="text-md sm:text-lg font-black text-white truncate">
                          {formatPHP(filteredTotalExpenses)}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center sm:border-l sm:border-emerald-400/30 sm:pl-4">
                        <div className="text-emerald-100 font-bold text-[10px] sm:text-xs tracking-wider uppercase mb-0.5 flex items-center gap-1 drop-shadow-sm">
                          Net Income
                        </div>
                        <div className="text-md sm:text-lg font-black text-white truncate">
                          {formatPHP(filteredTotalNet)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TRIPS FOUND CARD */}
                  <div className="col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg p-4 sm:p-5 shadow-sm flex items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-3 sm:gap-4 relative z-10 w-full">
                      <div className="flex flex-col overflow-hidden">
                        <div className="text-blue-100 font-bold text-[10px] sm:text-xs tracking-widest uppercase mb-0.5 drop-shadow-sm">
                          Trips
                        </div>
                        <div className="text-md sm:text-lg font-black text-white truncate">
                          {filteredTotalTrips}
                        </div>
                      </div>
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

      {/* 4. ✨ NEW: THE EDIT TRUCK MODAL */}
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
                <SelectContent className="rounded-xl z-[150]">
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

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl h-11 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. ✨ NEW: THE DELETE CONFIRMATION ALERT */}
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
