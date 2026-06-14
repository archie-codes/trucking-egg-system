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

  qtyPeewee: numField,
  qtyXs: numField,
  qtySmall: numField,
  qtyMedium: numField,
  qtyLarge: numField,
  qtyXl: numField,
  qtyXxl: numField,
  qtyCracked: numField,
  qtyBroken: numField,
  qtyDirty: numField, // ✨ ADDED

  brownQtyPeewee: numField,
  brownQtyXs: numField,
  brownQtySmall: numField,
  brownQtyMedium: numField,
  brownQtyLarge: numField,
  brownQtyXl: numField,
  brownQtyXxl: numField,
  brownQtyAssorted: numField,
  brownQtyCracked: numField,
  brownQtyBroken: numField,
  brownQtyDirty: numField,
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
      qtyPeewee: data.qtyPeewee,
      qtyXs: data.qtyXs,
      qtySmall: data.qtySmall,
      qtyMedium: data.qtyMedium,
      qtyLarge: data.qtyLarge,
      qtyXl: data.qtyXl,
      qtyXxl: data.qtyXxl,
      qtyCracked: data.qtyCracked,
      qtyBroken: data.qtyBroken,
      qtyDirty: data.qtyDirty, // ✨ Added
      brownQtyPeewee: data.brownQtyPeewee,
      brownQtyXs: data.brownQtyXs,
      brownQtySmall: data.brownQtySmall,
      brownQtyMedium: data.brownQtyMedium,
      brownQtyLarge: data.brownQtyLarge,
      brownQtyXl: data.brownQtyXl,
      brownQtyXxl: data.brownQtyXxl,
      brownQtyAssorted: data.brownQtyAssorted,
      brownQtyCracked: data.brownQtyCracked,
      brownQtyBroken: data.brownQtyBroken,
      brownQtyDirty: data.brownQtyDirty,
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
    await updateStock("PEEWEE", data.qtyPeewee);
    await updateStock("XS", data.qtyXs);
    await updateStock("SMALL", data.qtySmall);
    await updateStock("MEDIUM", data.qtyMedium);
    await updateStock("LARGE", data.qtyLarge);
    await updateStock("XL", data.qtyXl);
    await updateStock("XXL", data.qtyXxl);
    await updateStock("CRACKED", data.qtyCracked);
    await updateStock("BROKEN", data.qtyBroken);
    await updateStock("DIRTY", data.qtyDirty);

    await updateStock("BROWN_PEEWEE", data.brownQtyPeewee);
    await updateStock("BROWN_XS", data.brownQtyXs);
    await updateStock("BROWN_SMALL", data.brownQtySmall);
    await updateStock("BROWN_MEDIUM", data.brownQtyMedium);
    await updateStock("BROWN_LARGE", data.brownQtyLarge);
    await updateStock("BROWN_XL", data.brownQtyXl);
    await updateStock("BROWN_XXL", data.brownQtyXxl);
    await updateStock("BROWN_ASSORTED", data.brownQtyAssorted);
    await updateStock("BROWN_CRACKED", data.brownQtyCracked);
    await updateStock("BROWN_BROKEN", data.brownQtyBroken);
    await updateStock("BROWN_DIRTY", data.brownQtyDirty);

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
      .orderBy(desc(eggBatches.createdAt), desc(eggBatches.batchId));

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
      { class: "PEEWEE", qty: batch.qtyPeewee },
      { class: "XS", qty: batch.qtyXs },
      { class: "SMALL", qty: batch.qtySmall },
      { class: "MEDIUM", qty: batch.qtyMedium },
      { class: "LARGE", qty: batch.qtyLarge },
      { class: "XL", qty: batch.qtyXl },
      { class: "XXL", qty: batch.qtyXxl },
      { class: "CRACKED", qty: batch.qtyCracked },
      { class: "BROKEN", qty: batch.qtyBroken },
      { class: "DIRTY", qty: batch.qtyDirty },
      { class: "BROWN_PEEWEE", qty: batch.brownQtyPeewee },
      { class: "BROWN_XS", qty: batch.brownQtyXs },
      { class: "BROWN_SMALL", qty: batch.brownQtySmall },
      { class: "BROWN_MEDIUM", qty: batch.brownQtyMedium },
      { class: "BROWN_LARGE", qty: batch.brownQtyLarge },
      { class: "BROWN_XL", qty: batch.brownQtyXl },
      { class: "BROWN_XXL", qty: batch.brownQtyXxl },
      { class: "BROWN_ASSORTED", qty: batch.brownQtyAssorted },
      { class: "BROWN_CRACKED", qty: batch.brownQtyCracked },
      { class: "BROWN_BROKEN", qty: batch.brownQtyBroken },
      { class: "BROWN_DIRTY", qty: batch.brownQtyDirty },
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
      { class: "PEEWEE", delta: data.qtyPeewee - old.qtyPeewee },
      { class: "XS", delta: data.qtyXs - old.qtyXs },
      { class: "SMALL", delta: data.qtySmall - old.qtySmall },
      { class: "MEDIUM", delta: data.qtyMedium - old.qtyMedium },
      { class: "LARGE", delta: data.qtyLarge - old.qtyLarge },
      { class: "XL", delta: data.qtyXl - old.qtyXl },
      { class: "XXL", delta: data.qtyXxl - old.qtyXxl },
      { class: "CRACKED", delta: data.qtyCracked - old.qtyCracked },
      { class: "BROKEN", delta: data.qtyBroken - old.qtyBroken },
      { class: "DIRTY", delta: data.qtyDirty - old.qtyDirty },
      { class: "BROWN_PEEWEE", delta: data.brownQtyPeewee - old.brownQtyPeewee },
      { class: "BROWN_XS", delta: data.brownQtyXs - old.brownQtyXs },
      { class: "BROWN_SMALL", delta: data.brownQtySmall - old.brownQtySmall },
      { class: "BROWN_MEDIUM", delta: data.brownQtyMedium - old.brownQtyMedium },
      { class: "BROWN_LARGE", delta: data.brownQtyLarge - old.brownQtyLarge },
      { class: "BROWN_XL", delta: data.brownQtyXl - old.brownQtyXl },
      { class: "BROWN_XXL", delta: data.brownQtyXxl - old.brownQtyXxl },
      { class: "BROWN_ASSORTED", delta: data.brownQtyAssorted - old.brownQtyAssorted },
      { class: "BROWN_CRACKED", delta: data.brownQtyCracked - old.brownQtyCracked },
      { class: "BROWN_BROKEN", delta: data.brownQtyBroken - old.brownQtyBroken },
      { class: "BROWN_DIRTY", delta: data.brownQtyDirty - old.brownQtyDirty },
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
        qtyPeewee: data.qtyPeewee,
        qtyXs: data.qtyXs,
        qtySmall: data.qtySmall,
        qtyMedium: data.qtyMedium,
        qtyLarge: data.qtyLarge,
        qtyXl: data.qtyXl,
        qtyXxl: data.qtyXxl,
        qtyCracked: data.qtyCracked,
        qtyBroken: data.qtyBroken,
        qtyDirty: data.qtyDirty,
        brownQtyPeewee: data.brownQtyPeewee,
        brownQtyXs: data.brownQtyXs,
        brownQtySmall: data.brownQtySmall,
        brownQtyMedium: data.brownQtyMedium,
        brownQtyLarge: data.brownQtyLarge,
        brownQtyXl: data.brownQtyXl,
        brownQtyXxl: data.brownQtyXxl,
        brownQtyAssorted: data.brownQtyAssorted,
        brownQtyCracked: data.brownQtyCracked,
        brownQtyBroken: data.brownQtyBroken,
        brownQtyDirty: data.brownQtyDirty,
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

