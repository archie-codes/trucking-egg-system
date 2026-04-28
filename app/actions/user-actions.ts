// app/actions/user-actions.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// export async function createStaffAccount(formData: FormData) {
//   try {
//     const name = formData.get("name") as string;
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;
//     const role = formData.get("role") as string;
//     const department = formData.get("department") as string;

//     // 1. Check if the email already exists to prevent crashes
//     const [existingUser] = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, email));
//     if (existingUser) {
//       return {
//         success: false,
//         error: "An account with this email already exists.",
//       };
//     }

//     // 2. Hash the temporary password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // 3. Insert the new staff member into Neon
//     await db.insert(users).values({
//       name,
//       email,
//       passwordHash: hashedPassword,
//       role,
//       department,
//     });

//     // 4. Refresh the admin page so the new user appears instantly
//     revalidatePath("/admin/users");

//     return { success: true };
//   } catch (error) {
//     console.error("Failed to create user:", error);
//     return { success: false, error: "Failed to create staff account." };
//   }
// }

// Add this to the bottom of app/actions/user-actions.ts
// app/actions/user-actions.ts
export async function createStaffAccount(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string;

    // NEW: Grab the avatar URL from the hidden input
    const avatarUrl = formData.get("avatarUrl") as string | null;

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
      avatarUrl, // NEW: Save it to Neon
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create staff account." };
  }
}

export async function deleteStaffAccount(userId: number) {
  try {
    // 1. Delete the user from Neon
    await db.delete(users).where(eq(users.id, userId));

    // 2. Refresh the admin page instantly
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete account." };
  }
}

// Add to the bottom of app/actions/user-actions.ts
export async function updateStaffAccount(userId: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string;
    const avatarUrl = formData.get("avatarUrl") as string | null;

    // 1. Check if they are trying to change their email to one that already exists
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (currentUser.email !== email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (existingUser) {
        return {
          success: false,
          error: "This email is already taken by another account.",
        };
      }
    }

    // 2. Prepare the data to update
    const updateData: any = {
      name,
      email,
      role,
      department,
      avatarUrl,
    };

    // 3. ONLY update the password if the Admin actually typed a new one
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // 4. Save to Neon
    await db.update(users).set(updateData).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Failed to update account." };
  }
}
