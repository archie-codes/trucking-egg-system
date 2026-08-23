"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useWatch } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, X, AlertTriangle } from "lucide-react";

// Server Action
import { createFarmFlock } from "@/app/actions/farm-actions";

// UI Components
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Zod Schema with "BUILDING" Word Restriction & Custom Farm Validation
const formSchema = z
  .object({
    batchName: z
      .string()
      .min(2, "Batch name is required (e.g., BATCH 1 - 2026)")
      .transform((v) => v.toUpperCase())
      .refine((v) => !v.toUpperCase().includes("BUILDING"), {
        message:
          "Do not include the word 'BUILDING' here. Use the Building Name field instead.",
      }),
    farmNameSelect: z.string().min(1, "Please select a farm"),
    customFarmName: z.string().optional(),
    buildingName: z
      .string()
      .min(1, "Building name is required (e.g., BLDG A)")
      .transform((v) => v.toUpperCase()),
    dateLoaded: z.string().min(1, "Date is required"),
    initialHeadCount: z
      .number()
      .int("No decimals allowed")
      .min(1, "Must be at least 1 chicken"),
  })
  .refine(
    (data) => {
      if (data.farmNameSelect === "CUSTOM") {
        return !!data.customFarmName && data.customFarmName.trim().length >= 2;
      }
      return true;
    },
    {
      message: "Custom farm name must be at least 2 characters",
      path: ["customFarmName"],
    },
  );

export default function NewFlockPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [pendingValues, setPendingValues] = useState<z.infer<
    typeof formSchema
  > | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchName: "",
      farmNameSelect: "BARACBAC FARM",
      customFarmName: "",
      buildingName: "",
      dateLoaded: new Date().toISOString().split("T")[0],
      initialHeadCount: 0,
    },
  });

  const selectedFarmOption = useWatch({
    control: form.control,
    name: "farmNameSelect",
  });

  async function submitFlock(
    values: z.infer<typeof formSchema>,
    forceSave: boolean = false,
  ) {
    setIsSubmitting(true);
    const toastId = toast.loading(
      forceSave ? "Saving flock batch..." : "Registering new flock batch...",
    );

    // Auto-Append "FARM" Logic
    const rawFarm =
      values.farmNameSelect === "CUSTOM"
        ? values.customFarmName || ""
        : values.farmNameSelect;

    let formattedFarmName = rawFarm.trim().toUpperCase();
    if (!formattedFarmName.includes("FARM")) {
      formattedFarmName = `${formattedFarmName} FARM`;
    }

    const payload = {
      batchName: values.batchName,
      farmName: formattedFarmName,
      buildingName: values.buildingName,
      dateLoaded: values.dateLoaded,
      initialHeadCount: values.initialHeadCount,
    };

    try {
      const response = await createFarmFlock(payload, forceSave);

      if (response.success) {
        toast.success("Flock batch registered successfully!", { id: toastId });
        setShowWarningDialog(false);
        router.push("/egg-sales/farm-operations/flocks");
      } else if (response.requiresConfirmation) {
        toast.dismiss(toastId);
        setPendingValues(values);
        setWarningMessage(
          response.message ||
            "Warning: This Batch Name is already being used in another Farm/Building.",
        );
        setShowWarningDialog(true);
      } else {
        toast.error(response.error || "Failed to create flock batch", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error creating flock:", error);
      toast.error("An unexpected network error occurred", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitFlock(values, false);
  }

  function handleProceedAnyway() {
    if (pendingValues) {
      submitFlock(pendingValues, true);
    }
  }

  return (
    <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300 max-w-3xl">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">
              Load New Batch
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Register a new flock of chickens to a specific building on the farm.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="relative inline-flex items-center justify-center h-11 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 shadow-xs transition-all duration-300 overflow-hidden group/btn font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isSubmitting && (
              <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-slate-200/50 dark:via-white/5 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            )}
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover/btn:-translate-x-1 duration-300" />
            Back
          </button>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <CardTitle className="text-base font-semibold">
            Batch Details
          </CardTitle>
          <CardDescription>
            Enter initial head count and building location for this batch.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="batchName"
                render={({ field: { onChange, ...field }, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Batch Name
                    </FieldLabel>
                    <Input
                      placeholder="e.g., BATCH 1"
                      className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 uppercase"
                      {...field}
                      onChange={(e) => onChange(e.target.value.toUpperCase())}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {/* Smart Farm Name Dual-UI Component */}
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="farmNameSelect"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Farm Name
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-11! w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20">
                          <SelectValue placeholder="Select farm..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-200">
                          <SelectItem value="SJK FARM">SJK FARM</SelectItem>
                          <SelectItem value="BARACBAC FARM">
                            BARACBAC FARM
                          </SelectItem>
                          <SelectItem value="CUSTOM">
                            + Add Custom Farm...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                {selectedFarmOption === "CUSTOM" && (
                  <Controller
                    control={form.control}
                    name="customFarmName"
                    render={({ field: { onChange, ...field }, fieldState }) => (
                      <Field className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input
                          placeholder="Enter custom farm name (e.g. PANGASINAN)"
                          className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 uppercase"
                          {...field}
                          onChange={(e) =>
                            onChange(e.target.value.toUpperCase())
                          }
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="buildingName"
                render={({ field: { onChange, ...field }, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Building Name / Number
                    </FieldLabel>
                    <Input
                      placeholder="e.g., BUILDING 1"
                      className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 uppercase"
                      {...field}
                      onChange={(e) => onChange(e.target.value.toUpperCase())}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="initialHeadCount"
                render={({ field: { onChange, ...field }, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Initial Head Count
                    </FieldLabel>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="5000"
                      className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20"
                      {...field}
                      onKeyDown={(e) => {
                        if (["-", ".", "e", "E", "+"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) =>
                        onChange(
                          e.target.value
                            ? Math.floor(Math.abs(Number(e.target.value)))
                            : 0,
                        )
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="dateLoaded"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date Loaded
                  </FieldLabel>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto relative inline-flex items-center justify-center h-11 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 shadow-xs transition-all duration-300 overflow-hidden group/btn font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isSubmitting && (
                  <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-slate-200/50 dark:via-white/5 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                )}
                <X className="w-5 h-5 mr-2 transition-transform group-hover/btn:rotate-90 duration-300" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold text-sm inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {!isSubmitting && (
                  <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                )}
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                    Save New Batch
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Duplicate Batch Name Soft Warning Alert Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              Duplicate Batch Name Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300 pt-1">
              {warningMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleProceedAnyway();
              }}
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Proceed Anyway"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