// ✨ GET CUSTOMER SUGGESTIONS
export async function getEggCustomerSuggestions() {
  try {
    const customers = await db
      .select({ customerId: eggSales.customerId })
      .from(eggSales)
      .groupBy(eggSales.customerId);

    return {
      success: true,
      customers: customers.map((c) => c.customerId).filter(Boolean),
    };
  } catch (error) {
    console.error("Failed to fetch customer suggestions:", error);
    return { success: false, customers: [] };
  }
}

// ✨ DELETE EGG SALE
export async function deleteEggSale(id: number) {
  try {
    const saleResult = await db
      .select()
      .from(eggSales)
      .where(eq(eggSales.id, id))
      .limit(1);

    if (saleResult.length === 0) {
      return { success: false, error: "Sale record not found." };
    }

    const sale = saleResult[0];

    await db.transaction(async (tx) => {
      // 1. Add the sold trays back into the inventory
      await tx
        .update(eggInventory)
        .set({
          currentStockTrays: sql`${eggInventory.currentStockTrays} + ${sale.quantityTrays * 30}`,
          lastUpdated: new Date(),
        })
        .where(eq(eggInventory.classification, sale.classification));

      // 2. Delete the sale record
      await tx.delete(eggSales).where(eq(eggSales.id, id));
    });

    revalidatePath("/egg-sales/sales/history");
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete Sale Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete sale.",
    };
  }
}

