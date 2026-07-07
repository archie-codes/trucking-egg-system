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
//   qtyNote: z.string().optional(), // ✨ ADDED

//   rate: z.number().min(0),
//   tollFees: z.number().min(0),
//   dieselCash: z.number().min(0),
//   dieselPo: z.number().min(0),
//   meals: z.number().min(0),
//   roroShip: z.number().min(0),

//   salary: z.number().min(0),
//   salaryNote: z.string().optional(), // ✨ ADDED

//   others: z.number().min(0),
//   othersNote: z.string().optional(), // ✨ ADDED
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
//       qtyNote: validatedData.data.qtyNote, // ✨ ADDED

//       rate: validatedData.data.rate,
//       tollFees: validatedData.data.tollFees,
//       dieselCash: validatedData.data.dieselCash,
//       dieselPo: validatedData.data.dieselPo,
//       meals: validatedData.data.meals,
//       roroShip: validatedData.data.roroShip,

//       salary: validatedData.data.salary,
//       salaryNote: validatedData.data.salaryNote, // ✨ ADDED

//       others: validatedData.data.others,
//       othersNote: validatedData.data.othersNote, // ✨ ADDED
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
//         qtyNote: data.qtyNote, // ✨ ADDED

//         rate: data.rate,
//         tollFees: data.tollFees,
//         dieselCash: data.dieselCash,
//         dieselPo: data.dieselPo,
//         meals: data.meals,
//         roroShip: data.roroShip,

//         salary: data.salary,
//         salaryNote: data.salaryNote, // ✨ ADDED

//         others: data.others,
//         othersNote: data.othersNote, // ✨ ADDED
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

// // ✨ GET UNIQUE CUSTOMERS & FARMS FOR AUTOCOMPLETE
// export async function getTripHistorySuggestions() {
//   try {
//     const tripsData = await db
//       .select({
//         customerId: truckingTrips.customerId,
//         farmName: truckingTrips.farmName,
//       })
//       .from(truckingTrips);

//     // Extract unique, non-empty values
//     const uniqueCustomers = Array.from(
//       new Set(tripsData.map((t) => t.customerId).filter(Boolean)),
//     ).slice(0, 7);
//     const uniqueFarms = Array.from(
//       new Set(tripsData.map((t) => t.farmName).filter(Boolean)),
//     ).slice(0, 7);

//     return { success: true, customers: uniqueCustomers, farms: uniqueFarms };
//   } catch (error) {
//     console.error("Failed to fetch suggestions:", error);
//     return { success: false, customers: [], farms: [] };
//   }
// }

"use server";

import { db } from "@/db";
import { truckingTrips, truckingTripsCpf } from "@/db/schema";
// ✨ UPDATED: Imported 'and', 'ne'
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const tripSchema = z.object({
  date: z.string().min(1, "Date is required"),
  truckId: z.number().min(1, "Truck ID is required"),
  customerId: z.string().min(1, "Customer is required").toUpperCase(),
  farmName: z.string().min(1, "Farm Address is required").toUpperCase(),
  origin: z.string().min(1, "Origin is required").toUpperCase(),
  destination: z.string().min(1, "Destination is required").toUpperCase(),
  tripType: z.string().min(1, "Trip Type is required").toUpperCase(),
  loadType: z.string().toUpperCase(),
  deliveryOrderNo: z.string().optional(),

  qtyHeads: z.number().min(0),
  qtyNote: z.string().optional(),

  rate: z.number().min(0),
  ratePerTrip: z.number().min(0).optional(),
  tollFees: z.number().min(0),
  dieselCash: z.number().min(0),
  dieselPo: z.number().min(0),
  meals: z.number().min(0),
  roroShip: z.number().min(0),

  salary: z.number().min(0),
  salaryNote: z.string().optional(),

  others: z.number().min(0),
  othersNote: z.string().optional(),
  
  miscellaneous: z.number().min(0),
  miscellaneousNote: z.string().optional(),
  
  forceSave: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.tripType === "CPF") {
    const requiredFields = [
      { name: "salary", msg: "Salary is required for CPF trips" },
      { name: "tollFees", msg: "Toll fees are required for CPF trips" },
      { name: "meals", msg: "Meals are required for CPF trips" },
      { name: "miscellaneous", msg: "Miscellaneous is required for CPF trips" },
      { name: "ratePerTrip", msg: "Rate / Trip is required for CPF trips" },
    ];
    requiredFields.forEach(({ name, msg }) => {
      const val = data[name as keyof typeof data];
      if (!val || (typeof val === "number" && val <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: msg,
          path: [name],
        });
      }
    });
  } else {
    if (!data.loadType || data.loadType.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Load Type is required",
        path: ["loadType"],
      });
    }
  }
});

