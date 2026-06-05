// app/(modules)/egg-sales/sales/new-sale/page.tsx
"use client";

import { useRouter } from "next/navigation";
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
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Checkbox } from "@/components/ui/checkbox";

import {
  createEggSale,
  getLiveEggInventory,
  getEggCustomerSuggestions,
} from "@/app/actions/egg-actions";
import {
  Save,
  Loader2,
  CalendarIcon,
  ShoppingBag,
  AlertCircle,
  Banknote,
  CheckCircle2,
} from "lucide-react";

const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const sizeItemSchema = z.object({
  checked: z.boolean().default(false),
  quantityTrays: numField,
  pricePerTray: numField,
});

const saleSchema = z.object({
  saleDate: z.string().min(1, "Date is required"),
  customerId: z.string().min(1, "Customer name is required").toUpperCase(),
  amountPaid: numField,
  datePaid: z.string().optional().nullable(),
  remarks: z.string().optional(),
  sizes: z.object({
    PEEWEE: sizeItemSchema,
    XS: sizeItemSchema,
    SMALL: sizeItemSchema,
    MEDIUM: sizeItemSchema,
    LARGE: sizeItemSchema,
    XL: sizeItemSchema,
    XXL: sizeItemSchema,
    CRACKED: sizeItemSchema,
    BROKEN: sizeItemSchema,
    DIRTY: sizeItemSchema,
  }),
});

const EGG_SIZES = [
  {
    id: "PEEWEE",
    label: "Peewee",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50/40 dark:bg-indigo-950/10",
    border: "border-indigo-100 dark:border-indigo-900/30",
  },
  {
    id: "XS",
    label: "XS",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50/40 dark:bg-cyan-950/10",
    border: "border-cyan-100 dark:border-cyan-900/30",
  },
  {
    id: "SMALL",
    label: "Small",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50/40 dark:bg-blue-950/10",
    border: "border-blue-100 dark:border-blue-900/30",
  },
  {
    id: "MEDIUM",
    label: "Medium",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/40 dark:bg-emerald-950/10",
    border: "border-emerald-100 dark:border-emerald-900/30",
  },
  {
    id: "LARGE",
    label: "Large",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/40 dark:bg-amber-950/10",
    border: "border-amber-100 dark:border-amber-900/30",
  },
  {
    id: "XL",
    label: "XL",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50/40 dark:bg-orange-950/10",
    border: "border-orange-100 dark:border-orange-900/30",
  },
  {
    id: "XXL",
    label: "XXL",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50/40 dark:bg-purple-950/10",
    border: "border-purple-100 dark:border-purple-900/30",
  },
  {
    id: "CRACKED",
    label: "Cracked",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50/40 dark:bg-red-950/10",
    border: "border-red-100 dark:border-red-900/30",
  },
  {
    id: "BROKEN",
    label: "Broken",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50/40 dark:bg-rose-950/10",
    border: "border-rose-100 dark:border-rose-900/30",
  },
  {
    id: "DIRTY",
    label: "Dirty",
    color: "text-stone-600 dark:text-stone-400",
    bg: "bg-stone-50/40 dark:bg-stone-950/10",
    border: "border-stone-100 dark:border-stone-900/30",
  },
] as const;