const editSaleSchema = z.object({
  id: z.number(),
  saleDate: z.string().min(1, "Date is required"),
  customerId: z.string().min(1, "Customer name is required").toUpperCase(),
  quantityTrays: z.number(),
  pricePerTray: z.number(),
  amountPaid: z.number(),
  datePaid: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

// ✨ UPDATE EGG SALE
export async function updateEggSale(values: z.infer<typeof editSaleSchema>) {
  const validatedData = editSaleSchema.safeParse(values);

  if (!validatedData.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  const data = validatedData.data;

  try {
    const oldSaleResult = await db
      .select()
      .from(eggSales)
      .where(eq(eggSales.id, data.id))
      .limit(1);

    if (oldSaleResult.length === 0) {
      return { success: false, error: "Original sale record not found." };
    }

    const old = oldSaleResult[0];
    const totalAmount = data.quantityTrays * data.pricePerTray;
    let paymentStatus = "unpaid";
    
    if (data.amountPaid >= totalAmount && totalAmount > 0) {
        paymentStatus = "paid";
    } else if (data.amountPaid > 0 && data.amountPaid < totalAmount) {
        paymentStatus = "partial";
    }

    await db.transaction(async (tx) => {
      // Delta = new quantity - old quantity (in pieces)
      // Positive delta means we sold MORE, so we must deduct MORE from stock.
      // Negative delta means we sold LESS, so we must ADD back to stock.
      const deltaTrays = data.quantityTrays - old.quantityTrays;
      const deltaPieces = deltaTrays * 30;

      if (deltaPieces > 0) {
        // Check if we have enough stock for the additional pieces
        const stockResult = await tx
          .select({ currentStockTrays: eggInventory.currentStockTrays })
          .from(eggInventory)
          .where(eq(eggInventory.classification, old.classification))
          .limit(1);

        const currentStock = stockResult[0]?.currentStockTrays || 0;
        if (currentStock < deltaPieces) {
          throw new Error(
            `Insufficient stock for update. Need ${deltaTrays} more trays of ${old.classification}, but only ${Math.floor(currentStock / 30)} available.`,
          );
        }
      }

      // 1. Adjust inventory
      if (deltaPieces !== 0) {
        await tx
          .update(eggInventory)
          .set({
            currentStockTrays: sql`${eggInventory.currentStockTrays} - ${deltaPieces}`,
            lastUpdated: new Date(),
          })
          .where(eq(eggInventory.classification, old.classification));
      }

      // 2. Update sale record
      await tx
        .update(eggSales)
        .set({
          saleDate: data.saleDate,
          customerId: data.customerId,
          quantityTrays: data.quantityTrays,
          pricePerTray: data.pricePerTray,
          totalAmount: totalAmount,
          amountPaid: data.amountPaid,
          datePaid: data.datePaid,
          paymentStatus: paymentStatus,
          remarks: data.remarks || null,
        })
        .where(eq(eggSales.id, data.id));
    });

    revalidatePath("/egg-sales/sales/history");
    return { success: true };
  } catch (error: unknown) {
    console.error("Update Sale Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update sale.",
    };
  }
}

// ✨ RECORD A MULTI-ITEM EGG SALE (Outbound Fulfillment)
const saleItemSchema = z.object({
  classification: z.string().min(1),
  quantityTrays: z.number().min(1),
  pricePerTray: z.number().min(0),
});

const saleSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  customerId: z.string().min(1, "Customer is required").toUpperCase(),
  items: z.array(saleItemSchema).min(1, "Need at least 1 item"),
  amountPaid: z.number().min(0, "Invalid amount"),
  datePaid: z.string().optional().nullable(),
  remarks: z.string().optional(),
});

export async function createEggSale(values: z.infer<typeof saleSchema>) {
  const validated = saleSchema.safeParse(values);
  if (!validated.success) return { success: false, error: "Invalid form data" };

  const data = validated.data;
  const PIECES_PER_TRAY = 30;

  try {
    const timestamp = data.saleDate.replace(/-/g, "");
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedInvoiceId = `INV-${timestamp}-${randomChars}`;

    await db.transaction(async (tx) => {
      // 1. Guard: Check Live Inventory for ALL items first
      for (const item of data.items) {
        const stock = await tx
          .select({
            currentStockTrays: eggInventory.currentStockTrays,
            id: eggInventory.id,
          })
          .from(eggInventory)
          .where(eq(eggInventory.classification, item.classification))
          .limit(1);

        const availablePieces = stock[0]?.currentStockTrays || 0;
        const totalPiecesSold = item.quantityTrays * PIECES_PER_TRAY;

        if (stock.length === 0 || availablePieces < totalPiecesSold) {
          throw new Error(
            `Insufficient stock for ${item.classification}. Need ${item.quantityTrays} trays, but only have ${Math.floor(availablePieces / 30)} left.`,
          );
        }
      }

      // 2. Distribute the payment across the items to keep the flat ledger accurate
      let remainingPayment = data.amountPaid;

      for (const item of data.items) {
        const totalPiecesSold = item.quantityTrays * PIECES_PER_TRAY;
        const itemTotalAmount = item.quantityTrays * item.pricePerTray;

        // Calculate how much of the payment applies to this specific row
        const appliedPayment = Math.min(remainingPayment, itemTotalAmount);
        remainingPayment -= appliedPayment;

        const balance = itemTotalAmount - appliedPayment;
        let status = "unpaid";
        if (balance <= 0) status = "paid";
        else if (appliedPayment > 0 && balance > 0) status = "partial";

        // Fetch the inventory ID again for the foreign key
        const stock = await tx
          .select({ id: eggInventory.id })
          .from(eggInventory)
          .where(eq(eggInventory.classification, item.classification))
          .limit(1);

        // Insert individual ledger row
        await tx.insert(eggSales).values({
          saleDate: data.saleDate,
          customerId: data.customerId,
          invoiceId: generatedInvoiceId,
          inventoryId: stock[0].id,
          classification: item.classification,
          quantityTrays: item.quantityTrays,
          pricePerTray: item.pricePerTray,
          totalAmount: itemTotalAmount,
          amountPaid: appliedPayment,
          paymentStatus: status,
          datePaid: data.datePaid || null,
          remarks: data.remarks,
        });

        // Deduct from inventory
        await tx
          .update(eggInventory)
          .set({
            currentStockTrays: sql`${eggInventory.currentStockTrays} - ${totalPiecesSold}`,
            lastUpdated: new Date(),
          })
          .where(eq(eggInventory.classification, item.classification));
      }
    });

    revalidatePath("/egg-sales");
    return { success: true, invoiceId: generatedInvoiceId };
  } catch (error: unknown) {
    console.error("Sale Transaction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process sale.",
    };
  }
}

// ✨ GET EGG SALES HISTORY (ACCOUNTS RECEIVABLE)
export async function getEggSalesHistory() {
  try {
    const history = await db
      .select()
      .from(eggSales)
      .orderBy(desc(eggSales.saleDate), desc(eggSales.createdAt), desc(eggSales.id));

    return { success: true, data: history };
  } catch (error) {
    console.error("Failed to fetch sales history:", error);
    return { success: false, data: [] };
  }
}
