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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  createTripRecord,
  getTripHistorySuggestions,
} from "@/app/actions/trip-actions";
import { getActiveTrucks } from "@/app/actions/truck-actions";
import {
  Save,
  Loader2,
  FileText,
  Wallet,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ChevronDown,
} from "lucide-react";

// Helper to accept empty strings but transform to numbers safely for DB insertion
const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const tripSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    truckId: z.number().min(1, "Please select a truck"),
    customerId: z
      .string()
      .min(1, "Customer Name is required. Put N/A if none")
      .toUpperCase(),
    farmName: z
      .string()
      .min(1, "Farm Address is required. Put N/A if none")
      .toUpperCase(),

    origin: z.string().min(1, "Origin is required").toUpperCase(),
    destination: z.string().min(1, "Destination is required").toUpperCase(),
    tripType: z.string().min(1, "Trip Type is required").toUpperCase(),
    loadType: z.string().toUpperCase(),
    deliveryOrderNo: z.string().optional(),

    qtyHeads: numField.pipe(
      z.number().min(0, "Quantity must be a valid number"),
    ),
    qtyNote: z.string().optional(), // ✨ ADDED QTY NOTE
    rate: numField.pipe(z.number().min(0, "Rate must be a valid number")),
    ratePerTrip: numField
      .pipe(z.number().min(0, "Rate must be a valid number"))
      .optional(),

    tollFees: numField,
    dieselCash: numField,
    dieselPo: numField,
    meals: numField,
    roroShip: numField,

    salary: numField,
    salaryNote: z.string().optional(), // ✨ ADDED SALARY NOTE

    others: numField,
    othersNote: z.string().optional(), // ✨ ADDED OTHERS NOTE

    miscellaneous: numField,
    miscellaneousNote: z.string().optional(),

    forceSave: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tripType === "CPF") {
      const requiredFields = [
        { name: "salary", msg: "Salary is required for CPF trips" },
        { name: "tollFees", msg: "Toll fees are required for CPF trips" },
        { name: "meals", msg: "Meals are required for CPF trips" },
        {
          name: "miscellaneous",
          msg: "Miscellaneous is required for CPF trips",
        },
        { name: "ratePerTrip", msg: "Rate / Trip is required for CPF trips" },
      ];
      requiredFields.forEach(({ name, msg }) => {
        const val = data[name as keyof typeof data];
        if (!val || (typeof val === "number" && val <= 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: msg,
            path: [name],
          });
        }
      });
    } else {
      if (!data.loadType || data.loadType.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Load Type is required",
          path: ["loadType"],
        });
      }
    }
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

  // Autocomplete Suggestions
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  const [farmSuggestions, setFarmSuggestions] = useState<string[]>([]);

  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  const filteredOrigins = React.useMemo(() => {
    if (!originSearch) return phLocations.slice(0, 50);
    const search = originSearch.toLowerCase();
    return phLocations
      .filter((loc) => loc.label.toLowerCase().includes(search))
      .slice(0, 50);
  }, [phLocations, originSearch]);

  const filteredDestinations = React.useMemo(() => {
    if (!destinationSearch) return phLocations.slice(0, 50);
    const search = destinationSearch.toLowerCase();
    return phLocations
      .filter((loc) => loc.label.toLowerCase().includes(search))
      .slice(0, 50);
  }, [phLocations, destinationSearch]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [duplicateCpfWarning, setDuplicateCpfWarning] = useState<string | null>(
    null,
  );
  const [pendingValues, setPendingValues] = useState<z.infer<
    typeof tripSchema
  > | null>(null);

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

      // Fetch history suggestions for autocomplete
      getTripHistorySuggestions().then((res) => {
        if (res.success) {
          setCustomerSuggestions(res.customers || []);
          setFarmSuggestions(res.farms || []);
        }
      });

      try {
        const [provRes, cityRes] = await Promise.all([
          fetch("https://psgc.gitlab.io/api/provinces"),
          fetch("https://psgc.gitlab.io/api/cities-municipalities"),
        ]);

        const provData = await provRes.json();
        const cityData = await cityRes.json();

        const provMap = new Map();
        provData.forEach(
          (
            p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
          ) => provMap.set(p.code, p.name),
        );

        const formattedLocations = cityData.map(
          (
            city: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
          ) => {
            const provName = provMap.get(city.provinceCode) || "Metro Manila";
            const label = `${city.name}, ${provName}`;
            return {
              value: label.toUpperCase(),
              label: label,
            };
          },
        );

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
      tripType: "",
      loadType: "",
      deliveryOrderNo: "",
      qtyHeads: "",
      qtyNote: "", // ✨ Initialized
      rate: "",
      ratePerTrip: "", // ✨ Added
      tollFees: "",
      dieselCash: "",
      dieselPo: "",
      meals: "",
      roroShip: "",
      salary: "",
      salaryNote: "", // ✨ Initialized
      others: "",
      othersNote: "", // ✨ Initialized
      miscellaneous: "",
      miscellaneousNote: "",
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
  const miscellaneous =
    Number(useWatch({ control, name: "miscellaneous" })) || 0;
  const ratePerTrip = Number(useWatch({ control, name: "ratePerTrip" })) || 0;
  const tripType = useWatch({ control, name: "tripType" }) || "";

  const grossCollectible = tripType === "CPF" ? ratePerTrip : qtyHeads * rate;
  const totalExpenses =
    tollFees +
    dieselCash +
    dieselPo +
    meals +
    roroShip +
    salary +
    others +
    miscellaneous;
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

        form.reset({
          date: new Date().toISOString().split("T")[0],
          truckId: 0,
          customerId: "",
          farmName: "",
          origin: "",
          destination: "",
          tripType: "",
          loadType: "",
          deliveryOrderNo: "",
          qtyHeads: "",
          qtyNote: "", // ✨ Reset
          rate: "",
          ratePerTrip: "", // ✨ Reset
          tollFees: "",
          dieselCash: "",
          dieselPo: "",
          meals: "",
          roroShip: "",
          salary: "",
          salaryNote: "", // ✨ Reset
          others: "",
          othersNote: "", // ✨ Reset
          miscellaneous: "",
          miscellaneousNote: "", // ✨ Reset
        });
      } else {
        if ("isDuplicateCpf" in result && result.isDuplicateCpf) {
          toast.dismiss("trip-save");
          setDuplicateCpfWarning(result.error || "Duplicate CPF Trip");
          setPendingValues(values);
        } else {
          toast.error("Database Error", {
            id: "trip-save",
            description: result.error,
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", {
        id: "trip-save",
        description: "Failed to save trip.",
      });
    }
  }

  function onError(
    errors: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
  ) {
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
    <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300">
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
        <div className="flex items-center gap-4 mb-1">
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Informatiion */}
          <div className="w-full space-y-2">
            <Card className="shadow-lg border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <CardHeader className=" border-b border-slate-100 dark:border-slate-800/60 pb-5 px-6 lg:px-8">
                <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Trip Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 lg:pt-4 px-6 lg:px-8">
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
                                  "w-full justify-between font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md h-11 hover:bg-slate-50 dark:hover:bg-slate-900",
                                  !field.value && "text-slate-500",
                                )}
                              >
                                <div className="flex items-center">
                                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Select date</span>
                                  )}
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
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
                              className="w-full rounded-xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 px-4 text-md h-11! focus-within:ring-blue-500"
                            >
                              <SelectValue
                                placeholder={
                                  isLoadingTrucks
                                    ? "Loading fleet data..."
                                    : "Select a truck..."
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 z-200">
                              {availableTrucks.map((truck) => (
                                <SelectItem
                                  key={truck.id}
                                  value={truck.id.toString()}
                                  className="rounded-xl cursor-pointer text-[13px]"
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Controller
                      name="tripType"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Trip Type
                          </FieldLabel>
                          <Select
                            onValueChange={(val) => {
                              const prevVal = form.getValues("tripType");
                              field.onChange(val);
                              if (val === "CPF") {
                                form.setValue("loadType", "NONE");
                                form.setValue("customerId", "N/A");
                                form.setValue("farmName", "N/A");
                                form.setValue("deliveryOrderNo", "");
                                form.setValue("qtyHeads", "0");
                                form.setValue("rate", "0");
                                form.setValue("others", "0");
                                form.setValue("othersNote", "");
                                form.setValue(
                                  "ratePerTrip",
                                  form.getValues("ratePerTrip") || "",
                                );
                                const currentDest =
                                  form.getValues("destination");
                                if (
                                  currentDest !== "AGRO FOODS" &&
                                  currentDest !== "LPPI"
                                ) {
                                  form.setValue("destination", "");
                                }
                              } else if (prevVal === "CPF" || val !== "CPF") {
                                form.setValue("loadType", "");
                                if (prevVal === "CPF") {
                                  form.setValue("customerId", "");
                                  form.setValue("farmName", "");
                                  form.setValue("qtyHeads", "");
                                  form.setValue("rate", "");
                                  form.setValue("ratePerTrip", "");
                                  form.setValue("others", "");
                                  form.setValue("othersNote", "");
                                }
                                form.setValue("deliveryOrderNo", "");
                              }
                            }}
                            value={field.value || ""}
                          >
                            <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 px-4 text-md h-11! focus-within:ring-blue-500">
                              <SelectValue placeholder="Select Trip Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 z-200">
                              <SelectItem value="RTL">RTL</SelectItem>
                              <SelectItem value="LAYER">LAYER</SelectItem>
                              <SelectItem value="CPF">CPF</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="loadType"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Load Type
                          </FieldLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={
                              tripType === "CPF" ? "NONE" : field.value || ""
                            }
                            disabled={tripType === "CPF"}
                            required={tripType !== "CPF"}
                          >
                            <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 px-4 text-md h-11! focus-within:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50">
                              <SelectValue placeholder="Select Load Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 z-200">
                              {tripType === "CPF" ? (
                                <SelectItem value="NONE">NONE</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="Chick">Chick</SelectItem>
                                  <SelectItem value="Feeds">Feeds</SelectItem>
                                  <SelectItem value="RTL">RTL</SelectItem>
                                  <SelectItem value="Layer">Layer</SelectItem>
                                  <SelectItem value="Broiler (45 days)">
                                    Broiler (45 days)
                                  </SelectItem>
                                  <SelectItem value="Culls">Culls</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="deliveryOrderNo"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            D.O. No.
                          </FieldLabel>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase().replace(/-/g, ""))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "-") e.preventDefault();
                            }}
                            placeholder="E.g., 123456"
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                            disabled={tripType !== "CPF"}
                            required={tripType === "CPF"}
                          />
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
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                            aria-invalid={fieldState.invalid}
                            list="customer-suggestions"
                            disabled={tripType === "CPF"}
                            required={tripType !== "CPF"}
                          />
                          <datalist id="customer-suggestions">
                            {customerSuggestions.map((c, i) => (
                              <option key={i} value={c} />
                            ))}
                          </datalist>
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
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                            aria-invalid={fieldState.invalid}
                            list="farm-suggestions"
                            disabled={tripType === "CPF"}
                            required={tripType !== "CPF"}
                          />
                          <datalist id="farm-suggestions">
                            {farmSuggestions.map((f, i) => (
                              <option key={i} value={f} />
                            ))}
                          </datalist>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

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
                                  "w-full justify-between font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md h-11! hover:bg-slate-50 dark:hover:bg-slate-900",
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
                              className="w-[350px] p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
                              align="start"
                            >
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Search City or Province..."
                                  className="h-11"
                                  value={originSearch}
                                  onValueChange={setOriginSearch}
                                />
                                <CommandList className="max-h-[250px]">
                                  <CommandEmpty>
                                    No location found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {filteredOrigins.map((loc) => (
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
                                  "w-full justify-between font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md h-11! hover:bg-slate-50 dark:hover:bg-slate-900",
                                  !field.value && "text-slate-500",
                                )}
                              >
                                <span className="truncate pr-2">
                                  {field.value
                                    ? field.value === "AGRO FOODS" ||
                                      field.value === "LPPI"
                                      ? field.value
                                      : phLocations.find(
                                          (loc) => loc.value === field.value,
                                        )?.label || field.value
                                    : isLoadingLocations
                                      ? "Loading cities..."
                                      : "Select City, Province..."}
                                </span>
                                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[350px] p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-200"
                              align="start"
                            >
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Search City or Province..."
                                  className="h-11"
                                  value={destinationSearch}
                                  onValueChange={setDestinationSearch}
                                />
                                <CommandList className="max-h-[250px]">
                                  <CommandEmpty>
                                    No location found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {tripType === "CPF" ? (
                                      <>
                                        <CommandItem
                                          value="AGRO FOODS"
                                          onSelect={() => {
                                            field.onChange("AGRO FOODS");
                                            setIsDestinationOpen(false);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 shrink-0",
                                              field.value === "AGRO FOODS"
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          AGRO FOODS
                                        </CommandItem>
                                        <CommandItem
                                          value="LPPI"
                                          onSelect={() => {
                                            field.onChange("LPPI");
                                            setIsDestinationOpen(false);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 shrink-0",
                                              field.value === "LPPI"
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          LPPI
                                        </CommandItem>
                                      </>
                                    ) : (
                                      filteredDestinations.map((loc) => (
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
                                      ))
                                    )}
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
                    {/* ✨ UPDATED: Quantity with Note Textarea */}
                    <div className="space-y-2">
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
                              step="1"
                              min="0"
                              placeholder="0"
                              className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-bold text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                              onChange={(e) => {
                                const val = e.target.value.replace(/[-.]/g, "");
                                field.onChange(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === ".") e.preventDefault();
                              }}
                              onClick={(e) => e.currentTarget.select()}
                              aria-invalid={fieldState.invalid}
                              disabled={tripType === "CPF"}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name="qtyNote"
                        control={form.control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            disabled={tripType === "CPF"}
                            placeholder="Notes (e.g. 5 DOA, 2 missing)"
                            className="w-full h-[68px] p-3 text-xs border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950/50 text-slate-600 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name="rate"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="rate"
                            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                          >
                            Rate per Head (₱)
                          </FieldLabel>
                          <Input
                            {...field}
                            id="rate"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-bold text-emerald-600 dark:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                            onChange={(e) => {
                              const val = e.target.value.replace(/-/g, "");
                              field.onChange(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "-") e.preventDefault();
                            }}
                            onClick={(e) => e.currentTarget.select()}
                            aria-invalid={fieldState.invalid}
                            disabled={tripType === "CPF"}
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

          {/* Expenses */}
          <div className="w-full space-y-2">
            <Card className="shadow-lg border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
              <CardHeader className=" border-b border-slate-100 dark:border-slate-800/60 pb-5 px-6 lg:px-8">
                <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
                  <Wallet className="w-5 h-5 text-rose-500" />
                  Trip Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 lg:pt-4 px-6 lg:px-8">
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5 lg:gap-6">
                  <Controller
                    name="ratePerTrip"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="ratePerTrip"
                          className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                        >
                          Rate / Trip
                          {tripType === "CPF" && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="ratePerTrip"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-bold text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                          onChange={(e) => {
                            const val = e.target.value.replace(/-/g, "");
                            field.onChange(val);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "-") e.preventDefault();
                          }}
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                          disabled={tripType !== "CPF"}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
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
                          {tripType === "CPF" && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="tollFees"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => {
                            const val = e.target.value.replace(/-/g, "");
                            field.onChange(val);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "-") e.preventDefault();
                          }}
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />

                  {/* DIESEL EXPENSES (CASH & P.O.) */}
                  <div className="col-span-1 sm:col-span-2 space-y-2 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <FieldLabel className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-0 leading-none">
                          Diesel Expense
                        </FieldLabel>
                        <span className="text-[11px] text-slate-500 font-normal">
                          (Cash, P.O., or Both)
                        </span>
                      </div>
                      {(dieselCash > 0 || dieselPo > 0) && (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <span className="text-slate-500">Total Diesel:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
                            ₱
                            {(dieselCash + dieselPo).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* DIESEL CASH */}
                      <Controller
                        name="dieselCash"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor="dieselCash"
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between"
                            >
                              <span>Cash Amount</span>
                              {Number(field.value) > 0 && (
                                <span className="text-[9px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                  CASH
                                </span>
                              )}
                            </FieldLabel>
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl z-10 opacity-80" />
                              <Input
                                {...field}
                                id="dieselCash"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00 (Cash)"
                                className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-blue-600 dark:text-blue-400 w-full pl-4 transition-all focus-visible:ring-blue-500"
                                onChange={(e) => {
                                  const val = e.target.value.replace(/-/g, "");
                                  field.onChange(val);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "-") e.preventDefault();
                                }}
                                onClick={(e) => e.currentTarget.select()}
                                aria-invalid={fieldState.invalid}
                              />
                            </div>
                          </Field>
                        )}
                      />

                      {/* DIESEL P.O. */}
                      <Controller
                        name="dieselPo"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor="dieselPo"
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between"
                            >
                              <span>P.O. Amount</span>
                              {Number(field.value) > 0 && (
                                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                  P.O.
                                </span>
                              )}
                            </FieldLabel>
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl z-10 opacity-80" />
                              <Input
                                {...field}
                                id="dieselPo"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00 (P.O.)"
                                className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-emerald-600 dark:text-emerald-400 w-full pl-4 transition-all focus-visible:ring-emerald-500"
                                onChange={(e) => {
                                  const val = e.target.value.replace(/-/g, "");
                                  field.onChange(val);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "-") e.preventDefault();
                                }}
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
                          {tripType === "CPF" && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="meals"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-rose-600 dark:text-rose-400"
                          onChange={(e) => {
                            const val = e.target.value.replace(/-/g, "");
                            field.onChange(val);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "-") e.preventDefault();
                          }}
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
                          min="0"
                          placeholder="0.00"
                          disabled={tripType === "CPF"}
                          className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-rose-600 dark:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                          onChange={(e) => {
                            const val = e.target.value.replace(/-/g, "");
                            field.onChange(val);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "-") e.preventDefault();
                          }}
                          onClick={(e) => e.currentTarget.select()}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />

                  {/* ✨ UPDATED: Salary with Note Textarea */}
                  <div className="space-y-2">
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
                            {tripType === "CPF" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="salary"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-rose-600 dark:text-rose-400"
                            onChange={(e) => {
                              const val = e.target.value.replace(/-/g, "");
                              field.onChange(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "-") e.preventDefault();
                            }}
                            onClick={(e) => e.currentTarget.select()}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      name="salaryNote"
                      control={form.control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Breakdown (e.g. Juan - 3000)"
                          className="w-full h-[68px] p-3 text-xs border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-slate-600 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400"
                        />
                      )}
                    />
                  </div>

                  {/* ✨ UPDATED: Others with Note Textarea */}
                  <div className="space-y-2">
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
                            min="0"
                            placeholder="0.00"
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-rose-600 dark:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                            onChange={(e) => {
                              const val = e.target.value.replace(/-/g, "");
                              field.onChange(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "-") e.preventDefault();
                            }}
                            onClick={(e) => e.currentTarget.select()}
                            aria-invalid={fieldState.invalid}
                            disabled={tripType === "CPF"}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      name="othersNote"
                      control={form.control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Breakdown (e.g. RFID - 1000)"
                          className="w-full h-[68px] p-3 text-xs border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-slate-600 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                          disabled={tripType === "CPF"}
                        />
                      )}
                    />
                  </div>

                  {/* ✨ UPDATED: Miscellaneous with Note Textarea */}
                  <div className="space-y-2">
                    <Controller
                      name="miscellaneous"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="miscellaneous"
                            className="text-sm font-bold text-slate-700 dark:text-slate-300"
                          >
                            Miscellaneous
                            {tripType === "CPF" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="miscellaneous"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-md font-mono text-rose-600 dark:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                            onChange={(e) => {
                              const val = e.target.value.replace(/-/g, "");
                              field.onChange(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "-") e.preventDefault();
                            }}
                            onClick={(e) => e.currentTarget.select()}
                            aria-invalid={fieldState.invalid}
                            disabled={tripType !== "CPF"}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      name="miscellaneousNote"
                      control={form.control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Breakdown (e.g. Police - 500)"
                          className="w-full h-[68px] p-3 text-xs border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/50 text-slate-600 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                          disabled={tripType !== "CPF"}
                        />
                      )}
                    />
                  </div>
                </FieldGroup>

                <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                    }}
                    className="h-10 px-6 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ✨ FIX: STICKY BOTTOM BAR (Perfectly aligned to your screenshot) */}
        <div className="fixed bottom-0 right-0 left-0 md:left-(--sidebar-width,16rem) transition-[left] duration-300 ease-in-out bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* LEFT SIDE: Financial Metrics */}
            <div className="flex items-center justify-between w-full sm:w-auto space-x-2 sm:space-x-6 lg:space-x-12">
              {tripType !== "CPF" && (
                <>
                  <div className="text-left flex-1 sm:flex-none">
                    <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                      Collectible
                    </p>
                    <p className="text-[13px] sm:text-base md:text-lg font-mono text-slate-900 dark:text-white flex items-center font-bold">
                      ₱
                      <NumberTicker
                        value={grossCollectible}
                        decimalPlaces={2}
                      />
                    </p>
                  </div>

                  <div className="w-px h-6 sm:h-8 bg-slate-200 dark:bg-slate-800 shrink-0" />
                </>
              )}

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
              className="relative h-11! px-6 lg:px-8 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold shrink-0 w-full sm:w-auto mt-1 sm:mt-0"
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

      <Dialog
        open={!!duplicateCpfWarning}
        onOpenChange={(open) => !open && setDuplicateCpfWarning(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Trip Detected</DialogTitle>
            <DialogDescription>
              {duplicateCpfWarning}
              <br />
              <br />
              Are you sure you want to save another CPF trip for this truck to
              this destination on this date?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateCpfWarning(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingValues) {
                  setDuplicateCpfWarning(null);
                  onSubmit({ ...pendingValues, forceSave: true });
                }
              }}
            >
              Proceed & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
