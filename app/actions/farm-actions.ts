// actions/farm-actions.ts
"use server";

import { db } from "@/db";
import {
  farmFlocks,
  farmDailyRecords,
  farmFeedConsumptions,
  farmOperatingExpenses,
} from "@/db/schema";
import { eq, desc, sum, sql, count, and, gte, lte } from "drizzle-orm";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRoleAndDept } from "@/app/actions/user-actions";

// --- Zod Validation Schemas for Server Actions ---

const createFlockSchema = z.object({
  batchName: z
    .string()
    .min(2, "Batch name must be at least 2 characters")
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => !v.includes("BUILDING"), {
      message:
        "Do not include the word 'BUILDING' here. Use the Building Name field instead.",
    }),
  farmName: z
    .string()
    .min(2, "Farm name must be at least 2 characters")
    .transform((v) => {
      let trimmed = v.trim().toUpperCase();
      if (!trimmed.includes("FARM")) {
        trimmed = `${trimmed} FARM`;
      }
      return trimmed;
    }),
  buildingName: z
    .string()
    .min(1, "Building name is required")
    .transform((v) => v.trim().toUpperCase()),
  dateLoaded: z.string().min(1, "Date loaded is required"),
  initialHeadCount: z
    .number()
    .int("No decimals allowed")
    .min(1, "Initial headcount must be at least 1"),
});

const createDailyRecordSchema = z.object({
  flockId: z.number().int().min(1, "Valid flock selection is required"),
  recordDate: z.string().min(1, "Record date is required"),
  mortalityCount: z
    .number()
    .int("No decimals allowed")
    .min(0, "Mortality count cannot be negative"),
  quantityTrays: z
    .number()
    .int("No decimals allowed")
    .min(0, "Quantity trays cannot be negative"),
  quantityPieces: z
    .number()
    .int("No decimals allowed")
    .min(0, "Quantity pieces cannot be negative"),
  remarks: z.string().optional(),
});

const createFeedConsumptionSchema = z.object({
  flockId: z.number().int().min(1, "Valid flock selection is required"),
  dateGiven: z.string().min(1, "Date given is required"),
  feedType: z.string().min(2, "Feed type is required"),
  quantityBags: z.number().min(0.1, "Quantity bags must be greater than 0"),
  totalCost: z.number().min(0, "Total cost cannot be negative"),
});

const createOperatingExpenseSchema = z.object({
  flockId: z.number().int().min(1, "Valid flock selection is required"),
  dateIncurred: z.string().min(1, "Date incurred is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
  remarks: z.string().optional(),
});

// ======================================================================
// 1. FLOCKS ACTIONS
// ======================================================================

// GET ALL FLOCKS
export async function getFarmFlocks() {
  try {
    const allFlocks = await db
      .select()
      .from(farmFlocks)
      .orderBy(desc(farmFlocks.createdAt));

    return { success: true as const, data: allFlocks };
  } catch (error) {
    console.error("Error fetching farm flocks:", error);
    return { success: false as const, error: "Failed to fetch farm flocks" };
  }
}

// GET FLOCK BY ID
export async function getFarmFlockById(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid flock ID provided" };
    }

    const flockArr = await db
      .select()
      .from(farmFlocks)
      .where(eq(farmFlocks.id, id))
      .limit(1);

    if (!flockArr[0]) {
      return { success: false as const, error: "Flock batch not found" };
    }

    return { success: true as const, data: flockArr[0] };
  } catch (error) {
    console.error("Error fetching farm flock by ID:", error);
    return { success: false as const, error: "Failed to fetch flock details" };
  }
}

