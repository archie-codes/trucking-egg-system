// app/actions/egg-actions.ts
"use server";

import { db } from "@/db";
import { eggBatches, eggInventory } from "@/db/schema";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const batchSchema = z.object({
  arrivalDate: z.string().min(1, "Date is required"),
  batchId: z.string().min(1, "Batch ID is required"),
  farmName: z.string().min(1, "Farm Name is required").toUpperCase(),
  rawTraysPickedUp: numField.pipe(
    z.number().min(1, "Must log at least 1 picked up tray"),
  ),

  qtySmall: numField,
  qtyMedium: numField,
  qtyLarge: numField,
  qtyXl: numField,
  qtyXxl: numField,

  qtyCracked: numField,
  qtyBroken: numField,
});

export async function createEggBatch(values: z.infer<typeof batchSchema>) {
  const validatedData = batchSchema.safeParse(values);

  if (!validatedData.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  const data = validatedData.data;

  try {
    // Wrap in a transaction to ensure both history and inventory update together
    await db.transaction(async (tx) => {
      // 1. Log the Batch History
      await tx.insert(eggBatches).values({
        arrivalDate: data.arrivalDate,
        batchId: data.batchId,
        farmName: data.farmName,
        rawTraysPickedUp: data.rawTraysPickedUp,
        qtySmall: data.qtySmall,
        qtyMedium: data.qtyMedium,
        qtyLarge: data.qtyLarge,
        qtyXl: data.qtyXl,
        qtyXxl: data.qtyXxl,
        qtyCracked: data.qtyCracked,
        qtyBroken: data.qtyBroken,
      });

      // 2. Helper to upsert inventory (Add to stock, or create classification if it doesn't exist)
      const updateStock = async (classification: string, qty: number) => {
        if (qty <= 0) return;

        await tx
          .insert(eggInventory)
          .values({
            classification,
            currentStockTrays: qty,
            pricePerTray: 0, // Default price, can be updated in inventory dash later
          })
          .onConflictDoUpdate({
            target: eggInventory.classification,
            set: {
              currentStockTrays: sql`${eggInventory.currentStockTrays} + ${qty}`,
              lastUpdated: new Date(),
            },
          });
      };

      // 3. Update the ledger for all good eggs
      await updateStock("SMALL", data.qtySmall);
      await updateStock("MEDIUM", data.qtyMedium);
      await updateStock("LARGE", data.qtyLarge);
      await updateStock("XL", data.qtyXl);
      await updateStock("XXL", data.qtyXxl);
    });

    revalidatePath("/egg-sales/inventory");
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
