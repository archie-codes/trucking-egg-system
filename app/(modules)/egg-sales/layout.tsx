// app/(modules)/egg-sales/layout.tsx
import { EggSidebar } from "@/components/egg-sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert, Egg } from "lucide-react";
import { logoutUser } from "@/app/actions/auth-actions";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { LogoutButton } from "@/components/logout-button";

export default async function EggSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check who is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let isAdmin = false;

  if (token) {
    try {
      const payload = decodeJwt(token);
      if (payload.role === "admin") {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Could not decode token");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-slate-900 border-r border-slate-800">
        <EggSidebar />
      </aside>

      <main className="md:pl-64 flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-900 backdrop-blur-xl text-white flex items-center justify-between px-6 z-40 sticky top-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-inner flex items-center justify-center">
              <Egg className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 hidden sm:inline-block">
              Egg Sales Inventory
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* The Admin Portal Button */}
            {isAdmin && (
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors rounded-lg px-2 py-2"
                >
                  <ShieldAlert className="w-4 h-4 sm:mr-2" />
                  Admin Portal
                </Button>
              </Link>
            )}

            {/* THE ESCAPE BUTTON */}
            <LogoutButton />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
