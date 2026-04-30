// import { db } from "@/db";
// import { users } from "@/db/schema";
// import { desc } from "drizzle-orm";
// import { DataTable } from "./data-table";
// import { columns } from "./columns";
// import { Button } from "@/components/ui/button";
// import { UserPlus, Users } from "lucide-react";
// import Link from "next/link";

// export const dynamic = "force-dynamic";

// export default async function AdminUsersPage() {
//   // Fetch all users from the database, newest first
//   const data = await db.select().from(users).orderBy(desc(users.createdAt));

//   return (
//     <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-200">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
//         <div className="space-y-1 relative">
//           <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
//           <div className="flex items-center gap-4 mb-2">
//             <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
//               <Users className="w-8 h-8" strokeWidth={2.5} />
//             </div>
//             <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
//               <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm">
//                 Staff Management
//               </span>
//             </h1>
//           </div>
//           <p className="text-slate-500 dark:text-slate-400 font-medium text-lg ml-1">
//             Manage system access for all Fhernie Logistics and Otso Dragon
//             personnel.
//           </p>
//         </div>

//         <Link href="/admin/users/new">
//           <Button className="relative h-12 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold">
//             <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
//             <UserPlus className="w-5 h-5 mr-2 transition-transform group-hover/btn:scale-110" />
//             Add New Staff
//           </Button>
//         </Link>
//       </div>

//       {/* Data Table Section */}
//       <div className="relative">
//         {/* Subtle background glow for the table area */}
//         <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl -z-10" />
//         <DataTable columns={columns} data={data} />
//       </div>
//     </div>
//   );
// }

// app/admin/users/page.tsx
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm"; // We need 'eq' to filter!
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // 1. Find out who is looking at the page
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let adminDept = "all";

  if (token) {
    try {
      const payload = decodeJwt(token);
      adminDept = payload.department as string;
    } catch (e) {
      console.error("Token error");
    }
  }

  // 2. Fetch users based on Admin clearance level!
  let data;
  if (adminDept === "all") {
    // Super Admin: Sees absolutely everyone
    data = await db.select().from(users).orderBy(desc(users.createdAt));
  } else {
    // Department Admin: Sees ONLY people in their department
    data = await db
      .select()
      .from(users)
      .where(eq(users.department, adminDept)) // The magic filter!
      .orderBy(desc(users.createdAt));
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
              <Users className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm">
                Staff Management
              </span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-md ml-1">
            {adminDept === "all"
              ? "Manage system access for all Fhernie Logistics and Otso Dragon personnel."
              : `Manage system access for ${adminDept === "trucking" ? "Fhernie Logistics" : "Otso Dragon"} personnel.`}
          </p>
        </div>

        <Link href="/admin/users/new">
          <Button className="relative h-12 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold">
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <UserPlus className="w-5 h-5 mr-2 transition-transform group-hover/btn:scale-110" />
            Add New Staff
          </Button>
        </Link>
      </div>

      {/* Data Table Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl -z-10" />
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
