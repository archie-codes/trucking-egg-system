"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Truck,
  CheckCircle2,
  Wrench,
  XCircle,
  FolderOpen,
  Loader2,
  Activity,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  X,
  FilterX,
  BarChart3,
  Edit,
  Trash2,
  MoreVertical,
  Save,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Hash,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { DataTable } from "../trips/data-table";
import { columns } from "../trips/columns";
import {
  getTruckTrips,
  deleteTruck,
  updateTruck,
} from "@/app/actions/truck-actions";

// ── Animated counter ─────────────────────────────────────────────────────────
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
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const pct = Math.min((ts - startTime) / 900, 1);
      const eased = 1 - Math.pow(1 - pct, 4);
      setCurrent(startValue + distance * eased);
      if (pct < 1) requestAnimationFrame(animate);
      else setCurrent(value);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [value]);

  return isCurrency ? (
    <>
      {new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(current)}
    </>
  ) : (
    <>{Math.round(current)}</>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    badge:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    dot: "bg-amber-500",
    ping: true,
    folderTab:
      "bg-amber-600 dark:bg-amber-700 after:bg-amber-600 dark:after:bg-amber-700 before:bg-amber-600 dark:before:bg-amber-700",
    folderFront:
      "bg-linear-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500 after:bg-amber-400 dark:after:bg-amber-500 before:bg-amber-400 dark:before:bg-amber-500 group-hover:shadow-[inset_0_20px_40px_#fbbf24,inset_0_-20px_40px_#d97706] dark:group-hover:shadow-[inset_0_20px_40px_#b45309,inset_0_-20px_40px_#92400e]",
    folderIconBg: "bg-white/20 text-amber-50",
    folderBorder: "border-amber-300/30",
    listBg:
      "bg-amber-50/50 dark:bg-amber-500/10 hover:border-amber-400/50 dark:hover:border-amber-600/40",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
    ping: false,
    folderTab:
      "bg-emerald-600 dark:bg-emerald-700 after:bg-emerald-600 dark:after:bg-emerald-700 before:bg-emerald-600 dark:before:bg-emerald-700",
    folderFront:
      "bg-linear-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500 after:bg-emerald-400 dark:after:bg-emerald-500 before:bg-emerald-400 dark:before:bg-emerald-500 group-hover:shadow-[inset_0_20px_40px_#34d399,inset_0_-20px_40px_#059669] dark:group-hover:shadow-[inset_0_20px_40px_#059669,inset_0_-20px_40px_#047857]",
    folderIconBg: "bg-white/20 text-emerald-50",
    folderBorder: "border-emerald-300/30",
    listBg:
      "bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-400/50 dark:hover:border-emerald-600/40",
  },
  inactive: {
    label: "Inactive / Sold",
    icon: XCircle,
    badge:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    dot: "bg-rose-500",
    ping: false,
    folderTab:
      "bg-rose-600 dark:bg-rose-700 after:bg-rose-600 dark:after:bg-rose-700 before:bg-rose-600 dark:before:bg-rose-700",
    folderFront:
      "bg-linear-to-t from-rose-500 to-rose-400 dark:from-rose-600 dark:to-rose-500 after:bg-rose-400 dark:after:bg-rose-500 before:bg-rose-400 dark:before:bg-rose-500 group-hover:shadow-[inset_0_20px_40px_#fb7185,inset_0_-20px_40px_#e11d48] dark:group-hover:shadow-[inset_0_20px_40px_#e11d48,inset_0_-20px_40px_#be123c]",
    folderIconBg: "bg-white/20 text-rose-50",
    folderBorder: "border-rose-300/30",
    listBg:
      "bg-rose-50/50 dark:bg-rose-500/10 hover:border-rose-400/50 dark:hover:border-rose-600/40",
  },
};

