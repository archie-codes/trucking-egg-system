// app/actions/egg-actions.ts
"use server";

import { db } from "@/db";
import { eggBatches, eggInventory, eggSales, users } from "@/db/schema";
import { sql, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import * as z from "zod";

const numField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val) || 0);

const batchSchema = z.object({
  arrivalDate: z.string().min(1, "Date is required"),
  batchId: z.string().min(1, "Batch ID is required"),
  farmName: z.string().min(1, "Farm Name is required").toUpperCase(),
  receivedBy: z.string().optional(),

  totalTraysPickedUp: numField,
  extraType: z.string().default("NONE"),
  extraPiecesPickedUp: numField,

  qtyPeewee: numField,
  qtyXs: numField,
  qtySmall: numField,
  qtyMedium: numField,
  qtyLarge: numField,
  qtyXl: numField,
  qtyXxl: numField,
  qtyCracked: numField,
  qtyBroken: numField,
  qtyDirty: numField,

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

  // Resolve logged-in user / encoder name
  let encoderName = data.receivedBy || "System";
  if (!data.receivedBy) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        const payload = decodeJwt(token);
        if (payload?.id) {
          const [u] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, payload.id as number));
          if (u?.name) encoderName = u.name;
        }
      }
    } catch (err) {
      console.error("Failed to resolve user for receiving batch:", err);
    }
  }

  try {
    // 1. Log the Batch History (in Trays)
    await db.insert(eggBatches).values({
      arrivalDate: data.arrivalDate,
      batchId: data.batchId,
      farmName: data.farmName,
      receivedBy: encoderName,
      totalTraysPickedUp: data.totalTraysPickedUp,
      extraType: data.extraType || "NONE",
      extraPiecesPickedUp: data.extraPiecesPickedUp,
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
    });

    const updateStock = async (classification: string, qtyTrays: number) => {
      if (qtyTrays <= 0) return;
      const qtyPieces = Math.round(qtyTrays * 30);
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

    // 3. Update the ledger (converts trays to pieces for stock ledger)
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

    // Map quantities to pieces to subtract from inventory
    const inventoryReversalMap = [
      { class: "PEEWEE", pieces: Math.round((batch.qtyPeewee || 0) * 30) },
      { class: "XS", pieces: Math.round((batch.qtyXs || 0) * 30) },
      { class: "SMALL", pieces: Math.round((batch.qtySmall || 0) * 30) },
      { class: "MEDIUM", pieces: Math.round((batch.qtyMedium || 0) * 30) },
      { class: "LARGE", pieces: Math.round((batch.qtyLarge || 0) * 30) },
      { class: "XL", pieces: Math.round((batch.qtyXl || 0) * 30) },
      { class: "XXL", pieces: Math.round((batch.qtyXxl || 0) * 30) },
      { class: "CRACKED", pieces: Math.round((batch.qtyCracked || 0) * 30) },
      { class: "BROKEN", pieces: Math.round((batch.qtyBroken || 0) * 30) },
      { class: "DIRTY", pieces: Math.round((batch.qtyDirty || 0) * 30) },
      { class: "BROWN_PEEWEE", pieces: Math.round((batch.brownQtyPeewee || 0) * 30) },
      { class: "BROWN_XS", pieces: Math.round((batch.brownQtyXs || 0) * 30) },
      { class: "BROWN_SMALL", pieces: Math.round((batch.brownQtySmall || 0) * 30) },
      { class: "BROWN_MEDIUM", pieces: Math.round((batch.brownQtyMedium || 0) * 30) },
      { class: "BROWN_LARGE", pieces: Math.round((batch.brownQtyLarge || 0) * 30) },
      { class: "BROWN_XL", pieces: Math.round((batch.brownQtyXl || 0) * 30) },
      { class: "BROWN_XXL", pieces: Math.round((batch.brownQtyXxl || 0) * 30) },
      { class: "BROWN_ASSORTED", pieces: Math.round((batch.brownQtyAssorted || 0) * 30) },
      { class: "BROWN_CRACKED", pieces: Math.round((batch.brownQtyCracked || 0) * 30) },
      { class: "BROWN_BROKEN", pieces: Math.round((batch.brownQtyBroken || 0) * 30) },
      { class: "BROWN_DIRTY", pieces: Math.round((batch.brownQtyDirty || 0) * 30) },
    ];

    // 1. Guard Check: Ensure deleting this won't cause negative inventory
    for (const item of inventoryReversalMap) {
      if (item.pieces <= 0) continue;

      const stockResult = await db
        .select({ currentStockTrays: eggInventory.currentStockTrays })
        .from(eggInventory)
        .where(eq(eggInventory.classification, item.class))
        .limit(1);

      const currentStock = stockResult[0]?.currentStockTrays || 0;

      if (currentStock < item.pieces) {
        throw new Error(
          `Cannot delete batch. ${item.class} eggs from this batch have already been sold. (Need ${item.pieces} pieces, only ${currentStock} available).`,
        );
      }
    }

    // 2. Safely deduct the pieces back out of the inventory
    for (const item of inventoryReversalMap) {
      if (item.pieces <= 0) continue;

      await db
        .update(eggInventory)
        .set({
          currentStockTrays: sql`${eggInventory.currentStockTrays} - ${item.pieces}`,
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

    // Calculate the Delta in pieces (New Pieces - Old Pieces)
    const deltas = [
      { class: "PEEWEE", deltaPieces: Math.round((data.qtyPeewee - old.qtyPeewee) * 30) },
      { class: "XS", deltaPieces: Math.round((data.qtyXs - old.qtyXs) * 30) },
      { class: "SMALL", deltaPieces: Math.round((data.qtySmall - old.qtySmall) * 30) },
      { class: "MEDIUM", deltaPieces: Math.round((data.qtyMedium - old.qtyMedium) * 30) },
      { class: "LARGE", deltaPieces: Math.round((data.qtyLarge - old.qtyLarge) * 30) },
      { class: "XL", deltaPieces: Math.round((data.qtyXl - old.qtyXl) * 30) },
      { class: "XXL", deltaPieces: Math.round((data.qtyXxl - old.qtyXxl) * 30) },
      { class: "CRACKED", deltaPieces: Math.round((data.qtyCracked - old.qtyCracked) * 30) },
      { class: "BROKEN", deltaPieces: Math.round((data.qtyBroken - old.qtyBroken) * 30) },
      { class: "DIRTY", deltaPieces: Math.round((data.qtyDirty - old.qtyDirty) * 30) },
      { class: "BROWN_PEEWEE", deltaPieces: Math.round((data.brownQtyPeewee - old.brownQtyPeewee) * 30) },
      { class: "BROWN_XS", deltaPieces: Math.round((data.brownQtyXs - old.brownQtyXs) * 30) },
      { class: "BROWN_SMALL", deltaPieces: Math.round((data.brownQtySmall - old.brownQtySmall) * 30) },
      { class: "BROWN_MEDIUM", deltaPieces: Math.round((data.brownQtyMedium - old.brownQtyMedium) * 30) },
      { class: "BROWN_LARGE", deltaPieces: Math.round((data.brownQtyLarge - old.brownQtyLarge) * 30) },
      { class: "BROWN_XL", deltaPieces: Math.round((data.brownQtyXl - old.brownQtyXl) * 30) },
      { class: "BROWN_XXL", deltaPieces: Math.round((data.brownQtyXxl - old.brownQtyXxl) * 30) },
      { class: "BROWN_ASSORTED", deltaPieces: Math.round((data.brownQtyAssorted - old.brownQtyAssorted) * 30) },
      { class: "BROWN_CRACKED", deltaPieces: Math.round((data.brownQtyCracked - old.brownQtyCracked) * 30) },
      { class: "BROWN_BROKEN", deltaPieces: Math.round((data.brownQtyBroken - old.brownQtyBroken) * 30) },
      { class: "BROWN_DIRTY", deltaPieces: Math.round((data.brownQtyDirty - old.brownQtyDirty) * 30) },
    ];

    // 1. Guard Check: Ensure negative deltas (removing eggs) don't drop stock below zero
    for (const item of deltas) {
      if (item.deltaPieces >= 0) continue; // Adding eggs is safe

      const absoluteRemovalAmount = Math.abs(item.deltaPieces);
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
      if (item.deltaPieces === 0) continue; // No change

      await db
        .update(eggInventory)
        .set({
          currentStockTrays: sql`${eggInventory.currentStockTrays} + ${item.deltaPieces}`,
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
        totalTraysPickedUp: data.totalTraysPickedUp,
        extraType: data.extraType || "NONE",
        extraPiecesPickedUp: data.extraPiecesPickedUp,
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
      // 1. Add the sold trays + free replacement trays back into the inventory
      const totalPiecesToRestore =
        (sale.quantityTrays + (sale.palitBasag || 0)) * 30 + sale.quantityPieces;

      await tx
        .update(eggInventory)
        .set({
          currentStockTrays: sql`${eggInventory.currentStockTrays} + ${totalPiecesToRestore}`,
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
  quantityPieces: z.number().default(0),
  palitBasag: z.number().min(0).default(0),
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

  if (data.quantityTrays <= 0 && data.quantityPieces <= 0 && data.palitBasag <= 0) {
    return { success: false, error: "Quantity or Palit Basag must be greater than zero." };
  }
  if (data.pricePerTray <= 0 && (data.quantityTrays > 0 || data.quantityPieces > 0)) {
    return { success: false, error: "Price per tray must be greater than zero." };
  }

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
    const rawTotalAmount = (data.quantityTrays * data.pricePerTray) + (data.quantityPieces * (data.pricePerTray / 30));
    const totalAmount = Math.round(rawTotalAmount * 100) / 100;
    const balance = totalAmount - data.amountPaid;
    let paymentStatus = "unpaid";
    
    if (balance <= 0.01 && totalAmount > 0) {
        paymentStatus = "paid";
    } else if (data.amountPaid > 0 && balance > 0.01) {
        paymentStatus = "partial";
    }

    await db.transaction(async (tx) => {
      // Delta = new quantity - old quantity (in pieces, including palitBasag trays)
      const oldTotalPieces = (old.quantityTrays + (old.palitBasag || 0)) * 30 + old.quantityPieces;
      const newTotalPieces = (data.quantityTrays + (data.palitBasag || 0)) * 30 + data.quantityPieces;
      const deltaPieces = newTotalPieces - oldTotalPieces;

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
            `Insufficient stock for update. Need ${deltaPieces} additional pieces of ${old.classification}, but only ${currentStock} available.`,
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
          quantityPieces: data.quantityPieces,
          palitBasag: data.palitBasag,
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
  quantityTrays: z.number().min(0),
  quantityPieces: z.number().min(0).default(0),
  palitBasag: z.number().min(0).default(0),
  pricePerTray: z.number().min(0),
});

const saleSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  customerId: z.string().min(1, "Customer is required").toUpperCase(),
  preparedBy: z.string().optional(),
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

    let encoderName = data.preparedBy || "System";
    if (!data.preparedBy) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
          const payload = decodeJwt(token);
          if (payload?.id) {
            const [u] = await db
              .select({ name: users.name })
              .from(users)
              .where(eq(users.id, payload.id as number));
            if (u?.name) encoderName = u.name;
          }
        }
      } catch (err) {
        console.error("Failed to resolve user for egg sale:", err);
      }
    }

    await db.transaction(async (tx) => {
      // 1. Guard: Check Live Inventory for ALL items first
      for (const item of data.items) {
        const totalTraysAndBasag = item.quantityTrays + (item.palitBasag || 0);
        if (totalTraysAndBasag <= 0 && item.quantityPieces <= 0) {
          throw new Error(
            `Invalid quantity for ${item.classification}. Please enter at least 1 tray, palit basag, or piece.`,
          );
        }
        if (item.pricePerTray <= 0 && (item.quantityTrays > 0 || item.quantityPieces > 0)) {
          throw new Error(
            `Invalid price for ${item.classification}. Price per tray must be greater than zero.`,
          );
        }

        const stock = await tx
          .select({
            currentStockTrays: eggInventory.currentStockTrays,
            id: eggInventory.id,
          })
          .from(eggInventory)
          .where(eq(eggInventory.classification, item.classification))
          .limit(1);

        const availablePieces = stock[0]?.currentStockTrays || 0;
        const totalPiecesSold = (totalTraysAndBasag * PIECES_PER_TRAY) + item.quantityPieces;

        if (stock.length === 0 || availablePieces < totalPiecesSold) {
          throw new Error(
            `Insufficient stock for ${item.classification}. Need ${totalPiecesSold} pieces, but only have ${availablePieces} left.`,
          );
        }
      }

      // 2. Distribute the payment across the items to keep the flat ledger accurate
      let remainingPayment = data.amountPaid;

      for (const item of data.items) {
        const totalTraysAndBasag = item.quantityTrays + (item.palitBasag || 0);
        const totalPiecesSold = (totalTraysAndBasag * PIECES_PER_TRAY) + item.quantityPieces;
        const rawItemTotal = (item.quantityTrays * item.pricePerTray) + (item.quantityPieces * (item.pricePerTray / 30));
        const itemTotalAmount = Math.round(rawItemTotal * 100) / 100;

        // Calculate how much of the payment applies to this specific row
        const appliedPayment = Math.min(remainingPayment, itemTotalAmount);
        remainingPayment -= appliedPayment;

        const balance = itemTotalAmount - appliedPayment;
        let status = "unpaid";
        if (balance <= 0.01) status = "paid";
        else if (appliedPayment > 0 && balance > 0.01) status = "partial";

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
          quantityPieces: item.quantityPieces,
          palitBasag: item.palitBasag || 0,
          pricePerTray: item.pricePerTray,
          totalAmount: itemTotalAmount,
          amountPaid: appliedPayment,
          paymentStatus: status,
          datePaid: data.datePaid || null,
          preparedBy: encoderName,
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

    // Auto-fix any floating point precision status mismatches in database
    const updatedHistory = history.map((record) => {
      const balance = record.totalAmount - record.amountPaid;
      if (balance <= 0.01 && record.paymentStatus !== "paid") {
        db.update(eggSales)
          .set({ paymentStatus: "paid" })
          .where(eq(eggSales.id, record.id))
          .catch(console.error);
        return { ...record, paymentStatus: "paid" };
      }
      return record;
    });

    return { success: true, data: updatedHistory };
  } catch (error) {
    console.error("Failed to fetch sales history:", error);
    return { success: false, data: [] };
  }
}

// ✨ POST GROUP PAYMENT FOR ENTIRE INVOICE / LIST OF SALE ITEMS
export async function postInvoicePayment({
  invoiceId,
  itemIds,
  additionalAmountPaid,
  datePaid,
}: {
  invoiceId?: string | null;
  itemIds?: number[];
  additionalAmountPaid: number;
  datePaid: string;
}) {
  if (additionalAmountPaid <= 0 || !datePaid) {
    return { success: false, error: "Invalid payment parameters." };
  }

  try {
    let items: typeof eggSales.$inferSelect[] = [];

    if (invoiceId) {
      items = await db
        .select()
        .from(eggSales)
        .where(eq(eggSales.invoiceId, invoiceId))
        .orderBy(eggSales.id);
    } else if (itemIds && itemIds.length > 0) {
      items = await db
        .select()
        .from(eggSales)
        .where(inArray(eggSales.id, itemIds))
        .orderBy(eggSales.id);
    }

    if (!items || items.length === 0) {
      return { success: false, error: "No sales records found." };
    }

    let remainingAddPayment = Math.round(additionalAmountPaid * 100) / 100;

    await db.transaction(async (tx) => {
      for (const item of items) {
        if (remainingAddPayment <= 0) break;

        const itemTotal = Number(item.totalAmount);
        const currentPaid = Number(item.amountPaid);
        const itemUnpaidBalance = Math.max(0, itemTotal - currentPaid);

        if (itemUnpaidBalance > 0.01) {
          const addForThisItem = Math.min(remainingAddPayment, itemUnpaidBalance);
          const newPaid = Math.round((currentPaid + addForThisItem) * 100) / 100;
          remainingAddPayment = Math.round((remainingAddPayment - addForThisItem) * 100) / 100;

          const newBalance = itemTotal - newPaid;
          let status = "unpaid";
          if (newBalance <= 0.01) status = "paid";
          else if (newPaid > 0) status = "partial";

          await tx
            .update(eggSales)
            .set({
              amountPaid: newPaid,
              datePaid: datePaid,
              paymentStatus: status,
            })
            .where(eq(eggSales.id, item.id));
        }
      }
    });

    revalidatePath("/egg-sales/sales/history");
    return { success: true };
  } catch (error: unknown) {
    console.error("Post Invoice Payment Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record payment.",
    };
  }
}