// CREATE A NEW FLOCK (With Hard Block on exact match & Soft Warning on cross-farm/building match)
export async function createFarmFlock(
  rawData: {
    batchName: string;
    farmName: string;
    buildingName: string;
    dateLoaded: string;
    initialHeadCount: number;
  },
  forceSave?: boolean
) {
  try {
    const parsed = createFlockSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    if (!forceSave) {
      // Condition A (Hard Block): Exact match on batchName, farmName, AND buildingName
      const exactMatch = await db
        .select({ id: farmFlocks.id })
        .from(farmFlocks)
        .where(
          sql`LOWER(${farmFlocks.batchName}) = LOWER(${data.batchName}) AND LOWER(${farmFlocks.farmName}) = LOWER(${data.farmName}) AND LOWER(${farmFlocks.buildingName}) = LOWER(${data.buildingName})`
        )
        .limit(1);

      if (exactMatch.length > 0) {
        return {
          success: false as const,
          error: "This exact batch name already exists in this specific Farm and Building.",
        };
      }

      // Condition B (Soft Warning): Same batchName exists in a different Farm or Building
      const crossMatch = await db
        .select({ id: farmFlocks.id })
        .from(farmFlocks)
        .where(sql`LOWER(${farmFlocks.batchName}) = LOWER(${data.batchName})`)
        .limit(1);

      if (crossMatch.length > 0) {
        return {
          success: false as const,
          requiresConfirmation: true as const,
          message:
            "Warning: This Batch Name is already being used in another Farm/Building. Are you sure you want to use the same name here? (Make sure this won't cause confusion later).",
        };
      }
    }

    const userSession = await getAdminRoleAndDept();
    const recordedBy =
      userSession?.name && userSession.name !== "System"
        ? userSession.name
        : "Unknown User";

    // Condition C (Proceed): Database insert
    await db.insert(farmFlocks).values({
      batchName: data.batchName,
      farmName: data.farmName,
      buildingName: data.buildingName,
      dateLoaded: data.dateLoaded,
      initialHeadCount: data.initialHeadCount,
      currentHeadCount: data.initialHeadCount,
      isActive: true,
      recordedBy,
    });

    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");

    return { success: true as const };
  } catch (error) {
    console.error("Error creating farm flock:", error);
    return { success: false as const, error: "Failed to create flock record" };
  }
}

// UPDATE AN EXISTING FLOCK (With Hard Block on exact match & Soft Warning on cross-farm/building match)
export async function updateFarmFlock(
  id: number,
  rawData: {
    batchName: string;
    farmName: string;
    buildingName: string;
    dateLoaded: string;
    initialHeadCount: number;
  },
  forceSave?: boolean
) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid flock ID provided" };
    }

    const parsed = createFlockSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    if (!forceSave) {
      // Condition A (Hard Block): Exact match on batchName, farmName, AND buildingName (excluding current flock)
      const exactMatch = await db
        .select({ id: farmFlocks.id })
        .from(farmFlocks)
        .where(
          sql`LOWER(${farmFlocks.batchName}) = LOWER(${data.batchName}) AND LOWER(${farmFlocks.farmName}) = LOWER(${data.farmName}) AND LOWER(${farmFlocks.buildingName}) = LOWER(${data.buildingName}) AND ${farmFlocks.id} != ${id}`
        )
        .limit(1);

      if (exactMatch.length > 0) {
        return {
          success: false as const,
          error: "This exact batch name already exists in this specific Farm and Building.",
        };
      }

      // Condition B (Soft Warning): Same batchName exists in another Farm/Building (excluding current flock)
      const crossMatch = await db
        .select({ id: farmFlocks.id })
        .from(farmFlocks)
        .where(
          sql`LOWER(${farmFlocks.batchName}) = LOWER(${data.batchName}) AND ${farmFlocks.id} != ${id}`
        )
        .limit(1);

      if (crossMatch.length > 0) {
        return {
          success: false as const,
          requiresConfirmation: true as const,
          message:
            "Warning: This Batch Name is already being used in another Farm/Building. Are you sure you want to use the same name here? (Make sure this won't cause confusion later).",
        };
      }
    }

    // Condition C (Proceed): Database update
    // Recalculate currentHeadCount based on initialHeadCount and total mortality
    const mortalityAgg = await db
      .select({ totalMortality: sum(farmDailyRecords.mortalityCount) })
      .from(farmDailyRecords)
      .where(eq(farmDailyRecords.flockId, id));

    const totalMortality = Number(mortalityAgg[0]?.totalMortality || 0);
    const newCurrentHeadCount = Math.max(
      0,
      data.initialHeadCount - totalMortality
    );

    await db
      .update(farmFlocks)
      .set({
        batchName: data.batchName,
        farmName: data.farmName,
        buildingName: data.buildingName,
        dateLoaded: data.dateLoaded,
        initialHeadCount: data.initialHeadCount,
        currentHeadCount: newCurrentHeadCount,
      })
      .where(eq(farmFlocks.id, id));

    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");
    revalidatePath(`/egg-sales/farm-operations/flocks/${id}/edit`);

    return { success: true as const };
  } catch (error) {
    console.error("Error updating farm flock:", error);
    return { success: false as const, error: "Failed to update flock record" };
  }
}

