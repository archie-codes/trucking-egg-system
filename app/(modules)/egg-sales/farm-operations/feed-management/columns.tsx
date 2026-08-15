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
import { deleteFarmFeedConsumption } from "@/app/actions/farm-actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";

export type FeedRecordData = {
  id: number;
  dateGiven: string;
  feedType: string;
  quantityBags: number;
  totalCost: number;
  recordedBy?: string | null;
  flock: {
    id: number;
    batchName: string;
    farmName: string;
    buildingName: string;
  } | null;
};

function FeedActionsCell({ record }: { record: FeedRecordData }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting feed consumption record...");
    try {
      const res = await deleteFarmFeedConsumption(record.id);
      if (res.success) {
        toast.success("Feed consumption record deleted successfully!", {
          id: toastId,
        });
        setShowDeleteDialog(false);
      } else {
        toast.error(res.error || "Failed to delete feed record", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete feed record", { id: toastId });
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
                `/egg-sales/farm-operations/feed-management/${record.id}/edit`
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
              Delete Feed Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300 pt-1">
              Are you sure you want to delete this feed log dated{" "}
              <strong>
                {format(new Date(record.dateGiven), "MMM dd, yyyy")}
              </strong>{" "}
              ({record.feedType}) for batch <strong>{record.flock?.batchName}</strong>?
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

export const columns: ColumnDef<FeedRecordData>[] = [
  {
    accessorKey: "dateGiven",
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("dateGiven") as string;
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
    accessorKey: "feedType",
    header: "Feed Type",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-bold text-xs rounded-full px-2.5 py-0.5 bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/60 whitespace-nowrap"
      >
        {row.getValue("feedType")}
      </Badge>
    ),
  },
  {
    accessorKey: "quantityBags",
    header: "Quantity (Bags)",
    cell: ({ row }) => {
      const bags = row.getValue<number>("quantityBags");
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 whitespace-nowrap">
          {bags.toLocaleString()} {bags === 1 ? "bag" : "bags"}
        </span>
      );
    },
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => {
      const cost = row.getValue<number>("totalCost");
      return (
        <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
          ₱{" "}
          {cost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
        <FeedActionsCell record={row.original} />
      </div>
    ),
  },
];
