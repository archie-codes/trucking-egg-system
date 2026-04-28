// app/actions/user-actions.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // ADDED
import { decodeJwt } from "jose"; // ADDED

export async function getAdminClearance() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return "trucking"; // Fallback

  const payload = decodeJwt(token);
  return payload.department as string;
}
export async function createStaffAccount(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string;
    const avatarUrl = formData.get("avatarUrl") as string | null;

    // SECURITY CHECK: Prevent Privilege Escalation
    const creatorDept = await getAdminClearance();

    // If you are not a Super Admin ("all"), you can ONLY create users for your own department.
    if (creatorDept !== "all" && creatorDept !== department) {
      return {
        success: false,
        error:
          "Security Alert: You do not have permission to grant access to other departments or Global Access.",
      };
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      department,
      avatarUrl,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create staff account." };
  }
}

// 1. UPDATED UPDATE ACTION (Prevents locking yourself out)
export async function updateStaffAccount(userId: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string;
    const avatarUrl = formData.get("avatarUrl") as string | null;

    const currentAdminId = await getAdminId();

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    // Check email collisions
    if (currentUser.email !== email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (existingUser)
        return { success: false, error: "This email is already taken." };
    }

    const updateData: any = { name, email, avatarUrl };

    // SELF-SABOTAGE LOCK: Only update role/department if you are editing someone ELSE
    if (currentAdminId !== userId) {
      updateData.role = role;
      updateData.department = department;
    }

    // Update password if typed
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update account." };
  }
}

// 2. UPDATED DELETE ACTION (Soft Delete + Self-Sabotage Lock)
export async function deleteStaffAccount(userId: number) {
  try {
    const currentAdminId = await getAdminId();

    // SELF-SABOTAGE LOCK: You cannot delete yourself
    if (currentAdminId === userId) {
      return {
        success: false,
        error: "Action Blocked: You cannot disable your own active session.",
      };
    }

    // SOFT DELETE: We just flip the toggle to false!
    await db.update(users).set({ isActive: false }).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to disable account." };
  }
}

export async function getAdminId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const payload = decodeJwt(token);
  return payload.id as number;
}

// Add this to the bottom of app/actions/user-actions.ts
export async function restoreStaffAccount(userId: number) {
  try {
    // Flip the toggle back to true!
    await db.update(users).set({ isActive: true }).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to restore account." };
  }
}