// TOGGLE FLOCK STATUS (Active <-> Completed/Depleted)
export async function toggleFlockStatus(id: number, newStatus: boolean) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid flock ID provided" };
    }

    await db
      .update(farmFlocks)
      .set({ isActive: newStatus })
      .where(eq(farmFlocks.id, id));

    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");

    return { success: true as const };
  } catch (error) {
    console.error("Error toggling farm flock status:", error);
    return { success: false as const, error: "Failed to update flock status" };
  }
}

// MARK FLOCK AS INACTIVE (Backward Compatibility)
export async function deactivateFarmFlock(id: number) {
  return toggleFlockStatus(id, false);
}

// DELETE FARM FLOCK (Standard vs Admin Cascade Delete)
export async function deleteFarmFlock(id: number, isAdmin: boolean = false) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid flock ID provided" };
    }

    // Check if flock exists
    const flockExists = await db
      .select({ id: farmFlocks.id })
      .from(farmFlocks)
      .where(eq(farmFlocks.id, id))
      .limit(1);

    if (!flockExists.length) {
      return { success: false as const, error: "Flock batch not found" };
    }

    // Check child records count
    const dailyCountArr = await db
      .select({ count: count() })
      .from(farmDailyRecords)
      .where(eq(farmDailyRecords.flockId, id));

    const feedCountArr = await db
      .select({ count: count() })
      .from(farmFeedConsumptions)
      .where(eq(farmFeedConsumptions.flockId, id));

    const opExCountArr = await db
      .select({ count: count() })
      .from(farmOperatingExpenses)
      .where(eq(farmOperatingExpenses.flockId, id));

    const totalChildRecords =
      Number(dailyCountArr[0]?.count || 0) +
      Number(feedCountArr[0]?.count || 0) +
      Number(opExCountArr[0]?.count || 0);

    if (!isAdmin && totalChildRecords > 0) {
      return {
        success: false as const,
        error:
          "Cannot delete batch: It has existing farm records. Please contact an Admin.",
      };
    }

    if (isAdmin) {
      // Safe cascade delete using Drizzle database transaction
      await db.transaction(async (tx) => {
        await tx
          .delete(farmDailyRecords)
          .where(eq(farmDailyRecords.flockId, id));
        await tx
          .delete(farmFeedConsumptions)
          .where(eq(farmFeedConsumptions.flockId, id));
        await tx
          .delete(farmOperatingExpenses)
          .where(eq(farmOperatingExpenses.flockId, id));
        await tx.delete(farmFlocks).where(eq(farmFlocks.id, id));
      });
    } else {
      // Standard delete when no child records exist
      await db.delete(farmFlocks).where(eq(farmFlocks.id, id));
    }

    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting farm flock:", error);
    return {
      success: false as const,
      error: "An error occurred while deleting the flock batch.",
    };
  }
}

// ======================================================================
// 2. DAILY RECORDS ACTIONS (WITH MATHEMATICAL HEADCOUNT SYNC)
// ======================================================================

