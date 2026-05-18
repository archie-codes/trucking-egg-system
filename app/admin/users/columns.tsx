// // app/admin/users/columns.tsx
// "use client";

// import { useState } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import {
//   MoreHorizontal,
//   Trash,
//   ShieldAlert,
//   User,
//   Edit,
//   Copy,
//   UserCheck,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import {
//   deleteStaffAccount,
//   restoreStaffAccount,
// } from "@/app/actions/user-actions";
// import Image from "next/image";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// // Import the new Edit Sheet
// import { EditUserSheet } from "@/components/admin/edit-user-sheet";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// export type StaffRecord = {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   department: string;
//   avatarUrl: string | null;
//   isActive: boolean;
//   createdAt: Date;
// };

// export const columns: ColumnDef<StaffRecord>[] = [
//   {
//     accessorKey: "name",
//     header: "Staff Member",
//     cell: ({ row }) => {
//       const user = row.original;

//       return (
//         <div className="flex items-center gap-3">
//           <div
//             className={`relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm shrink-0 flex items-center justify-center ${!user.isActive ? "opacity-50 grayscale" : ""}`}
//           >
//             {user.avatarUrl ? (
//               <Image
//                 src={user.avatarUrl}
//                 alt={user.name}
//                 fill
//                 className="object-cover"
//                 unoptimized
//               />
//             ) : (
//               <User className="w-5 h-5 text-slate-400" />
//             )}
//           </div>
//           <div>
//             <div
//               className={`font-semibold ${!user.isActive ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"}`}
//             >
//               {user.name}
//             </div>
//             {/* The beautiful red Disabled badge! */}
//             {!user.isActive && (
//               <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm mt-0.5 inline-block">
//                 Disabled
//               </span>
//             )}
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "email",
//     header: "Email Address",
//     cell: ({ row }) => (
//       <div className="text-slate-500 dark:text-slate-400 font-medium">
//         {row.getValue("email")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "department",
//     header: "Access Level",
//     cell: ({ row }) => {
//       const dept = row.getValue("department") as string;
//       if (dept === "all")
//         return (
//           <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm">
//             Global Access
//           </Badge>
//         );
//       if (dept === "trucking")
//         return (
//           <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 shadow-sm">
//             Fhernie Logistics
//           </Badge>
//         );
//       if (dept === "eggs")
//         return (
//           <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 shadow-sm">
//             Otso Dragon
//           </Badge>
//         );
//       return <Badge variant="outline">{dept}</Badge>;
//     },
//   },
//   {
//     accessorKey: "role",
//     header: "Role",
//     cell: ({ row }) => {
//       const role = row.getValue("role") as string;
//       return role === "admin" ? (
//         <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md w-fit border border-indigo-100 dark:border-indigo-500/20">
//           <ShieldAlert className="w-3.5 h-3.5" /> Admin
//         </div>
//       ) : (
//         <span className="text-slate-500 font-medium px-2.5 py-1">Encoder</span>
//       );
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const user = row.original;

//       // Inline component to hold the state for the Edit Sheet
//       const ActionMenu = () => {
//         const [isEditOpen, setIsEditOpen] = useState(false);
//         const [isAlertOpen, setIsAlertOpen] = useState(false);
//         const [alertAction, setAlertAction] = useState<
//           "disable" | "restore" | null
//         >(null);

//         const handleConfirmAction = async () => {
//           if (alertAction === "disable") {
//             const result = await deleteStaffAccount(user.id);
//             if (result.success) {
//               toast.success("Account Disabled", {
//                 description: `${user.name} has been locked out of the system.`,
//                 className:
//                   "border-red-500/30 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-md shadow-xl",
//               });
//             } else {
//               toast.error("Error", { description: result.error });
//             }
//           } else if (alertAction === "restore") {
//             const result = await restoreStaffAccount(user.id);
//             if (result.success) {
//               toast.success("Account Restored", {
//                 description: `${user.name} can now log in again.`,
//                 className:
//                   "border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/50 backdrop-blur-md shadow-xl",
//               });
//             } else {
//               toast.error("Error", { description: result.error });
//             }
//           }
//           setIsAlertOpen(false);
//           setAlertAction(null);
//         };

