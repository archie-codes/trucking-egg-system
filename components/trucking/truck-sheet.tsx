// "use client";

// import { useState } from "react";
// import { toast } from "sonner";
// import { format } from "date-fns"; // ✨ Added for exact date formatting
// import { cn } from "@/lib/utils"; // ✨ Added for Tailwind classes
// import {
//   Loader2,
//   Save,
//   Truck,
//   Hash,
//   Wrench,
//   Settings,
//   ShieldCheck,
//   CalendarIcon,
// } from "lucide-react";

// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Field, FieldLabel } from "@/components/ui/field";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// // ✨ ADDED: Shadcn Calendar and Popover
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// import { registerTruck } from "@/app/actions/truck-actions";

// export function TruckSheet({
//   isOpen,
//   onClose,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
// }) {
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ✨ ADDED: State to manage the calendar popover and selected date
//   const [isCalendarOpen, setIsCalendarOpen] = useState(false);
//   const [ltoExpiry, setLtoExpiry] = useState<Date | undefined>(undefined);

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const formData = new FormData(e.currentTarget);
//     const result = await registerTruck(formData);

//     if (result.success) {
//       toast.success("Truck Registered", {
//         description: `${formData.get("fleetCode")} has been added to the fleet.`,
//         className:
//           "border-emerald-500/30 bg-emerald-50/80 backdrop-blur-md shadow-xl",
//       });
//       setLtoExpiry(undefined); // Reset the date when successful
//       onClose(); // Slide the panel away
//     } else {
//       toast.error("Registration Failed", { description: result.error });
//     }
//     setIsSubmitting(false);
//   }

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent className="overflow-hidden w-full sm:max-w-md bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-l border-white/20 dark:border-slate-800/50 shadow-2xl p-0 flex flex-col h-full z-[200]">
//         <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-90 z-10" />

//         <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
//           <SheetHeader className="mb-8 mt-2">
//             <SheetTitle className="text-lg lg:text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm flex items-center gap-2">
//               <Truck className="w-6 h-6 text-blue-500" />
//               Register Truck
//             </SheetTitle>
//             <SheetDescription className="text-base text-slate-500 dark:text-slate-400">
//               Add a new hauling asset to the Fhernie Logistics database.
//             </SheetDescription>
//           </SheetHeader>

//           <form
//             id="add-truck-form"
//             onSubmit={handleSubmit}
//             className="space-y-6 pb-10"
//           >
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <Field className="space-y-2 group">
//                 <FieldLabel
//                   htmlFor="fleetCode"
//                   className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
//                 >
//                   <Hash className="w-4 h-4 text-blue-500" /> Fleet Code
//                 </FieldLabel>
//                 <Input
//                   id="fleetCode"
//                   name="fleetCode"
//                   placeholder="e.g., F1"
//                   required
//                   className="text-[15px] h-[46px] px-4 rounded-xl uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
//                 />
//               </Field>

//               <Field className="space-y-2 group">
//                 <FieldLabel
//                   htmlFor="plateNumber"
//                   className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
//                 >
//                   <Hash className="w-4 h-4 text-blue-500" /> Plate No.
//                 </FieldLabel>
//                 <Input
//                   id="plateNumber"
//                   name="plateNumber"
//                   placeholder="e.g., TQC 585"
//                   required
//                   className="text-[15px] h-[46px] px-4 rounded-xl font-mono uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
//                 />
//               </Field>
//             </div>

//             {/* HARDWARE FIELDS */}
//             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-5">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Field className="space-y-2 group">
//                   <FieldLabel
//                     htmlFor="engineNo"
//                     className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
//                   >
//                     <Settings className="w-4 h-4 text-slate-500" /> Engine No.
//                   </FieldLabel>
//                   <Input
//                     id="engineNo"
//                     name="engineNo"
//                     placeholder="Optional"
//                     className="text-[15px] h-[46px] px-4 rounded-xl font-mono uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
//                   />
//                 </Field>

//                 <Field className="space-y-2 group">
//                   <FieldLabel
//                     htmlFor="chassisNo"
//                     className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
//                   >
//                     <ShieldCheck className="w-4 h-4 text-slate-500" /> Chassis
//                     No.
//                   </FieldLabel>
//                   <Input
//                     id="chassisNo"
//                     name="chassisNo"
//                     placeholder="Optional"
//                     className="text-[15px] h-[46px] px-4 rounded-xl font-mono uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
//                   />
//                 </Field>
//               </div>

//               <Field className="space-y-2 group">
//                 <FieldLabel
//                   htmlFor="ltoExpiry"
//                   className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
//                 >
//                   <CalendarIcon className="w-4 h-4 text-rose-500" /> LTO Expiry
//                   Date
//                 </FieldLabel>