// GET ALL DAILY RECORDS
export async function getFarmDailyRecords() {
  try {
    const records = await db
      .select({
        id: farmDailyRecords.id,
        recordDate: farmDailyRecords.recordDate,
        mortalityCount: farmDailyRecords.mortalityCount,
        quantityTrays: farmDailyRecords.quantityTrays,
        quantityPieces: farmDailyRecords.quantityPieces,
        remarks: farmDailyRecords.remarks,
        recordedBy: farmDailyRecords.recordedBy,
        flockId: farmDailyRecords.flockId,
        flock: {
          id: farmFlocks.id,
          batchName: farmFlocks.batchName,
          farmName: farmFlocks.farmName,
          buildingName: farmFlocks.buildingName,
        },
      })
      .from(farmDailyRecords)
      .leftJoin(farmFlocks, eq(farmDailyRecords.flockId, farmFlocks.id))
      .orderBy(desc(farmDailyRecords.recordDate));

    return { success: true as const, data: records };
  } catch (error) {
    console.error("Error fetching daily records:", error);
    return { success: false as const, error: "Failed to fetch daily records" };
  }
}

// GET DAILY RECORD BY ID
export async function getFarmDailyRecordById(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid daily record ID" };
    }

    const record = await db
      .select()
      .from(farmDailyRecords)
      .where(eq(farmDailyRecords.id, id))
      .limit(1);

    if (!record[0]) {
      return { success: false as const, error: "Daily record not found" };
    }

    return { success: true as const, data: record[0] };
  } catch (error) {
    console.error("Error fetching daily record by ID:", error);
    return { success: false as const, error: "Failed to fetch daily record" };
  }
}

// CREATE A DAILY RECORD (And deduct mortality from flock currentHeadCount)
export async function createFarmDailyRecord(rawData: {
  flockId: number;
  recordDate: string;
  mortalityCount: number;
  quantityTrays: number;
  quantityPieces: number;
  remarks?: string;
}) {
  try {
    const parsed = createDailyRecordSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    const userSession = await getAdminRoleAndDept();
    const recordedBy =
      userSession?.name && userSession.name !== "System"
        ? userSession.name
        : "Unknown User";

    await db.transaction(async (tx) => {
      await tx.insert(farmDailyRecords).values({
        flockId: data.flockId,
        recordDate: data.recordDate,
        mortalityCount: data.mortalityCount,
        quantityTrays: data.quantityTrays,
        quantityPieces: data.quantityPieces,
        remarks: data.remarks || "",
        recordedBy,
      });

      if (data.mortalityCount > 0) {
        await tx
          .update(farmFlocks)
          .set({
            currentHeadCount: sql`${farmFlocks.currentHeadCount} - ${data.mortalityCount}`,
          })
          .where(eq(farmFlocks.id, data.flockId));
      }
    });

    revalidatePath("/egg-sales/farm-operations/daily-records");
    revalidatePath("/(modules)/egg-sales/farm-operations/daily-records");
    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");

    return { success: true as const };
  } catch (error) {
    console.error("Error creating daily record:", error);
    return { success: false as const, error: "Failed to create daily record" };
  }
}

// UPDATE DAILY RECORD (WITH MATHEMATICAL FLOCK HEADCOUNT ADJUSTMENT)
export async function updateFarmDailyRecord(
  id: number,
  rawData: {
    flockId: number;
    recordDate: string;
    mortalityCount: number;
    quantityTrays: number;
    quantityPieces: number;
    remarks?: string;
  }
) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid record ID" };
    }

    const parsed = createDailyRecordSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    await db.transaction(async (tx) => {
      // 1. Fetch old record to calculate mortality difference
      const oldRecordArr = await tx
        .select()
        .from(farmDailyRecords)
        .where(eq(farmDailyRecords.id, id))
        .limit(1);

      if (!oldRecordArr[0]) {
        throw new Error("Daily record not found");
      }

      const oldRecord = oldRecordArr[0];
      const oldMortality = oldRecord.mortalityCount;
      const oldFlockId = oldRecord.flockId;
      const newMortality = data.mortalityCount;
      const newFlockId = data.flockId;

      // 2. Update the daily record
      await tx
        .update(farmDailyRecords)
        .set({
          flockId: newFlockId,
          recordDate: data.recordDate,
          mortalityCount: newMortality,
          quantityTrays: data.quantityTrays,
          quantityPieces: data.quantityPieces,
          remarks: data.remarks || "",
        })
        .where(eq(farmDailyRecords.id, id));

      // 3. Adjust currentHeadCount on farmFlocks based on mortality change
      if (oldFlockId === newFlockId) {
        const diff = newMortality - oldMortality;
        if (diff !== 0) {
          await tx
            .update(farmFlocks)
            .set({
              currentHeadCount: sql`${farmFlocks.currentHeadCount} - ${diff}`,
            })
            .where(eq(farmFlocks.id, newFlockId));
        }
      } else {
        // Flock changed: revert old mortality on old flock, apply new mortality on new flock
        if (oldMortality > 0) {
          await tx
            .update(farmFlocks)
            .set({
              currentHeadCount: sql`${farmFlocks.currentHeadCount} + ${oldMortality}`,
            })
            .where(eq(farmFlocks.id, oldFlockId));
        }
        if (newMortality > 0) {
          await tx
            .update(farmFlocks)
            .set({
              currentHeadCount: sql`${farmFlocks.currentHeadCount} - ${newMortality}`,
            })
            .where(eq(farmFlocks.id, newFlockId));
        }
      }
    });

    revalidatePath("/egg-sales/farm-operations/daily-records");
    revalidatePath("/(modules)/egg-sales/farm-operations/daily-records");
    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");

    return { success: true as const };
  } catch (error) {
    console.error("Error updating daily record:", error);
    return { success: false as const, error: "Failed to update daily record" };
  }
}

