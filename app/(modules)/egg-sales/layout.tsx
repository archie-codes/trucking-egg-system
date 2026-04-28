// app/(modules)/egg-sales/layout.tsx
import { EggSidebar } from "@/components/egg-sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
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
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-slate-900">
        <EggSidebar />
      </aside>

      <main className="md:pl-64 flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-40 sticky top-0 shadow-sm">
          <div className="font-semibold text-slate-800">
            Egg Sales Inventory
          </div>

          <div className="flex items-center gap-3">
            {/* The Admin Portal Button (Amber Theme) */}
            {isAdmin && (
              <Link href="/admin/users">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 bg-amber-50/50"
                >
                  <ShieldAlert className="w-4 h-4 mr-2 text-amber-600" />
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
