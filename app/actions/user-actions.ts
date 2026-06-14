// app/actions/user-actions.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export async function getAdminClearance() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return "trucking"; // Fallback

  const payload = decodeJwt(token);
  return payload.department as string;
}

export async function getAdminRoleAndDept() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return { id: null, role: "encoder", department: "trucking" };

  const payload = decodeJwt(token);
  return {
    id: payload.id as number,
    role: payload.role as string,
    department: payload.department as string,
  };
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { name, email, avatarUrl, role, department };

    // If the admin demoted themselves to encoder, log them out to enforce the new role
    let demotedSelf = false;
    if (currentAdminId === userId && currentUser.role === "admin" && role === "encoder") {
      const cookieStore = await cookies();
      cookieStore.delete("auth_token");
      demotedSelf = true;
    }

    // Update password if typed
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: true, demotedSelf };
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return { success: false, error: "Failed to restore account." };
  }
}

export async function updateUserPassword(
  userId: number,
  currentPw: string,
  newPw: string,
) {
  try {
    // 1. Fetch the user from the database
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // 2. Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPw, user.passwordHash); // Assuming your DB column is named 'password'
    if (!isPasswordValid) {
      return { success: false, error: "Incorrect current password." };
    }

    // 3. Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPw, 10);

    // 4. Update the database
    await db
      .update(users)
      .set({ passwordHash: hashedNewPassword })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update password:", error);
    return {
      success: false,
      error: "An error occurred while updating the password.",
    };
  }
}

export async function updateUserAvatar(userId: number, avatarUrl: string) {
  try {
    // 1. Update the user's avatar URL in the database
    await db
      .update(users)
      .set({ avatarUrl: avatarUrl })
      .where(eq(users.id, userId));

    // 2. Revalidate the layout so the new avatar instantly shows up in the Navbar!
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to update avatar:", error);
    return { success: false, error: "Failed to update database." };
  }
}

export async function pingUserPresence() {
  try {
    const userId = await getAdminId();
    if (!userId) return { success: false };

    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update presence:", error);
    return { success: false };
  }
}
