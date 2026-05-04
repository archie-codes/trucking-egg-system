"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createTripRecord } from "@/app/actions/trip-actions";
import { getActiveTrucks } from "@/app/actions/truck-actions";
import { Save, Loader2, Truck, Wallet, FileText } from "lucide-react";

// 1. Zod Schema (Strict numbers for DB relation)
const tripSchema = z.object({
  truckId: z.number().min(1, "Please select a truck"),
  customerId: z.string().min(1, "Customer is required"),
  area: z.string().min(1, "Area/Province is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),

  qtyHeads: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Invalid rate"),

  // Expenses
  tollFees: z.number().min(0),
  dieselAmount: z.number().min(0),
  meals: z.number().min(0),
  roroShip: z.number().min(0),
  salary: z.number().min(0),
  others: z.number().min(0),
});

export default function NewTripPage() {
  // State for fetching real trucks from the DB
  const [availableTrucks, setAvailableTrucks] = useState<
    { id: number; code: string; plate: string }[]
  >([]);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(true);

  // Fetch active trucks on mount
  useEffect(() => {
    async function loadTrucks() {
      const result = await getActiveTrucks();
      if (result.success && result.data) {
        setAvailableTrucks(result.data);
      } else {
        toast.error("Failed to load trucks", { description: result.error });
      }
      setIsLoadingTrucks(false);
    }
    loadTrucks();
  }, []);

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      truckId: 0,
      customerId: "",
      area: "",
      origin: "",
      destination: "",
      qtyHeads: 0,
      rate: 0,
      tollFees: 0,
      dieselAmount: 0,
      meals: 0,
      roroShip: 0,
      salary: 0,
      others: 0,
    },
  });

  // Watchers for Live Excel-style tracking
  const { control } = form;
  const qtyHeads = useWatch({ control, name: "qtyHeads" }) || 0;
  const rate = useWatch({ control, name: "rate" }) || 0;
  const tollFees = useWatch({ control, name: "tollFees" }) || 0;
  const dieselAmount = useWatch({ control, name: "dieselAmount" }) || 0;
  const meals = useWatch({ control, name: "meals" }) || 0;
  const roroShip = useWatch({ control, name: "roroShip" }) || 0;
  const salary = useWatch({ control, name: "salary" }) || 0;
  const others = useWatch({ control, name: "others" }) || 0;

  // Live Math
  const grossCollectible = qtyHeads * rate;
  const totalExpenses =
    tollFees + dieselAmount + meals + roroShip + salary + others;
  const netIncome = grossCollectible - totalExpenses;

  async function onSubmit(values: z.infer<typeof tripSchema>) {
    toast.loading("Saving to database...", { id: "trip-save" });
    try {
      const result = await createTripRecord(values);
      if (result.success) {
        toast.success("Trip Record Saved", {
          id: "trip-save",
          description: `Logged net income of ₱${netIncome.toLocaleString()}`,
        });
        form.reset();
      } else {
        toast.error("Database Error", {
          id: "trip-save",
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Network Error", {
        id: "trip-save",
        description: "Failed to save trip.",
      });
    }
  }

  const parseNumber = (val: string) => (val === "" ? 0 : Number(val));

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-2xl">
              <Truck className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            Dispatch New Trip
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
            Live Hauling & Poultry Logistics
          </p>
        </div>
      </div>
      <form
        id="new-trip-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="pb-36 lg:pb-32"
      >
        {/* Changed to 12-column grid for better small laptop scaling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT: Trip Details (Takes more space on laptops because it has text fields) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <Card className="shadow-lg border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <CardHeader className=" border-b border-slate-100 dark:border-slate-800/60 pb-5 px-6 lg:px-8">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Trip Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 lg:pt-8 px-6 lg:px-8">
                <FieldGroup className="space-y-4 lg:space-y-5">
                  {/* Row 1: Truck Assignment */}
                  <Controller
                    name="truckId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="truckId"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Assigned Truck
                        </FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={
                            field.value ? field.value.toString() : undefined
                          }
                          disabled={isLoadingTrucks}
                        >
                          <SelectTrigger className="w-full rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 px-4 text-[15px] shadow-sm focus-within:ring-blue-500">
                            <SelectValue
                              placeholder={
                                isLoadingTrucks
                                  ? "Loading fleet data..."
                                  : "Select a truck..."
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95">
                            {availableTrucks.map((truck) => (
                              <SelectItem
                                key={truck.id}
                                value={truck.id.toString()}
                                className="rounded-lg cursor-pointer"
                              >
                                {truck.code} ({truck.plate})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Row 2: Customer & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="customerId"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="customerId"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Customer Name
                          </FieldLabel>
                          <Input
                            {...field}
                            id="customerId"
                            placeholder="E.g., Jollibee"
                            className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px]"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="area"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="area"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Area / Province
                          </FieldLabel>
                          <Input
                            {...field}
                            value={field.value || ""}
                            id="area"
                            placeholder="E.g., Pampanga"
                            className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px]"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  {/* Row 3: Origin & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="origin"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="origin"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Origin (From)
                          </FieldLabel>
                          <Input
                            {...field}
                            id="origin"
                            placeholder="Farm A"
                            className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px]"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="destination"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="destination"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Destination (To)
                          </FieldLabel>
                          <Input
                            {...field}
                            id="destination"
                            placeholder="Market B"
                            className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px]"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <Separator className="my-2 border-slate-100 dark:border-slate-800/60" />

                  {/* Row 4: Qty & Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="qtyHeads"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="qtyHeads"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Quantity (Heads)
                          </FieldLabel>
                          <Input
                            {...field}
                            id="qtyHeads"
                            type="number"
                            className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-bold text-blue-600 dark:text-blue-400"
                            onChange={(e) =>
                              field.onChange(parseNumber(e.target.value))
                            }
                            onClick={(e) => e.currentTarget.select()}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="rate"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="rate"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Rate per Head (₱)
                          </FieldLabel>
                          <Input
                            {...field}
                            id="rate"
                            type="number"
                            className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-bold text-emerald-600 dark:text-emerald-400"
                            onChange={(e) =>
                              field.onChange(parseNumber(e.target.value))
                            }
                            onClick={(e) => e.currentTarget.select()}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Expenses (Takes less space because it's just numbers) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <Card className="shadow-lg border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/60 pb-5 px-6 lg:px-8">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                  <Wallet className="w-5 h-5 text-rose-500" />
                  Trip Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 lg:pt-8 px-6 lg:px-8">
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-4">
                  <Controller
                    name="tollFees"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="tollFees"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Toll Fees
                        </FieldLabel>
                        <Input
                          {...field}
                          id="tollFees"
                          type="number"
                          className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) =>
                            field.onChange(parseNumber(e.target.value))
                          }
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="dieselAmount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="dieselAmount"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Diesel / Cash
                        </FieldLabel>
                        <Input
                          {...field}
                          id="dieselAmount"
                          type="number"
                          className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) =>
                            field.onChange(parseNumber(e.target.value))
                          }
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="meals"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="meals"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Meals
                        </FieldLabel>
                        <Input
                          {...field}
                          id="meals"
                          type="number"
                          className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) =>
                            field.onChange(parseNumber(e.target.value))
                          }
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="roroShip"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="roroShip"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Roro Ship
                        </FieldLabel>
                        <Input
                          {...field}
                          id="roroShip"
                          type="number"
                          className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) =>
                            field.onChange(parseNumber(e.target.value))
                          }
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="salary"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="salary"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Driver/Helper
                        </FieldLabel>
                        <Input
                          {...field}
                          id="salary"
                          type="number"
                          className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) =>
                            field.onChange(parseNumber(e.target.value))
                          }
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="others"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="others"
                          className="text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          Others / Crates
                        </FieldLabel>
                        <Input
                          {...field}
                          id="others"
                          type="number"
                          className="border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) =>
                            field.onChange(parseNumber(e.target.value))
                          }
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* STICKY BOTTOM BAR WITH PREMIUM BUTTON */}
        <div className="fixed bottom-0 right-0 left-0 md:left-(--sidebar-width,16rem) transition-[left] duration-300 ease-in-out bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Totals Section */}
            <div className="flex w-full md:w-auto justify-between md:justify-start space-x-2 sm:space-x-8 lg:space-x-12">
              <div className="text-center md:text-left">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                  Gross
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                  ₱{grossCollectible.toLocaleString()}
                </p>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div className="text-center md:text-left">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                  Expenses
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-rose-500">
                  - ₱{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div className="text-center md:text-left">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                  Net Income
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-500 drop-shadow-sm">
                  ₱{netIncome.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              form="new-trip-form"
              disabled={form.formState.isSubmitting}
              className="relative h-12 sm:h-14 px-6 lg:px-10 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold w-full md:w-auto text-base lg:text-lg disabled:opacity-70 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 sm:w-6 sm:h-6 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                  Save Record
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
