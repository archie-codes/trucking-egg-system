// app/actions/trip-actions.ts
"use server";

import { db } from "@/db";
import { truckingTrips } from "@/db/schema";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const tripSchema = z.object({
  date: z.string().min(1, "Date is required"),
  truckId: z.number().min(1, "Truck ID is required"),
  customerId: z.string().min(1, "Customer is required").toUpperCase(),
  farmName: z.string().min(1, "Farm Address is required").toUpperCase(),
  origin: z.string().min(1, "Origin is required").toUpperCase(),
  destination: z.string().min(1, "Destination is required").toUpperCase(),

  qtyHeads: z.number().min(1),
  rate: z.number().min(0),
  tollFees: z.number().min(0),
  dieselCash: z.number().min(0),
  dieselPo: z.number().min(0),
  meals: z.number().min(0),
  roroShip: z.number().min(0),
  salary: z.number().min(0),
  others: z.number().min(0),
});

export async function createTripRecord(values: z.infer<typeof tripSchema>) {
  const validatedData = tripSchema.safeParse(values);

  if (!validatedData.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  try {
    await db.insert(truckingTrips).values({
      date: validatedData.data.date,
      truckId: validatedData.data.truckId,
      customerId: validatedData.data.customerId,
      farmName: validatedData.data.farmName,
      origin: validatedData.data.origin,
      destination: validatedData.data.destination,
      qtyHeads: validatedData.data.qtyHeads,
      rate: validatedData.data.rate,
      tollFees: validatedData.data.tollFees,
      dieselCash: validatedData.data.dieselCash,
      dieselPo: validatedData.data.dieselPo,
      meals: validatedData.data.meals,
      roroShip: validatedData.data.roroShip,
      salary: validatedData.data.salary,
      others: validatedData.data.others,
    });

    revalidatePath("/trucking/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error);
    return {
      success: false,
      error: error.message || "Failed to save trip to the database.",
    };
  }
}
