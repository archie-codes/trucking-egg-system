// app/(modules)/egg-sales/layout.tsx
import { EggSidebar } from "@/components/egg-sales/egg-sidebar";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { UserProfileMenu } from "@/components/global/user-profile-menu";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egg Sales",
};

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
    console.error("Failed to fetch user", error);
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
    // ✨ FIX 1: Changed to 'h-screen overflow-hidden' to lock the entire window
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside className="hidden md:flex w-(--sidebar-width,16rem) flex-col fixed inset-y-0 z-50 bg-slate-900 border-r border-slate-800 transition-[width] duration-300 ease-in-out">
        <EggSidebar />
      </aside>

      {/* ✨ FIX 2: Ensure main stretches full height */}
      <main className="md:pl-(--sidebar-width,16rem) flex-1 flex flex-col h-screen min-w-0 transition-[padding] duration-300 ease-in-out">
        {/* ✨ FIX 3: Removed 'sticky top-0' and added 'shrink-0' so it locks in place without letting the page scroll behind it */}
        <header className="h-16 shrink-0 border-b border-slate-800 bg-slate-900 backdrop-blur-xl text-white flex items-center justify-between px-4 sm:px-6 z-40 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-slate-800 focus:outline-none"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 p-0 bg-slate-900 border-r border-slate-800 text-slate-300"
                  showCloseButton={false}
                >
                  <SheetTitle className="sr-only">Egg Sales Menu</SheetTitle>
                  <EggSidebar isMobile />
                </SheetContent>
              </Sheet>
            </div>

            <span className="font-bold text-[18px] tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 hidden sm:inline-block">
              Egg Sales Inventory
            </span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4">
            {/* The Admin Portal Button */}
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 h-9 md:h-10 hover:bg-emerald-600 hover:text-white transition-colors rounded-lg px-2 md:px-3 py-1 md:py-2"
                  asChild
                >
                  <Link href="/admin/users">
                    <ShieldAlert className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Admin Portal</span>
                  </Link>
                </Button>
                <div className="w-px h-4 md:h-6 bg-slate-700 mx-0.5 md:mx-1"></div>
              </>
            )}

            <UserProfileMenu currentUser={currentUser} />
          </div>
        </header>

        {/* ✨ FIX 4: Added 'overflow-y-auto custom-scrollbar' so ONLY the content area scrolls */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
