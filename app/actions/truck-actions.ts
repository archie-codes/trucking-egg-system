// app/actions/truck-actions.ts
"use server";

import { db } from "@/db";
import { truckingFleet, truckingTrips } from "@/db/schema";
import { addDays, format } from "date-fns";
import { eq, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================================================
// 1. REGISTER NEW TRUCK
// ============================================================================

// Server-side validation schema
// ✨ UPDATED: Added engine, chassis, and ltoExpiry fields
const registerTruckSchema = z.object({
  fleetCode: z.string().min(1, "Fleet Code is required").toUpperCase(),
  plateNumber: z.string().min(1, "Plate Number is required").toUpperCase(),
  status: z.string().min(1, "Status is required"),
  engineNo: z.string().optional(),
  chassisNo: z.string().optional(),
  ltoExpiry: z.string().optional(),
});

export async function registerTruck(formData: FormData) {
  try {
    // 1. Validate the raw FormData using Zod (Enterprise Standard)
    const validatedData = registerTruckSchema.safeParse({
      fleetCode: formData.get("fleetCode"),
      plateNumber: formData.get("plateNumber"),
      status: formData.get("status"),
      engineNo: formData.get("engineNo"),
      chassisNo: formData.get("chassisNo"),
      ltoExpiry: formData.get("ltoExpiry"),
    });

    if (!validatedData.success) {
      return {
        success: false,
        error: "Invalid form data provided.",
      };
    }

    const { fleetCode, plateNumber, status, engineNo, chassisNo, ltoExpiry } =
      validatedData.data;

    // 2. Check for duplicates! No two trucks can have the same Fleet Code or Plate.
    const [existingTruck] = await db
      .select()
      .from(truckingFleet)
      .where(
        or(
          eq(truckingFleet.fleetCode, fleetCode),
          eq(truckingFleet.plateNumber, plateNumber),
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

    // 3. Save the new truck to the database
    await db.insert(truckingFleet).values({
      fleetCode,
      plateNumber,
      status,
      isActive: true, // Default new trucks to active
      engineNo: engineNo || null, // ✨ Save as null if left blank
      chassisNo: chassisNo || null, // ✨ Save as null if left blank
      ltoExpiry: ltoExpiry || null, // ✨ Save as null if left blank
    });

    // 4. Refresh the Fleet page so the new truck appears instantly
    revalidatePath("/trucking/fleet");
    // Also revalidate the new trips page so the dropdown updates immediately!
    revalidatePath("/trucking/trips/new");

    return { success: true };
  } catch (error) {
    console.error("Failed to register truck:", error);
    return {
      success: false,
      error: "Database error: Failed to register truck.",
    };
  }
}

// ============================================================================
// 2. FETCH ACTIVE TRUCKS (For the Dropdown Menu)
// ============================================================================

export async function getActiveTrucks() {
  try {
    const trucks = await db
      .select({
        id: truckingFleet.id,
        code: truckingFleet.fleetCode,
        plate: truckingFleet.plateNumber,
      })
      .from(truckingFleet)
      // Only fetch trucks that are marked active in the system
      .where(eq(truckingFleet.isActive, true))
      // Order alphabetically by Fleet Code (e.g., F1, F2, F3)
      .orderBy(truckingFleet.fleetCode);

    return { success: true, data: trucks };
  } catch (error) {
    console.error("Failed to fetch trucks:", error);
    return { success: false, error: "Failed to fetch fleet data." };
  }
}

// ============================================================================
// Fetch trips for a specific truck (formatted perfectly for our DataTable)
// ============================================================================

export async function getTruckTrips(truckId: number) {
  try {
    const data = await db
      .select({
        id: truckingTrips.id,
        truckId: truckingTrips.truckId,
        date: truckingTrips.date,
        customerId: truckingTrips.customerId,
        farmName: truckingTrips.farmName,
        origin: truckingTrips.origin,
        destination: truckingTrips.destination,
        qtyHeads: truckingTrips.qtyHeads,
        rate: truckingTrips.rate,
        tollFees: truckingTrips.tollFees,
        dieselCash: truckingTrips.dieselCash,
        dieselPo: truckingTrips.dieselPo,
        meals: truckingTrips.meals,
        roroShip: truckingTrips.roroShip,
        salary: truckingTrips.salary,
        others: truckingTrips.others,
        createdAt: truckingTrips.createdAt,
        fleetCode: truckingFleet.fleetCode,
        plateNumber: truckingFleet.plateNumber,
      })
      .from(truckingTrips)
      .leftJoin(truckingFleet, eq(truckingTrips.truckId, truckingFleet.id))
      .where(eq(truckingTrips.truckId, truckId))
      .orderBy(desc(truckingTrips.createdAt));

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to fetch truck trips:", error);
    return { success: false, error: "Failed to load truck history." };
  }
}

// ============================================================================
// Delete Truck Action
// ============================================================================

export async function deleteTruck(truckId: number) {
  try {
    await db.delete(truckingFleet).where(eq(truckingFleet.id, truckId));
    revalidatePath("/trucking/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete truck." };
  }
}

// ============================================================================
// Update Truck Action
// ============================================================================
export async function updateTruck(
  truckId: number,
  data: {
    fleetCode: string;
    plateNumber: string;
    status: string;
    engineNo?: string; // ✨ Added
    chassisNo?: string; // ✨ Added
    ltoExpiry?: string; // ✨ Added
  },
) {
  try {
    await db
      .update(truckingFleet)
      .set({
        fleetCode: data.fleetCode,
        plateNumber: data.plateNumber,
        status: data.status,
        engineNo: data.engineNo || null, // ✨ Converts empty string to null to keep DB clean
        chassisNo: data.chassisNo || null,
        ltoExpiry: data.ltoExpiry || null,
      })
      .where(eq(truckingFleet.id, truckId));

    revalidatePath("/trucking/fleet"); // Refresh the page to show new details
    return { success: true };
  } catch (error: any) {
    console.error("Update error:", error);
    return { success: false, error: "Failed to update truck." };
  }
}

// ============================================================================
// LTO Alerts Action
// ============================================================================

import { isNotNull, and, lte, asc } from "drizzle-orm";

export async function getLtoAlerts() {
  try {
    // 1. Calculate the date exactly 7 days from today
    const targetDate = addDays(new Date(), 7);
    const formattedTargetDate = format(targetDate, "yyyy-MM-dd");

    // 2. Fetch active trucks where LTO expiry is less than or equal to 7 days from now
    const expiringTrucks = await db
      .select({
        id: truckingFleet.id,
        fleetCode: truckingFleet.fleetCode,
        plateNumber: truckingFleet.plateNumber,
        ltoExpiry: truckingFleet.ltoExpiry,
      })
      .from(truckingFleet)
      .where(
        and(
          eq(truckingFleet.status, "active"), // Only alert for active trucks
          isNotNull(truckingFleet.ltoExpiry),
          lte(truckingFleet.ltoExpiry, formattedTargetDate),
        ),
      )
      .orderBy(asc(truckingFleet.ltoExpiry));

    return { success: true, data: expiringTrucks };
  } catch (error) {
    console.error("Failed to fetch LTO alerts:", error);
    return { success: false, error: "Failed to load alerts." };
  }
}
