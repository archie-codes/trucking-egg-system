import { getEggBatchHistory } from "@/app/actions/egg-actions";
import { HistoryTable } from "./data-table";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

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

export default async function ReceivedHistoryPage() {
  const res = await getEggBatchHistory();
  const batches = res.success ? res.data : [];

  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-112px)] w-full min-w-0 overflow-hidden gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              Received Egg History
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            Historical ledger of all farm inbound deliveries
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0">
        <HistoryTable data={batches} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
