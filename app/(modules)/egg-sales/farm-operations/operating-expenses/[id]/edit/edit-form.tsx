"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";

// Server Actions
import {
  updateFarmOperatingExpense,
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

const EXPENSE_CATEGORIES = [
  "Diesel",
  "Toll",
  "Miscellaneous",
  "Salary",
  "Extra Salary",
  "Electricity (Kuryente)",
  "Water Bill",
];

const formSchema = z.object({
  flockId: z.number().int().min(1, "Please select a flock/batch"),
  dateIncurred: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Please select an expense category"),
  amount: z.number().min(0, "Amount cannot be negative"),
  remarks: z.string().optional(),
});

interface OperatingExpense {
  id: number;
  flockId: number;
  dateIncurred: string;
  category: string;
  amount: number;
  remarks: string | null;
}

type Flock = NonNullable<
  Awaited<ReturnType<typeof getFarmFlocks>>["data"]
>[number];

export default function EditOperatingExpenseForm({ record }: { record: OperatingExpense }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFlocks, setActiveFlocks] = useState<Flock[]>([]);

  useEffect(() => {
    async function loadFlocks() {
      const res = await getFarmFlocks();
      if (res.success && res.data) {
        setActiveFlocks(res.data);
      } else {
        toast.error("Failed to load active flocks");
      }
    }
    loadFlocks();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flockId: record.flockId,
      dateIncurred: record.dateIncurred,
      category: record.category,
      amount: record.amount,
      remarks: record.remarks || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating operating expense...");
    try {
      const response = await updateFarmOperatingExpense(record.id, values);
      if (response.success) {
        toast.success("Operating expense updated successfully!", { id: toastId });
        router.push("/egg-sales/farm-operations/operating-expenses");
      } else {
        toast.error(response.error || "Failed to update expense record", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error updating operating expense:", error);
      toast.error("An unexpected network error occurred", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="sm:h-[95vh] w-full mx-auto space-y-3 animate-in fade-in duration-300 max-w-3xl">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-red-600 to-rose-500">
              Edit Operating Expense
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Modify overhead expense details, category, or amount.
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
          <CardTitle className="text-base font-semibold">Expense Details</CardTitle>
          <CardDescription>
            Update batch association, expense category, or cost.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
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
                      <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-200">
                        {activeFlocks.map((flock) => (
                          <SelectItem key={flock.id} value={flock.id.toString()}>
                            {flock.farmName} - {flock.buildingName} ({flock.batchName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
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

              <Controller
                control={form.control}
                name="amount"
                render={({ field: { onChange, ...field }, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount (₱)
                    </FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-11! rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20"
                      {...field}
                      onChange={(e) =>
                        onChange(e.target.value ? Number(e.target.value) : 0)
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
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
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                    Save Changes
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