//                 {/* ✨ HIDDEN INPUT: Feeds the selected date to FormData on submit */}
//                 <input
//                   type="hidden"
//                   name="ltoExpiry"
//                   value={ltoExpiry ? format(ltoExpiry, "yyyy-MM-dd") : ""}
//                 />

//                 {/* ✨ NEW SHADCN CALENDAR POPOVER */}
//                 <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal h-[46px]! border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950 text-[15px] shadow-sm",
//                         !ltoExpiry && "text-slate-500",
//                       )}
//                     >
//                       {ltoExpiry ? (
//                         format(ltoExpiry, "MMMM dd, yyyy")
//                       ) : (
//                         <span>Pick a date</span>
//                       )}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent
//                     className="w-auto p-0 z-[250] rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl"
//                     align="start"
//                   >
//                     <Calendar
//                       mode="single"
//                       selected={ltoExpiry}
//                       onSelect={(date) => {
//                         setLtoExpiry(date);
//                         setIsCalendarOpen(false);
//                       }}
//                       captionLayout="dropdown"
//                       fromYear={2000}
//                       toYear={new Date().getFullYear() + 10}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </Field>
//             </div>

//             <Field className="space-y-2 group">
//               <FieldLabel
//                 htmlFor="status"
//                 className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
//               >
//                 <Wrench className="w-4 h-4 text-blue-500" /> Current Status
//               </FieldLabel>
//               <Select name="status" defaultValue="active">
//                 <SelectTrigger className="text-[15px] h-[46px]! px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/50 shadow-sm">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="rounded-xl shadow-xl z-[250]">
//                   <SelectItem
//                     value="active"
//                     className="cursor-pointer text-emerald-600 font-medium hover:bg-slate-100"
//                   >
//                     Active (Ready for Haul)
//                   </SelectItem>
//                   <SelectItem
//                     value="maintenance"
//                     className="cursor-pointer text-amber-600 font-medium hover:bg-slate-100"
//                   >
//                     Under Maintenance
//                   </SelectItem>
//                   <SelectItem
//                     value="inactive"
//                     className="cursor-pointer text-slate-500 font-medium hover:bg-slate-100"
//                   >
//                     Inactive / Sold
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </Field>
//           </form>
//         </div>

//         {/* Fixed Footer for Save Button */}
//         <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0">
//           <Button
//             type="submit"
//             form="add-truck-form"
//             disabled={isSubmitting}
//             className="relative w-full h-14 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all font-bold text-base overflow-hidden group/btn"
//           >
//             <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Registering...
//               </>
//             ) : (
//               <>
//                 <Save className="mr-3 h-5 w-5 transition-transform group-hover/btn:scale-110" />{" "}
//                 Register Truck
//               </>
//             )}
//           </Button>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Save,
  Truck,
  Hash,
  Wrench,
  Settings,
  ShieldCheck,
  CalendarIcon,
  ChevronRight,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { registerTruck } from "@/app/actions/truck-actions";

// ── Tiny section-divider label ──────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

// ── Reusable field wrapper ───────────────────────────────────────────────────
function FormField({
  id,
  label,
  icon,
  iconColor,
  children,
}: {
  id?: string;
  label: string;
  icon: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <Field className="space-y-1.5">
      <FieldLabel
        htmlFor={id}
        className={cn(
          "flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80",
        )}
      >
        <span className={cn("shrink-0", iconColor)}>{icon}</span>
        {label}
      </FieldLabel>
      {children}
    </Field>
  );
}

// ── Status badge helper ──────────────────────────────────────────────────────
const statusConfig = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  maintenance: {
    label: "Under Maintenance",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  inactive: {
    label: "Inactive / Sold",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
  },
};

