// app/(modules)/egg-sales/sales/new-sale/page.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberTicker } from "@/components/ui/number-ticker";

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

const saleSchema = z.object({
  saleDate: z.string().min(1, "Date is required"),
  customerId: z.string().min(1, "Customer name is required").toUpperCase(),
  classification: z.string().min(1, "Egg size is required"),
  quantityTrays: numField.pipe(z.number().min(1, "Must sell at least 1 tray")),
  pricePerTray: numField.pipe(z.number().min(1, "Price is required")),
  amountPaid: numField,
  datePaid: z.string().optional().nullable(),
  remarks: z.string().optional(),
  paymentStatus: z.string().optional(),
});

export default function NewSalePage() {
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
      classification: "",
      quantityTrays: "",
      pricePerTray: "",
      amountPaid: "",
      datePaid: "",
      remarks: "",
    },
  });

  const { control, setValue } = form;

  // Watch for Live Math
  const qty = Number(useWatch({ control, name: "quantityTrays" })) || 0;
  const price = Number(useWatch({ control, name: "pricePerTray" })) || 0;
  const paid = Number(useWatch({ control, name: "amountPaid" })) || 0;
  const classification = useWatch({ control, name: "classification" });

  // Math Engine
  const totalAmount = qty * price;
  const balance = totalAmount - paid;

  // ✨ Live Inventory Conversion (Pieces to Trays)
  const selectedStockItem = inventory.find(
    (i) => i.classification === classification,
  );
  const availablePieces = selectedStockItem?.currentStockTrays || 0;

  // Math.floor ensures we only show FULL trays available for sale
  const availableTrays = Math.floor(availablePieces / 30);
  const remainderPieces = availablePieces % 30; // Leftover loose eggs

  const isOverSelling = qty > availableTrays && classification !== "";

  // Auto-set Date Paid if they pay in full
  useEffect(() => {
    if (paid > 0 && paid >= totalAmount && totalAmount > 0) {
      const today = format(new Date(), "yyyy-MM-dd");
      if (form.getValues("datePaid") !== today) {
        setValue("datePaid", today);
      }
    }
  }, [paid, totalAmount, setValue, form]);

  async function onSubmit(values: z.infer<typeof saleSchema>) {
    if (isOverSelling) {
      toast.error("Insufficient Stock", {
        description: "You cannot sell more trays than what is in the Bodega.",
      });
      return;
    }

    // Auto-determine status for Accounts Receivable tracking
    let status = "unpaid";
    if (balance <= 0) status = "paid";
    else if (paid > 0 && balance > 0) status = "partial";

    toast.loading("Processing outbound sale...", { id: "sale-save" });
    const result = await createEggSale({
      ...values,
      paymentStatus: status,
    });

    if (result.success) {
      toast.success("Sale completed & inventory deducted!", {
        id: "sale-save",
      });

      // Update local memory so they don't have to refresh
      if (!customerSuggestions.includes(values.customerId)) {
        setCustomerSuggestions((prev) => [...prev, values.customerId]);
      }

      // Deduct sold pieces from local inventory state
      const PIECES_SOLD = values.quantityTrays * 30;
      setInventory((prev) =>
        prev.map((item) =>
          item.classification === values.classification
            ? {
                ...item,
                currentStockTrays: item.currentStockTrays - PIECES_SOLD,
              }
            : item,
        ),
      );

      form.reset({
        saleDate: format(new Date(), "yyyy-MM-dd"),
        customerId: "",
        classification: "",
        quantityTrays: "",
        pricePerTray: "",
        amountPaid: "",
        datePaid: "",
        remarks: "",
      });
    } else {
      toast.error("Database Error", {
        id: "sale-save",
        description: result.error,
      });
    }
  }

  return (
    <div className="sm:h-[95vh] w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
        <h1 className="text-lg lg:text-xl font-black tracking-tight text-slate-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">
            Egg Sales & Delivery
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
          Outbound client fulfillment and Accounts Receivable
        </p>
      </div>

      <form
        id="sale-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="pb-36 lg:pb-32 space-y-4"
      >
        {/* TOP CARD: Delivery Context */}
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

        {/* MIDDLE CARD: Product & Math Engine */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2 font-bold">
              <Banknote className="w-5 h-5 text-emerald-500" />
              Product & Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <Controller
                name="classification"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex justify-between items-center mb-1.5">
                      <FieldLabel className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase mb-0">
                        Egg Size
                      </FieldLabel>
                      {classification && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            availableTrays === 0
                              ? "bg-rose-100 text-rose-600"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          Stock: {availableTrays} Trays{" "}
                          {remainderPieces > 0
                            ? `(+${remainderPieces} pcs)`
                            : ""}
                        </span>
                      )}
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950 border-emerald-200 dark:border-emerald-800/50 font-bold">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {["XS", "SMALL", "MEDIUM", "LARGE", "XL", "XXL"].map(
                          (size) => (
                            <SelectItem
                              key={size}
                              value={size}
                              className="font-bold"
                            >
                              {size}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                name="quantityTrays"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase">
                      Quantity (Trays)
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      onClick={(e) => e.currentTarget.select()}
                      className={cn(
                        "h-11 rounded-xl font-black bg-white dark:bg-slate-950",
                        isOverSelling
                          ? "border-rose-500 text-rose-600 focus-visible:ring-rose-500"
                          : "border-emerald-200 dark:border-emerald-800/50",
                      )}
                    />
                  </Field>
                )}
              />

              <Controller
                name="pricePerTray"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase">
                      Price per Tray (₱)
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 rounded-xl font-black border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-950 text-emerald-600"
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-6">
              <Controller
                name="amountPaid"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-xs font-bold text-slate-500 uppercase">
                      Amount Paid Now (₱)
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 rounded-xl font-black bg-slate-50 dark:bg-slate-900/50"
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
                            "w-full justify-start font-normal border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-md h-11",
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
                      placeholder="e.g. Check bouncing, partial payment"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                    />
                  </Field>
                )}
              />
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
                Total Amount
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
            disabled={form.formState.isSubmitting || qty === 0 || isOverSelling}
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
                <Save className="w-4 h-4 mr-2" /> Record Sale
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
