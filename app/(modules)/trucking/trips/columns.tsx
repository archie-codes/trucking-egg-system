"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Truck,
  MoreHorizontal,
  Edit,
  Trash,
  Loader2,
  Save,
  AlertTriangle,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { deleteTripRecord, updateTripRecord } from "@/app/actions/trip-actions";

export type TripRecord = {
  id: number;
  truckId: number;
  fleetCode: string | null;
  plateNumber: string | null;
  date: string;
  customerId: string;
  farmName: string;
  origin: string;
  destination: string;
  qtyHeads: number;
  rate: number;
  tollFees: number;
  dieselCash: number;
  dieselPo: number;
  meals: number;
  roroShip: number;
  salary: number;
  others: number;
  createdAt: Date;
};

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

const formatNum = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// ✨ Animated Number Component for Real-Time Summary
function AnimatedNumber({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  const [current, setCurrent] = useState(value);

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
  }, [value]); // intentionally leaving out current from deps

  if (isCurrency) {
    return <>{formatPHP(current)}</>;
  }

  return <>{formatNum(current)}</>;
}

// STATEFUL COMPONENT FOR ROW ACTIONS
const TripActionsCell = ({ trip }: { trip: TripRecord }) => {
  const router = useRouter();

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Loading States
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Advanced UI States (Copied from New Trip)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  // Set default diesel mode based on existing data
  const [dieselMode, setDieselMode] = useState<"cash" | "po">(
    trip.dieselPo > 0 ? "po" : "cash",
  );

  const [phLocations, setPhLocations] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [formData, setFormData] = useState({
    date: trip.date,
    customerId: trip.customerId,
    farmName: trip.farmName,
    origin: trip.origin,
    destination: trip.destination,
    qtyHeads: trip.qtyHeads,
    rate: trip.rate,
    tollFees: trip.tollFees,
    dieselCash: trip.dieselCash,
    dieselPo: trip.dieselPo,
    meals: trip.meals,
    roroShip: trip.roroShip,
    salary: trip.salary,
    others: trip.others,
  });

  // ✨ DYNAMIC MATH FOR THE FOOTER (Updates as user types!)
  const grossCollectible = (formData.qtyHeads || 0) * (formData.rate || 0);
  const totalExpenses =
    (formData.tollFees || 0) +
    (formData.dieselCash || 0) +
    (formData.dieselPo || 0) +
    (formData.meals || 0) +
    (formData.roroShip || 0) +
    (formData.salary || 0) +
    (formData.others || 0);
  const netIncome = grossCollectible - totalExpenses;

  useEffect(() => {
    async function fetchLocations() {
      if (phLocations.length > 0) return;
      setIsLoadingLocations(true);
      try {
        const [provRes, cityRes] = await Promise.all([
          fetch("https://psgc.gitlab.io/api/provinces"),
          fetch("https://psgc.gitlab.io/api/cities-municipalities"),
        ]);
        const provData = await provRes.json();
        const cityData = await cityRes.json();

        const provMap = new Map();
        provData.forEach((p: any) => provMap.set(p.code, p.name));

        const formattedLocations = cityData.map((city: any) => {
          const provName = provMap.get(city.provinceCode) || "Metro Manila";
          const label = `${city.name}, ${provName}`;
          return { value: label.toUpperCase(), label };
        });

        formattedLocations.sort((a: any, b: any) =>
          a.label.localeCompare(b.label),
        );
        setPhLocations(formattedLocations);
      } catch (error) {
        console.error("Failed to fetch PSGC locations:", error);
      } finally {
        setIsLoadingLocations(false);
      }
    }

    if (isEditOpen) {
      fetchLocations();
    }
  }, [isEditOpen, phLocations.length]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting record...");

    const result = await deleteTripRecord(trip.id);

    if (result.success) {
      toast.success("Trip deleted successfully.", { id: toastId });
      setIsDeleteOpen(false);
      router.refresh();
      window.dispatchEvent(new CustomEvent("trip-updated"));
    } else {
      toast.error(result.error || "Failed to delete.", { id: toastId });
    }
    setIsDeleting(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateTripRecord(trip.id, formData);

    if (result.success) {
      toast.success("Trip updated successfully.");
      setIsEditOpen(false);
      router.refresh();
      window.dispatchEvent(new CustomEvent("trip-updated"));
    } else {
      toast.error(result.error || "Failed to update trip.");
    }

    setIsSaving(false);
  };

  const handleNumChange = (field: string, val: string) => {
    const parsed = val === "" ? 0 : Number(val);
    setFormData((prev) => ({ ...prev, [field]: isNaN(parsed) ? 0 : parsed }));
  };

  const handleDieselModeSwitch = (mode: "cash" | "po") => {
    setDieselMode(mode);
    if (mode === "cash") {
      setFormData((prev) => ({
        ...prev,
        dieselCash: prev.dieselPo,
        dieselPo: 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        dieselPo: prev.dieselCash,
        dieselCash: 0,
      }));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-110 rounded-xl shadow-lg border-slate-200 dark:border-slate-800"
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer font-medium py-2"
          >
            <Edit className="mr-2 h-4 w-4 text-blue-500" />
            Edit Record
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 font-medium py-2"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* THE BEAUTIFUL DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-3xl p-0 overflow-hidden z-200 shadow-2xl">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="p-6 pt-10 flex flex-col items-center text-center relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-100 dark:bg-rose-500/20 rounded-full animate-ping opacity-75" />
              <div className="relative w-16 h-16 bg-rose-100 dark:bg-rose-500/10 ring-8 ring-rose-50 dark:ring-rose-500/5 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            <DialogTitle className="font-sans text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Delete Trip Record?
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500 dark:text-white/60 leading-relaxed max-w-[280px] mx-auto">
              This action cannot be undone. This will permanently delete the
              hauling record for{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {trip.fleetCode || "this truck"}
                {trip.plateNumber ? ` - ${trip.plateNumber}` : ""}
              </span>{" "}
              to customer{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {trip.customerId}
              </span>
              .
            </DialogDescription>
          </div>

          <DialogFooter className="p-5 sm:px-6 sm:py-5 bg-slate-50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="rounded-xl h-12 w-full sm:w-auto font-bold border-slate-200 dark:border-white/10 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl h-12 w-full sm:flex-1 bg-rose-500 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/25 border-none transition-all"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 mr-2" />
              )}
              Yes, Delete Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* THE UPGRADED EDIT DIALOG MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] sm:h-auto max-h-[90vh] flex flex-col bg-white dark:bg-[#0d1117] border-slate-200 dark:border-white/10 rounded-2xl p-0 overflow-hidden z-200 shadow-2xl">
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#0d1117] relative z-10">
            <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600 dark:text-[#5cabff]" />{" "}
              Edit Trip Record
            </DialogTitle>
            <DialogDescription className="mt-1.5 font-medium text-slate-500 dark:text-white/50 text-sm">
              Modify the logistics or financial data for{" "}
              <span className="font-bold text-slate-700 dark:text-white">
                {trip.fleetCode || "Truck"}
              </span>{" "}
              on {new Date(trip.date).toLocaleDateString()}.
            </DialogDescription>
          </div>

          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col flex-1 overflow-hidden min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              {/* ROUTING DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                  Routing Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Trip Date
                    </Label>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start font-normal h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950",
                            !formData.date && "text-slate-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                          {formData.date ? (
                            format(new Date(formData.date), "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-250 rounded-2xl border-slate-200 dark:border-slate-800"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            formData.date ? new Date(formData.date) : undefined
                          }
                          defaultMonth={
                            formData.date ? new Date(formData.date) : undefined
                          }
                          captionLayout="dropdown"
                          fromYear={2000}
                          toYear={new Date().getFullYear()}
                          onSelect={(date) => {
                            if (date) {
                              setFormData({
                                ...formData,
                                date: format(date, "yyyy-MM-dd"),
                              });
                              setIsCalendarOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Customer / Client
                    </Label>
                    <Input
                      value={formData.customerId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerId: e.target.value.toUpperCase(),
                        })
                      }
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Farm Name
                    </Label>
                    <Input
                      value={formData.farmName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          farmName: e.target.value.toUpperCase(),
                        })
                      }
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Origin
                    </Label>
                    <Popover open={isOriginOpen} onOpenChange={setIsOriginOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isOriginOpen}
                          disabled={isLoadingLocations}
                          className="w-full justify-between font-normal h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 text-[15px]"
                        >
                          <span className="truncate pr-2">
                            {formData.origin ||
                              (isLoadingLocations
                                ? "Loading..."
                                : "Select Origin")}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[350px] p-0 z-250 rounded-2xl border-slate-200 dark:border-slate-800"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search City or Province..."
                            className="h-11"
                          />
                          <CommandList className="max-h-[250px]">
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                              {phLocations.map((loc) => (
                                <CommandItem
                                  key={loc.value}
                                  value={loc.label}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      origin: loc.value,
                                    });
                                    setIsOriginOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 shrink-0",
                                      formData.origin === loc.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {loc.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Destination
                    </Label>
                    <Popover
                      open={isDestinationOpen}
                      onOpenChange={setIsDestinationOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isDestinationOpen}
                          disabled={isLoadingLocations}
                          className="w-full justify-between font-normal h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 text-[15px]"
                        >
                          <span className="truncate pr-2">
                            {formData.destination ||
                              (isLoadingLocations
                                ? "Loading..."
                                : "Select Destination")}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[350px] p-0 z-250 rounded-2xl border-slate-200 dark:border-slate-800"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search City or Province..."
                            className="h-11"
                          />
                          <CommandList className="max-h-[250px]">
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                              {phLocations.map((loc) => (
                                <CommandItem
                                  key={loc.value}
                                  value={loc.label}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      destination: loc.value,
                                    });
                                    setIsDestinationOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 shrink-0",
                                      formData.destination === loc.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {loc.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* FINANCIAL DETAILS */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest border-b border-emerald-100 dark:border-emerald-900/30 pb-2">
                  Financial Matrix
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Qty (Heads)
                    </Label>
                    <Input
                      type="number"
                      value={formData.qtyHeads || ""}
                      onChange={(e) =>
                        handleNumChange("qtyHeads", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 font-bold text-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Rate (₱)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rate || ""}
                      onChange={(e) => handleNumChange("rate", e.target.value)}
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 font-bold text-emerald-600"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-rose-500 uppercase">
                      Toll Fees
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.tollFees || ""}
                      onChange={(e) =>
                        handleNumChange("tollFees", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-rose-500 uppercase">
                      Meals
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.meals || ""}
                      onChange={(e) => handleNumChange("meals", e.target.value)}
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">
                        Diesel Expense
                      </Label>
                      <div className="flex bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDieselModeSwitch("cash")}
                          className={`px-3 py-1 text-[10px] font-black uppercase rounded ${dieselMode === "cash" ? "bg-slate-100 dark:bg-slate-950 shadow-sm text-blue-600" : "text-slate-500"}`}
                        >
                          CASH
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDieselModeSwitch("po")}
                          className={`px-3 py-1 text-[10px] font-black uppercase rounded ${dieselMode === "po" ? "bg-slate-100 dark:bg-slate-950 shadow-sm text-emerald-600" : "text-slate-500"}`}
                        >
                          P.O.
                        </button>
                      </div>
                    </div>
                    {dieselMode === "cash" ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.dieselCash || ""}
                        onChange={(e) =>
                          handleNumChange("dieselCash", e.target.value)
                        }
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                        placeholder="Cash Amount"
                      />
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.dieselPo || ""}
                        onChange={(e) =>
                          handleNumChange("dieselPo", e.target.value)
                        }
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                        placeholder="P.O. Amount"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Label className="text-[11px] font-bold text-rose-500 uppercase">
                      Roro Ship
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.roroShip || ""}
                      onChange={(e) =>
                        handleNumChange("roroShip", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-rose-500 uppercase">
                      Salary
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.salary || ""}
                      onChange={(e) =>
                        handleNumChange("salary", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-rose-500 uppercase">
                      Other Expenses
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.others || ""}
                      onChange={(e) =>
                        handleNumChange("others", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 rounded-2xl font-mono text-rose-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ✨ NEW: STICKY FOOTER WITH REAL-TIME FINANCIAL SUMMARY */}
            <DialogFooter className="flex-col border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-white/2 p-0 sm:p-0">
              {/* REAL-TIME SUMMARY BAR */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/2 p-3 sm:p-4">
                <div className="text-center bg-slate-100/50 dark:bg-white/5 p-1.5 sm:p-3 rounded-xl border border-slate-200/50 dark:border-white/5 overflow-hidden flex flex-col justify-center">
                  <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight sm:tracking-widest mb-0.5 sm:mb-1 truncate">
                    Collectible
                  </p>
                  <p
                    className="text-xs sm:text-lg text-blue-600 dark:text-blue-400 font-mono truncate"
                    title={formatPHP(grossCollectible)}
                  >
                    <AnimatedNumber value={grossCollectible} isCurrency />
                  </p>
                </div>
                <div className="text-center bg-rose-50/50 dark:bg-rose-500/10 p-1.5 sm:p-3 rounded-xl border border-rose-100/50 dark:border-rose-500/10 overflow-hidden flex flex-col justify-center">
                  <p className="text-[9px] sm:text-xs font-bold text-rose-500 uppercase tracking-tight sm:tracking-widest mb-0.5 sm:mb-1 truncate">
                    Expenses
                  </p>
                  <p
                    className="text-xs sm:text-lg text-rose-600 dark:text-rose-400 font-mono truncate"
                    title={`-${formatPHP(totalExpenses)}`}
                  >
                    -<AnimatedNumber value={totalExpenses} isCurrency />
                  </p>
                </div>
                <div className="text-center bg-emerald-50/50 dark:bg-emerald-500/10 p-1.5 sm:p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10 overflow-hidden flex flex-col justify-center">
                  <p className="text-[9px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-tight sm:tracking-widest mb-0.5 sm:mb-1 truncate">
                    Net Income
                  </p>
                  <p
                    className={cn(
                      "text-xs sm:text-lg font-mono truncate",
                      netIncome >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400",
                    )}
                    title={formatPHP(netIncome)}
                  >
                    <AnimatedNumber value={netIncome} isCurrency />
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 p-4 sm:p-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl h-12 w-full sm:w-auto font-bold border-slate-200 dark:border-white/10 dark:text-white dark:bg-transparent dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="relative rounded-xl h-12 w-full sm:flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-lg transition-all duration-300 overflow-hidden group/btn border-none disabled:opacity-70 disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />{" "}
                      Update Ledger
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<TripRecord>[] = [
  {
    id: "truck",
    header: "Truck",
    cell: ({ row }) => {
      const fleetCode = row.original.fleetCode;
      const plateNumber = row.original.plateNumber;
      return (
        <div className="font-medium whitespace-nowrap">
          {fleetCode || "N/A"} - {plateNumber || "NO PLATE"}
        </div>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        {row.getValue("customerId")}
      </span>
    ),
  },
  {
    accessorKey: "origin",
    header: "From",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.getValue("origin")}</span>
    ),
  },
  {
    accessorKey: "destination",
    header: "To",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-medium">
        {row.getValue("destination")}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const dateObj = new Date(row.getValue("date") as string);
      return (
        <span className="whitespace-nowrap text-muted-foreground">
          {dateObj.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "qtyHeads",
    header: () => <div className="text-right">Qty Hds</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatNum(row.getValue("qtyHeads"))}
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: () => <div className="text-right">Rate</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">
        {formatPHP(row.getValue("rate"))}
      </div>
    ),
  },
  {
    id: "collectible",
    header: () => <div className="text-right font-medium">Collectible</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium whitespace-nowrap">
        {formatPHP(row.original.qtyHeads * row.original.rate)}
      </div>
    ),
  },
  {
    accessorKey: "tollFees",
    header: () => <div className="text-right">Toll Fees</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("tollFees"))}
      </div>
    ),
  },
  {
    accessorKey: "dieselCash",
    header: () => <div className="text-right">Diesel (Cash)</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("dieselCash"))}
      </div>
    ),
  },
  {
    accessorKey: "dieselPo",
    header: () => <div className="text-right">Diesel (P.O.)</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("dieselPo"))}
      </div>
    ),
  },
  {
    accessorKey: "meals",
    header: () => <div className="text-right">Meals</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("meals"))}
      </div>
    ),
  },
  {
    accessorKey: "roroShip",
    header: () => <div className="text-right">Roro</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("roroShip"))}
      </div>
    ),
  },
  {
    accessorKey: "others",
    header: () => <div className="text-right">Others</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("others"))}
      </div>
    ),
  },
  {
    accessorKey: "salary",
    header: () => <div className="text-right">Salary</div>,
    cell: ({ row }) => (
      <div className="text-right text-destructive whitespace-nowrap">
        {formatPHP(row.getValue("salary"))}
      </div>
    ),
  },
  {
    id: "total",
    header: () => <div className="text-right font-bold">Total</div>,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="text-right font-bold text-destructive whitespace-nowrap">
          {formatPHP(
            t.tollFees +
              t.dieselCash +
              t.dieselPo +
              t.meals +
              t.roroShip +
              t.salary +
              t.others,
          )}
        </div>
      );
    },
  },
  {
    id: "netIncome",
    header: () => <div className="text-right font-bold">Net Income</div>,
    cell: ({ row }) => {
      const t = row.original;
      const net =
        t.qtyHeads * t.rate -
        (t.tollFees +
          t.dieselCash +
          t.dieselPo +
          t.meals +
          t.roroShip +
          t.salary +
          t.others);
      return (
        <div
          className={`text-right font-bold whitespace-nowrap ${net >= 0 ? "text-emerald-500" : "text-destructive"}`}
        >
          {formatPHP(net)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TripActionsCell trip={row.original} />,
  },
];
