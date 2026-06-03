import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { EggDashboardClient } from "./egg-dashboard-client";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    const userId = payload.id as number;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export default async function EggDashboardPage() {
  const currentUser = await getCurrentUser();
  const userName = currentUser?.name || "User";
  const avatarUrl = currentUser?.avatarUrl || null;

  return <EggDashboardClient userName={userName} avatarUrl={avatarUrl} />;
}
