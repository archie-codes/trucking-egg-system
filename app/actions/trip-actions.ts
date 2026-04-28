// app/actions/trip-actions.ts
"use server"; // This is the magic word that tells Next.js this must run securely on the server

import { db } from "@/db"; // Ensure this matches where you put your db/index.ts
import { liveTrips } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createTripRecord(data: typeof liveTrips.$inferInsert) {
  try {
    // 1. Insert the data directly into Neon
    await db.insert(liveTrips).values(data);

    // 2. Tell Next.js to refresh the dashboard/history pages so the new data shows up instantly
    revalidatePath("/trucking/dashboard");
    revalidatePath("/trucking/trips");

    return { success: true };
  } catch (error) {
    console.error("Failed to insert trip:", error);
    return { success: false, error: "Failed to save trip to database." };
  }
}