// ── Main Component ───────────────────────────────────────────────────────────
export function TruckSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [ltoExpiry, setLtoExpiry] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState("active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await registerTruck(formData);

    if (result.success) {
      toast.success("Truck registered", {
        description: `${String(formData.get("fleetCode")).toUpperCase()} has been added to the fleet.`,
      });
      setLtoExpiry(undefined);
      setStatus("active");
      onClose();
    } else {
      toast.error("Registration failed", { description: result.error });
    }
    setIsSubmitting(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className={cn(
          "flex flex-col p-0 gap-0 w-full sm:max-w-[420px]",
          "bg-background border-l border-border/60",
          "z-200 h-full",
        )}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-linear-to-r from-blue-500 to-blue-400 z-10" />

        {/* ── Header ── */}
        <SheetHeader className="shrink-0 px-6 pt-8 pb-5 border-b border-border/60">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 shrink-0">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold text-foreground leading-tight">
                Register Truck
              </SheetTitle>
              <SheetDescription className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
                Add a new hauling asset to the Fhernie Logistics fleet.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 custom-scrollbar">
          <form
            id="add-truck-form"
            onSubmit={handleSubmit}
            className="space-y-7"
          >
            {/* IDENTIFICATION */}
            <div>
              <SectionLabel>Identification</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="fleetCode"
                  label="Fleet Code"
                  icon={<Hash className="h-3.5 w-3.5" />}
                  iconColor="text-blue-500"
                >
                  <Input
                    id="fleetCode"
                    name="fleetCode"
                    placeholder="F1"
                    required
                    className="h-10 rounded-lg text-sm uppercase font-mono tracking-wider bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground/50"
                  />
                </FormField>

                <FormField
                  id="plateNumber"
                  label="Plate No."
                  icon={<Hash className="h-3.5 w-3.5" />}
                  iconColor="text-blue-500"
                >
                  <Input
                    id="plateNumber"
                    name="plateNumber"
                    placeholder="TQC 585"
                    required
                    className="h-10 rounded-lg text-sm uppercase font-mono tracking-wider bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground/50"
                  />
                </FormField>
              </div>
            </div>

            {/* HARDWARE */}
            <div>
              <SectionLabel>Hardware Details</SectionLabel>
              <div className="rounded-xl border border-border/50 bg-muted/30 dark:bg-muted/10 overflow-hidden divide-y divide-border/40">
                {/* Engine No. */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background border border-border/60">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Engine No.
                    </p>
                    <Input
                      id="engineNo"
                      name="engineNo"
                      placeholder="Optional"
                      className="h-8 border-0 bg-transparent p-0 text-sm font-mono uppercase tracking-wider shadow-none focus-visible:ring-0 placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                {/* Chassis No. */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background border border-border/60">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Chassis No.
                    </p>
                    <Input
                      id="chassisNo"
                      name="chassisNo"
                      placeholder="Optional"
                      className="h-8 border-0 bg-transparent p-0 text-sm font-mono uppercase tracking-wider shadow-none focus-visible:ring-0 placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                {/* LTO Expiry */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background border border-border/60">
                    <CalendarIcon className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                      LTO Expiry Date
                    </p>
                    <input
                      type="hidden"
                      name="ltoExpiry"
                      value={ltoExpiry ? format(ltoExpiry, "yyyy-MM-dd") : ""}
                    />
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between text-sm transition-colors",
                            ltoExpiry
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/50",
                          )}
                        >
                          <span>
                            {ltoExpiry
                              ? format(ltoExpiry, "MMMM dd, yyyy")
                              : "Pick a date"}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-250 rounded-xl border-border/60 shadow-lg"
                        align="start"
                        sideOffset={8}
                      >
                        <Calendar
                          mode="single"
                          selected={ltoExpiry}
                          onSelect={(date) => {
                            setLtoExpiry(date);
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
              </div>
            </div>

            {/* STATUS */}
            <div>
              <SectionLabel>Operational Status</SectionLabel>
              <Select
                name="status"
                defaultValue="active"
                onValueChange={setStatus}
              >
                {/* ✨ FIX: Removed the extra hardcoded dot div from SelectTrigger */}
                <SelectTrigger
                  className={cn(
                    "h-11 w-full rounded-xl text-sm bg-background border-border/60",
                    "focus:ring-1 focus:ring-blue-500/50",
                    "data-[state=open]:border-blue-500/50",
                  )}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 shadow-lg z-250">
                  {(
                    Object.entries(statusConfig) as [
                      string,
                      (typeof statusConfig)[keyof typeof statusConfig],
                    ][]
                  ).map(([value, cfg]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="cursor-pointer py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            cfg.dot,
                          )}
                        />
                        <span className={cn("text-sm font-medium", cfg.text)}>
                          {cfg.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status hint */}
              <p className="mt-2 text-[12px] text-muted-foreground/60 leading-relaxed pl-1">
                {status === "active" &&
                  "This truck will be available for trip assignment immediately."}
                {status === "maintenance" &&
                  "Truck will be excluded from active dispatch until cleared."}
                {status === "inactive" &&
                  "Truck will be archived and hidden from dispatch lists."}
              </p>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 py-4 border-t border-border/60 bg-muted/20 dark:bg-muted/5">
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl text-sm font-medium border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-truck-form"
              disabled={isSubmitting}
              className="relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold"
            >
              <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4  animate-spin" />
                  Registering…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                  Register Truck
                </span>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