export default function NewSalePage() {
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDatePaidOpen, setIsDatePaidOpen] = useState(false);

  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    getEggCustomerSuggestions().then((res) => {
      if (res.success) setCustomerSuggestions(res.customers || []);
    });
    getLiveEggInventory().then((res) => {
      if (res.success) setInventory(res.data || []);
    });
  }, []);

  const form = useForm<
    z.input<typeof saleSchema>,
    unknown,
    z.infer<typeof saleSchema>
  >({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: format(new Date(), "yyyy-MM-dd"),
      customerId: "",
      amountPaid: "",
      datePaid: "",
      remarks: "",
      sizes: {
        PEEWEE: { checked: false, quantityTrays: "", pricePerTray: "" },
        XS: { checked: false, quantityTrays: "", pricePerTray: "" },
        SMALL: { checked: false, quantityTrays: "", pricePerTray: "" },
        MEDIUM: { checked: false, quantityTrays: "", pricePerTray: "" },
        LARGE: { checked: false, quantityTrays: "", pricePerTray: "" },
        XL: { checked: false, quantityTrays: "", pricePerTray: "" },
        XXL: { checked: false, quantityTrays: "", pricePerTray: "" },
        CRACKED: { checked: false, quantityTrays: "", pricePerTray: "" },
        BROKEN: { checked: false, quantityTrays: "", pricePerTray: "" },
        DIRTY: { checked: false, quantityTrays: "", pricePerTray: "" },
      },
    },
  });

  const { control, setValue } = form;

  // Watch entire sizes object for immediate calculations
  const watchedSizes = useWatch({ control, name: "sizes" }) || {};
  const paid = Number(useWatch({ control, name: "amountPaid" })) || 0;

  // Global Financial Calculations
  const totalAmount = EGG_SIZES.reduce((sum, size) => {
    const data = watchedSizes[size.id];
    if (!data?.checked) return sum;
    const qty = Number(data.quantityTrays) || 0;
    const price = Number(data.pricePerTray) || 0;
    return sum + qty * price;
  }, 0);

  const balance = totalAmount - paid;

  // Real-time Master Stock Validation Guard
  const isOverSelling = EGG_SIZES.some((size) => {
    const data = watchedSizes[size.id];
    if (!data?.checked) return false;

    const stockPieces =
      inventory.find((i) => i.classification === size.id)?.currentStockTrays ||
      0;
    const availableTrays = Math.floor(stockPieces / 30);
    const requestedQty = Number(data.quantityTrays) || 0;

    return requestedQty > availableTrays;
  });

  // Auto-fill payment date if fully settled
  useEffect(() => {
    if (paid > 0 && paid >= totalAmount && totalAmount > 0) {
      const today = format(new Date(), "yyyy-MM-dd");
      if (form.getValues("datePaid") !== today) {
        setValue("datePaid", today);
      }
    }
  }, [paid, totalAmount, setValue, form]);

  async function onSubmit(values: z.infer<typeof saleSchema>) {
    // 1. Extract only the dimensions the user actually toggled on
    const outboundItems = EGG_SIZES.filter(
      (size) => values.sizes[size.id]?.checked,
    ).map((size) => ({
      classification: size.id,
      quantityTrays: Number(values.sizes[size.id].quantityTrays),
      pricePerTray: Number(values.sizes[size.id].pricePerTray),
    }));

    if (outboundItems.length === 0) {
      toast.error("Empty Submission", {
        description:
          "Please toggle at least one egg size to record a delivery.",
      });
      return;
    }

    if (isOverSelling) {
      toast.error("Insufficient Stock", {
        description: "One or more entries exceed current bodega levels.",
      });
      return;
    }

    toast.loading("Processing outbound delivery...", { id: "sale-save" });

    // Remap form values to pass the flattened item structure down to the server transaction handler
    const payload = {
      saleDate: values.saleDate,
      customerId: values.customerId,
      amountPaid: values.amountPaid,
      datePaid: values.datePaid,
      remarks: values.remarks,
      items: outboundItems,
    };

    const result = await createEggSale(payload);

    if (result.success) {
      router.push(`/egg-sales/sales/receipt/${result.invoiceId}`);
      toast.success("Delivery completed & inventory deducted!", {
        id: "sale-save",
      });

      if (!customerSuggestions.includes(values.customerId)) {
        setCustomerSuggestions((prev) => [...prev, values.customerId]);
      }

      // Sync state variables directly to prevent dynamic layout lag
      setInventory((prev) => {
        const updated = [...prev];
        outboundItems.forEach((item) => {
          const piecesSold = item.quantityTrays * 30;
          const matchIdx = updated.findIndex(
            (i) => i.classification === item.classification,
          );
          if (matchIdx !== -1)
            updated[matchIdx].currentStockTrays -= piecesSold;
        });
        return updated;
      });

      form.reset();
    } else {
      toast.error("Database Error", {
        id: "sale-save",
        description: result.error,
      });
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300 pb-24">
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
        <h1 className="text-lg lg:text-xl font-black tracking-tight text-slate-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">
            Egg Sales & Delivery Matrix
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
          Outbound client fulfillment and Accounts Receivable
        </p>
      </div>

      <form
        id="sale-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* LOGISTICS MANIFEST CONTEXT */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-6">
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="saleDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                      Date Delivered
                    </FieldLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950 text-md h-11 hover:bg-slate-50",
                            !field.value && "text-slate-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-xl z-200"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
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
                name="customerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                      Customer Name / Address
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="e.g. ALING NENA - MARKET"
                      className="h-11 rounded-xl uppercase font-semibold border-slate-200 dark:border-slate-800/80"
                      list="customer-suggestions"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                    <datalist id="customer-suggestions">
                      {customerSuggestions.map((c, i) => (
                        <option key={i} value={c} />
                      ))}
                    </datalist>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* HIGH DENSITY CHECKLIST GRID */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
              <Banknote className="w-5 h-5 text-emerald-500" />
              Egg Size Selection Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[750px] divide-y divide-slate-100 dark:divide-slate-800/60">
                {/* Table Header Row */}
                <div className="grid grid-cols-12 bg-slate-50/70 dark:bg-slate-900/40 p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1 text-center">Invoiced</div>
                  <div className="col-span-2">Egg Classification</div>
                  <div className="col-span-3 text-center">Available Stock</div>
                  <div className="col-span-2 px-1">Quantity (Trays)</div>
                  <div className="col-span-2 px-1">Tray Price (₱)</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Checklist Matrix Rows */}
                {EGG_SIZES.map((size) => {
                  const isChecked = !!watchedSizes[size.id]?.checked;
                  const stockPieces =
                    inventory.find((i) => i.classification === size.id)
                      ?.currentStockTrays || 0;
                  const availableTrays = Math.floor(stockPieces / 30);
                  const looseEggs = stockPieces % 30;

                  const rowQty =
                    Number(watchedSizes[size.id]?.quantityTrays) || 0;
                  const rowPrice =
                    Number(watchedSizes[size.id]?.pricePerTray) || 0;
                  const rowSubtotal = isChecked ? rowQty * rowPrice : 0;

                  const rowIsOverselling = isChecked && rowQty > availableTrays;

                  return (
                    <div
                      key={size.id}
                      className={cn(
                        "grid grid-cols-12 items-center p-4 transition-colors duration-150",
                        isChecked
                          ? "bg-white dark:bg-slate-900/60"
                          : "bg-slate-50/20 dark:bg-transparent opacity-70",
                      )}
                    >
                      {/* Checkbox Column */}
                      <div className="col-span-1 flex justify-center">
                        <Controller
                          name={`sizes.${size.id}.checked`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={`check-${size.id}`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                          )}
                        />
                      </div>

                      {/* Classification Badge Name */}
                      <div className="col-span-2">
                        <label
                          htmlFor={`check-${size.id}`}
                          className={cn(
                            "text-sm font-black tracking-wide uppercase cursor-pointer select-none",
                            size.color,
                          )}
                        >
                          {size.label}
                        </label>
                      </div>

                      {/* Available Bodega Stock Level */}
                      <div className="col-span-3 text-center text-xs">
                        <span
                          className={cn(
                            "font-bold px-2.5 py-1 rounded-full text-[11px]",
                            availableTrays === 0
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
                          )}
                        >
                          {availableTrays} Trays{" "}
                          {looseEggs > 0 ? `(+${looseEggs} pcs)` : ""}
                        </span>
                      </div>

                      {/* Quantity Input Form Field */}
                      <div className="col-span-2 px-1">
                        <Controller
                          name={`sizes.${size.id}.quantityTrays`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              disabled={!isChecked}
                              placeholder="0"
                              onClick={(e) => e.currentTarget.select()}
                              className={cn(
                                "h-9 font-black rounded-lg text-sm text-center bg-transparent transition-all",
                                rowIsOverselling
                                  ? "border-rose-500 text-rose-600 focus-visible:ring-rose-500 bg-rose-50/50"
                                  : "border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500",
                              )}
                            />
                          )}
                        />
                      </div>

                      {/* Price Per Tray Input Form Field */}
                      <div className="col-span-2 px-1">
                        <Controller
                          name={`sizes.${size.id}.pricePerTray`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              disabled={!isChecked}
                              placeholder="₱0"
                              onClick={(e) => e.currentTarget.select()}
                              className="h-9 font-black rounded-lg text-sm text-center bg-transparent border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 text-emerald-600"
                            />
                          )}
                        />
                      </div>

                      {/* Interactive Live Subtotal Cell */}
                      <div
                        className={cn(
                          "col-span-2 text-right font-mono font-bold text-sm pr-2",
                          isChecked
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-300 dark:text-slate-700",
                        )}
                      >
                        ₱{rowSubtotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LOWER FINANCIAL DETAILS CONTEXT */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-black/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Controller
                  name="amountPaid"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                        Total Amount Paid (₱)
                      </FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 rounded-xl font-black bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="datePaid"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                        Date Paid
                      </FieldLabel>
                      <Popover
                        open={isDatePaidOpen}
                        onOpenChange={setIsDatePaidOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950 text-md h-11",
                              !field.value && "text-slate-400",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Optional (If unpaid)"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-xl z-200"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                                setIsDatePaidOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                  )}
                />
                <Controller
                  name="remarks"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                        Remarks / Notes
                      </FieldLabel>
                      <Input
                        {...field}
                        placeholder="e.g. Paid via GCash"
                        className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      />
                    </Field>
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
          <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
            <div className="text-center sm:text-left flex-1 sm:flex-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                Grand Total Amount
              </p>
              <p className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white leading-none">
                ₱<NumberTicker value={totalAmount} />
              </p>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

            <div className="text-center sm:text-left flex-1 sm:flex-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                A/R Balance
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {balance <= 0 && totalAmount > 0 ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Fully Paid
                  </span>
                ) : balance > 0 && totalAmount > 0 ? (
                  <span className="flex items-center text-rose-600 dark:text-rose-400 font-bold text-sm bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> ₱
                    {balance.toLocaleString()} Owed
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
            form="sale-form"
            disabled={
              form.formState.isSubmitting || totalAmount === 0 || isOverSelling
            }
            className="h-11 px-8 rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg font-semibold w-full sm:w-auto shrink-0"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : isOverSelling ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" /> Insufficient Stock
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Record Delivery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