// DELETE DAILY RECORD (WITH MATHEMATICAL FLOCK HEADCOUNT REVERSION)
export async function deleteFarmDailyRecord(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid record ID" };
    }

    await db.transaction(async (tx) => {
      // 1. Fetch record to get mortalityCount and flockId
      const recordArr = await tx
        .select()
        .from(farmDailyRecords)
        .where(eq(farmDailyRecords.id, id))
        .limit(1);

      if (!recordArr[0]) {
        throw new Error("Daily record not found");
      }

      const record = recordArr[0];

      // 2. Delete the record
      await tx
        .delete(farmDailyRecords)
        .where(eq(farmDailyRecords.id, id));

      // 3. Add mortalityCount back to currentHeadCount of the flock
      if (record.mortalityCount > 0) {
        await tx
          .update(farmFlocks)
          .set({
            currentHeadCount: sql`${farmFlocks.currentHeadCount} + ${record.mortalityCount}`,
          })
          .where(eq(farmFlocks.id, record.flockId));
      }
    });

    revalidatePath("/egg-sales/farm-operations/daily-records");
    revalidatePath("/(modules)/egg-sales/farm-operations/daily-records");
    revalidatePath("/egg-sales/farm-operations/flocks");
    revalidatePath("/(modules)/egg-sales/farm-operations/flocks");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting daily record:", error);
    return { success: false as const, error: "Failed to delete daily record" };
  }
}

// ======================================================================
// 3. FEED CONSUMPTIONS ACTIONS
// ======================================================================

// GET ALL FEED CONSUMPTION RECORDS
export async function getFarmFeedConsumptions() {
  try {
    const records = await db
      .select({
        id: farmFeedConsumptions.id,
        dateGiven: farmFeedConsumptions.dateGiven,
        feedType: farmFeedConsumptions.feedType,
        quantityBags: farmFeedConsumptions.quantityBags,
        totalCost: farmFeedConsumptions.totalCost,
        recordedBy: farmFeedConsumptions.recordedBy,
        flockId: farmFeedConsumptions.flockId,
        flock: {
          id: farmFlocks.id,
          batchName: farmFlocks.batchName,
          farmName: farmFlocks.farmName,
          buildingName: farmFlocks.buildingName,
        },
      })
      .from(farmFeedConsumptions)
      .leftJoin(farmFlocks, eq(farmFeedConsumptions.flockId, farmFlocks.id))
      .orderBy(desc(farmFeedConsumptions.dateGiven));

    return { success: true as const, data: records };
  } catch (error) {
    console.error("Error fetching feed records:", error);
    return { success: false as const, error: "Failed to fetch feed consumption records" };
  }
}

