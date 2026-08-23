"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, X, Plus, Trash2, AlertTriangle } from "lucide-react";

// Server Actions
import {
  createFarmOperatingExpense,
  getFarmFlocks,
} from "@/app/actions/farm-actions";

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
import { Switch } from "@/components/ui/switch";

const EXPENSE_CATEGORIES = [
  "Diesel",
  "Toll",
  "Miscellaneous",
  "Salary",
  "Extra Salary",
  "Electricity (Kuryente)",
  "Water Bill",
];

const formSchema = z
  .object({
    isSplit: z.boolean(),
    flockId: z.number().int().optional(),
    dateIncurred: z.string().min(1, "Date is required"),
    category: z.string().min(1, "Please select an expense category"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    remarks: z.string().optional(),
    allocations: z
      .array(
        z.object({
          flockId: z.number().int().min(1, "Please select a flock/batch"),
          allocatedAmount: z.number().min(0.01, "Allocated amount must be > 0"),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isSplit) {
      if (!data.allocations || data.allocations.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least two allocations are required for a split expense.",
          path: ["allocations"],
        });
      } else {
        const selectedFlockIds = data.allocations
          .map((a) => a.flockId)
          .filter((id) => id > 0);
        const uniqueFlockIds = new Set(selectedFlockIds);
        if (uniqueFlockIds.size !== selectedFlockIds.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Each farm batch can only be selected once in allocations.",
            path: ["allocations"],
          });
        }

        const sum = data.allocations.reduce(
          (acc, curr) => acc + curr.allocatedAmount,
          0,
        );
        if (sum > data.amount + 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Allocated amounts (₱${sum.toLocaleString()}) exceed total expense amount (₱${data.amount.toLocaleString()}).`,
            path: ["allocations"],
          });
        } else if (Math.abs(sum - data.amount) > 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Sum of allocations must exactly equal the total amount.",
            path: ["allocations"],
          });
        }
      }
    } else {
      if (!data.flockId || data.flockId < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a flock/batch.",
          path: ["flockId"],
        });
      }
    }
  });

type Flock = NonNullable<
  Awaited<ReturnType<typeof getFarmFlocks>>["data"]
>[number];

export default function NewOperatingExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFlocks, setActiveFlocks] = useState<Flock[]>([]);

  useEffect(() => {
    async function loadFlocks() {
      const res = await getFarmFlocks();
      if (res.success && res.data) {
        setActiveFlocks(res.data.filter((f) => f.isActive));
      } else {
        toast.error("Failed to load active flocks");
      }
    }
    loadFlocks();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isSplit: false,
      flockId: 0,
      dateIncurred: new Date().toISOString().split("T")[0],
      category: "",
      amount: 0,
      remarks: "",
      allocations: [
        { flockId: 0, allocatedAmount: 0 },
        { flockId: 0, allocatedAmount: 0 },
      ],
    },
  });

  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const isSplit = useWatch({ control, name: "isSplit" });
  const totalAmount = useWatch({ control, name: "amount" }) || 0;
  const allocations = useWatch({ control, name: "allocations" }) || [];

  const sumOfAllocations = allocations.reduce(
    (sum, alloc) => sum + (Number(alloc.allocatedAmount) || 0),
    0,
  );
  const remainingBalance = totalAmount - sumOfAllocations;
  const isBalanceZero = Math.abs(remainingBalance) < 0.01;
  const isOverAllocated = remainingBalance < -0.01;
  const overAllocatedAmount = Math.abs(remainingBalance);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const toastId = toast.loading("Logging operating expense...");
    try {
      const payload = {
        ...values,
        flockId: values.isSplit
          ? undefined
          : values.flockId && values.flockId > 0
            ? values.flockId
            : undefined,
        allocations: values.isSplit ? values.allocations : undefined,
      };
      const response = await createFarmOperatingExpense(payload);
      if (response.success) {
        toast.success("Operating expense logged successfully!", {
          id: toastId,
        });
        router.push("/egg-sales/farm-operations/operating-expenses");
      } else {
        toast.error(response.error || "Failed to save expense record", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error logging operating expense:", error);
      toast.error("An unexpected network error occurred", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300 max-w-3xl pb-10">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-red-600 to-rose-500">
              Log Operating Expense
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Record farm overhead costs (diesel, salaries, utilities) tied to a
            batch.
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
            Expense Details
          </CardTitle>
          <CardDescription>
            Specify batch, category, and expense amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit, (errors) => {
              console.error("Form validation errors:", errors);
              const firstError = Object.values(errors)[0];
              toast.error(
                typeof firstError?.message === "string"
                  ? firstError.message
                  : "Please check the form for missing or invalid inputs.",
              );
            })}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="dateIncurred"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date Incurred
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

              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value }, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Expense Category
                    </FieldLabel>
                    <Select
                      value={value || ""}
                      onValueChange={onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-11! w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-200">
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="amount"
                render={({
                  field: { onChange, value, ...field },
                  fieldState,
                }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Amount (₱)
                    </FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20"
                      {...field}
                      value={value || ""}
                      onChange={(e) =>
                        onChange(e.target.value ? Number(e.target.value) : 0)
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="remarks"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Remarks / Details (Optional)
                    </FieldLabel>
                    <Input
                      placeholder="e.g., Worker salary week 2, May electricity bill"
                      className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20"
                      {...field}
                      value={field.value || ""}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {/* Split Expense Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="space-y-0.5">
                <FieldLabel className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0">
                  Split Expense
                </FieldLabel>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distribute this total cost across multiple farms or buildings.
                </p>
              </div>
              <Controller
                control={control}
                name="isSplit"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // Revert selections and amounts to defaults when toggling
                      form.setValue("flockId", 0);
                      form.setValue("allocations", [
                        { flockId: 0, allocatedAmount: 0 },
                        { flockId: 0, allocatedAmount: 0 },
                      ]);
                      form.clearErrors(["flockId", "allocations"]);
                    }}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Standard vs Split Content */}
            {!isSplit ? (
              <Controller
                control={control}
                name="flockId"
                render={({ field: { onChange, value }, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Farm - Building - Batch
                    </FieldLabel>
                    <Select
                      value={value ? value.toString() : ""}
                      onValueChange={(val) => onChange(Number(val))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-11! w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20">
                        <SelectValue placeholder="Select a batch..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-200 max-h-60 overflow-y-auto">
                        {activeFlocks.map((flock) => (
                          <SelectItem
                            key={flock.id}
                            value={flock.id.toString()}
                          >
                            {flock.farmName} - {flock.buildingName} (
                            {flock.batchName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Allocations
                  </h3>
                  <div className="flex items-center gap-2">
                    {isOverAllocated ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Over-allocated by ₱
                        {overAllocatedAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <div
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${isBalanceZero ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"}`}
                      >
                        Remaining: ₱
                        {remainingBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {isOverAllocated && (
                  <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                        Allocation Exceeds Total Expense Amount
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                        Total allocated (₱
                        {sumOfAllocations.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        ) exceeds total expense amount (₱
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        ) by{" "}
                        <strong className="font-bold underline">
                          ₱
                          {overAllocatedAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                        . Please reduce individual allocation amounts to match the total.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {fields.map((item, index) => {
                    const selectedFlockIds = allocations
                      .map((a) => a.flockId)
                      .filter((id) => id > 0);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-3 items-start p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50"
                      >
                        <div className="flex-1 w-full">
                          <Controller
                            control={control}
                            name={`allocations.${index}.flockId`}
                            render={({
                              field: { onChange, value },
                              fieldState,
                            }) => (
                              <Field className="mb-0">
                                <Select
                                  value={value ? value.toString() : ""}
                                  onValueChange={(val) => onChange(Number(val))}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger className="h-10! w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20">
                                    <SelectValue placeholder="Select batch..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-200 max-h-60 overflow-y-auto">
                                    {activeFlocks.map((flock) => {
                                      const isAlreadySelected =
                                        selectedFlockIds.includes(flock.id) &&
                                        flock.id !== value;
                                      return (
                                        <SelectItem
                                          key={flock.id}
                                          value={flock.id.toString()}
                                          disabled={isAlreadySelected}
                                        >
                                          {flock.farmName} -{" "}
                                          {flock.buildingName} (
                                          {flock.batchName})
                                          {isAlreadySelected
                                            ? " — (Already Selected)"
                                            : ""}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        </div>
                        <div className="w-full sm:w-48 flex items-start gap-2">
                          <Controller
                            control={control}
                            name={`allocations.${index}.allocatedAmount`}
                            render={({
                              field: { onChange, value, ...field },
                              fieldState,
                            }) => (
                              <Field className="mb-0 flex-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Amount"
                                  className="h-10! rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20"
                                  {...field}
                                  value={value || ""}
                                  onChange={(e) =>
                                    onChange(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : 0,
                                    )
                                  }
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 2}
                            className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              fields.length <= 2
                                ? "Minimum 2 allocations required for split expense"
                                : "Remove allocation"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => append({ flockId: 0, allocatedAmount: 0 })}
                  disabled={fields.length >= activeFlocks.length}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {fields.length >= activeFlocks.length
                    ? "All active batches have been allocated"
                    : "Add Allocation"}
                </button>
                {form.formState.errors.allocations?.root && (
                  <p className="text-xs text-rose-500 mt-1">
                    {form.formState.errors.allocations.root.message}
                  </p>
                )}
              </div>
            )}

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
                disabled={isSubmitting || (isSplit && !isBalanceZero)}
                className="w-full sm:w-auto relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold text-sm inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {!isSubmitting && !(isSplit && !isBalanceZero) && (
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
                    Save Expense
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
