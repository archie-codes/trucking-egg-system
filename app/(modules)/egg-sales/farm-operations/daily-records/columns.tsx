"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Badge } from "@/components/ui/badge";
import { deleteFarmDailyRecord } from "@/app/actions/farm-actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";

export type DailyRecordData = {
  id: number;
  recordDate: string;
  mortalityCount: number;
  quantityTrays: number;
  quantityPieces: number;
  remarks: string | null;
  recordedBy?: string | null;
  flock: {
    id: number;
    batchName: string;
    farmName: string;
    buildingName: string;
  } | null;
};

function DailyRecordActionsCell({ record }: { record: DailyRecordData }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting daily record...");
    try {
      const res = await deleteFarmDailyRecord(record.id);
      if (res.success) {
        toast.success("Daily record deleted and flock headcount restored!", {
          id: toastId,
        });
        setShowDeleteDialog(false);
      } else {
        toast.error(res.error || "Failed to delete daily record", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete daily record", { id: toastId });
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
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/egg-sales/farm-operations/daily-records/${record.id}/edit`
              )
            }
            className="cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-2 text-slate-500" />
            Edit Record
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete Daily Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300 pt-1">
              Are you sure you want to delete this record dated{" "}
              <strong>
                {format(new Date(record.recordDate), "MMM dd, yyyy")}
              </strong>{" "}
              for batch <strong>{record.flock?.batchName}</strong>?
              {record.mortalityCount > 0 && (
                <span className="block mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                  ℹ️ Note: Deleting this record will restore {record.mortalityCount} birds back to the batch headcount.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
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
                "Delete Record"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const columns: ColumnDef<DailyRecordData>[] = [
  {
    accessorKey: "recordDate",
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("recordDate") as string;
      const date = new Date(dateStr);
      return (
        <div className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {isNaN(date.getTime()) ? dateStr : format(date, "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    id: "farmName",
    accessorFn: (row) => row.flock?.farmName || "N/A",
    header: "Farm Origin",
    cell: ({ row }) => (
      <div className="font-bold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
        {row.original.flock?.farmName || "N/A"}
      </div>
    ),
  },
  {
    id: "buildingName",
    accessorFn: (row) => row.flock?.buildingName || "N/A",
    header: "Building",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase whitespace-nowrap">
        {row.original.flock?.buildingName || "N/A"}
      </div>
    ),
  },
  {
    id: "batchName",
    accessorFn: (row) => row.flock?.batchName || "N/A",
    header: "Batch Name",
    cell: ({ row }) => (
      <div className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        {row.original.flock?.batchName || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "quantityTrays",
    header: "Egg Production",
    cell: ({ row }) => {
      const trays = row.original.quantityTrays || 0;
      const pieces = row.original.quantityPieces || 0;
      const totalEggs = (trays * 30) + pieces;
      return (
        <div className="flex flex-col whitespace-nowrap">
          <span className="font-bold text-emerald-700 dark:text-emerald-300">
            {trays.toLocaleString()} trays {pieces > 0 ? `+ ${pieces} pcs` : ""}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            ({totalEggs.toLocaleString()} total eggs)
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "mortalityCount",
    header: "Mortality / Losses",
    cell: ({ row }) => {
      const count = row.getValue<number>("mortalityCount");
      return (
        <div className="whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
              count > 0
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {count} {count === 1 ? "bird" : "birds"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const remarks = row.getValue<string>("remarks");
      return (
        <div className="text-muted-foreground truncate max-w-[180px] text-xs">
          {remarks || "-"}
        </div>
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
          className="font-medium text-xs gap-1.5 py-0.5 px-2.5 rounded-full inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 whitespace-nowrap"
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
        <DailyRecordActionsCell record={row.original} />
      </div>
    ),
  },
];
