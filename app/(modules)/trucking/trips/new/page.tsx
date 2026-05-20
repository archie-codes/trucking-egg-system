"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { createTripRecord } from "@/app/actions/trip-actions";
import { getActiveTrucks } from "@/app/actions/truck-actions";
import {
  Save,
  Loader2,
  FileText,
  Wallet,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";

// Helper to accept empty strings but transform to numbers safely for DB insertion
const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const tripSchema = z.object({
  date: z.string().min(1, "Date is required"),
  truckId: z.number().min(1, "Please select a truck"),
  customerId: z.string().min(1, "Customer Name is required").toUpperCase(),
  farmName: z.string().min(1, "Farm Address is required").toUpperCase(),

  origin: z.string().min(1, "Origin is required").toUpperCase(),
  destination: z.string().min(1, "Destination is required").toUpperCase(),

  qtyHeads: numField.pipe(z.number().min(1, "Quantity must be at least 1")),
  rate: numField.pipe(z.number().min(0, "Invalid rate")),

  tollFees: numField,
  dieselCash: numField,
  dieselPo: numField,
  meals: numField,
  roroShip: numField,
  salary: numField,
  others: numField,
});

export default function NewTripPage() {
  const [availableTrucks, setAvailableTrucks] = useState<
    { id: number; code: string; plate: string }[]
  >([]);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(true);

  const [phLocations, setPhLocations] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  const [dieselMode, setDieselMode] = useState<"cash" | "po">("cash");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      const truckResult = await getActiveTrucks();
      if (truckResult.success && truckResult.data) {
        // ✨ FIX: Bulletproof Natural Sorting using Regex Number Extraction
        // This physically pulls the numbers out of "F10" and "F9" to mathematically compare them.
        const sortedTrucks = [...truckResult.data].sort((a, b) => {
          const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
          const numB = parseInt(b.code.replace(/\D/g, "")) || 0;

          if (numA !== numB) {
            return numA - numB; // 10 will always be greater than 9
          }
          return a.code.localeCompare(b.code); // Fallback if no numbers exist
        });

        setAvailableTrucks(sortedTrucks);
      } else {
        toast.error("Failed to load trucks");
      }
      setIsLoadingTrucks(false);

      try {
        const [provRes, cityRes] = await Promise.all([
          fetch("https://psgc.gitlab.io/api/provinces"),
          fetch("https://psgc.gitlab.io/api/cities-municipalities"),
        ]);

        const provData = await provRes.json();
        const cityData = await cityRes.json();

        const provMap = new Map();
        provData.forEach((p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => provMap.set(p.code, p.name));

        const formattedLocations = cityData.map((city: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
          const provName = provMap.get(city.provinceCode) || "Metro Manila";
          const label = `${city.name}, ${provName}`;
          return {
            value: label.toUpperCase(),
            label: label,
          };
        });

        formattedLocations.sort((a: { label: string }, b: { label: string }) =>
          a.label.localeCompare(b.label),
        );
        setPhLocations(formattedLocations);
      } catch (error) {
        console.error("Failed to fetch PSGC locations:", error);
        toast.error("Could not load location data. Check connection.");
      } finally {
        setIsLoadingLocations(false);
      }
    }

    loadInitialData();
  }, []);

  const form = useForm<
    z.input<typeof tripSchema>,
    any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
    z.infer<typeof tripSchema>
  >({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      truckId: 0,
      customerId: "",
      farmName: "",
      origin: "",
      destination: "",
      qtyHeads: "",
      rate: "",
      tollFees: "",
      dieselCash: "",
      dieselPo: "",
      meals: "",
      roroShip: "",
      salary: "",
      others: "",
    },
  });

  const { control } = form;

  const qtyHeads = Number(useWatch({ control, name: "qtyHeads" })) || 0;
  const rate = Number(useWatch({ control, name: "rate" })) || 0;
  const tollFees = Number(useWatch({ control, name: "tollFees" })) || 0;
  const dieselCash = Number(useWatch({ control, name: "dieselCash" })) || 0;
  const dieselPo = Number(useWatch({ control, name: "dieselPo" })) || 0;
  const meals = Number(useWatch({ control, name: "meals" })) || 0;
  const roroShip = Number(useWatch({ control, name: "roroShip" })) || 0;
  const salary = Number(useWatch({ control, name: "salary" })) || 0;
  const others = Number(useWatch({ control, name: "others" })) || 0;

  const grossCollectible = qtyHeads * rate;
  const totalExpenses =
    tollFees + dieselCash + dieselPo + meals + roroShip + salary + others;
  const netIncome = grossCollectible - totalExpenses;

  const handleDieselModeSwitch = (mode: "cash" | "po") => {
    setDieselMode(mode);
    if (mode === "cash") {
      const currentPo = form.getValues("dieselPo");
      form.setValue("dieselCash", currentPo || "");
      form.setValue("dieselPo", "");
    } else {
      const currentCash = form.getValues("dieselCash");
      form.setValue("dieselPo", currentCash || "");
      form.setValue("dieselCash", "");
    }
  };

  async function onSubmit(values: z.infer<typeof tripSchema>) {
    toast.loading("Saving to database...", { id: "trip-save" });
    try {
      const result = await createTripRecord(values);
      if (result.success) {
        toast.success("Trip Record Saved", {
          id: "trip-save",
          description: `Logged net income of ₱${netIncome.toLocaleString()}`,
        });

        form.reset({
          date: new Date().toISOString().split("T")[0],
          truckId: 0,
          customerId: "",
          farmName: "",
          origin: "",
          destination: "",
          qtyHeads: "",
          rate: "",
          tollFees: "",
          dieselCash: "",
          dieselPo: "",
          meals: "",
          roroShip: "",
          salary: "",
          others: "",
        });

        setDieselMode("cash");
      } else {
        toast.error("Database Error", {
          id: "trip-save",
          description: result.error,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", {
        id: "trip-save",
        description: "Failed to save trip.",
      });
    }
  }

  function onError(errors: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const errorMessage =
        errors[firstKey]?.message || `Please check the ${firstKey} field.`;
      toast.error("Validation Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } else {
      toast.error("Incomplete Form", {
        description: "Please check all required fields before saving.",
      });
    }
  }

  return (
    <div className="sm:h-[95vh] max-w-[1500px] mx-auto space-y-4 animate-in fade-in duration-300">
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
        <div className="flex items-center gap-4 mb-1">
          <h1 className="text-lg lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              New Trip
            </span>
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
          Hauling & Poultry Logistics
        </p>
      </div>
      <form
        id="new-trip-form"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="pb-36 lg:pb-32"
      >
        <div className="flex flex-col gap-6 lg:gap-4">
          <div className="w-full space-y-2">
            <Card className="shadow-lg border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <CardHeader className=" border-b border-slate-100 dark:border-slate-800/60 pb-5 px-6 lg:px-8">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Trip Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 lg:pt-8 px-6 lg:px-8">
                <FieldGroup className="space-y-4 lg:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="date"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="date"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Trip Date
                          </FieldLabel>
                          <Popover
                            open={isCalendarOpen}
                            onOpenChange={setIsCalendarOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                id="date"
                                className={cn(
                                  "w-full justify-start font-normal border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] h-[46px] hover:bg-slate-50 dark:hover:bg-slate-900",
                                  !field.value && "text-slate-500",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                defaultMonth={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
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
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

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
                              field.value === 0 ? "" : field.value.toString()
                            }
                            disabled={isLoadingTrucks}
                          >
                            <SelectTrigger
                              id="truckId"
                              className="w-full rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 px-4 text-[15px] h-[46px]! focus-within:ring-blue-500"
                            >
                              <SelectValue
                                placeholder={
                                  isLoadingTrucks
                                    ? "Loading fleet data..."
                                    : "Select a truck..."
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 z-200">
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
                  </div>

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
                            placeholder="E.g., JUAN DELA CRUZ"
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] uppercase"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="farmName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="farmName"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Farm / Branch Address
                          </FieldLabel>
                          <Input
                            {...field}
                            id="farmName"
                            placeholder="E.g., SJK FARM"
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] uppercase"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-blue-100 dark:border-slate-800/60">
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
                          <Popover
                            open={isOriginOpen}
                            onOpenChange={setIsOriginOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isOriginOpen}
                                disabled={isLoadingLocations}
                                className={cn(
                                  "w-full justify-between font-normal border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] h-[46px] hover:bg-slate-50 dark:hover:bg-slate-900",
                                  !field.value && "text-slate-500",
                                )}
                              >
                                <span className="truncate pr-2">
                                  {field.value
                                    ? phLocations.find(
                                        (loc) => loc.value === field.value,
                                      )?.label
                                    : isLoadingLocations
                                      ? "Loading cities..."
                                      : "Select City, Province..."}
                                </span>
                                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[350px] p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search City or Province..."
                                  className="h-11"
                                />
                                <CommandList className="max-h-[250px]">
                                  <CommandEmpty>
                                    No location found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {phLocations.map((loc) => (
                                      <CommandItem
                                        key={loc.value}
                                        value={loc.label}
                                        onSelect={() => {
                                          field.onChange(loc.value);
                                          setIsOriginOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            field.value === loc.value
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
                                className={cn(
                                  "w-full justify-between font-normal border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] h-[46px] hover:bg-slate-50 dark:hover:bg-slate-900",
                                  !field.value && "text-slate-500",
                                )}
                              >
                                <span className="truncate pr-2">
                                  {field.value
                                    ? phLocations.find(
                                        (loc) => loc.value === field.value,
                                      )?.label
                                    : isLoadingLocations
                                      ? "Loading cities..."
                                      : "Select City, Province..."}
                                </span>
                                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[350px] p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search City or Province..."
                                  className="h-11"
                                />
                                <CommandList className="max-h-[250px]">
                                  <CommandEmpty>
                                    No location found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {phLocations.map((loc) => (
                                      <CommandItem
                                        key={loc.value}
                                        value={loc.label}
                                        onSelect={() => {
                                          field.onChange(loc.value);
                                          setIsDestinationOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            field.value === loc.value
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
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

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
                            step="0.01"
                            placeholder="0"
                            className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-bold text-blue-600 dark:text-blue-400"
                            onChange={(e) => field.onChange(e.target.value)}
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
                            step="0.01"
                            placeholder="0.00"
                            className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-bold text-emerald-600 dark:text-emerald-400"
                            onChange={(e) => field.onChange(e.target.value)}
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

          {/* BOTTOM: Expenses */}
          <div className="w-full space-y-6">
            <Card className="shadow-lg border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/60 pb-5 px-6 lg:px-8">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                  <Wallet className="w-5 h-5 text-rose-500" />
                  Trip Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 lg:pt-8 px-6 lg:px-8">
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
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
                          step="0.01"
                          placeholder="0.00"
                          className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => field.onChange(e.target.value)}
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />

                  {/* THE DIESEL TOGGLE */}
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 mb-2">
                      <FieldLabel className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-0 leading-none">
                        Diesel Expense
                      </FieldLabel>
                      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shrink-0 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleDieselModeSwitch("cash")}
                          className={`px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase rounded transition-all ${dieselMode === "cash" ? "bg-white dark:bg-slate-950 shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                        >
                          CASH
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDieselModeSwitch("po")}
                          className={`px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase rounded transition-all ${dieselMode === "po" ? "bg-white dark:bg-slate-950 shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                        >
                          P.O.
                        </button>
                      </div>
                    </div>
                    <div className={dieselMode === "cash" ? "block" : "hidden"}>
                      <Controller
                        name="dieselCash"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl z-10 opacity-80" />
                              <Input
                                {...field}
                                id="dieselCash"
                                type="number"
                                step="0.01"
                                placeholder="Cash Amount"
                                className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-blue-600 dark:text-blue-400 w-full pl-4 transition-all focus-visible:ring-blue-500"
                                onChange={(e) => field.onChange(e.target.value)}
                                onClick={(e) => e.currentTarget.select()}
                                aria-invalid={fieldState.invalid}
                              />
                            </div>
                          </Field>
                        )}
                      />
                    </div>
                    <div className={dieselMode === "po" ? "block" : "hidden"}>
                      <Controller
                        name="dieselPo"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl z-10 opacity-80" />
                              <Input
                                {...field}
                                id="dieselPo"
                                type="number"
                                step="0.01"
                                placeholder="P.O. Amount"
                                className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-emerald-600 dark:text-emerald-400 w-full pl-4 transition-all focus-visible:ring-emerald-500"
                                onChange={(e) => field.onChange(e.target.value)}
                                onClick={(e) => e.currentTarget.select()}
                                aria-invalid={fieldState.invalid}
                              />
                            </div>
                          </Field>
                        )}
                      />
                    </div>
                  </div>

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
                          step="0.01"
                          placeholder="0.00"
                          className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => field.onChange(e.target.value)}
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
                          step="0.01"
                          placeholder="0.00"
                          className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => field.onChange(e.target.value)}
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
                          Salary
                        </FieldLabel>
                        <Input
                          {...field}
                          id="salary"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => field.onChange(e.target.value)}
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
                          step="0.01"
                          placeholder="0.00"
                          className="h-[46px] border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-[15px] font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => field.onChange(e.target.value)}
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

        {/* ✨ FIX: STICKY BOTTOM BAR (Perfectly aligned to your screenshot) */}
        <div className="fixed bottom-0 right-0 left-0 md:left-(--sidebar-width,16rem) transition-[left] duration-300 ease-in-out bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* LEFT SIDE: Financial Metrics */}
            <div className="flex items-center justify-between w-full sm:w-auto space-x-2 sm:space-x-6 lg:space-x-12">
              <div className="text-left flex-1 sm:flex-none">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                  Collectible
                </p>
                <p className="text-[13px] sm:text-base md:text-lg font-mono text-slate-900 dark:text-white flex items-center font-bold">
                  ₱<NumberTicker value={grossCollectible} decimalPlaces={2} />
                </p>
              </div>

              <div className="w-px h-6 sm:h-8 bg-slate-200 dark:bg-slate-800 shrink-0" />

              <div className="text-left flex-1 sm:flex-none">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                  Expenses
                </p>
                <p className="text-[13px] sm:text-base md:text-lg font-mono text-rose-500 flex items-center font-bold">
                  - ₱<NumberTicker value={totalExpenses} decimalPlaces={2} />
                </p>
              </div>

              <div className="w-px h-6 sm:h-8 bg-slate-200 dark:bg-slate-800 shrink-0" />

              <div className="text-left flex-1 sm:flex-none">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                  Net Income
                </p>
                <p className="text-[13px] sm:text-base md:text-lg font-mono text-emerald-500 flex items-center font-bold">
                  ₱<NumberTicker value={netIncome} decimalPlaces={2} />
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: Save Button */}
            <Button
              type="submit"
              form="new-trip-form"
              disabled={form.formState.isSubmitting}
              className="relative h-11 px-6 lg:px-8 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold shrink-0 w-full sm:w-auto mt-1 sm:mt-0"
            >
              <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
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
