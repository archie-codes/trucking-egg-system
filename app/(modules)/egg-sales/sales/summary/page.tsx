import { getEggSalesHistory } from "@/app/actions/egg-actions";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { SummaryDashboard } from "./summary-dashboard";

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

export default async function SalesSummaryPage() {
  const res = await getEggSalesHistory();
  const sales = res.success && res.data ? res.data : [];

  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-3 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-teal-600 to-emerald-500">
              Sales & Income Summary
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Filter sales by timeframe (Today, 2 Weeks, Month, Year, Date) and track customer pending credits
          </p>
        </div>
      </div>

      {/* DASHBOARD CLIENT COMPONENT */}
      <div className="flex-1 flex flex-col min-h-0">
        <SummaryDashboard data={sales} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
