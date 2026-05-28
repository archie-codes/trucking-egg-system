// app/(modules)/egg-sales/receiving/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NumberTicker } from "@/components/ui/number-ticker";

import { createEggBatch } from "@/app/actions/egg-actions";
import {
  Save,
  Loader2,
  CalendarIcon,
  PackageOpen,
  LayoutList,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const batchSchema = z.object({
  arrivalDate: z.string().min(1, "Date is required"),
  batchId: z.string().min(1, "Batch ID is required"),
  farmName: z.string().min(1, "Farm Name is required").toUpperCase(),
  rawTraysPickedUp: numField.pipe(
    z.number().min(1, "Please input pickup count"),
  ),

  qtySmall: numField,
  qtyMedium: numField,
  qtyLarge: numField,
  qtyXl: numField,
  qtyXxl: numField,
  qtyCracked: numField,
  qtyBroken: numField,
});

export default function ReceivingPage() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Generate a standard batch code (e.g., BATCH-20260528-0925)
  const generateBatchId = () => `BATCH-${format(new Date(), "yyyyMMdd-HHmm")}`;

  const form = useForm<
    z.input<typeof batchSchema>,
    unknown,
    z.infer<typeof batchSchema>
  >({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      arrivalDate: format(new Date(), "yyyy-MM-dd"),
      batchId: generateBatchId(),
      farmName: "",
      rawTraysPickedUp: "",
      qtySmall: "",
      qtyMedium: "",
      qtyLarge: "",
      qtyXl: "",
      qtyXxl: "",
      qtyCracked: "",
      qtyBroken: "",
    },
  });

  const { control } = form;

  // Watch values for real-time variance calculation
  const rawTrays = Number(useWatch({ control, name: "rawTraysPickedUp" })) || 0;
  const s = Number(useWatch({ control, name: "qtySmall" })) || 0;
  const m = Number(useWatch({ control, name: "qtyMedium" })) || 0;
  const l = Number(useWatch({ control, name: "qtyLarge" })) || 0;
  const xl = Number(useWatch({ control, name: "qtyXl" })) || 0;
  const xxl = Number(useWatch({ control, name: "qtyXxl" })) || 0;
  const cracked = Number(useWatch({ control, name: "qtyCracked" })) || 0;
  const broken = Number(useWatch({ control, name: "qtyBroken" })) || 0;

  const totalSorted = s + m + l + xl + xxl + cracked + broken;
  const variance = rawTrays - totalSorted;

  async function onSubmit(values: z.infer<typeof batchSchema>) {
    // Warning guard for missing eggs
    if (variance !== 0) {
      const confirmSave = window.confirm(
        `WARNING: Your sorted count (${totalSorted}) does not match the pickup count (${rawTrays}).\n\nVariance: ${variance} trays.\n\nAre you sure you want to save this batch?`,
      );
      if (!confirmSave) return;
    }

    toast.loading("Processing sorting batch...", { id: "batch-save" });
    const result = await createEggBatch(values);

    if (result.success) {
      toast.success("Batch successfully received & inventory updated!", {
        id: "batch-save",
      });
      form.reset({
        arrivalDate: format(new Date(), "yyyy-MM-dd"),
        batchId: generateBatchId(),
        farmName: "",
        rawTraysPickedUp: "",
        qtySmall: "",
        qtyMedium: "",
        qtyLarge: "",
        qtyXl: "",
        qtyXxl: "",
        qtyCracked: "",
        qtyBroken: "",
      });
    } else {
      toast.error("Database Error", {
        id: "batch-save",
        description: result.error,
      });
    }
  }

  return (
    <div className="sm:h-[95vh] w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl -z-10" />
        <h1 className="text-lg lg:text-xl font-black tracking-tight text-slate-900 dark:text-white">
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
        onSubmit={form.handleSubmit(onSubmit)}
        className="pb-36 lg:pb-32 space-y-4"
      >
        {/* TOP CARD: Primary Inbound Info */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
              <PackageOpen className="w-5 h-5 text-amber-500" />
              Egg Arrival
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-6">
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            "w-full justify-start font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950 text-md h-11 hover:bg-slate-50 dark:hover:bg-slate-900",
                            !field.value && "text-slate-500",
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
                          captionLayout="dropdown"
                          fromYear={2000}
                          toYear={new Date().getFullYear()}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setIsCalendarOpen(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError errors={[fieldState.error]} />
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
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950/50 font-mono text-sm"
                    />
                    <FieldError errors={[fieldState.error]} />
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
                      className="h-11 rounded-xl uppercase font-semibold"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="rawTraysPickedUp"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase">
                      Total Trays Arrived
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 rounded-xl font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* BOTTOM CARD: Sorting Matrix */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
              <LayoutList className="w-5 h-5 text-blue-500" />
              Sorting & QA Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-6 space-y-6">
            {/* Good Eggs */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Classified Inventory (Trays)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {(["Small", "Medium", "Large", "Xl", "Xxl"] as const).map(
                  (size) => (
                    <Controller
                      key={size}
                      name={`qty${size}`}
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex flex-col space-y-1">
                          <Label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {size.toUpperCase()}
                          </Label>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            onClick={(e) => e.currentTarget.select()}
                            className="h-11 rounded-lg font-mono text-blue-600 dark:text-blue-400 font-bold focus-visible:ring-blue-500"
                          />
                        </div>
                      )}
                    />
                  ),
                )}
              </div>
            </div>

            {/* Losses */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">
                Losses & Rejects (Trays)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Controller
                  name="qtyCracked"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex flex-col space-y-1">
                      <Label className="text-xs font-bold text-rose-500 uppercase">
                        Cracked
                      </Label>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 rounded-lg font-mono text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="qtyBroken"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex flex-col space-y-1">
                      <Label className="text-xs font-bold text-rose-500 uppercase">
                        Broken/Spoiled
                      </Label>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 rounded-lg font-mono text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 right-0 left-0 md:left-(--sidebar-width,16rem) transition-[left] duration-300 ease-in-out bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Variance Calculator UI */}
          <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
            <div className="text-center sm:text-left flex-1 sm:flex-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Total Sorted
              </p>
              <p className="text-lg sm:text-xl font-mono font-bold text-slate-900 dark:text-white">
                <NumberTicker value={totalSorted} />{" "}
                <span className="text-sm text-slate-500 font-sans">
                  / {rawTrays}
                </span>
              </p>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

            <div className="text-center sm:text-left flex-1 sm:flex-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Variance Check
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {variance === 0 && rawTrays > 0 ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Perfect Match
                  </span>
                ) : variance > 0 ? (
                  <span className="flex items-center text-rose-600 dark:text-rose-400 font-bold text-sm bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> Missing{" "}
                    {variance} Trays
                  </span>
                ) : variance < 0 ? (
                  <span className="flex items-center text-amber-600 dark:text-amber-400 font-bold text-sm bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> Over count (
                    {Math.abs(variance)})
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">
                    Awaiting inputs...
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            form="receiving-form"
            disabled={form.formState.isSubmitting || rawTrays === 0}
            className="h-11 px-8 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-lg font-semibold w-full sm:w-auto shrink-0"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Receive Batch
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
