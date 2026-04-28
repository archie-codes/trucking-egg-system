// app/admin/users/columns.tsx
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
// 1. ADDED: 'Copy' to the Lucide imports
import {
  MoreHorizontal,
  Trash,
  ShieldAlert,
  User,
  Edit,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteStaffAccount } from "@/app/actions/user-actions";
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
import { EditUserSheet } from "@/components/edit-user-sheet";

export type StaffRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl: string | null;
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
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm shrink-0 flex items-center justify-center">
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
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {user.name}
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

        const handleDelete = async () => {
          if (
            confirm(`Are you sure you want to revoke access for ${user.name}?`)
          ) {
            const result = await deleteStaffAccount(user.id);
            if (result.success) {
              toast.success("Account Deleted", {
                description: `${user.name} has been removed from the system.`,
                className:
                  "border-red-500/30 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-md shadow-xl",
              });
            } else {
              toast.error("Error", { description: result.error });
            }
          }
        };

        return (
          <>
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
                className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-800"
              >
                <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wider">
                  Actions
                </DropdownMenuLabel>

                {/* EDIT BUTTON */}
                <DropdownMenuItem
                  onClick={() => setIsEditOpen(true)}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit className="w-4 h-4 mr-2 text-blue-500" />
                  Edit Profile
                </DropdownMenuItem>

                {/* 2. ADDED: The Copy Icon with a subtle slate color to match the design language */}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user.email);
                    toast.success("Email copied to clipboard!"); // Added a nice little toast here too!
                  }}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Copy className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Copy Email ID
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      };

      return <ActionMenu />;
    },
  },
];
