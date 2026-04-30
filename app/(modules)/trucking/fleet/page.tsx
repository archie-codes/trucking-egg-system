// // app/trucking/fleet/page.tsx
// import { db } from "@/db";
// import { trucks } from "@/db/schema";
// import { desc } from "drizzle-orm";
// import { Truck, Hash, CheckCircle2, Wrench, XCircle } from "lucide-react";
// import { AddTruckButton } from "./add-truck-button";
// import { Badge } from "@/components/ui/badge";

// export const dynamic = "force-dynamic";

// export default async function FleetManagementPage() {
//   const fleetData = await db
//     .select()
//     .from(trucks)
//     .orderBy(desc(trucks.createdAt));

//   return (
//     // OPTIMIZATION: Reduced the outer Y-padding from py-8 to py-6
//     <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-200">
//       {/* Header Section */}
//       {/* OPTIMIZATION: Changed mb-10 to mb-6, and sm:items-end to sm:items-center */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="space-y-1 relative">
//           <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
//           <div className="flex items-center gap-4 mb-1">
//             <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
//               <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm">
//                 Fleet Management
//               </span>
//             </h1>
//           </div>
//           <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
//             Manage active trucks, plate numbers, and maintenance statuses.
//           </p>
//         </div>

//         <AddTruckButton />
//       </div>

//       {/* Data Table - Excel Style */}
//       <div className="relative overflow-hidden bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
//             <thead>
//               <tr className="bg-slate-100 dark:bg-slate-800/80 border-b-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
//                 <th className="py-2 px-3 font-semibold border-r border-slate-300 dark:border-slate-700 w-12 text-center">
//                   #
//                 </th>
//                 <th className="py-2 px-3 font-semibold border-r border-slate-300 dark:border-slate-700">
//                   Fleet Code
//                 </th>
//                 <th className="py-2 px-3 font-semibold border-r border-slate-300 dark:border-slate-700">
//                   Plate Number
//                 </th>
//                 <th className="py-2 px-3 font-semibold border-r border-slate-300 dark:border-slate-700">
//                   Status
//                 </th>
//                 <th className="py-2 px-3 font-semibold">
//                   System State
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {fleetData.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="py-8 text-center text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800"
//                   >
//                     No trucks registered yet.
//                   </td>
//                 </tr>
//               ) : (
//                 fleetData.map((truck, index) => (
//                   <tr
//                     key={truck.id}
//                     className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 even:bg-slate-50 dark:even:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 transition-colors"
//                   >
//                     <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center text-slate-500">
//                       {index + 1}
//                     </td>
//                     <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-800 font-mono font-medium text-slate-800 dark:text-slate-200">
//                       {truck.fleetCode}
//                     </td>
//                     <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200">
//                       {truck.plateNumber}
//                     </td>
//                     <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-800">
//                       <div className="flex items-center">
//                         <div className={`w-2 h-2 rounded-full mr-2 ${
//                           truck.status === 'active' ? 'bg-emerald-500' :
//                           truck.status === 'maintenance' ? 'bg-amber-500' :
//                           'bg-slate-400'
//                         }`} />
//                         <span className="capitalize text-slate-700 dark:text-slate-300">
//                           {truck.status}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">
//                       {truck.isActive ? "Operational" : "Disabled"}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/trucking/fleet/page.tsx
import { db } from "@/db";
import { trucks } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Truck,
  CheckCircle2,
  Wrench,
  XCircle,
  FolderOpen,
  MoreVertical,
} from "lucide-react";
import { AddTruckButton } from "./add-truck-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function FleetManagementPage() {
  const fleetData = await db
    .select()
    .from(trucks)
    .orderBy(desc(trucks.createdAt));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <div className="flex items-center gap-4 mb-1">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
              <Truck className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm">
                Fleet Folders
              </span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">
            Digital asset folders for active trucks and maintenance tracking.
          </p>
        </div>

        <AddTruckButton />
      </div>

      {/* CSS GRID: Replaces the Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* EMPTY STATE */}
        {fleetData.length === 0 && (
          <div className="col-span-full py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/30 rounded-[24px] sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 sm:mb-4">
              <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-bold text-lg sm:text-xl text-slate-700 dark:text-slate-300">
              No folders created yet.
            </p>
            <p className="text-xs sm:text-sm font-medium mt-1">
              Click 'Register Truck' to create your first asset folder.
            </p>
          </div>
        )}

        {/* TRUCK FOLDERS (CARDS) */}
        {fleetData.map((truck) => (
          <div
            key={truck.id}
            className="group relative flex flex-col bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-xl hover:border-blue-500/20 dark:hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Dynamic Top Color Bar based on Status */}
            <div
              className={`absolute top-0 inset-x-0 h-1.5 transition-colors ${
                truck.status === "active"
                  ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : truck.status === "maintenance"
                    ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-slate-400"
              }`}
            />

            {/* Card Header: Icon & Status */}
            <div className="flex justify-between items-start mb-4 sm:mb-6 mt-1 sm:mt-2">
              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                <FolderOpen
                  className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110"
                  strokeWidth={2}
                />
              </div>

              <div>
                {truck.status === "active" && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />{" "}
                    Active
                  </Badge>
                )}
                {truck.status === "maintenance" && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                    <Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />{" "}
                    Garage
                  </Badge>
                )}
                {truck.status === "inactive" && (
                  <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                    <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />{" "}
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            {/* Card Body: The Truck Identity */}
            <div className="mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-x-2 gap-y-1 tracking-tight">
                <span className="truncate max-w-full">{truck.fleetCode}</span>
                <span className="text-slate-800 dark:text-slate-700 font-normal shrink-0">
                  -
                </span>
                <span className="font-mono text-lg sm:text-xl text-slate-800 dark:text-slate-300 truncate max-w-full">
                  {truck.plateNumber}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Logistics Asset
              </p>
            </div>

            {/* Card Footer: System State & Actions */}
            <div className="mt-auto pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
              {truck.isActive ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                    Operational
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-red-500"></span>
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-red-600 dark:text-red-400 uppercase">
                    Disabled
                  </span>
                </div>
              )}

              {/* Action Menu Placeholder (Three Dots) */}
              <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
