// app/actions/egg-actions.ts
"use server";

import { db } from "@/db";
import { eggBatches, eggInventory, eggSales } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
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

  qtyXs: numField,
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
      qtyXs: data.qtyXs,
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
    await updateStock("XS", data.qtyXs);
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

// ✨ STRICT BATCH DELETION
export async function deleteEggBatch(batchId: string) {
  try {
    const batchResult = await db
      .select()
      .from(eggBatches)
      .where(eq(eggBatches.batchId, batchId))
      .limit(1);

    if (batchResult.length === 0) {
      return { success: false, error: "Batch record not found." };
    }

    const batch = batchResult[0];

    // Map the quantities we need to subtract from inventory
    const inventoryReversalMap = [
      { class: "XS", qty: batch.qtyXs },
      { class: "SMALL", qty: batch.qtySmall },
      { class: "MEDIUM", qty: batch.qtyMedium },
      { class: "LARGE", qty: batch.qtyLarge },
      { class: "XL", qty: batch.qtyXl },
      { class: "XXL", qty: batch.qtyXxl },
    ];

    // 1. Guard Check: Ensure deleting this won't cause negative inventory
    for (const item of inventoryReversalMap) {
      if (item.qty <= 0) continue;

      const stockResult = await db
        .select({ currentStockTrays: eggInventory.currentStockTrays })
        .from(eggInventory)
        .where(eq(eggInventory.classification, item.class))
        .limit(1);

      const currentStock = stockResult[0]?.currentStockTrays || 0;

      if (currentStock < item.qty) {
        throw new Error(
          `Cannot delete batch. ${item.class} eggs from this batch have already been sold. (Need ${item.qty}, only ${currentStock} available).`,
        );
      }
    }

    // 2. Safely deduct the pieces back out of the inventory
    for (const item of inventoryReversalMap) {
      if (item.qty <= 0) continue;

      await db
        .update(eggInventory)
        .set({
          currentStockTrays: sql`${eggInventory.currentStockTrays} - ${item.qty}`,
          lastUpdated: new Date(),
        })
        .where(eq(eggInventory.classification, item.class));
    }

    // 3. Delete the historical record
    await db.delete(eggBatches).where(eq(eggBatches.batchId, batchId));

    revalidatePath("/egg-sales/receiving/history");
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete Batch Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete batch.",
    };
  }
}

// ✨ STRICT DELTA MATH BATCH EDITING
const editBatchSchema = batchSchema.extend({
  id: z.number(),
});

