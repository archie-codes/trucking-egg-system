// app/admin/layout.tsx
import { ShieldAlert, Truck, Egg } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="h-16 border-b bg-slate-900 text-white flex items-center justify-between px-6 z-40 sticky top-0 shadow-md">
        {/* Left Side: Admin Branding */}
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          Master Admin Portal
        </div>

        {/* Right Side: Quick Portals & Logout */}
        <div className="flex items-center gap-2">
          <Link href="/trucking/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-blue-400 hover:bg-slate-800 transition-colors"
            >
              <Truck className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Trucking Portal</span>
            </Button>
          </Link>

          <Link href="/egg-sales/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <Egg className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Egg Sales Portal</span>
            </Button>
          </Link>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>

          {/* Your brand new client-side logout button! */}
          <LogoutButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

// Quick helper component since we removed the standard Shadcn button import at the top
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
