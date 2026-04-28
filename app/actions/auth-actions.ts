// app/actions/auth-actions.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

// Encode the secret key we just put in your .env.local
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET);

// app/actions/auth-actions.ts
export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const requestedModule = formData.get("requestedModule") as string; // 1. Grab the door they are using

    // 2. Find the user in the database
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    if (!user.isActive) {
      return {
        success: false,
        error:
          "Access Denied: This account has been disabled by an Administrator.",
      };
    }

    // 3. Verify the password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password." };
    }

    // 4. THE DOOR CHECK: Are they at the wrong portal?
    // (If they are 'all', they are the Master Admin and can use any door)
    if (
      user.department !== "all" &&
      requestedModule &&
      user.department !== requestedModule
    ) {
      // Create a smart error message based on where they actually belong
      const correctPortalName =
        user.department === "eggs"
          ? "Otso Dragon (Egg Sales)"
          : "Fhernie Logistics (Trucking)";
      return {
        success: false,
        error: `Access Denied: This account belongs to ${correctPortalName}. Please go back to the home page and select the correct portal.`,
      };
    }

    // ... The rest of the token generation stays exactly the same below this line ...
    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      department: user.department,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h") // Forces them to log in once a day for security
      .sign(SECRET_KEY);

    // 4. Put the token in a highly secure, HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true, // Prevents hackers from stealing it via JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // 5. Tell the frontend where to route them based on their department
    return { success: true, department: user.department };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

import { redirect } from "next/navigation";

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  // Route them to the main portal selector instead of a specific login page
  redirect("/");
}