export async function updateEggBatch(values: z.infer<typeof editBatchSchema>) {
  const validatedData = editBatchSchema.safeParse(values);

  if (!validatedData.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  const data = validatedData.data;

  try {
    const oldBatchResult = await db
      .select()
      .from(eggBatches)
      .where(eq(eggBatches.id, data.id))
      .limit(1);

    if (oldBatchResult.length === 0) {
      return { success: false, error: "Original batch record not found." };
    }

    const old = oldBatchResult[0];

    // Calculate the Delta (New Value - Old Value)
    const deltas = [
      { class: "XS", delta: data.qtyXs - old.qtyXs },
      { class: "SMALL", delta: data.qtySmall - old.qtySmall },
      { class: "MEDIUM", delta: data.qtyMedium - old.qtyMedium },
      { class: "LARGE", delta: data.qtyLarge - old.qtyLarge },
      { class: "XL", delta: data.qtyXl - old.qtyXl },
      { class: "XXL", delta: data.qtyXxl - old.qtyXxl },
    ];

    // 1. Guard Check: Ensure negative deltas (removing eggs) don't drop stock below zero
    for (const item of deltas) {
      if (item.delta >= 0) continue; // Adding eggs is always safe

      const absoluteRemovalAmount = Math.abs(item.delta);
      const stockResult = await db
        .select({ currentStockTrays: eggInventory.currentStockTrays })
        .from(eggInventory)
        .where(eq(eggInventory.classification, item.class))
        .limit(1);

      const currentStock = stockResult[0]?.currentStockTrays || 0;

      if (currentStock < absoluteRemovalAmount) {
        throw new Error(
          `Cannot reduce ${item.class} count. You are attempting to remove ${absoluteRemovalAmount} pieces, but only ${currentStock} are available in inventory.`,
        );
      }
    }

    // 2. Apply Deltas to Inventory
    for (const item of deltas) {
      if (item.delta === 0) continue; // No change

      await db
        .update(eggInventory)
        .set({
          currentStockTrays: sql`${eggInventory.currentStockTrays} + ${item.delta}`,
          lastUpdated: new Date(),
        })
        .where(eq(eggInventory.classification, item.class));
    }

    // 3. Update the historical batch record with the new values
    await db
      .update(eggBatches)
      .set({
        arrivalDate: data.arrivalDate,
        farmName: data.farmName,
        rawCasesPickedUp: data.rawCasesPickedUp,
        rawTraysPickedUp: data.rawTraysPickedUp,
        qtyXs: data.qtyXs,
        qtySmall: data.qtySmall,
        qtyMedium: data.qtyMedium,
        qtyLarge: data.qtyLarge,
        qtyXl: data.qtyXl,
        qtyXxl: data.qtyXxl,
        qtyCracked: data.qtyCracked,
        qtyBroken: data.qtyBroken,
        qtyDirty: data.qtyDirty,
      })
      .where(eq(eggBatches.id, data.id));

    revalidatePath("/egg-sales/receiving/history");
    return { success: true };
  } catch (error: unknown) {
    console.error("Update Batch Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update batch.",
    };
  }
}

// ✨ GET LIVE INVENTORY FOR SALES GUARD
export async function getLiveEggInventory() {
  try {
    const inventory = await db.select().from(eggInventory);
    return { success: true, data: inventory };
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return { success: false, data: [] };
  }
}

// ✨ GET UNIQUE CUSTOMERS FOR SALES AUTOCOMPLETE
export async function getEggCustomerSuggestions() {
  try {
    const sales = await db
      .select({ customerId: eggSales.customerId })
      .from(eggSales);

    const uniqueCustomers = Array.from(
      new Set(sales.map((s) => s.customerId).filter(Boolean)),
    ).slice(0, 20);

    return { success: true, customers: uniqueCustomers };
  } catch (error) {
    console.error("Failed to fetch customer suggestions:", error);
    return { success: false, customers: [] };
  }
}

// ✨ RECORD AN EGG SALE (Outbound Fulfillment)
const saleSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  customerId: z.string().min(1, "Customer is required").toUpperCase(),
  classification: z.string().min(1, "Egg size is required"),
  quantityTrays: z.number().min(1, "Quantity must be at least 1"),
  pricePerTray: z.number().min(0, "Invalid price"),
  amountPaid: z.number().min(0, "Invalid amount"),
  paymentStatus: z.string(),
  datePaid: z.string().optional().nullable(),
  remarks: z.string().optional(),
});

export async function createEggSale(values: z.infer<typeof saleSchema>) {
  const validated = saleSchema.safeParse(values);
  if (!validated.success) return { success: false, error: "Invalid form data" };

  const data = validated.data;
  const totalAmount = data.quantityTrays * data.pricePerTray;

  // ✨ MATH ENGINE: Convert Sold Trays into Pieces for the database deduction
  const PIECES_PER_TRAY = 30;
  const totalPiecesSold = data.quantityTrays * PIECES_PER_TRAY;

  try {
    // 1. Check Live Inventory (in Pieces)
    const stock = await db
      .select({
        currentStockTrays: eggInventory.currentStockTrays,
        id: eggInventory.id,
      })
      .from(eggInventory)
      .where(eq(eggInventory.classification, data.classification))
      .limit(1);

    const availablePieces = stock[0]?.currentStockTrays || 0;

    // 2. Strict Real-Time Guard
    if (stock.length === 0 || availablePieces < totalPiecesSold) {
      throw new Error(
        `Insufficient stock. You need ${totalPiecesSold} pieces (${data.quantityTrays} trays), but only have ${availablePieces} pieces left.`,
      );
    }

    // 3. Log the Sale in the Ledger
    await db.insert(eggSales).values({
      saleDate: data.saleDate,
      customerId: data.customerId,
      inventoryId: stock[0].id,
      classification: data.classification,
      quantityTrays: data.quantityTrays,
      pricePerTray: data.pricePerTray,
      totalAmount: totalAmount,
      amountPaid: data.amountPaid,
      paymentStatus: data.paymentStatus,
      datePaid: data.datePaid || null,
      remarks: data.remarks,
    });

    // 4. Real-Time Deduction! (Subtracting the pieces)
    await db
      .update(eggInventory)
      .set({
        currentStockTrays: sql`${eggInventory.currentStockTrays} - ${totalPiecesSold}`,
        lastUpdated: new Date(),
      })
      .where(eq(eggInventory.classification, data.classification));

    revalidatePath("/egg-sales");
    return { success: true };
  } catch (error: unknown) {
    console.error("Sale Transaction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process sale.",
    };
  }
}
