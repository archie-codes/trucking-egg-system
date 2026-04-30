// app/actions/truck-actions.ts
"use server";

import { db } from "@/db";
import { trucks } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function registerTruck(formData: FormData) {
  try {
    const fleetCode = formData.get("fleetCode") as string;
    const plateNumber = formData.get("plateNumber") as string;
    const status = formData.get("status") as string;

    // 1. Check for duplicates! No two trucks can have the same Fleet Code or Plate.
    const [existingTruck] = await db
      .select()
      .from(trucks)
      .where(
        or(
          eq(trucks.fleetCode, fleetCode),
          eq(trucks.plateNumber, plateNumber),
        ),
      );

    if (existingTruck) {
      if (existingTruck.fleetCode === fleetCode) {
        return {
          success: false,
          error: `Fleet Code ${fleetCode} is already registered.`,
        };
      }
      return {
        success: false,
        error: `Plate Number ${plateNumber} is already registered.`,
      };
    }

    // 2. Save the new truck to the database
    await db.insert(trucks).values({
      fleetCode: fleetCode.toUpperCase(), // Force uppercase for clean data (e.g., f1 -> F1)
      plateNumber: plateNumber.toUpperCase(),
      status,
    });

    // 3. Refresh the Fleet page so the new truck appears instantly
    revalidatePath("/trucking/fleet");
    return { success: true };
  } catch (error) {
    console.error("Failed to register truck:", error);
    return { success: false, error: "Failed to register truck to the fleet." };
  }
}