// GET FEED CONSUMPTION BY ID
export async function getFarmFeedConsumptionById(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid feed record ID" };
    }
    const record = await db
      .select()
      .from(farmFeedConsumptions)
      .where(eq(farmFeedConsumptions.id, id))
      .limit(1);

    if (!record[0]) {
      return { success: false as const, error: "Feed record not found" };
    }
    return { success: true as const, data: record[0] };
  } catch (error) {
    console.error("Error fetching feed record by ID:", error);
    return { success: false as const, error: "Failed to fetch feed record" };
  }
}

// CREATE A FEED CONSUMPTION RECORD
export async function createFarmFeedConsumption(rawData: {
  flockId: number;
  dateGiven: string;
  feedType: string;
  quantityBags: number;
  totalCost: number;
}) {
  try {
    const parsed = createFeedConsumptionSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    const userSession = await getAdminRoleAndDept();
    const recordedBy =
      userSession?.name && userSession.name !== "System"
        ? userSession.name
        : "Unknown User";

    await db.insert(farmFeedConsumptions).values({
      flockId: data.flockId,
      dateGiven: data.dateGiven,
      feedType: data.feedType,
      quantityBags: data.quantityBags,
      totalCost: data.totalCost,
      recordedBy,
    });

    revalidatePath("/egg-sales/farm-operations/feed-management");
    revalidatePath("/(modules)/egg-sales/farm-operations/feed-management");

    return { success: true as const };
  } catch (error) {
    console.error("Error creating feed record:", error);
    return { success: false as const, error: "Failed to log feed consumption" };
  }
}

// UPDATE FEED CONSUMPTION RECORD
export async function updateFarmFeedConsumption(
  id: number,
  rawData: {
    flockId: number;
    dateGiven: string;
    feedType: string;
    quantityBags: number;
    totalCost: number;
  }
) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid feed record ID" };
    }
    const parsed = createFeedConsumptionSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }
    const data = parsed.data;

    await db
      .update(farmFeedConsumptions)
      .set({
        flockId: data.flockId,
        dateGiven: data.dateGiven,
        feedType: data.feedType,
        quantityBags: data.quantityBags,
        totalCost: data.totalCost,
      })
      .where(eq(farmFeedConsumptions.id, id));

    revalidatePath("/egg-sales/farm-operations/feed-management");
    revalidatePath("/(modules)/egg-sales/farm-operations/feed-management");

    return { success: true as const };
  } catch (error) {
    console.error("Error updating feed record:", error);
    return { success: false as const, error: "Failed to update feed record" };
  }
}

// DELETE FEED CONSUMPTION RECORD
export async function deleteFarmFeedConsumption(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid feed record ID" };
    }

    await db
      .delete(farmFeedConsumptions)
      .where(eq(farmFeedConsumptions.id, id));

    revalidatePath("/egg-sales/farm-operations/feed-management");
    revalidatePath("/(modules)/egg-sales/farm-operations/feed-management");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting feed record:", error);
    return { success: false as const, error: "Failed to delete feed record" };
  }
}

// ======================================================================
// 4. OPERATING EXPENSES ACTIONS
// ======================================================================

// GET ALL OPERATING EXPENSES
export async function getFarmOperatingExpenses() {
  try {
    const records = await db
      .select({
        id: farmOperatingExpenses.id,
        dateIncurred: farmOperatingExpenses.dateIncurred,
        category: farmOperatingExpenses.category,
        amount: farmOperatingExpenses.amount,
        remarks: farmOperatingExpenses.remarks,
        recordedBy: farmOperatingExpenses.recordedBy,
        flockId: farmOperatingExpenses.flockId,
        flock: {
          id: farmFlocks.id,
          batchName: farmFlocks.batchName,
          farmName: farmFlocks.farmName,
          buildingName: farmFlocks.buildingName,
        },
      })
      .from(farmOperatingExpenses)
      .leftJoin(farmFlocks, eq(farmOperatingExpenses.flockId, farmFlocks.id))
      .orderBy(desc(farmOperatingExpenses.dateIncurred));

    return { success: true as const, data: records };
  } catch (error) {
    console.error("Error fetching operating expenses:", error);
    return { success: false as const, error: "Failed to fetch operating expenses" };
  }
}

