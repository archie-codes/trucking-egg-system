"use client";

import * as React from "react";
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
import { createTripRecord } from "@/app/actions/trip-actions";
import { Save, Loader2 } from "lucide-react";

// 1. Pure Zod Schema (No more coerce. Just pure, strict numbers)
const tripSchema = z.object({
  truckId: z.string().min(1, "Truck is required"),
  customerId: z.string().min(1, "Customer is required"),
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
  // 2. Initialize the form
  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      truckId: "",
      customerId: "",
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

  // 3. Live Excel-style tracking
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

  const { isSubmitting } = form.formState;

  // 4. Submit Handler connected to Neon
  async function onSubmit(values: z.infer<typeof tripSchema>) {
    // 1. Manually show a loading toast (good for long network operations)
    toast.loading("Saving to database...", { id: "trip-save" });

    try {
      // 2. Call the Server Action
      const result = await createTripRecord(values);

      if (result.success) {
        // 3. Success State: Clear loading toast, show success toast, reset form
        toast.success("Trip Record Saved", {
          id: "trip-save",
          description: `Logged net income of ₱${netIncome.toLocaleString()}`,
        });
        form.reset();
      } else {
        // 4. Server Error State
        toast.error("Database Error", {
          id: "trip-save",
          description: result.error || "Could not save. Please try again.",
        });
      }
    } catch (error) {
      // 5. Client/Network Error State
      toast.error("Network Error", {
        id: "trip-save",
        description: "A network error occurred. Please check your connection.",
      });
    }
  }

  // Helper to strictly parse numbers from the inputs
  const parseNumber = (val: string) => (val === "" ? 0 : Number(val));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Record New Trip
          </h1>
          <p className="text-muted-foreground">
            Live Hauling & Poultry Logistics
          </p>
        </div>
      </div>

      <form
        id="new-trip-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Trip Details */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50 border-b pb-4">
              <CardTitle className="text-lg">Trip Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="truckId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="truckId">Truck Plate</FieldLabel>
                        <Input
                          {...field}
                          id="truckId"
                          placeholder="ABC-123"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="customerId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="customerId">Customer</FieldLabel>
                        <Input
                          {...field}
                          id="customerId"
                          placeholder="Customer Name"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="origin"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="origin">Origin</FieldLabel>
                        <Input
                          {...field}
                          id="origin"
                          placeholder="Farm A"
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
                        <FieldLabel htmlFor="destination">
                          Destination
                        </FieldLabel>
                        <Input
                          {...field}
                          id="destination"
                          placeholder="Market B"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="qtyHeads"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="qtyHeads">
                          Quantity (Heads)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="qtyHeads"
                          type="number"
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
                        <FieldLabel htmlFor="rate">
                          Rate per Head (₱)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="rate"
                          type="number"
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

          {/* RIGHT: Expenses */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50 border-b pb-4">
              <CardTitle className="text-lg">Trip Expenses</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="tollFees"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tollFees">Toll Fees</FieldLabel>
                      <Input
                        {...field}
                        id="tollFees"
                        type="number"
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
                      <FieldLabel htmlFor="dieselAmount">
                        Diesel / Cash
                      </FieldLabel>
                      <Input
                        {...field}
                        id="dieselAmount"
                        type="number"
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
                      <FieldLabel htmlFor="meals">Meals</FieldLabel>
                      <Input
                        {...field}
                        id="meals"
                        type="number"
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
                      <FieldLabel htmlFor="roroShip">Roro Ship</FieldLabel>
                      <Input
                        {...field}
                        id="roroShip"
                        type="number"
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
                      <FieldLabel htmlFor="salary">
                        Driver/Helper Salary
                      </FieldLabel>
                      <Input
                        {...field}
                        id="salary"
                        type="number"
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
                      <FieldLabel htmlFor="others">Others</FieldLabel>
                      <Input
                        {...field}
                        id="others"
                        type="number"
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

        {/* STICKY BOTTOM BAR */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-background border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex w-full md:w-auto justify-between md:justify-start space-x-6 md:space-x-12">
              <div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">
                  Gross
                </p>
                <p className="text-xl md:text-2xl font-bold">
                  ₱{grossCollectible.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">
                  Expenses
                </p>
                <p className="text-xl md:text-2xl font-bold text-red-500">
                  - ₱{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">
                  Net Income
                </p>
                <p className="text-2xl md:text-3xl font-black text-green-500">
                  ₱{netIncome.toLocaleString()}
                </p>
              </div>
            </div>
            {/* Find this section in your sticky bottom bar */}
            <Button
              type="submit"
              form="new-trip-form"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="w-full md:w-auto px-8 font-bold text-lg flex items-center justify-center gap-2"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
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
