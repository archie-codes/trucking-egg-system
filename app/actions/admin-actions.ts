"use server";

import { db } from "@/db";
import { systemSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const DEVELOPER_EMAIL = "bauzonarchie@gmail.com";
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-fallback-secret",
);

async function verifyDeveloper() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) throw new Error("Unauthorized access to developer core.");

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as number;

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user || user.email !== DEVELOPER_EMAIL) {
      throw new Error("Unauthorized: Email mismatch.");
    }
  } catch {
    throw new Error("Unauthorized: Invalid or tampered token.");
  }
}

// Ensure settings exist and return them
async function getOrCreateSettings() {
  const settings = await db.select().from(systemSettings).limit(1);
  if (settings.length === 0) {
    const newRow = await db
      .insert(systemSettings)
      .values({
        isLocked: false,
        masterPin: "123456",
      })
      .returning();
    return newRow[0];
  }
  return settings[0];
}

export async function getSystemLockStatus() {
  try {
    const config = await getOrCreateSettings();
    return { isLocked: config.isLocked, reason: config.lockReason };
  } catch {
    return { isLocked: false };
  }
}

export async function toggleSystemLock(
  lockState: boolean,
  inputPin: string,
  reason?: string,
) {
  try {
    await verifyDeveloper();
    const config = await getOrCreateSettings();

    if (config.masterPin !== inputPin) {
      throw new Error("Invalid Developer Master PIN. Access denied.");
    }

    await db
      .update(systemSettings)
      .set({
        isLocked: lockState,
        lockReason:
          reason ||
          "CThe database ledger contract for FhernieOtso Corp has expired or requires a compliance review. Access to the management module is temporarily restricted.",
        lastUpdated: new Date(),
      })
      .where(eq(systemSettings.id, config.id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function updateMasterPin(currentPin: string, newPin: string) {
  try {
    await verifyDeveloper();
    const config = await getOrCreateSettings();

    if (config.masterPin !== currentPin) {
      throw new Error("Incorrect current PIN.");
    }

    if (newPin.length < 4) {
      throw new Error("New PIN must be at least 4 digits.");
    }

    await db
      .update(systemSettings)
      .set({
        masterPin: newPin,
        lastUpdated: new Date(),
      })
      .where(eq(systemSettings.id, config.id));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