// GET OPERATING EXPENSE BY ID
export async function getFarmOperatingExpenseById(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid expense record ID" };
    }
    const record = await db
      .select()
      .from(farmOperatingExpenses)
      .where(eq(farmOperatingExpenses.id, id))
      .limit(1);

    if (!record[0]) {
      return { success: false as const, error: "Expense record not found" };
    }
    return { success: true as const, data: record[0] };
  } catch (error) {
    console.error("Error fetching operating expense by ID:", error);
    return { success: false as const, error: "Failed to fetch operating expense" };
  }
}

// CREATE AN OPERATING EXPENSE
export async function createFarmOperatingExpense(rawData: {
  flockId: number;
  dateIncurred: string;
  category: string;
  amount: number;
  remarks?: string;
}) {
  try {
    const parsed = createOperatingExpenseSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    const userSession = await getAdminRoleAndDept();
    const recordedBy =
      userSession?.name && userSession.name !== "System"
        ? userSession.name
        : "Unknown User";

    await db.insert(farmOperatingExpenses).values({
      flockId: data.flockId,
      dateIncurred: data.dateIncurred,
      category: data.category,
      amount: data.amount,
      remarks: data.remarks || "",
      recordedBy,
    });

    revalidatePath("/egg-sales/farm-operations/operating-expenses");
    revalidatePath("/(modules)/egg-sales/farm-operations/operating-expenses");

    return { success: true as const };
  } catch (error) {
    console.error("Error creating operating expense:", error);
    return { success: false as const, error: "Failed to log operating expense" };
  }
}

// UPDATE OPERATING EXPENSE
export async function updateFarmOperatingExpense(
  id: number,
  rawData: {
    flockId: number;
    dateIncurred: string;
    category: string;
    amount: number;
    remarks?: string;
  }
) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid expense record ID" };
    }
    const parsed = createOperatingExpenseSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false as const, error: `Validation failed: ${errorMsg}` };
    }
    const data = parsed.data;

    await db
      .update(farmOperatingExpenses)
      .set({
        flockId: data.flockId,
        dateIncurred: data.dateIncurred,
        category: data.category,
        amount: data.amount,
        remarks: data.remarks || "",
      })
      .where(eq(farmOperatingExpenses.id, id));

    revalidatePath("/egg-sales/farm-operations/operating-expenses");
    revalidatePath("/(modules)/egg-sales/farm-operations/operating-expenses");

    return { success: true as const };
  } catch (error) {
    console.error("Error updating operating expense:", error);
    return { success: false as const, error: "Failed to update operating expense" };
  }
}

// DELETE OPERATING EXPENSE
export async function deleteFarmOperatingExpense(id: number) {
  try {
    if (!id || typeof id !== "number" || id <= 0) {
      return { success: false as const, error: "Invalid expense record ID" };
    }

    await db
      .delete(farmOperatingExpenses)
      .where(eq(farmOperatingExpenses.id, id));

    revalidatePath("/egg-sales/farm-operations/operating-expenses");
    revalidatePath("/(modules)/egg-sales/farm-operations/operating-expenses");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting operating expense:", error);
    return { success: false as const, error: "Failed to delete operating expense" };
  }
}

// ======================================================================
// 5. MASTER FLOCK REPORT
// ======================================================================

