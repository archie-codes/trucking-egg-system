// app/admin/users/columns.tsx
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash,
  ShieldAlert,
  Edit,
  Copy,
  UserCheck,
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
    cell: ({ row, table }) => {
      const user = row.original;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentUserId = (table.options.meta as any)?.currentUserId;
      const isCurrentUser = currentUserId === user.id;

      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar user={user} />
          <div className="min-w-0 flex items-center gap-2">
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
                <span className="block items-center text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-md mt-0.5">
                  Disabled
                </span>
              )}
            </div>
            {isCurrentUser && (
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] uppercase tracking-wider h-5 px-1.5 bg-blue-100/50 text-blue-700 border border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-bold"
              >
                Your account
              </Badge>
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
    cell: ({ row, table }) => {
      const user = row.original;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentUserId = (table.options.meta as any)?.currentUserId;
      return <ActionMenu user={user} currentUserId={currentUserId} />;
    },
  },
];

// ── Action menu ───────────────────────────────────────────────────────────────
function ActionMenu({
  user,
  currentUserId,
}: {
  user: StaffRecord;
  currentUserId?: number | null;
}) {
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
                      ? They&apos;ll be logged out immediately and blocked from
                      the system.
                    </>
                  ) : (
                    <>
                      Restore access for{" "}
                      <span className="font-semibold text-foreground">
                        {user.name}
                      </span>
                      ? They&apos;ll be able to log in and use the system
                      normally again.
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
                if (currentUserId === user.id) {
                  e.preventDefault();
                  toast.error(
                    "You cannot disable your own account while logged in.",
                  );
                  return;
                }
                e.preventDefault();
                setAlertAction("disable");
                setIsAlertOpen(true);
              }}
              className={cn(
                "cursor-pointer gap-2 py-2 text-sm font-medium rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30",
                currentUserId === user.id && "opacity-50",
              )}
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
