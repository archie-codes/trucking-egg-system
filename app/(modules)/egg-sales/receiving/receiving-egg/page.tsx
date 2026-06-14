"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  createEggBatch,
  getEggFarmSuggestions,
} from "@/app/actions/egg-actions";
import {
  Save,
  Loader2,
  CalendarIcon,
  PackageOpen,
  LayoutList,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

// Standard Constants
const TRAYS_PER_CASE = 12;
const EGGS_PER_TRAY = 30;

const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const batchSchema = z.object({
  arrivalDate: z.string().min(1, "Date is required"),
  batchId: z.string().min(1, "Batch ID is required"),
  farmName: z.string().min(1, "Farm Name is required").toUpperCase(),

  rawCasesPickedUp: numField,
  rawTraysPickedUp: numField,

  qtyPeewee: numField,
  qtyXs: numField,
  qtySmall: numField,
  qtyMedium: numField,
  qtyLarge: numField,
  qtyXl: numField,
  qtyXxl: numField,
  qtyCracked: numField,
  qtyBroken: numField,
  qtyDirty: numField,

  brownQtyPeewee: numField,
  brownQtyXs: numField,
  brownQtySmall: numField,
  brownQtyMedium: numField,
  brownQtyLarge: numField,
  brownQtyXl: numField,
  brownQtyXxl: numField,
  brownQtyAssorted: numField,
  brownQtyCracked: numField,
  brownQtyBroken: numField,
  brownQtyDirty: numField,
});

// ✨ UPGRADED: Now includes Seconds + a 4-character random unique string
const generateBatchId = (date: Date = new Date()) => {
  const timestamp = format(date, "yyyyMMdd-HHmmss");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BATCH-${timestamp}-${randomChars}`;
};

export default function ReceivingPage() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [farmSuggestions, setFarmSuggestions] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // ✨ NEW Modal State
  const [isBatchIdClicked, setIsBatchIdClicked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFarmOriginShaking, setIsFarmOriginShaking] = useState(false);

  // Use a lazy state initializer to guarantee Math.random() only runs once on mount
  const [initialBatchId] = useState(generateBatchId);

  useEffect(() => {
    getEggFarmSuggestions().then((res) => {
      if (res.success) {
        setFarmSuggestions(res.farms || []);
      }
    });
  }, []);

  const form = useForm<
    z.input<typeof batchSchema>,
    unknown,
    z.infer<typeof batchSchema>
  >({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      arrivalDate: format(new Date(), "yyyy-MM-dd"),
      batchId: initialBatchId,
      farmName: "",
      rawCasesPickedUp: "",
      rawTraysPickedUp: "",
      qtyPeewee: "",
      qtyXs: "",
      qtySmall: "",
      qtyMedium: "",
      qtyLarge: "",
      qtyXl: "",
      qtyXxl: "",
      qtyCracked: "",
      qtyBroken: "",
      qtyDirty: "",
      brownQtyPeewee: "",
      brownQtyXs: "",
      brownQtySmall: "",
      brownQtyMedium: "",
      brownQtyLarge: "",
      brownQtyXl: "",
      brownQtyXxl: "",
      brownQtyAssorted: "",
      brownQtyCracked: "",
      brownQtyBroken: "",
      brownQtyDirty: "",
    },
  });

  const { control } = form;

  const rawCases = Number(useWatch({ control, name: "rawCasesPickedUp" })) || 0;
  const rawTrays = Number(useWatch({ control, name: "rawTraysPickedUp" })) || 0;

  const totalPickupTrays = rawCases * TRAYS_PER_CASE + rawTrays;
  const totalExpectedPieces = totalPickupTrays * EGGS_PER_TRAY;

  const peewee = Number(useWatch({ control, name: "qtyPeewee" })) || 0;
  const xs = Number(useWatch({ control, name: "qtyXs" })) || 0;
  const s = Number(useWatch({ control, name: "qtySmall" })) || 0;
  const m = Number(useWatch({ control, name: "qtyMedium" })) || 0;
  const l = Number(useWatch({ control, name: "qtyLarge" })) || 0;
  const xl = Number(useWatch({ control, name: "qtyXl" })) || 0;
  const xxl = Number(useWatch({ control, name: "qtyXxl" })) || 0;
  const cracked = Number(useWatch({ control, name: "qtyCracked" })) || 0;
  const broken = Number(useWatch({ control, name: "qtyBroken" })) || 0;
  const dirty = Number(useWatch({ control, name: "qtyDirty" })) || 0;

  const bPeewee = Number(useWatch({ control, name: "brownQtyPeewee" })) || 0;
  const bXs = Number(useWatch({ control, name: "brownQtyXs" })) || 0;
  const bS = Number(useWatch({ control, name: "brownQtySmall" })) || 0;
  const bM = Number(useWatch({ control, name: "brownQtyMedium" })) || 0;
  const bL = Number(useWatch({ control, name: "brownQtyLarge" })) || 0;
  const bXl = Number(useWatch({ control, name: "brownQtyXl" })) || 0;
  const bXxl = Number(useWatch({ control, name: "brownQtyXxl" })) || 0;
  const bAssorted =
    Number(useWatch({ control, name: "brownQtyAssorted" })) || 0;
  const bCracked = Number(useWatch({ control, name: "brownQtyCracked" })) || 0;
  const bBroken = Number(useWatch({ control, name: "brownQtyBroken" })) || 0;
  const bDirty = Number(useWatch({ control, name: "brownQtyDirty" })) || 0;

  // ✨ Added Dirty to total calculation
  const totalSortedPieces =
    peewee +
    xs +
    s +
    m +
    l +
    xl +
    xxl +
    cracked +
    broken +
    dirty +
    bPeewee +
    bXs +
    bS +
    bM +
    bL +
    bXl +
    bXxl +
    bAssorted +
    bCracked +
    bBroken +
    bDirty;
  const variancePieces = totalExpectedPieces - totalSortedPieces;

  // Handles the initial click on the bottom bar
  const handlePreSubmitCheck = () => {
    const farmName = form.getValues("farmName");
    if (!farmName || farmName.trim() === "") {
      setIsFarmOriginShaking(true);
      form.setFocus("farmName"); // ✨ Auto-focus the field
      setTimeout(() => setIsFarmOriginShaking(false), 600);
      toast.error("Missing Origin Farm", {
        description: "Please select or type the farm origin before proceeding.",
      });
      return;
    }

    if (totalExpectedPieces === 0) {
      toast.error("Invalid Entry", {
        description: "Please enter the Cases/Trays picked up.",
      });
      return;
    }

    // ✨ STRICT GUARD: Prevent saving if eggs are missing or overcounted
    if (variancePieces !== 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600); // Remove class after animation
      const isMissing = variancePieces > 0;
      toast.error(isMissing ? "Missing Eggs Detected" : "Overcount Detected", {
        description: `You are ${isMissing ? "missing" : "over by"} ${Math.abs(variancePieces)} pieces. Please correct the sorting breakdown.`,
        duration: 5000,
      });
      return;
    }

    // If perfect, open the custom modal
    setIsConfirmModalOpen(true);
  };

  // Handles the actual database save from inside the modal
  async function onFinalSubmit(values: z.infer<typeof batchSchema>) {
    setIsConfirmModalOpen(false);
    toast.loading("Processing sorting batch...", { id: "batch-save" });
    const result = await createEggBatch(values);

    if (result.success) {
      toast.success("Batch successfully received & inventory updated!", {
        id: "batch-save",
      });

      if (!farmSuggestions.includes(values.farmName)) {
        setFarmSuggestions((prev) => [...prev, values.farmName]);
      }

      form.reset({
        arrivalDate: format(new Date(), "yyyy-MM-dd"),
        batchId: generateBatchId(),
        farmName: "",
        rawCasesPickedUp: "",
        rawTraysPickedUp: "",
        qtyPeewee: "",
        qtyXs: "",
        qtySmall: "",
        qtyMedium: "",
        qtyLarge: "",
        qtyXl: "",
        qtyXxl: "",
        qtyCracked: "",
        qtyBroken: "",
        qtyDirty: "",
        brownQtyPeewee: "",
        brownQtyXs: "",
        brownQtySmall: "",
        brownQtyMedium: "",
        brownQtyLarge: "",
        brownQtyXl: "",
        brownQtyXxl: "",
        brownQtyAssorted: "",
        brownQtyCracked: "",
        brownQtyBroken: "",
        brownQtyDirty: "",
      });
    } else {
      toast.error("Database Error", {
        id: "batch-save",
        description: result.error,
      });
    }
  }

  return (
    <>
      <style>{`
        @keyframes error-pulse {
          0%, 100% { box-shadow: 0 0 0px rgba(239, 68, 68, 0); border-color: #fca5a5; }
          50% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.8); border-color: #ef4444; }
        }
        .animate-error-pulse {
          animation: error-pulse 0.3s ease-in-out 3;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 3;
        }
      `}</style>
      <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl -z-10" />
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-600 to-orange-500">
              Bodega Receiving
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            Inbound Farm Pickups & QA Sorting
          </p>
        </div>

        <form
          id="receiving-form"
          onSubmit={form.handleSubmit(onFinalSubmit)}
          className="pb-36 lg:pb-32 space-y-4"
        >
          {/* TOP CARD: Primary Inbound Info */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
              <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                <PackageOpen className="w-5 h-5 text-amber-500" />
                Manifest & Arrival (Bulk Count)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 space-y-6">
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Controller
                  name="arrivalDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                        Arrival Date
                      </FieldLabel>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="arrivalDate"
                            className={cn(
                              "w-full justify-start font-normal border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 text-md h-11 hover:bg-amber-100 dark:hover:bg-amber-900/40",
                              !field.value && "text-amber-700/50",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            defaultMonth={
                              field.value ? new Date(field.value) : undefined
                            }
                            disabled={(date) => date > new Date()}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                                form.setValue("batchId", generateBatchId(date));
                                setIsCalendarOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                  )}
                />

                <Controller
                  name="batchId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                        Batch ID
                      </FieldLabel>
                      <Input
                        {...field}
                        readOnly // ✨ LOCKS THE FIELD
                        tabIndex={-1} // ✨ Skips this field when pressing 'Tab'
                        onClick={() => {
                          if (!isBatchIdClicked) {
                            setIsBatchIdClicked(true);
                            setTimeout(() => setIsBatchIdClicked(false), 900); // 3 pulses * 300ms
                            toast("Automated Batch ID", {
                              description:
                                "This ID is auto-generated and cannot be edited manually.",
                            });
                          }
                        }}
                        className={cn(
                          "h-11 rounded-xl font-mono text-sm cursor-not-allowed transition-all",
                          isBatchIdClicked
                            ? "bg-red-50 dark:bg-red-950/30 text-red-600 animate-error-pulse border-red-500"
                            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-100",
                        )}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="farmName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                        Origin Farm
                      </FieldLabel>
                      <Input
                        {...field}
                        placeholder="e.g. SJK FARM"
                        className={cn(
                          "h-11 rounded-xl uppercase font-semibold transition-all duration-300",
                          isFarmOriginShaking
                            ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-600 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-100",
                        )}
                        list="farm-suggestions"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                      <datalist id="farm-suggestions">
                        {farmSuggestions.map((f, i) => (
                          <option key={i} value={f} />
                        ))}
                      </datalist>
                    </Field>
                  )}
                />
              </FieldGroup>

              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="rawCasesPickedUp"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase">
                        Cases (12 Trays)
                      </FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="0"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "+") {
                            e.preventDefault();
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 rounded-xl font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="rawTraysPickedUp"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase">
                        Extra Trays
                      </FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="0"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "+") {
                            e.preventDefault();
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 rounded-xl font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* BOTTOM CARD: Sorting Matrix (Pieces) */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                <LayoutList className="w-5 h-5 text-blue-500" />
                Sorting & QA Breakdown
              </CardTitle>
              <div className="text-[10px] sm:text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-lg tracking-wider">
                ENTER IN PIECES (EGGS)
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-6 space-y-6">
              {/* WHITE EGGS HEADER */}
              <div className="pb-2 mb-2 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  White Eggs
                </h3>
              </div>
              {/* Good Eggs */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Classified Inventory (Pcs)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                  {[
                    {
                      name: "qtyPeewee" as const,
                      size: "Peewee",
                      color:
                        "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50",
                      labelColor: "text-indigo-600 dark:text-indigo-400",
                    },
                    {
                      name: "qtyXs" as const,
                      size: "Xs",
                      color:
                        "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
                      labelColor: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      name: "qtySmall" as const,
                      size: "Small",
                      color:
                        "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
                      labelColor: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      name: "qtyMedium" as const,
                      size: "Medium",
                      color:
                        "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
                      labelColor: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      name: "qtyLarge" as const,
                      size: "Large",
                      color:
                        "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
                      labelColor: "text-amber-600 dark:text-amber-400",
                    },
                    {
                      name: "qtyXl" as const,
                      size: "Xl",
                      color:
                        "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50",
                      labelColor: "text-orange-600 dark:text-orange-400",
                    },
                    {
                      name: "qtyXxl" as const,
                      size: "Xxl",
                      color:
                        "text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50",
                      labelColor: "text-purple-600 dark:text-purple-400",
                    },
                  ].map(({ name, size, color, labelColor }) => (
                    <Controller
                      key={size}
                      name={name}
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex flex-col space-y-1">
                          <Label
                            className={cn(
                              "text-[10px] sm:text-xs font-bold uppercase",
                              labelColor,
                            )}
                          >
                            {size}
                          </Label>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            onClick={(e) => e.currentTarget.select()}
                            className={cn(
                              "h-11 rounded-xl font-mono font-bold",
                              color,
                            )}
                          />
                        </div>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Losses & Downgrades */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">
                  Losses & Downgrades (Pcs)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <Controller
                    name="qtyCracked"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-fuchsia-500 uppercase">
                          Cracked
                        </Label>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onClick={(e) => e.currentTarget.select()}
                          className="h-11 rounded-xl font-mono text-fuchsia-600 bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-900/50"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name="qtyBroken"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-rose-500 uppercase">
                          Broken
                        </Label>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onClick={(e) => e.currentTarget.select()}
                          className="h-11 rounded-xl font-mono text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                        />
                      </div>
                    )}
                  />
                  {/* ✨ NEW: Dirty Eggs */}
                  <Controller
                    name="qtyDirty"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">
                          Dirty
                        </Label>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onClick={(e) => e.currentTarget.select()}
                          className="h-11 rounded-xl font-mono text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* BROWN EGGS HEADER */}
              <div className="pt-6 pb-2 mb-2 border-b-2 border-amber-200 dark:border-amber-900/50">
                <h3 className="text-md font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest">
                  Brown Eggs
                </h3>
              </div>

              {/* Brown Good Eggs */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Classified Inventory (Pcs)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    {
                      name: "brownQtyPeewee" as const,
                      size: "Peewee",
                      color:
                        "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50",
                      labelColor: "text-indigo-600 dark:text-indigo-400",
                    },
                    {
                      name: "brownQtyXs" as const,
                      size: "Xs",
                      color:
                        "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
                      labelColor: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      name: "brownQtySmall" as const,
                      size: "Small",
                      color:
                        "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
                      labelColor: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      name: "brownQtyMedium" as const,
                      size: "Medium",
                      color:
                        "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
                      labelColor: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      name: "brownQtyLarge" as const,
                      size: "Large",
                      color:
                        "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
                      labelColor: "text-amber-600 dark:text-amber-400",
                    },
                    {
                      name: "brownQtyXl" as const,
                      size: "Xl",
                      color:
                        "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50",
                      labelColor: "text-orange-600 dark:text-orange-400",
                    },
                    {
                      name: "brownQtyXxl" as const,
                      size: "Xxl",
                      color:
                        "text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50",
                      labelColor: "text-purple-600 dark:text-purple-400",
                    },
                    {
                      name: "brownQtyAssorted" as const,
                      size: "Assorted",
                      color:
                        "text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50",
                      labelColor: "text-teal-600 dark:text-teal-400",
                    },
                  ].map(({ name, size, color, labelColor }) => (
                    <Controller
                      key={size}
                      name={name}
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex flex-col space-y-1">
                          <Label
                            className={cn(
                              "text-[10px] sm:text-xs font-bold uppercase",
                              labelColor,
                            )}
                          >
                            {size}
                          </Label>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            onClick={(e) => e.currentTarget.select()}
                            className={cn(
                              "h-11 rounded-xl font-mono font-bold",
                              color,
                            )}
                          />
                        </div>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Brown Losses & Downgrades */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">
                  Losses & Downgrades (Pcs)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <Controller
                    name="brownQtyCracked"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-fuchsia-500 uppercase">
                          Cracked
                        </Label>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onClick={(e) => e.currentTarget.select()}
                          className="h-11 rounded-xl font-mono text-fuchsia-600 bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-900/50"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name="brownQtyBroken"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-rose-500 uppercase">
                          Broken
                        </Label>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onClick={(e) => e.currentTarget.select()}
                          className="h-11 rounded-xl font-mono text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name="brownQtyDirty"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">
                          Dirty
                        </Label>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onClick={(e) => e.currentTarget.select()}
                          className="h-11 rounded-xl font-mono text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* ✨ NEW: Custom Confirmation Modal */}
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle className="text-center text-xl font-black text-slate-900 dark:text-white">
                Confirm Receiving
              </DialogTitle>
              <DialogDescription className="text-center">
                Please verify the final piece count before logging to the
                database.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 my-4 space-y-3 border border-slate-100 dark:border-slate-800/60 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Batch ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {form.getValues("batchId")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Farm Origin:</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">
                  {form.getValues("farmName")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">
                  Pickup Volume:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {rawCases} Cases, {rawTrays} Trays
                </span>
              </div>
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Total QA Count
                </span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {totalSortedPieces.toLocaleString()} Pieces
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* White Eggs */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                    White Eggs
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Peewee:</span>
                      <span className="font-bold text-indigo-600">{peewee}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">XS:</span>
                      <span className="font-bold text-blue-600">{xs}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Small:</span>
                      <span className="font-bold text-blue-600">{s}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Medium:</span>
                      <span className="font-bold text-emerald-600">{m}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Large:</span>
                      <span className="font-bold text-amber-600">{l}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">XL:</span>
                      <span className="font-bold text-orange-600">{xl}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">XXL:</span>
                      <span className="font-bold text-purple-600">{xxl}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Cracked:</span>
                      <span className="font-bold text-fuchsia-600">{cracked}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Broken:</span>
                      <span className="font-bold text-rose-600">{broken}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Dirty:</span>
                      <span className="font-bold text-stone-600">{dirty}</span>
                    </div>
                  </div>
                </div>

                {/* Brown Eggs */}
                <div>
                  <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 pb-1 border-b border-amber-200/50 dark:border-amber-900/30">
                    Brown Eggs
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Peewee:</span>
                      <span className="font-bold text-amber-600">{bPeewee}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">XS:</span>
                      <span className="font-bold text-amber-600">{bXs}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Small:</span>
                      <span className="font-bold text-amber-600">{bS}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Medium:</span>
                      <span className="font-bold text-amber-600">{bM}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Large:</span>
                      <span className="font-bold text-amber-600">{bL}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">XL:</span>
                      <span className="font-bold text-amber-600">{bXl}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">XXL:</span>
                      <span className="font-bold text-amber-600">{bXxl}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Assorted:</span>
                      <span className="font-bold text-amber-600">{bAssorted}</span>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-x-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Cracked:</span>
                        <span className="font-bold text-amber-600">{bCracked}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Broken:</span>
                        <span className="font-bold text-amber-600">{bBroken}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Dirty:</span>
                        <span className="font-bold text-amber-600">{bDirty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:space-x-0 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit(onFinalSubmit)()}
                disabled={form.formState.isSubmitting}
                className="relative w-full rounded-xl h-11 bg-linear-to-r  from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg transition-all duration-300 overflow-hidden group/btn border-0"
              >
                <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out z-0" />
                <span className="relative z-10 flex items-center justify-center">
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm & Save"
                  )}
                </span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 right-0 left-0 md:left-(--sidebar-width,16rem) transition-[left] duration-300 ease-in-out bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="text-center sm:text-left flex-1 sm:flex-none">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                  Target Expected
                </p>
                <p className="text-lg sm:text-xl font-mono font-bold text-slate-900 dark:text-white leading-none">
                  <NumberTicker value={totalExpectedPieces} />{" "}
                  <span className="text-sm text-slate-500 font-sans">Pcs</span>
                </p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">
                  = {totalPickupTrays} Total Trays
                </p>
              </div>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

              <div className="text-center sm:text-left flex-1 sm:flex-none">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Variance Check
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {variancePieces === 0 && totalExpectedPieces > 0 ? (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Perfect Match
                    </span>
                  ) : variancePieces > 0 ? (
                    <span
                      className={cn(
                        "flex items-center text-rose-600 dark:text-rose-400 font-bold text-sm bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-md transition-all",
                        isShaking
                          ? "animate-shake border border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          : "animate-pulse border border-transparent",
                      )}
                    >
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      <span>
                        Missing <NumberTicker value={variancePieces} /> Eggs
                      </span>
                    </span>
                  ) : variancePieces < 0 ? (
                    <span
                      className={cn(
                        "flex items-center text-amber-600 dark:text-amber-400 font-bold text-sm bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md transition-all",
                        isShaking
                          ? "animate-shake border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          : "animate-pulse border border-transparent",
                      )}
                    >
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      <span>
                        Over count (
                        <NumberTicker value={Math.abs(variancePieces)} />)
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 font-medium">
                      Awaiting QA Count...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ✨ Changed to type="button" to trigger our custom guard function first */}
            <Button
              type="button"
              onClick={handlePreSubmitCheck}
              disabled={form.formState.isSubmitting || totalExpectedPieces === 0 || variancePieces !== 0}
              className={cn(
                "relative overflow-hidden group/btn border-0 h-11 px-8 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 text-white shadow-lg font-semibold w-full sm:w-auto shrink-0 transition-all duration-300",
                totalExpectedPieces === 0 || variancePieces !== 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-amber-500 hover:to-orange-400",
              )}
            >
              <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out z-0" />
              {form.formState.isSubmitting ? (
                <span className="relative z-10 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                </span>
              ) : variancePieces !== 0 && totalExpectedPieces > 0 ? (
                <span className="relative z-10 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" /> Resolve Variance
                </span>
              ) : (
                <span className="relative z-10 flex items-center">
                  <Save className="w-4 h-4 mr-2" /> Receive Batch
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
