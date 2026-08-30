"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, startOfDay, endOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
import { deleteFarmOperatingExpense } from "@/app/actions/farm-actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";

export type OperatingExpenseData = {
  id: number;
  dateIncurred: string;
  category: string;
  amount: number;
  remarks: string | null;
  recordedBy?: string | null;
  flock: {
    id: number;
    batchName: string;
    farmName: string;
    buildingName: string;
  } | null;
};

function OpExActionsCell({ record }: { record: OperatingExpenseData }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting operating expense...");
    try {
      const res = await deleteFarmOperatingExpense(record.id);
      if (res.success) {
        toast.success("Operating expense deleted successfully!", {
          id: toastId,
        });
        setShowDeleteDialog(false);
      } else {
        toast.error(res.error || "Failed to delete expense record", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete expense record", { id: toastId });
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
                `/egg-sales/farm-operations/operating-expenses/${record.id}/edit`
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
              Delete Operating Expense
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300 pt-1">
              Are you sure you want to delete this expense record dated{" "}
              <strong>
                {format(new Date(record.dateIncurred), "MMM dd, yyyy")}
              </strong>{" "}
              ({record.category} - ₱{record.amount.toLocaleString()}) for batch{" "}
              <strong>{record.flock?.batchName}</strong>?
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

export const columns: ColumnDef<OperatingExpenseData>[] = [
  {
    accessorKey: "dateIncurred",
    header: "Date",
    filterFn: (
      row,
      columnId,
      filterValue: { from?: Date; to?: Date } | undefined,
    ) => {
      if (!filterValue || !filterValue.from) return true;
      const cellValue = row.getValue(columnId) as string;
      if (!cellValue) return false;
      const rowDate = new Date(cellValue);
      if (isNaN(rowDate.getTime())) return true;
      const from = startOfDay(filterValue.from);
      const to = filterValue.to
        ? endOfDay(filterValue.to)
        : endOfDay(filterValue.from);
      return rowDate >= from && rowDate <= to;
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("dateIncurred") as string;
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue<string>("category");
      return (
        <Badge
          variant="outline"
          className="font-bold text-xs rounded-full px-2.5 py-0.5 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-800/60 whitespace-nowrap"
        >
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue<number>("amount");
      return (
        <div className="font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
          ₱{" "}
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
        <OpExActionsCell record={row.original} />
      </div>
    ),
  },
];