export async function getFarmFlockReport(flockId: number) {
  try {
    if (!flockId || typeof flockId !== "number" || flockId <= 0) {
      return { success: false as const, error: "Invalid flock ID provided" };
    }

    const flockArr = await db
      .select()
      .from(farmFlocks)
      .where(eq(farmFlocks.id, flockId))
      .limit(1);

    const flock = flockArr[0];
    if (!flock) return { success: false as const, error: "Flock not found" };

    const dailyAgg = await db
      .select({
        totalTrays: sum(farmDailyRecords.quantityTrays),
        totalPieces: sum(farmDailyRecords.quantityPieces),
      })
      .from(farmDailyRecords)
      .where(eq(farmDailyRecords.flockId, flockId));

    const feedAgg = await db
      .select({
        totalFeedCost: sum(farmFeedConsumptions.totalCost),
      })
      .from(farmFeedConsumptions)
      .where(eq(farmFeedConsumptions.flockId, flockId));

    const opExAgg = await db
      .select({
        totalOpEx: sum(farmOperatingExpenses.amount),
      })
      .from(farmOperatingExpenses)
      .where(eq(farmOperatingExpenses.flockId, flockId));

    const totalTrays = Number(dailyAgg[0]?.totalTrays || 0);
    const totalPieces = Number(dailyAgg[0]?.totalPieces || 0);
    const totalEggsInPieces = totalTrays * 30 + totalPieces;

    const totalFeedCost = Number(feedAgg[0]?.totalFeedCost || 0);
    const totalOpEx = Number(opExAgg[0]?.totalOpEx || 0);
    const grandTotalExpenses = totalFeedCost + totalOpEx;

    const totalMortality = Math.max(0, flock.initialHeadCount - flock.currentHeadCount);
    const survivalRate =
      flock.initialHeadCount > 0
        ? ((flock.currentHeadCount / flock.initialHeadCount) * 100).toFixed(2)
        : "0.00";

    const costPerEgg =
      totalEggsInPieces > 0
        ? (grandTotalExpenses / totalEggsInPieces).toFixed(2)
        : "0.00";

    return {
      success: true as const,
      data: {
        flock,
        production: {
          totalTrays,
          totalPieces,
          totalEggsInPieces,
        },
        expenses: {
          totalFeedCost,
          totalOpEx,
          grandTotalExpenses,
          costPerEgg,
        },
        health: {
          totalMortality,
          survivalRate,
        },
      },
    };
  } catch (error) {
    console.error("Error generating flock report:", error);
    return { success: false as const, error: "Failed to generate report" };
  }
}

// ======================================================================
// 6. FARM DASHBOARD STATS
// ======================================================================

export async function getFarmDashboardStats() {
  try {
    // 1. Total Active Batches & Current Bird Population
    const activeFlocksResult = await db
      .select({
        activeCount: count(),
        totalBirds: sum(farmFlocks.currentHeadCount),
      })
      .from(farmFlocks)
      .where(eq(farmFlocks.isActive, true));

    const totalActiveBatches = activeFlocksResult[0]?.activeCount || 0;
    const currentBirdPopulation = Number(activeFlocksResult[0]?.totalBirds || 0);

    // 2. Today's Production (Sum of quantityTrays and quantityPieces for recordDate = today)
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const todayProductionResult = await db
      .select({
        trays: sum(farmDailyRecords.quantityTrays),
        pieces: sum(farmDailyRecords.quantityPieces),
      })
      .from(farmDailyRecords)
      .where(eq(farmDailyRecords.recordDate, todayStr));

    const todayTrays = Number(todayProductionResult[0]?.trays || 0);
    const todayPieces = Number(todayProductionResult[0]?.pieces || 0);

    // 3. This Month's Expenses (Sum of totalCost in feed + amount in operating expenses for date in current month)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startOfMonthStr = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endOfMonthStr = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    const feedExpenseResult = await db
      .select({ total: sum(farmFeedConsumptions.totalCost) })
      .from(farmFeedConsumptions)
      .where(
        and(
          gte(farmFeedConsumptions.dateGiven, startOfMonthStr),
          lte(farmFeedConsumptions.dateGiven, endOfMonthStr)
        )
      );

    const operatingExpenseResult = await db
      .select({ total: sum(farmOperatingExpenses.amount) })
      .from(farmOperatingExpenses)
      .where(
        and(
          gte(farmOperatingExpenses.dateIncurred, startOfMonthStr),
          lte(farmOperatingExpenses.dateIncurred, endOfMonthStr)
        )
      );

    const totalFeedCost = Number(feedExpenseResult[0]?.total || 0);
    const totalOperatingCost = Number(operatingExpenseResult[0]?.total || 0);
    const thisMonthExpenses = totalFeedCost + totalOperatingCost;

    return {
      success: true as const,
      data: {
        totalActiveBatches,
        currentBirdPopulation,
        todayTrays,
        todayPieces,
        thisMonthExpenses,
      },
    };
  } catch (error) {
    console.error("Error fetching farm dashboard stats:", error);
    return {
      success: false as const,
      error: "Failed to fetch farm dashboard stats",
    };
  }
}

