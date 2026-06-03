// app/actions/egg-actions.ts
"use server";

import { db } from "@/db";
import { eggBatches, eggInventory } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const batchSchema = z.object({
  arrivalDate: z.string().min(1, "Date is required"),
  batchId: z.string().min(1, "Batch ID is required"),
  farmName: z.string().min(1, "Farm Name is required").toUpperCase(),

  rawCasesPickedUp: numField,
  rawTraysPickedUp: numField,

  qtySmall: numField,
  qtyMedium: numField,
  qtyLarge: numField,
  qtyXl: numField,
  qtyXxl: numField,
  qtyCracked: numField,
  qtyBroken: numField,
  qtyDirty: numField, // ✨ ADDED
});

export async function createEggBatch(values: z.infer<typeof batchSchema>) {
  const validatedData = batchSchema.safeParse(values);

  if (!validatedData.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  const data = validatedData.data;

  try {
    // 1. Log the Batch History
    await db.insert(eggBatches).values({
      arrivalDate: data.arrivalDate,
      batchId: data.batchId,
      farmName: data.farmName,
      rawCasesPickedUp: data.rawCasesPickedUp, // ✨ Added
      rawTraysPickedUp: data.rawTraysPickedUp, // ✨ Added
      qtySmall: data.qtySmall,
      qtyMedium: data.qtyMedium,
      qtyLarge: data.qtyLarge,
      qtyXl: data.qtyXl,
      qtyXxl: data.qtyXxl,
      qtyCracked: data.qtyCracked,
      qtyBroken: data.qtyBroken,
      qtyDirty: data.qtyDirty, // ✨ Added
    });

    const updateStock = async (classification: string, qtyPieces: number) => {
      if (qtyPieces <= 0) return;
      await db
        .insert(eggInventory)
        .values({
          classification,
          currentStockTrays: qtyPieces,
          pricePerTray: 0,
        })
        .onConflictDoUpdate({
          target: eggInventory.classification,
          set: {
            currentStockTrays: sql`${eggInventory.currentStockTrays} + ${qtyPieces}`,
            lastUpdated: new Date(),
          },
        });
    };

    // 3. Update the ledger
    await updateStock("SMALL", data.qtySmall);
    await updateStock("MEDIUM", data.qtyMedium);
    await updateStock("LARGE", data.qtyLarge);
    await updateStock("XL", data.qtyXl);
    await updateStock("XXL", data.qtyXxl);
    // Note: We typically do not add Cracked/Broken/Dirty to the main sellable inventory ledger,
    // but they are safely recorded in the history table above!

    revalidatePath("/egg-sales");
    return { success: true };
  } catch (error: unknown) {
    console.error("Batch Transaction Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process batch receiving.",
    };
  }
}
// ... Keep your other functions exactly the same

// ✨ GET UNIQUE FARMS FOR BODEGA AUTOCOMPLETE
export async function getEggFarmSuggestions() {
  try {
    const batches = await db
      .select({ farmName: eggBatches.farmName })
      .from(eggBatches);

    // Extract unique farm names and keep the most recent 15
    const uniqueFarms = Array.from(
      new Set(batches.map((b) => b.farmName).filter(Boolean)),
    ).slice(0, 15);

    return { success: true, farms: uniqueFarms };
  } catch (error) {
    console.error("Failed to fetch farm suggestions:", error);
    return { success: false, farms: [] };
  }
}

// ✨ GET RECEIVED EGG HISTORY
export async function getEggBatchHistory() {
  try {
    const history = await db
      .select()
      .from(eggBatches)
      .orderBy(desc(eggBatches.createdAt));

    return { success: true, data: history };
  } catch (error) {
    console.error("Failed to fetch batch history:", error);
    return { success: false, data: [] };
  }
}
