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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the new Edit Sheet
import { EditUserSheet } from "@/components/admin/edit-user-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export const columns: ColumnDef<StaffRecord>[] = [
  {
    accessorKey: "name",
    header: "Staff Member",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-3">
          <div
            className={`relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm shrink-0 flex items-center justify-center ${!user.isActive ? "opacity-50 grayscale" : ""}`}
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
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <div
              className={`font-semibold ${!user.isActive ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"}`}
            >
              {user.name}
            </div>
            {/* The beautiful red Disabled badge! */}
            {!user.isActive && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm mt-0.5 inline-block">
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
    header: "Email Address",
    cell: ({ row }) => (
      <div className="text-slate-500 dark:text-slate-400 font-medium">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Access Level",
    cell: ({ row }) => {
      const dept = row.getValue("department") as string;
      if (dept === "all")
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm">
            Global Access
          </Badge>
        );
      if (dept === "trucking")
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 shadow-sm">
            Fhernie Logistics
          </Badge>
        );
      if (dept === "eggs")
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 shadow-sm">
            Otso Dragon
          </Badge>
        );
      return <Badge variant="outline">{dept}</Badge>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return role === "admin" ? (
        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md w-fit border border-indigo-100 dark:border-indigo-500/20">
          <ShieldAlert className="w-3.5 h-3.5" /> Admin
        </div>
      ) : (
        <span className="text-slate-500 font-medium px-2.5 py-1">Encoder</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      // Inline component to hold the state for the Edit Sheet
      const ActionMenu = () => {
        const [isEditOpen, setIsEditOpen] = useState(false);
        const [isAlertOpen, setIsAlertOpen] = useState(false);
        const [alertAction, setAlertAction] = useState<
          "disable" | "restore" | null
        >(null);

        const handleConfirmAction = async () => {
          if (alertAction === "disable") {
            const result = await deleteStaffAccount(user.id);
            if (result.success) {
              toast.success("Account Disabled", {
                description: `${user.name} has been locked out of the system.`,
                className:
                  "border-red-500/30 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-md shadow-xl",
              });
            } else {
              toast.error("Error", { description: result.error });
            }
          } else if (alertAction === "restore") {
            const result = await restoreStaffAccount(user.id);
            if (result.success) {
              toast.success("Account Restored", {
                description: `${user.name} can now log in again.`,
                className:
                  "border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/50 backdrop-blur-md shadow-xl",
              });
            } else {
              toast.error("Error", { description: result.error });
            }
          }
          setIsAlertOpen(false);
          setAlertAction(null);
        };

        return (
          <>
            {/* Custom Alert Dialog for Confirmations */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogContent className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-2xl p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {alertAction === "disable"
                      ? "Disable Account Access"
                      : "Restore Account Access"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
                    {alertAction === "disable" ? (
                      <>
                        Are you sure you want to disable access for{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {user.name}
                        </span>
                        ? They will be immediately logged out and unable to
                        access the system until restored.
                      </>
                    ) : (
                      <>
                        Are you sure you want to restore access for{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {user.name}
                        </span>
                        ? They will be able to log in and use the system
                        normally.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-2">
                  <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 px-6 m-0">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmAction}
                    className={`rounded-xl text-white shadow-md transition-colors h-10 px-6 m-0 font-semibold ${
                      alertAction === "disable"
                        ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    }`}
                  >
                    {alertAction === "disable"
                      ? "Yes, Disable"
                      : "Yes, Restore"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* The Slide-Out Edit Panel */}
            <EditUserSheet
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              user={user}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 p-1.5"
              >
                <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wider px-2 py-1.5">
                  Actions
                </DropdownMenuLabel>

                {/* EDIT BUTTON */}
                <DropdownMenuItem
                  onClick={() => setIsEditOpen(true)}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Edit className="w-4 h-4 mr-2 text-blue-500" />
                  Edit Profile
                </DropdownMenuItem>

                {/* The Copy Icon with a subtle slate color */}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user.email);
                    toast.success("Email copied to clipboard!");
                  }}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Copy className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Copy Email ID
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

                {/* CONDITIONAL RENDER: Show Restore if disabled, Disable if active */}
                {user.isActive ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      setAlertAction("disable");
                      setIsAlertOpen(true);
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors rounded-lg"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Disable Account
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      setAlertAction("restore");
                      setIsAlertOpen(true);
                    }}
                    className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 transition-colors rounded-lg"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Restore Account
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      };

      return <ActionMenu />;
    },
  },
];
