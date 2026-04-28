// app/admin/layout.tsx
import { ShieldAlert, Truck, Egg } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Read the JWT to find out what kind of Admin this is
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let adminDept = "all"; // Default to super admin just in case, middleware protects the route anyway

  if (token) {
    try {
      const payload = decodeJwt(token);
      adminDept = payload.department as string;
    } catch (error) {
      console.error("Could not decode token in Admin Layout");
    }
  }

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
        <div className="flex items-center gap-3">
          {/* ONLY show Trucking button if they are 'all' or 'trucking' */}
          {(adminDept === "all" || adminDept === "trucking") && (
            <Link href="/trucking/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-blue-600 hover:text-white transition-colors rounded-lg px-2 py-2"
              >
                <Truck className="w-4 h-4 mr-2" />
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

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-slate-800 mx-2 hidden sm:block"></div>

          <LogoutButton />
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