// ── Section divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  isCurrency,
  accent,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  accent: "emerald" | "blue" | "rose" | "violet";
}) {
  const colors = {
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/50 text-blue-700 dark:text-blue-400",
    rose: "bg-rose-50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/50 text-rose-700 dark:text-rose-400",
    violet:
      "bg-violet-50 dark:bg-violet-950/30 border-violet-200/60 dark:border-violet-900/50 text-violet-700 dark:text-violet-400",
  }[accent];

  return (
    <div className={cn("rounded-xl border p-3.5 sm:p-4 overflow-hidden min-w-0 flex flex-col justify-center", colors)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1.5 truncate">
        {label}
      </p>
      <p className="text-[14px] sm:text-[15px] font-bold font-mono leading-none truncate w-full">
        <AnimatedNumber value={value} isCurrency={isCurrency} />
      </p>
    </div>
  );
}

// ── Edit form field ────────────────────────────────────────────────────────────
function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </Label>
      {children}
    </div>
  );
}

const fieldClass =
  "h-10 rounded-lg text-sm bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/40";

// ── Main Component ────────────────────────────────────────────────────────────
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    fleetCode: truck.fleetCode || "",
    plateNumber: truck.plateNumber || "",
    status: truck.status || "active",
    engineNo: truck.engineNo || "",
    chassisNo: truck.chassisNo || "",
    ltoExpiry: truck.ltoExpiry
      ? new Date(truck.ltoExpiry).toISOString().split("T")[0]
      : "",
  });

  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDashboardOpen && dashboardRef.current) dashboardRef.current.focus();
  }, [isDashboardOpen]);

  useEffect(() => {
    const handleTripUpdate = async () => {
      if (isDashboardOpen || isProfileOpen) {
        const result = await getTruckTrips(truck.id);
        if (result.success && result.data) setTrips(result.data);
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
    if (result.success && result.data) setTrips(result.data);
    else toast.error("Failed to load truck history.");
    setIsLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const result = await updateTruck(truck.id, editForm);
    if (result.success) {
      toast.success("Truck updated successfully.");
      setIsEditDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update truck.");
    }
    setIsUpdating(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const id = toast.loading("Deleting truck…");
    const result = await deleteTruck(truck.id);
    if (result.success) {
      toast.success(`${truck.fleetCode} deleted.`, { id });
      setIsDeleteDialogOpen(false);
      setIsProfileOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete.", { id });
    }
    setIsDeleting(false);
  };

  const uniqueYears = useMemo(
    () =>
      Array.from(
        new Set(trips.map((t) => new Date(t.date).getFullYear().toString())),
      )
        .sort()
        .reverse(),
    [trips],
  );
  const uniqueCustomers = useMemo(() => {
    const relevantTrips = trips.filter((t) => {
      const matchYear =
        selectedYear === "all" ||
        new Date(t.date).getFullYear().toString() === selectedYear;
      const matchDest =
        selectedDestination === "all" || t.destination === selectedDestination;
      return matchYear && matchDest;
    });
    return Array.from(new Set(relevantTrips.map((t) => t.customerId))).sort();
  }, [trips, selectedYear, selectedDestination]);
  const uniqueDestinations = useMemo(() => {
    const relevantTrips = trips.filter((t) => {
      const matchYear =
        selectedYear === "all" ||
        new Date(t.date).getFullYear().toString() === selectedYear;
      const matchCustomer =
        selectedCustomer === "all" || t.customerId === selectedCustomer;
      return matchYear && matchCustomer;
    });
    return Array.from(new Set(relevantTrips.map((t) => t.destination))).sort();
  }, [trips, selectedYear, selectedCustomer]);

  const filteredTrips = useMemo(
    () =>
      trips
        .filter((t) => {
          const matchYear =
            selectedYear === "all" ||
            new Date(t.date).getFullYear().toString() === selectedYear;
          const matchCustomer =
            selectedCustomer === "all" || t.customerId === selectedCustomer;
          const matchDest =
            selectedDestination === "all" ||
            t.destination === selectedDestination;
          return matchYear && matchCustomer && matchDest;
        })
        .map((t) => ({
          ...t,
          fleetCode: truck.fleetCode,
          plateNumber: truck.plateNumber,
        })),
    [
      trips,
      selectedYear,
      selectedCustomer,
      selectedDestination,
      truck.fleetCode,
      truck.plateNumber,
    ],
  );
  // ✨ AUTO-RESET: If a selected filter is no longer valid based on the other selections, reset it to "all"
  useEffect(() => {
    if (
      selectedCustomer !== "all" &&
      !uniqueCustomers.includes(selectedCustomer)
    ) {
      setSelectedCustomer("all");
    }
    if (
      selectedDestination !== "all" &&
      !uniqueDestinations.includes(selectedDestination)
    ) {
      setSelectedDestination("all");
    }
  }, [
    selectedYear,
    uniqueCustomers,
    uniqueDestinations,
    selectedCustomer,
    selectedDestination,
  ]);

  const calc = (arr: any[]) => {
    const gross = arr.reduce((s, t) => s + t.qtyHeads * t.rate, 0);
    const exp = arr.reduce(
      (s, t) =>
        s +
        (t.tollFees +
          t.dieselCash +
          t.dieselPo +
          t.meals +
          t.roroShip +
          t.salary +
          t.others),
      0,
    );
    return { gross, exp, net: gross - exp, count: arr.length };
  };

  const lifetime = calc(trips);
  const filtered = calc(filteredTrips);
  const hasActiveFilters =
    selectedYear !== "all" ||
    selectedCustomer !== "all" ||
    selectedDestination !== "all";

  const statusCfg =
    STATUS[truck.status as keyof typeof STATUS] ?? STATUS.inactive;
  const StatusIcon = statusCfg.icon;

  // ── Card render ──────────────────────────────────────────────────────────────
  const renderCard = () => {
    if (viewMode === "list") {
      return (
        <div
          onClick={handleOpenProfile}
          className={cn(
            "group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-border/60 rounded-xl cursor-pointer hover:shadow-sm transition-all",
            statusCfg.listBg,
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {truck.fleetCode}{" "}
                <span className="text-muted-foreground font-normal">·</span>{" "}
                <span className="font-mono">{truck.plateNumber}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Logistics asset
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "shrink-0 text-xs font-semibold px-2.5 py-1 border-0",
              statusCfg.badge,
            )}
          >
            <StatusIcon className="h-3 w-3 mr-1.5" />
            {statusCfg.label}
          </Badge>
        </div>
      );
    }

    // Grid / folder card
    return (
      <div
        onClick={handleOpenProfile}
        className="relative group flex flex-col items-center justify-center w-full max-w-[260px] sm:max-w-[270px] mx-auto h-[150px] sm:h-[160px] cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        <div className="file relative w-full h-full origin-bottom perspective-[1500px] z-10">
          {/* Folder tab bg */}
          <div
            className={cn(
              "work-5 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[35%] after:h-4 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-15px] before:left-[calc(35%-4px)] before:w-4 before:h-4 before:[clip-path:polygon(0_35%,0%_100%,50%_100%)]",
              statusCfg.folderTab,
            )}
          />
          {/* Paper layers */}
          <div className="work-4 absolute inset-1 bg-zinc-400 dark:bg-zinc-600 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:transform-[rotateX(-20deg)]" />
          <div className="work-3 absolute inset-1 bg-zinc-300 dark:bg-zinc-500 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-30deg)]" />
          <div className="work-2 absolute inset-1 bg-zinc-100 dark:bg-slate-200 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-38deg)] p-4 sm:p-5 flex flex-col gap-1.5 sm:gap-2 shadow-inner overflow-hidden">
            <div className="w-1/3 h-2 sm:h-2.5 bg-zinc-200 dark:bg-slate-300 rounded-full mb-1" />
            {[1, 5 / 6, 4 / 5, 1, 3 / 4].map((w, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 sm:h-2 bg-zinc-200 dark:bg-slate-300 rounded-full",
                  i === 3 && "mt-2",
                )}
                style={{ width: `${w * 100}%` }}
              />
            ))}
            <div className="mt-auto flex justify-end">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-zinc-200 dark:border-slate-300 rounded-full flex items-center justify-center opacity-50 -rotate-12">
                <span className="text-[7px] sm:text-[9px] font-bold text-zinc-300 dark:text-slate-400">
                  OK
                </span>
              </div>
            </div>
          </div>
          {/* Front face */}
          <div
            className={cn(
              "work-1 absolute bottom-0 w-full h-[calc(100%-4px)] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[50%] after:h-[16px] after:rounded-t-2xl before:absolute before:content-[''] before:top-[-10px] before:right-[calc(50%-4px)] before:size-3 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%)] transition-all ease duration-300 origin-bottom flex flex-col justify-between p-3 sm:p-4 group-hover:transform-[rotateX(-46deg)_translateY(1px)]",
              statusCfg.folderFront,
            )}
          >
            <div className="flex justify-between items-start">
              <div
                className={cn(
                  "p-1.5 sm:p-2 rounded-md transition-colors group-hover:bg-white/30",
                  statusCfg.folderIconBg,
                )}
              >
                <FolderOpen
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110"
                  strokeWidth={2}
                />
              </div>
              <Badge
                className={cn(
                  "border-0 shadow-sm text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/25 text-white",
                )}
              >
                <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                {statusCfg.label}
              </Badge>
            </div>
            <div className="mt-1 sm:mt-2">
              <h3 className="text-sm sm:text-base font-black text-white flex flex-wrap items-center gap-x-1.5 gap-y-0.5 tracking-tight drop-shadow-sm">
                <span className="truncate max-w-full">{truck.fleetCode}</span>
                <span className="font-normal text-white/60 shrink-0">·</span>
                <span className="font-mono truncate max-w-full">
                  {truck.plateNumber}
                </span>
              </h3>
              <p className="text-[9px] sm:text-[10px] text-white/80 font-medium mt-0.5 flex items-center gap-1">
                <Truck className="w-3 h-3" /> Logistics Asset
              </p>
            </div>
            <div
              className={cn(
                "mt-auto pt-2 border-t flex items-center gap-1.5",
                statusCfg.folderBorder,
              )}
            >
              <span
                className={cn(
                  "relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0",
                )}
              >
                {statusCfg.ping && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                )}
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-full w-full",
                    statusCfg.dot,
                  )}
                />
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-white/80 uppercase">
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderCard()}

      {/* ── Profile sheet ──────────────────────────────────────────────────────── */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        {/* ✨ FIX: Added [&>button]:hidden to remove Shadcn's floating X button */}
        <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-[400px] bg-background border-l border-border/60 z-200 [&>button]:hidden">
          {/* Accent bar */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-linear-to-r from-blue-500 to-blue-400 z-10" />

          {/* Header */}
          <SheetHeader className="shrink-0 px-5 pt-6 pb-4 border-b border-border/60">
            <div className="flex items-start justify-between gap-3">
              <SheetTitle className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex flex-col items-start">
                  <p className="text-[15px] font-semibold text-foreground truncate leading-tight">
                    {truck.fleetCode}{" "}
                    <span className="text-muted-foreground font-normal">·</span>{" "}
                    <span className="font-mono">{truck.plateNumber}</span>
                  </p>
                  <Badge
                    className={cn(
                      "mt-1 text-[10px] font-semibold px-2 py-0.5 border-0",
                      statusCfg.badge,
                    )}
                  >
                    <StatusIcon className="h-2.5 w-2.5 mr-1" />
                    {statusCfg.label}
                  </Badge>
                </div>
              </SheetTitle>

              {/* ✨ FIX: Custom aligned control group with the Dropdown and Close buttons directly next to each other */}
              <div className="flex items-center gap-1 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xl border-border/60 shadow-md z-250"
                  >
                    <DropdownMenuItem
                      onClick={() => setIsEditDialogOpen(true)}
                      className="cursor-pointer gap-2 py-2 text-sm"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">Edit details</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="cursor-pointer gap-2 py-2 text-sm text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="font-medium">Delete truck</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsProfileOpen(false)}
                  className="h-8 w-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                <p className="text-sm animate-pulse">Loading metrics…</p>
              </div>
            ) : (
              <>
                {/* Lifetime stats */}
                <div>
                  <SectionLabel>Lifetime overview</SectionLabel>
                  <div className="grid grid-cols-2 gap-2.5">
                    <StatCard
                      label="Total trips"
                      value={lifetime.count}
                      accent="violet"
                    />
                    <StatCard
                      label="Net income"
                      value={lifetime.net}
                      isCurrency
                      accent="emerald"
                    />
                    <StatCard
                      label="Collectibles"
                      value={lifetime.gross}
                      isCurrency
                      accent="blue"
                    />
                    <StatCard
                      label="Expenses"
                      value={lifetime.exp}
                      isCurrency
                      accent="rose"
                    />
                  </div>
                </div>

                {/* Hardware details */}
                <div>
                  <SectionLabel>Hardware details</SectionLabel>
                  <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/40">
                    {[
                      {
                        icon: Settings,
                        label: "Engine No.",
                        value: truck.engineNo,
                      },
                      {
                        icon: ShieldCheck,
                        label: "Chassis No.",
                        value: truck.chassisNo,
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[13px] text-muted-foreground flex-1">
                          {label}
                        </span>
                        <span
                          className={cn(
                            "text-[13px] font-mono font-medium text-right",
                            !value && "text-muted-foreground/40",
                          )}
                        >
                          {value || "—"}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <CalendarIcon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="text-[13px] text-muted-foreground flex-1">
                        LTO expiry
                      </span>
                      <span
                        className={cn(
                          "text-[13px] font-medium text-right",
                          truck.ltoExpiry
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground/40",
                        )}
                      >
                        {truck.ltoExpiry
                          ? format(new Date(truck.ltoExpiry), "MMM dd, yyyy")
                          : "Unregistered"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!isLoading && (
            <div className="shrink-0 px-5 py-4 border-t border-border/60 bg-muted/10">
              <Button
                onClick={() => {
                  setIsDashboardOpen(true);
                  setIsProfileOpen(false);
                }}
                className="relative w-full h-11 rounded-xl text-sm font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn"
              >
                <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                Open Analytics & Ledger
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Full-screen dashboard ──────────────────────────────────────────────── */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={dashboardRef}
            tabIndex={0}
            className="bg-background w-full h-full sm:h-[95vh] max-w-[1500px] rounded-none sm:rounded-lg shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-border/60 outline-none animate-in zoom-in-95 duration-200"
          >
            {/* Dashboard header */}
            <div className="h-[3px] bg-linear-to-r from-blue-500 to-blue-400 w-full" />
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-card border-b border-border/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-foreground truncate">
                    {truck.fleetCode}{" "}
                    <span className="text-muted-foreground font-normal">·</span>{" "}
                    <span className="font-mono">{truck.plateNumber}</span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Analytics & trip ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDashboardOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dashboard body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-muted/20 dark:bg-background custom-scrollbar">
              {/* Filter bar */}
              <div className="bg-card rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                    <FilterX className="h-3.5 w-3.5 text-muted-foreground" />
                    Filter records
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedCustomer("all");
                        setSelectedDestination("all");
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <X className="h-3 w-3" /> Clear filters
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Period / Year",
                      value: selectedYear,
                      setter: setSelectedYear,
                      options: uniqueYears,
                      placeholder: "All years",
                    },
                    {
                      label: "Customer",
                      value: selectedCustomer,
                      setter: setSelectedCustomer,
                      options: uniqueCustomers,
                      placeholder: "All customers",
                    },
                    {
                      label: "Route",
                      value: selectedDestination,
                      setter: setSelectedDestination,
                      options: uniqueDestinations,
                      placeholder: "All routes",
                    },
                  ].map(({ label, value, setter, options, placeholder }) => (
                    <div key={label} className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {label}
                      </p>
                      <Select value={value} onValueChange={setter}>
                        <SelectTrigger className="h-9 w-full text-sm rounded-lg bg-background border-border/60 focus:ring-1 focus:ring-blue-500/40">
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="z-110 rounded-xl border-border/60 shadow-md">
                          <SelectItem value="all" className="font-medium">
                            {placeholder}
                          </SelectItem>
                          {options.map((o: string) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metric cards */}
              {filteredTrips.length === 0 ? (
                <div className="bg-card rounded-xl border border-border/60 p-10 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No trips match these filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="Net income"
                    value={filtered.net}
                    isCurrency
                    accent="emerald"
                  />
                  <StatCard
                    label="Collectibles"
                    value={filtered.gross}
                    isCurrency
                    accent="blue"
                  />
                  <StatCard
                    label="Expenses"
                    value={filtered.exp}
                    isCurrency
                    accent="rose"
                  />
                  <StatCard
                    label="Trips"
                    value={filtered.count}
                    accent="violet"
                  />
                </div>
              )}

              {/* Data table */}
              <div className="bg-card rounded-xl border border-border/60 p-4">
                <DataTable columns={columns} data={filteredTrips} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit dialog ────────────────────────────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-[480px] max-h-[95dvh] overflow-y-auto custom-scrollbar rounded-2xl bg-background border-border/60 z-200 p-0 gap-0">
          {/* Dialog accent */}
          <div className="h-[3px] bg-linear-to-r from-blue-500 to-blue-400 w-full" />

          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <Edit className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <DialogTitle className="text-[15px] font-semibold">
                  Edit asset details
                </DialogTitle>
              </div>
              <DialogDescription className="text-[13px] text-muted-foreground ml-11">
                Update registration and operational info for {truck.fleetCode}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* ID fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EditField label="Fleet Code">
                  <Input
                    value={editForm.fleetCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fleetCode: e.target.value })
                    }
                    className={fieldClass}
                    required
                  />
                </EditField>
                <EditField label="Plate No.">
                  <Input
                    value={editForm.plateNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, plateNumber: e.target.value })
                    }
                    className={cn(fieldClass, "font-mono uppercase")}
                    required
                  />
                </EditField>
              </div>

              {/* Hardware fields */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/40">
                {[
                  { icon: Settings, key: "engineNo", label: "Engine No." },
                  { icon: ShieldCheck, key: "chassisNo", label: "Chassis No." },
                ].map(({ icon: Icon, key, label }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[12px] text-muted-foreground w-24 shrink-0">
                      {label}
                    </span>
                    <Input
                      value={(editForm as any)[key]}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [key]: e.target.value })
                      }
                      className="h-8 border-0 bg-transparent p-0 text-sm font-mono uppercase shadow-none focus-visible:ring-0 placeholder:font-sans placeholder:normal-case placeholder:text-muted-foreground/40"
                      placeholder="Optional"
                    />
                  </div>
                ))}

                {/* LTO expiry row */}
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="text-[12px] text-muted-foreground w-24 shrink-0">
                    LTO Expiry
                  </span>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex flex-1 items-center text-sm transition-colors",
                          editForm.ltoExpiry
                            ? "text-foreground font-medium"
                            : "text-muted-foreground/50",
                        )}
                      >
                        {editForm.ltoExpiry
                          ? format(new Date(editForm.ltoExpiry), "MMM dd, yyyy")
                          : "Pick a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-250 rounded-xl border-border/60 shadow-lg"
                      align="start"
                      sideOffset={8}
                    >
                      <Calendar
                        mode="single"
                        selected={
                          editForm.ltoExpiry
                            ? new Date(editForm.ltoExpiry)
                            : undefined
                        }
                        onSelect={(date) => {
                          setEditForm({
                            ...editForm,
                            ltoExpiry: date ? format(date, "yyyy-MM-dd") : "",
                          });
                          setIsCalendarOpen(false);
                        }}
                        captionLayout="dropdown"
                        fromYear={2000}
                        toYear={new Date().getFullYear() + 10}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Status */}
              <EditField label="Operational Status">
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                >
                  <SelectTrigger className={cn(fieldClass, "px-3 w-full")}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl z-250 border-border/60">
                    {Object.entries(STATUS).map(([val, cfg]) => {
                      return (
                        <SelectItem key={val} value={val} className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                cfg.dot,
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                cfg.badge
                                  .split(" ")
                                  .find((c) => c.startsWith("text-")),
                              )}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </EditField>

              <DialogFooter className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 h-10 rounded-xl text-sm font-medium border-border/60"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-2 relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold"
                >
                  <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />{" "}
                      Save changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────────────────────────────────────────── */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-[400px] rounded-2xl bg-background border-border/60 z-200">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                <Trash2 className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-[15px] font-semibold text-foreground">
                  Delete truck asset
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                  Permanently delete{" "}
                  <span className="font-semibold text-foreground">
                    {truck.fleetCode} ({truck.plateNumber})
                  </span>
                  ? This cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="flex-1 h-10 rounded-xl text-sm font-medium border-border/60 hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] border-0 shadow-sm gap-2 transition-all"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete asset"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
