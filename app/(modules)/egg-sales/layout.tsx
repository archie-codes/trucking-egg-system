// app/(modules)/egg-sales/layout.tsx
import { EggSidebar } from "@/components/egg-sales/egg-sidebar";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Egg, User } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { UserProfileMenu } from "@/components/global/user-profile-menu";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Fetch the logged-in user's fresh data from the database
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
    console.error("Failed to fetch user");
    return null;
  }
}

export default async function EggSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden md:flex w-(--sidebar-width,16rem) flex-col fixed inset-y-0 z-50 bg-slate-900 border-r border-slate-800 transition-[width] duration-300 ease-in-out">
        <EggSidebar />
      </aside>

      <main className="md:pl-(--sidebar-width,16rem) flex-1 flex flex-col transition-[padding] duration-300 ease-in-out">
        <header className="h-16 border-b border-slate-800 bg-slate-900 backdrop-blur-xl text-white flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-slate-800"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 p-0 bg-slate-900 border-r border-slate-800 text-slate-300"
                >
                  <SheetTitle className="sr-only">Egg Sales Menu</SheetTitle>
                  <EggSidebar isMobile />
                </SheetContent>
              </Sheet>
            </div>

            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 hidden sm:inline-block">
              Egg Sales Inventory
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* The Admin Portal Button */}
            {isAdmin && (
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors rounded-lg px-2 py-2"
                >
                  <ShieldAlert className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </Button>
              </Link>
            )}

            <div className="w-px h-6 bg-slate-700 hidden sm:block mx-1"></div>

            <UserProfileMenu currentUser={currentUser} />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
