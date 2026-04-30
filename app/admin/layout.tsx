// app/admin/layout.tsx
import { ShieldAlert, Truck, Egg, User } from "lucide-react";
import { UserProfileMenu } from "@/components/user-profile-menu";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const adminDept = currentUser?.department || "all";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 backdrop-blur-xl text-white flex items-center justify-between px-6 z-40 sticky top-0 shadow-lg">
        {/* Left Side: Admin Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-inner flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-100 hidden sm:inline-block">
            {adminDept === "all"
              ? "Master Admin Portal"
              : "Department Admin Portal"}
          </span>
        </div>

        {/* Right Side: Quick Portals & Logout */}
        <div className="flex items-center gap-4">
          {/* ONLY show Trucking button if they are 'all' or 'trucking' */}
          {(adminDept === "all" || adminDept === "trucking") && (
            <Link href="/trucking/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-blue-600 hover:text-white transition-colors rounded-lg px-2 py-2"
              >
                <Truck className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Trucking Portal</span>
              </Button>
            </Link>
          )}

          {/* ONLY show Egg button if they are 'all' or 'eggs' */}
          {(adminDept === "all" || adminDept === "eggs") && (
            <Link href="/egg-sales/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-amber-600 hover:text-white transition-colors rounded-lg px-2 py-2"
              >
                <Egg className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Egg Sales Portal</span>
              </Button>
            </Link>
          )}

          <div className="w-px h-6 bg-slate-800 hidden sm:block mx-1"></div>

          {/* User Profile & Interactive Logout Avatar */}

          <UserProfileMenu currentUser={currentUser} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

// Quick helper component
function Button({ className, variant, size, children, ...props }: any) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