//         return (
//           <>
//             {/* Custom Alert Dialog for Confirmations */}
//             <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
//               <AlertDialogContent className="rounded-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-2xl p-6">
//                 <AlertDialogHeader>
//                   <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
//                     {alertAction === "disable"
//                       ? "Disable Account Access"
//                       : "Restore Account Access"}
//                   </AlertDialogTitle>
//                   <AlertDialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
//                     {alertAction === "disable" ? (
//                       <>
//                         Are you sure you want to disable access for{" "}
//                         <span className="font-semibold text-slate-700 dark:text-slate-300">
//                           {user.name}
//                         </span>
//                         ? They will be immediately logged out and unable to
//                         access the system until restored.
//                       </>
//                     ) : (
//                       <>
//                         Are you sure you want to restore access for{" "}
//                         <span className="font-semibold text-slate-700 dark:text-slate-300">
//                           {user.name}
//                         </span>
//                         ? They will be able to log in and use the system
//                         normally.
//                       </>
//                     )}
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter className="mt-6 gap-2">
//                   <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 px-6 m-0">
//                     Cancel
//                   </AlertDialogCancel>
//                   <AlertDialogAction
//                     onClick={handleConfirmAction}
//                     className={`rounded-xl text-white shadow-md transition-colors h-10 px-6 m-0 font-semibold ${
//                       alertAction === "disable"
//                         ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
//                         : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
//                     }`}
//                   >
//                     {alertAction === "disable"
//                       ? "Yes, Disable"
//                       : "Yes, Restore"}
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>

//             {/* The Slide-Out Edit Panel */}
//             <EditUserSheet
//               isOpen={isEditOpen}
//               onClose={() => setIsEditOpen(false)}
//               user={user}
//             />

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//                 >
//                   <span className="sr-only">Open menu</span>
//                   <MoreHorizontal className="h-4 w-4 text-slate-500" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 align="end"
//                 className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 p-1.5"
//               >
//                 <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wider px-2 py-1.5">
//                   Actions
//                 </DropdownMenuLabel>

//                 {/* EDIT BUTTON */}
//                 <DropdownMenuItem
//                   onClick={() => setIsEditOpen(true)}
//                   className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
//                 >
//                   <Edit className="w-4 h-4 mr-2 text-blue-500" />
//                   Edit Profile
//                 </DropdownMenuItem>

//                 {/* The Copy Icon with a subtle slate color */}
//                 <DropdownMenuItem
//                   onClick={() => {
//                     navigator.clipboard.writeText(user.email);
//                     toast.success("Email copied to clipboard!");
//                   }}
//                   className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
//                 >
//                   <Copy className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
//                   Copy Email ID
//                 </DropdownMenuItem>

//                 <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

//                 {/* CONDITIONAL RENDER: Show Restore if disabled, Disable if active */}
//                 {user.isActive ? (
//                   <DropdownMenuItem
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setAlertAction("disable");
//                       setIsAlertOpen(true);
//                     }}
//                     className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors rounded-lg"
//                   >
//                     <Trash className="w-4 h-4 mr-2" />
//                     Disable Account
//                   </DropdownMenuItem>
//                 ) : (
//                   <DropdownMenuItem
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setAlertAction("restore");
//                       setIsAlertOpen(true);
//                     }}
//                     className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 transition-colors rounded-lg"
//                   >
//                     <UserCheck className="w-4 h-4 mr-2" />
//                     Restore Account
//                   </DropdownMenuItem>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </>
//         );
//       };

//       return <ActionMenu />;
//     },
//   },
// ];

// app/admin/users/columns.tsx
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash,
  ShieldAlert,
  User,
  Edit,
  Copy,
  UserCheck,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  deleteStaffAccount,
  restoreStaffAccount,
} from "@/app/actions/user-actions";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditUserSheet } from "@/components/admin/edit-user-sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type StaffRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
};

// ── Department badge config ────────────────────────────────────────────────────
const DEPT_CONFIG: Record<string, { label: string; className: string }> = {
  all: {
    label: "Global access",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  },
  trucking: {
    label: "Fhernie Logistics",
    className:
      "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  },
  eggs: {
    label: "Otso Dragon",
    className:
      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  },
};

// ── Initials fallback ─────────────────────────────────────────────────────────
function Avatar({ user }: { user: StaffRecord }) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div
      className={cn(
        "relative w-9 h-9 rounded-xl overflow-hidden border border-border/60 shrink-0 flex items-center justify-center bg-muted",
        !user.isActive && "opacity-40 grayscale",
      )}
    >
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={user.name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="text-[11px] font-bold text-muted-foreground">
          {initials}
        </span>
      )}
    </div>
  );
}

