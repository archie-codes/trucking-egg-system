// // app/actions/trip-actions.ts
// "use server";

// import { db } from "@/db";
// import { truckingTrips } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { revalidatePath } from "next/cache";
// import * as z from "zod";

// const tripSchema = z.object({
//   date: z.string().min(1, "Date is required"),
//   truckId: z.number().min(1, "Truck ID is required"),
//   customerId: z.string().min(1, "Customer is required").toUpperCase(),
//   farmName: z.string().min(1, "Farm Address is required").toUpperCase(),
//   origin: z.string().min(1, "Origin is required").toUpperCase(),
//   destination: z.string().min(1, "Destination is required").toUpperCase(),

//   qtyHeads: z.number().min(1),
//   rate: z.number().min(0),
//   tollFees: z.number().min(0),
//   dieselCash: z.number().min(0),
//   dieselPo: z.number().min(0),
//   meals: z.number().min(0),
//   roroShip: z.number().min(0),
//   salary: z.number().min(0),
//   others: z.number().min(0),
// });

// export async function createTripRecord(values: z.infer<typeof tripSchema>) {
//   const validatedData = tripSchema.safeParse(values);

//   if (!validatedData.success) {
//     return { success: false, error: "Invalid form data provided." };
//   }

//   try {
//     await db.insert(truckingTrips).values({
//       date: validatedData.data.date,
//       truckId: validatedData.data.truckId,
//       customerId: validatedData.data.customerId,
//       farmName: validatedData.data.farmName,
//       origin: validatedData.data.origin,
//       destination: validatedData.data.destination,
//       qtyHeads: validatedData.data.qtyHeads,
//       rate: validatedData.data.rate,
//       tollFees: validatedData.data.tollFees,
//       dieselCash: validatedData.data.dieselCash,
//       dieselPo: validatedData.data.dieselPo,
//       meals: validatedData.data.meals,
//       roroShip: validatedData.data.roroShip,
//       salary: validatedData.data.salary,
//       others: validatedData.data.others,
//     });

//     revalidatePath("/trucking/trips");
//     return { success: true };
//   } catch (error: unknown) {
//     console.error("Database Error:", error);
//     return {
//       success: false,
//       error:
//         error instanceof Error
//           ? error.message
//           : "Failed to save trip to the database.",
//     };
//   }
// }

// // ✨ DELETE TRIP ACTION
// export async function deleteTripRecord(tripId: number) {
//   try {
//     await db.delete(truckingTrips).where(eq(truckingTrips.id, tripId));
//     revalidatePath("/trucking/trips");
//     return { success: true };
//   } catch (error: unknown) {
//     console.error("Failed to delete trip:", error);
//     return { success: false, error: "Failed to delete trip record." };
//   }
// }

// // ✨ UPDATE TRIP ACTION
// export async function updateTripRecord(
//   tripId: number,
//   data: Partial<z.infer<typeof tripSchema>>,
// ) {
//   try {
//     await db
//       .update(truckingTrips)
//       .set({
//         date: data.date,
//         customerId: data.customerId,
//         farmName: data.farmName,
//         origin: data.origin,
//         destination: data.destination,
//         qtyHeads: data.qtyHeads,
//         rate: data.rate,
//         tollFees: data.tollFees,
//         dieselCash: data.dieselCash,
//         dieselPo: data.dieselPo,
//         meals: data.meals,
//         roroShip: data.roroShip,
//         salary: data.salary,
//         others: data.others,
//       })
//       .where(eq(truckingTrips.id, tripId));

//     revalidatePath("/trucking/trips");
//     return { success: true };
//   } catch (error: unknown) {
//     console.error("Failed to update trip:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Failed to update trip.",
//     };
//   }
// }

// app/actions/trip-actions.ts
"use server";

import { db } from "@/db";
import { truckingTrips } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  qtyNote: z.string().optional(), // ✨ ADDED

  rate: z.number().min(0),
  tollFees: z.number().min(0),
  dieselCash: z.number().min(0),
  dieselPo: z.number().min(0),
  meals: z.number().min(0),
  roroShip: z.number().min(0),

  salary: z.number().min(0),
  salaryNote: z.string().optional(), // ✨ ADDED

  others: z.number().min(0),
  othersNote: z.string().optional(), // ✨ ADDED
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
      qtyNote: validatedData.data.qtyNote, // ✨ ADDED

      rate: validatedData.data.rate,
      tollFees: validatedData.data.tollFees,
      dieselCash: validatedData.data.dieselCash,
      dieselPo: validatedData.data.dieselPo,
      meals: validatedData.data.meals,
      roroShip: validatedData.data.roroShip,

      salary: validatedData.data.salary,
      salaryNote: validatedData.data.salaryNote, // ✨ ADDED

      others: validatedData.data.others,
      othersNote: validatedData.data.othersNote, // ✨ ADDED
    });

    revalidatePath("/trucking/trips");
    return { success: true };
  } catch (error: unknown) {
    console.error("Database Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save trip to the database.",
    };
  }
}

// ✨ DELETE TRIP ACTION
export async function deleteTripRecord(tripId: number) {
  try {
    await db.delete(truckingTrips).where(eq(truckingTrips.id, tripId));
    revalidatePath("/trucking/trips");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete trip:", error);
    return { success: false, error: "Failed to delete trip record." };
  }
}

// ✨ UPDATE TRIP ACTION
export async function updateTripRecord(
  tripId: number,
  data: Partial<z.infer<typeof tripSchema>>,
) {
  try {
    await db
      .update(truckingTrips)
      .set({
        date: data.date,
        customerId: data.customerId,
        farmName: data.farmName,
        origin: data.origin,
        destination: data.destination,

        qtyHeads: data.qtyHeads,
        qtyNote: data.qtyNote, // ✨ ADDED

        rate: data.rate,
        tollFees: data.tollFees,
        dieselCash: data.dieselCash,
        dieselPo: data.dieselPo,
        meals: data.meals,
        roroShip: data.roroShip,

        salary: data.salary,
        salaryNote: data.salaryNote, // ✨ ADDED

        others: data.others,
        othersNote: data.othersNote, // ✨ ADDED
      })
      .where(eq(truckingTrips.id, tripId));

    revalidatePath("/trucking/trips");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update trip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update trip.",
    };
  }
}

// ✨ GET UNIQUE CUSTOMERS & FARMS FOR AUTOCOMPLETE
export async function getTripHistorySuggestions() {
  try {
    const tripsData = await db
      .select({
        customerId: truckingTrips.customerId,
        farmName: truckingTrips.farmName,
      })
      .from(truckingTrips);

    // Extract unique, non-empty values
    const uniqueCustomers = Array.from(
      new Set(tripsData.map((t) => t.customerId).filter(Boolean)),
    ).slice(0, 7);
    const uniqueFarms = Array.from(
      new Set(tripsData.map((t) => t.farmName).filter(Boolean)),
    ).slice(0, 7);

    return { success: true, customers: uniqueCustomers, farms: uniqueFarms };
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return { success: false, customers: [], farms: [] };
  }
}