export async function createTripRecord(values: z.infer<typeof tripSchema>) {
  const validatedData = tripSchema.safeParse(values);

  if (!validatedData.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  try {
    if (validatedData.data.tripType === "CPF") {
      // ✨ Duplicate Checker for D.O. No.
      if (validatedData.data.deliveryOrderNo) {
        const existingDo = await db
          .select({ id: truckingTripsCpf.id })
          .from(truckingTripsCpf)
          .where(eq(truckingTripsCpf.deliveryOrderNo, validatedData.data.deliveryOrderNo))
          .limit(1);

        if (existingDo.length > 0) {
          return {
            success: false,
            error: `DUPLICATE DETECTED: D.O. No. ${validatedData.data.deliveryOrderNo} already exists.`,
          };
        }
      }

      // ✨ Duplicate Checker for CPF Trips
      const existingTrip = await db
        .select({ id: truckingTripsCpf.id })
        .from(truckingTripsCpf)
        .where(
          and(
            eq(truckingTripsCpf.date, validatedData.data.date),
            eq(truckingTripsCpf.truckId, validatedData.data.truckId),
            eq(truckingTripsCpf.destination, validatedData.data.destination),
          ),
        )
        .limit(1);

      if (existingTrip.length > 0 && !validatedData.data.forceSave) {
        return {
          success: false,
          isDuplicateCpf: true,
          error: `DUPLICATE DETECTED: This truck already has a recorded CPF trip to ${validatedData.data.destination} on ${validatedData.data.date}.`,
        };
      }

      // ✨ Insert into trucking_trips_cpf
      await db.insert(truckingTripsCpf).values({
        date: validatedData.data.date,
        truckId: validatedData.data.truckId,
        origin: validatedData.data.origin,
        destination: validatedData.data.destination,
        tripType: validatedData.data.tripType,
        deliveryOrderNo: validatedData.data.deliveryOrderNo,

        ratePerTrip: validatedData.data.ratePerTrip || 0,
        tollFees: validatedData.data.tollFees,
        dieselCash: validatedData.data.dieselCash,
        dieselPo: validatedData.data.dieselPo,
        meals: validatedData.data.meals,

        salary: validatedData.data.salary,
        salaryNote: validatedData.data.salaryNote,

        miscellaneous: validatedData.data.miscellaneous,
        miscellaneousNote: validatedData.data.miscellaneousNote,
      });
    } else {
      // ✨ Original Duplicate Checker Logic for Normal Trips
      const existingTrip = await db
        .select({ id: truckingTrips.id })
        .from(truckingTrips)
        .where(
          and(
            eq(truckingTrips.date, validatedData.data.date),
            eq(truckingTrips.truckId, validatedData.data.truckId),
            eq(truckingTrips.customerId, validatedData.data.customerId),
            eq(truckingTrips.destination, validatedData.data.destination),
          ),
        )
        .limit(1);

      if (existingTrip.length > 0) {
        return {
          success: false,
          error: `DUPLICATE DETECTED: This truck already has a recorded trip to ${validatedData.data.destination} for ${validatedData.data.customerId} on ${validatedData.data.date}.`,
        };
      }

      // ✨ Proceed with Insert into normal truckingTrips
      await db.insert(truckingTrips).values({
        date: validatedData.data.date,
        truckId: validatedData.data.truckId,
        customerId: validatedData.data.customerId,
        farmName: validatedData.data.farmName,
        origin: validatedData.data.origin,
        destination: validatedData.data.destination,
        tripType: validatedData.data.tripType,
        loadType: validatedData.data.loadType,

        qtyHeads: validatedData.data.qtyHeads,
        qtyNote: validatedData.data.qtyNote,

        rate: validatedData.data.rate,
        tollFees: validatedData.data.tollFees,
        dieselCash: validatedData.data.dieselCash,
        dieselPo: validatedData.data.dieselPo,
        meals: validatedData.data.meals,
        roroShip: validatedData.data.roroShip,

        salary: validatedData.data.salary,
        salaryNote: validatedData.data.salaryNote,

        others: validatedData.data.others,
        othersNote: validatedData.data.othersNote,
      });
    }

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
export async function deleteTripRecord(tripId: number, tripType?: string) {
  try {
    if (tripType === "CPF") {
      await db.delete(truckingTripsCpf).where(eq(truckingTripsCpf.id, tripId));
    } else {
      await db.delete(truckingTrips).where(eq(truckingTrips.id, tripId));
    }
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
    if (data.tripType === "CPF") {
      // ✨ Duplicate Checker for D.O. No.
      if (data.deliveryOrderNo) {
        const existingDo = await db
          .select({ id: truckingTripsCpf.id })
          .from(truckingTripsCpf)
          .where(
            and(
              eq(truckingTripsCpf.deliveryOrderNo, data.deliveryOrderNo),
              ne(truckingTripsCpf.id, tripId)
            )
          )
          .limit(1);

        if (existingDo.length > 0) {
          return {
            success: false,
            error: `DUPLICATE DETECTED: D.O. No. ${data.deliveryOrderNo} already exists.`,
          };
        }
      }

      await db
        .update(truckingTripsCpf)
        .set({
          date: data.date,
          origin: data.origin,
          destination: data.destination,
          tripType: data.tripType,
          deliveryOrderNo: data.deliveryOrderNo,

          ratePerTrip: data.ratePerTrip,
          tollFees: data.tollFees,
          dieselCash: data.dieselCash,
          dieselPo: data.dieselPo,
          meals: data.meals,

          salary: data.salary,
          salaryNote: data.salaryNote,

          miscellaneous: data.miscellaneous,
          miscellaneousNote: data.miscellaneousNote,
        })
        .where(eq(truckingTripsCpf.id, tripId));
    } else {
      await db
        .update(truckingTrips)
        .set({
          date: data.date,
          customerId: data.customerId,
          farmName: data.farmName,
          origin: data.origin,
          destination: data.destination,
          tripType: data.tripType,
          loadType: data.loadType,

          qtyHeads: data.qtyHeads,
          qtyNote: data.qtyNote,

          rate: data.rate,
          tollFees: data.tollFees,
          dieselCash: data.dieselCash,
          dieselPo: data.dieselPo,
          meals: data.meals,
          roroShip: data.roroShip,

          salary: data.salary,
          salaryNote: data.salaryNote,

          others: data.others,
          othersNote: data.othersNote,
        })
        .where(eq(truckingTrips.id, tripId));
    }

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

    const uniqueCustomers = Array.from(
      new Set(tripsData.map((t) => t.customerId).filter(Boolean)),
    ).slice(0, 15); // Increased slice slightly for better history
    const uniqueFarms = Array.from(
      new Set(tripsData.map((t) => t.farmName).filter(Boolean)),
    ).slice(0, 15);

    return { success: true, customers: uniqueCustomers, farms: uniqueFarms };
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return { success: false, customers: [], farms: [] };
  }
}