export const columns: ColumnDef<StaffRecord>[] = [
  {
    accessorKey: "name",
    header: "Staff member",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar user={user} />
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-semibold leading-tight truncate",
                !user.isActive
                  ? "text-muted-foreground/50 line-through"
                  : "text-foreground",
              )}
            >
              {user.name}
            </p>
            {!user.isActive && (
              <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-md mt-0.5">
                Disabled
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-[13px] text-muted-foreground font-medium truncate block max-w-[200px]">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "department",
    header: "Access",
    cell: ({ row }) => {
      const dept = row.getValue("department") as string;
      const cfg = DEPT_CONFIG[dept];
      if (!cfg)
        return (
          <Badge variant="outline" className="text-xs">
            {dept}
          </Badge>
        );
      return (
        <Badge
          className={cn(
            "text-[11px] font-semibold border px-2 py-0.5 rounded-md",
            cfg.className,
          )}
        >
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return role === "admin" ? (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 px-2 py-0.5 rounded-md">
          <ShieldAlert className="h-3 w-3" />
          Admin
        </span>
      ) : (
        <span className="text-[12px] font-medium text-muted-foreground px-1">
          Encoder
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <ActionMenu user={user} />;
    },
  },
];

// ── Action menu ───────────────────────────────────────────────────────────────
function ActionMenu({ user }: { user: StaffRecord }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertAction, setAlertAction] = useState<"disable" | "restore" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    if (alertAction === "disable") {
      const result = await deleteStaffAccount(user.id);
      if (result.success) {
        toast.success(`${user.name} has been disabled.`);
      } else {
        toast.error(result.error);
      }
    } else if (alertAction === "restore") {
      const result = await restoreStaffAccount(user.id);
      if (result.success) {
        toast.success(`${user.name}'s access has been restored.`);
      } else {
        toast.error(result.error);
      }
    }
    setIsLoading(false);
    setIsAlertOpen(false);
    setAlertAction(null);
  };

  const isDisableAction = alertAction === "disable";

  return (
    <>
      {/* Edit sheet */}
      <EditUserSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
      />

      {/* Confirm dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="sm:max-w-[400px] rounded-2xl bg-background border-border/60 z-200">
          {/* Accent bar */}
          <div
            className={cn(
              "absolute top-0 inset-x-0 h-[3px] rounded-t-2xl",
              isDisableAction ? "bg-rose-500" : "bg-emerald-500",
            )}
          />

          <AlertDialogHeader className="pt-2">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  isDisableAction
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50"
                    : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50",
                )}
              >
                {isDisableAction ? (
                  <Trash
                    className={cn(
                      "h-4 w-4",
                      isDisableAction
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  />
                ) : (
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <AlertDialogTitle className="text-[15px] font-semibold text-foreground leading-tight">
                  {isDisableAction
                    ? "Disable account access"
                    : "Restore account access"}
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                  {isDisableAction ? (
                    <>
                      Disable access for{" "}
                      <span className="font-semibold text-foreground">
                        {user.name}
                      </span>
                      ? They'll be logged out immediately and blocked from the
                      system.
                    </>
                  ) : (
                    <>
                      Restore access for{" "}
                      <span className="font-semibold text-foreground">
                        {user.name}
                      </span>
                      ? They'll be able to log in and use the system normally
                      again.
                    </>
                  )}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5 flex gap-2">
            <AlertDialogCancel
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl text-sm font-medium border-border/60 hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={isLoading}
              onClick={handleConfirm}
              className={cn(
                "flex-1 h-10 rounded-xl text-sm font-semibold border-0 shadow-sm gap-2 active:scale-[0.98] transition-all text-white",
                isDisableAction
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
                </>
              ) : isDisableAction ? (
                "Disable"
              ) : (
                "Restore"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className="sr-only">Actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border-border/60 shadow-md p-1"
        >
          <DropdownMenuItem
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer gap-2 py-2 text-sm font-medium rounded-lg"
          >
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            Edit profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.email);
              toast.success("Email copied.");
            }}
            className="cursor-pointer gap-2 py-2 text-sm font-medium rounded-lg"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            Copy email
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {user.isActive ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setAlertAction("disable");
                setIsAlertOpen(true);
              }}
              className="cursor-pointer gap-2 py-2 text-sm font-medium rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              <Trash className="h-3.5 w-3.5" />
              Disable account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setAlertAction("restore");
                setIsAlertOpen(true);
              }}
              className="cursor-pointer gap-2 py-2 text-sm font-medium rounded-lg text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Restore account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
