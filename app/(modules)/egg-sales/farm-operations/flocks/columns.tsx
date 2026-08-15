"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toggleFlockStatus, deleteFarmFlock } from "@/app/actions/farm-actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  User,
} from "lucide-react";

export type FlockData = {
  id: number;
  batchName: string;
  farmName: string;
  buildingName: string;
  dateLoaded: string;
  initialHeadCount: number;
  currentHeadCount: number;
  isActive: boolean;
  recordedBy?: string | null;
  ageInWeeks: number;
  formattedDateLoaded: string;
};

function FlockActionsCell({
  flock,
  initialIsAdmin = false,
}: {
  flock: FlockData;
  initialIsAdmin?: boolean;
}) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  async function handleToggleStatus() {
    setIsToggling(true);
    const targetStatus = !flock.isActive;
    const toastId = toast.loading(
      targetStatus ? "Activating batch..." : "Marking batch as completed..."
    );
    try {
      const res = await toggleFlockStatus(flock.id, targetStatus);
      if (res.success) {
        toast.success(
          `Batch "${flock.batchName}" marked as ${
            targetStatus ? "Active" : "Completed/Depleted"
          }`,
          { id: toastId }
        );
      } else {
        toast.error(res.error || "Failed to update flock status", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update flock status", { id: toastId });
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting flock batch...");
    try {
      const res = await deleteFarmFlock(flock.id, isAdmin);
      if (res.success) {
        toast.success(`Batch "${flock.batchName}" deleted successfully`, {
          id: toastId,
        });
        setShowDeleteDialog(false);
      } else {
        toast.error(res.error || "Failed to delete batch", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the batch", {
        id: toastId,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/egg-sales/farm-operations/flocks/${flock.id}/edit`
              )
            }
            className="cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-2 text-slate-500" />
            Edit Batch
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isToggling}
            className="cursor-pointer"
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-500" />
            ) : flock.isActive ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Power className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            )}
            {flock.isActive ? "Mark as Completed" : "Mark as Active"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Batch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              Delete Batch Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300 space-y-2 pt-2">
              <span>
                Are you sure you want to delete <strong>{flock.batchName}</strong> ({flock.buildingName})?
              </span>
              {isAdmin ? (
                <span className="block text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 mt-2">
                  ⚠️ Admin Cascade Override: All associated feeds, mortality records, and expenses will be permanently deleted.
                </span>
              ) : (
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Note: Standard users cannot delete batches with existing records.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center gap-2 py-2 px-1 border-t border-b border-slate-100 dark:border-slate-800 my-2">
            <input
              type="checkbox"
              id={`admin-checkbox-${flock.id}`}
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label
              htmlFor={`admin-checkbox-${flock.id}`}
              className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              Initiate as Admin (Cascade Delete child records)
            </label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Batch"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const getColumns = (isAdmin: boolean = false): ColumnDef<FlockData>[] => [
  {
    accessorKey: "farmName",
    header: "Farm Origin",
    cell: ({ row }) => (
      <div className="font-bold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
        {row.getValue("farmName")}
      </div>
    ),
  },
  {
    accessorKey: "buildingName",
    header: "Building",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase whitespace-nowrap">
        {row.getValue("buildingName")}
      </div>
    ),
  },
  {
    accessorKey: "batchName",
    header: "Batch Name",
    cell: ({ row }) => (
      <div className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        {row.getValue("batchName")}
      </div>
    ),
  },
  {
    accessorKey: "formattedDateLoaded",
    header: "Date Loaded",
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap">
        {row.getValue("formattedDateLoaded")}
      </div>
    ),
  },
  {
    accessorKey: "ageInWeeks",
    header: "Age (Weeks)",
    cell: ({ row }) => {
      const age = row.getValue<number>("ageInWeeks");
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          {age} {age === 1 ? "week" : "weeks"}
        </span>
      );
    },
  },
  {
    accessorKey: "currentHeadCount",
    header: "Current Headcount",
    cell: ({ row }) => {
      const current = row.getValue<number>("currentHeadCount");
      const initial = row.original.initialHeadCount;
      return (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">
            {current.toLocaleString()} birds
          </span>
          <span className="text-[10px] text-muted-foreground">
            of {initial.toLocaleString()} initial
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>("isActive");
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
          }
        >
          {isActive ? "Active" : "Depleted"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "recordedBy",
    header: "Recorded By",
    cell: ({ row }) => {
      const recordedBy = row.getValue<string | null>("recordedBy") || "System";
      return (
        <Badge
          variant="secondary"
          className="font-medium text-xs gap-1 py-0.5 px-2 inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
          <User className="w-3 h-3 text-slate-500" />
          <span>{recordedBy}</span>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right" onClick={(e) => e.stopPropagation()}>
        <FlockActionsCell flock={row.original} initialIsAdmin={isAdmin} />
      </div>
    ),
  },
];

export const columns = getColumns(false);

