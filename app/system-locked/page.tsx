// app/system-locked/page.tsx
import { ShieldAlert } from "lucide-react";
import { getSystemLockStatus } from "@/app/actions/admin-actions";
import { redirect } from "next/navigation";
import { CheckStatusButton } from "./check-status-button";

export const dynamic = "force-dynamic";

export default async function SystemLockedPage() {
  // ✨ THE REVERSE GUARD: Check the status before rendering the locked screen
  const status = await getSystemLockStatus();

  // If the system is actually unlocked, kick them back into the app!
  if (!status.isLocked) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-rose-900/50 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
          System Suspended
        </h1>

        <p className="text-slate-400 font-medium mb-8">
          {status.reason ||
            "The database ledger contract for FhernieOtso Corp has expired or requires a compliance review. Access to the management module is temporarily restricted."}
        </p>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Please Contact Developer
          </p>
          <p className="text-sm text-slate-300 font-mono">
            bauzonarchie@gmail.com
          </p>
        </div>

        <CheckStatusButton />
      </div>
    </div>
  );
}
