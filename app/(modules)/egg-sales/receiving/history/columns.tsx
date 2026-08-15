"use client";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { format, isToday } from "date-fns";
import { eggBatches } from "@/db/schema";
import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  CalendarIcon,
  Info,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteEggBatch, updateEggBatch } from "@/app/actions/egg-actions";
import { toast } from "sonner";

export type EggBatchRecord = typeof eggBatches.$inferSelect;

export const getColumns = (isAdmin: boolean): ColumnDef<EggBatchRecord>[] => [
  {
    accessorKey: "arrivalDate",
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("arrivalDate") as string;
      return (
        <div className="font-bold whitespace-nowrap">
          {format(new Date(dateStr), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "batchId",
    header: "Batch ID",
    cell: ({ row }) => {
      const dateStr = row.getValue("arrivalDate") as string;
      const isNewDelivery = isToday(new Date(dateStr));

      return (
        <div className="flex flex-col">
          {isNewDelivery && (
            <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5 animate-pulse">
              New Delivery
            </span>
          )}
          <div className="font-mono text-xs text-slate-500 whitespace-nowrap">
            {row.getValue("batchId")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "receivedBy",
    header: "Recorded By",
    cell: ({ row }) => {
      const receivedBy = (row.getValue("receivedBy") as string) || "System";
      return (
        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
          {receivedBy}
        </div>
      );
    },
  },
  {
    accessorKey: "farmName",
    header: "Farm Origin",
    cell: ({ row }) => {
      return (
        <div className="font-bold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
          {row.getValue("farmName")}
        </div>
      );
    },
  },
  {
    accessorKey: "totalTraysPickedUp",
    header: () => (
      <div className="text-right text-amber-600 dark:text-amber-500 font-bold border-r border-slate-200 dark:border-slate-800 pr-2">
        Total Trays
      </div>
    ),
    cell: ({ row }) => {
      const totalTrays = (row.getValue("totalTraysPickedUp") as number) || 0;
      const extraType = (row.original.extraType as string) || "NONE";
      const extraPieces = (row.original.extraPiecesPickedUp as number) || 0;

      let extraText = "";
      if (extraType === "HALF_TRAY") extraText = " + Half Tray";
      else if (extraType === "PIECES" && extraPieces > 0)
        extraText = ` + ${extraPieces} Pcs`;

      return (
        <div className="text-right font-black text-amber-600 dark:text-amber-500 border-r border-slate-100 dark:border-slate-800/60 pr-2 bg-amber-50/30 dark:bg-amber-900/10 py-1">
          {totalTrays} Trays{extraText}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyPeewee",
    header: () => (
      <div className="text-right text-indigo-600 dark:text-indigo-400">PW</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyPeewee") as number;
      return (
        <div className="text-right font-mono text-indigo-600 dark:text-indigo-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyXs",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">XS</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyXs") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtySmall",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">Small</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtySmall") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyMedium",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">Medium</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyMedium") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyLarge",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">Large</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyLarge") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyXl",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400">XL</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyXl") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyXxl",
    header: () => (
      <div className="text-right text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800 pr-2">
        XXL
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("qtyXxl") as number;
      return (
        <div className="text-right font-mono text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800/60 pr-2">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyCracked",
    header: () => <div className="text-right text-rose-500">Cracked</div>,
    cell: ({ row }) => {
      const val = row.getValue("qtyCracked") as number;
      return (
        <div className="text-right font-mono text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyBroken",
    header: () => <div className="text-right text-rose-500">Broken</div>,
    cell: ({ row }) => {
      const val = row.getValue("qtyBroken") as number;
      return (
        <div className="text-right font-mono text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "qtyDirty",
    header: () => <div className="text-right text-orange-500">Dirty</div>,
    cell: ({ row }) => {
      const val = row.getValue("qtyDirty") as number;
      return (
        <div className="text-right font-mono text-orange-500 bg-orange-50/30 dark:bg-orange-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  // --- BROWN EGGS COLUMNS ---
  {
    accessorKey: "brownQtyPeewee",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">Br PW</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyPeewee") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyXs",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">Br XS</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyXs") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtySmall",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">Br S</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtySmall") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyMedium",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">Br M</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyMedium") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyLarge",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">Br L</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyLarge") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyXl",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">Br XL</div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyXl") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyXxl",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500">
        Br XXL
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyXxl") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyAssorted",
    header: () => (
      <div className="text-right text-amber-700 dark:text-amber-500 border-r border-slate-200 dark:border-slate-800 pr-2">
        Br ASST
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("brownQtyAssorted") as number;
      return (
        <div className="text-right font-mono text-amber-700 dark:text-amber-500 border-r border-slate-100 dark:border-slate-800/60 pr-2">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyCracked",
    header: () => <div className="text-right text-rose-500">Br CRK</div>,
    cell: ({ row }) => {
      const val = row.getValue("brownQtyCracked") as number;
      return (
        <div className="text-right font-mono text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyBroken",
    header: () => <div className="text-right text-rose-500">Br BRK</div>,
    cell: ({ row }) => {
      const val = row.getValue("brownQtyBroken") as number;
      return (
        <div className="text-right font-mono text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "brownQtyDirty",
    header: () => <div className="text-right text-orange-500">Br DRT</div>,
    cell: ({ row }) => {
      const val = row.getValue("brownQtyDirty") as number;
      return (
        <div className="text-right font-mono text-orange-500 bg-orange-50/30 dark:bg-orange-900/10 px-2 py-1 rounded">
          {val > 0 ? val : "-"}
        </div>
      );
    },
  },
  {
    id: "totalEggs",
    header: () => (
      <div className="text-right text-indigo-600 dark:text-indigo-400 font-bold">
        Total Eggs
      </div>
    ),
    cell: ({ row }) => {
      const {
        qtyPeewee,
        qtyXs,
        qtySmall,
        qtyMedium,
        qtyLarge,
        qtyXl,
        qtyXxl,
        qtyCracked,
        qtyBroken,
        qtyDirty,
        brownQtyPeewee,
        brownQtyXs,
        brownQtySmall,
        brownQtyMedium,
        brownQtyLarge,
        brownQtyXl,
        brownQtyXxl,
        brownQtyAssorted,
        brownQtyCracked,
        brownQtyBroken,
        brownQtyDirty,
      } = row.original;

      const totalTrays =
        (qtyPeewee || 0) +
        (qtyXs || 0) +
        (qtySmall || 0) +
        (qtyMedium || 0) +
        (qtyLarge || 0) +
        (qtyXl || 0) +
        (qtyXxl || 0) +
        (qtyCracked || 0) +
        (qtyBroken || 0) +
        (qtyDirty || 0) +
        (brownQtyPeewee || 0) +
        (brownQtyXs || 0) +
        (brownQtySmall || 0) +
        (brownQtyMedium || 0) +
        (brownQtyLarge || 0) +
        (brownQtyXl || 0) +
        (brownQtyXxl || 0) +
        (brownQtyAssorted || 0) +
        (brownQtyCracked || 0) +
        (brownQtyBroken || 0) +
        (brownQtyDirty || 0);

      const totalPieces = Math.round(totalTrays * 30);

      return (
        <div className="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-1 rounded">
          {totalPieces > 0 ? `${totalPieces.toLocaleString()} Pcs` : "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell batch={row.original} isAdmin={isAdmin} />,
  },
];

const ActionCell = ({
  batch,
  isAdmin,
}: {
  batch: EggBatchRecord;
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [formData, setFormData] = useState({
    arrivalDate: batch.arrivalDate || "",
    batchId: batch.batchId || "",
    farmName: batch.farmName || "",
    totalTraysPickedUp: batch.totalTraysPickedUp ?? 0,
    extraType: batch.extraType || "NONE",
    extraPiecesPickedUp: batch.extraPiecesPickedUp ?? 0,
    qtyPeewee: batch.qtyPeewee ?? 0,
    qtyXs: batch.qtyXs ?? 0,
    qtySmall: batch.qtySmall ?? 0,
    qtyMedium: batch.qtyMedium ?? 0,
    qtyLarge: batch.qtyLarge ?? 0,
    qtyXl: batch.qtyXl ?? 0,
    qtyXxl: batch.qtyXxl ?? 0,
    qtyCracked: batch.qtyCracked ?? 0,
    qtyBroken: batch.qtyBroken ?? 0,
    qtyDirty: batch.qtyDirty ?? 0,
    brownQtyPeewee: batch.brownQtyPeewee ?? 0,
    brownQtyXs: batch.brownQtyXs ?? 0,
    brownQtySmall: batch.brownQtySmall ?? 0,
    brownQtyMedium: batch.brownQtyMedium ?? 0,
    brownQtyLarge: batch.brownQtyLarge ?? 0,
    brownQtyXl: batch.brownQtyXl ?? 0,
    brownQtyXxl: batch.brownQtyXxl ?? 0,
    brownQtyAssorted: batch.brownQtyAssorted ?? 0,
    brownQtyCracked: batch.brownQtyCracked ?? 0,
    brownQtyBroken: batch.brownQtyBroken ?? 0,
    brownQtyDirty: batch.brownQtyDirty ?? 0,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteEggBatch(batch.batchId);

    if (result.success) {
      toast.success("Batch deleted successfully. Inventory reversed.");
      router.refresh();
    } else {
      toast.error("Deletion Failed", { description: result.error });
    }

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  const formatTrayCount = (val: number): string => {
    if (isNaN(val) || val === 0) return "0";
    if (Number.isInteger(val)) return val.toString();
    return Number(val.toFixed(2)).toString();
  };

  const EGGS_PER_TRAY = 30;

  const totalTrays = Number(formData.totalTraysPickedUp) || 0;
  const extraType = formData.extraType || "NONE";
  const extraPiecesInput = Number(formData.extraPiecesPickedUp) || 0;

  const extraPieces =
    extraType === "HALF_TRAY"
      ? 15
      : extraType === "PIECES"
        ? extraPiecesInput
        : 0;
  const totalPickupTrays = totalTrays + extraPieces / 30;
  const totalExpectedPieces = totalTrays * EGGS_PER_TRAY + extraPieces;

  const peewee = Number(formData.qtyPeewee) || 0;
  const xs = Number(formData.qtyXs) || 0;
  const s = Number(formData.qtySmall) || 0;
  const m = Number(formData.qtyMedium) || 0;
  const l = Number(formData.qtyLarge) || 0;
  const xl = Number(formData.qtyXl) || 0;
  const xxl = Number(formData.qtyXxl) || 0;
  const cracked = Number(formData.qtyCracked) || 0;
  const broken = Number(formData.qtyBroken) || 0;
  const dirty = Number(formData.qtyDirty) || 0;

  const bPeewee = Number(formData.brownQtyPeewee) || 0;
  const bXs = Number(formData.brownQtyXs) || 0;
  const bS = Number(formData.brownQtySmall) || 0;
  const bM = Number(formData.brownQtyMedium) || 0;
  const bL = Number(formData.brownQtyLarge) || 0;
  const bXl = Number(formData.brownQtyXl) || 0;
  const bXxl = Number(formData.brownQtyXxl) || 0;
  const bAssorted = Number(formData.brownQtyAssorted) || 0;
  const bCracked = Number(formData.brownQtyCracked) || 0;
  const bBroken = Number(formData.brownQtyBroken) || 0;
  const bDirty = Number(formData.brownQtyDirty) || 0;

  const totalSortedTrays =
    peewee +
    xs +
    s +
    m +
    l +
    xl +
    xxl +
    cracked +
    broken +
    dirty +
    bPeewee +
    bXs +
    bS +
    bM +
    bL +
    bXl +
    bXxl +
    bAssorted +
    bCracked +
    bBroken +
    bDirty;
  const totalSortedPieces = Math.round(totalSortedTrays * EGGS_PER_TRAY);
  const variancePieces = totalExpectedPieces - totalSortedPieces;
  const varianceTrays = Number(
    (totalPickupTrays - totalSortedTrays).toFixed(2),
  );

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (variancePieces !== 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      const isMissing = variancePieces > 0;
      const absTrays = Math.abs(varianceTrays);
      const absPieces = Math.abs(variancePieces);
      toast.error(isMissing ? "Missing Eggs Detected" : "Overcount Detected", {
        description: `You are ${isMissing ? "missing" : "over by"} ${absTrays} ${absTrays === 1 ? "Tray" : "Trays"} (${absPieces} Pcs). Please correct the sorting breakdown.`,
        duration: 5000,
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Updating batch...");

    const result = await updateEggBatch({
      id: batch.id,
      ...formData,
    });

    if (result.success) {
      toast.success("Batch updated successfully.", { id: toastId });
      setIsEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update batch.", { id: toastId });
    }

    setIsSaving(false);
  };

  const handleNumChange = (field: string, val: string) => {
    const parsed = val === "" ? 0 : Number(val);
    setFormData((prev) => ({ ...prev, [field]: isNaN(parsed) ? 0 : parsed }));
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 3;
        }
        @keyframes expandFadeIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-expand-fade-in {
          animation: expandFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-110 rounded-lg shadow-lg border-slate-200 dark:border-slate-800"
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className={cn(
              "gap-2 font-medium cursor-pointer",
              isAdmin
                ? "text-blue-600 dark:text-blue-400 focus:bg-blue-50 focus:text-blue-700 dark:focus:bg-blue-900/30"
                : "text-slate-400 opacity-50 cursor-not-allowed",
            )}
            onClick={(e) => {
              if (!isAdmin) {
                e.preventDefault();
                toast.error("Access Denied", {
                  description: "Only Admins can edit records.",
                });
                return;
              }
              setFormData({
                arrivalDate: batch.arrivalDate || "",
                batchId: batch.batchId || "",
                farmName: batch.farmName || "",
                totalTraysPickedUp: batch.totalTraysPickedUp ?? 0,
                extraType: batch.extraType || "NONE",
                extraPiecesPickedUp: batch.extraPiecesPickedUp ?? 0,
                qtyPeewee: batch.qtyPeewee ?? 0,
                qtyXs: batch.qtyXs ?? 0,
                qtySmall: batch.qtySmall ?? 0,
                qtyMedium: batch.qtyMedium ?? 0,
                qtyLarge: batch.qtyLarge ?? 0,
                qtyXl: batch.qtyXl ?? 0,
                qtyXxl: batch.qtyXxl ?? 0,
                qtyCracked: batch.qtyCracked ?? 0,
                qtyBroken: batch.qtyBroken ?? 0,
                qtyDirty: batch.qtyDirty ?? 0,
                brownQtyPeewee: batch.brownQtyPeewee ?? 0,
                brownQtyXs: batch.brownQtyXs ?? 0,
                brownQtySmall: batch.brownQtySmall ?? 0,
                brownQtyMedium: batch.brownQtyMedium ?? 0,
                brownQtyLarge: batch.brownQtyLarge ?? 0,
                brownQtyXl: batch.brownQtyXl ?? 0,
                brownQtyXxl: batch.brownQtyXxl ?? 0,
                brownQtyAssorted: batch.brownQtyAssorted ?? 0,
                brownQtyCracked: batch.brownQtyCracked ?? 0,
                brownQtyBroken: batch.brownQtyBroken ?? 0,
                brownQtyDirty: batch.brownQtyDirty ?? 0,
              });
              setIsEditOpen(true);
            }}
          >
            <Edit className="w-4 h-4" /> Edit Batch
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "gap-2 font-medium cursor-pointer",
              isAdmin
                ? "text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-900/30"
                : "text-slate-400 opacity-50 cursor-not-allowed",
            )}
            onClick={(e) => {
              if (!isAdmin) {
                e.preventDefault();
                toast.error("Access Denied", {
                  description: "Only Admins can delete records.",
                });
                return;
              }
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete Batch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete batch{" "}
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                {batch.batchId}
              </span>
              . The system will attempt to deduct these eggs back out of your
              active inventory. This action will fail if the eggs have already
              been sold.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl h-11"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Delete Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] sm:w-[95vw] h-[90dvh] sm:h-auto max-h-[90dvh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-[#0d1117] border-slate-200 dark:border-white/10 rounded-xl sm:rounded-lg p-0 overflow-hidden z-200 shadow-2xl [&>button]:hidden">
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#0d1117] relative z-10 flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600 dark:text-[#5cabff]" />{" "}
                Edit Batch Record
              </DialogTitle>
              <DialogDescription className="mt-1.5 font-medium text-slate-500 dark:text-white/50 text-sm">
                Modify the receiving details and sorted pieces for{" "}
                <span className="font-bold text-slate-700 dark:text-white">
                  {batch.batchId}
                </span>
                .
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditOpen(false)}
              className="h-8 w-8 shrink-0 rounded-full bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 dark:hover:text-rose-400 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col flex-1 overflow-hidden min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                  Manifest Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Arrival Date
                    </Label>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900",
                            !formData.arrivalDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          {formData.arrivalDate ? (
                            format(
                              new Date(formData.arrivalDate),
                              "MMMM d, yyyy",
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-200 rounded-xl border-slate-200 shadow-xl"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            formData.arrivalDate
                              ? new Date(formData.arrivalDate)
                              : undefined
                          }
                          defaultMonth={
                            formData.arrivalDate
                              ? new Date(formData.arrivalDate)
                              : undefined
                          }
                          captionLayout="dropdown"
                          fromYear={2020}
                          toYear={new Date().getFullYear() + 1}
                          disabled={(date) => date > new Date()}
                          onSelect={(date) => {
                            if (date) {
                              setFormData({
                                ...formData,
                                arrivalDate: format(date, "yyyy-MM-dd"),
                              });
                              setIsCalendarOpen(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Farm Origin
                    </Label>
                    <Input
                      value={formData.farmName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          farmName: e.target.value.toUpperCase(),
                        })
                      }
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 uppercase"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Total Trays
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={
                        formData.totalTraysPickedUp === 0 &&
                        formData.totalTraysPickedUp.toString() !== "0"
                          ? ""
                          : formData.totalTraysPickedUp
                      }
                      onChange={(e) =>
                        handleNumChange("totalTraysPickedUp", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Extra Egg Option
                    </Label>
                    <Select
                      value={formData.extraType || "NONE"}
                      onValueChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          extraType: val,
                          extraPiecesPickedUp:
                            val === "HALF_TRAY"
                              ? 15
                              : val === "NONE"
                                ? 0
                                : prev.extraPiecesPickedUp,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-11! w-full rounded-2xl font-bold bg-amber-50 dark:bg-amber-950/30 border-slate-200 dark:border-slate-800/80 text-amber-900 dark:text-amber-100">
                        <SelectValue placeholder="Option" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl z-200">
                        <SelectItem value="NONE">No Extra (0 Pcs)</SelectItem>
                        <SelectItem value="HALF_TRAY">
                          Half Tray (15 Pcs)
                        </SelectItem>
                        <SelectItem value="PIECES">Per Pieces Egg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Extra Eggs (Pcs)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      disabled={formData.extraType !== "PIECES"}
                      readOnly={
                        formData.extraType === "HALF_TRAY" ||
                        formData.extraType === "NONE"
                      }
                      value={
                        formData.extraType === "HALF_TRAY"
                          ? 15
                          : formData.extraType === "NONE"
                            ? 0
                            : formData.extraPiecesPickedUp
                      }
                      onChange={(e) =>
                        handleNumChange("extraPiecesPickedUp", e.target.value)
                      }
                      onClick={(e) =>
                        formData.extraType === "PIECES" &&
                        e.currentTarget.select()
                      }
                      className={cn(
                        "h-11 rounded-2xl font-bold transition-all",
                        formData.extraType === "PIECES"
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-slate-200 dark:border-slate-800/80"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed",
                      )}
                    />
                  </div>
                </div>

                {formData.extraType === "HALF_TRAY" && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 animate-expand-fade-in">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-700 dark:text-amber-300">
                        QA Hint: Half Tray = 0.5 Tray (15 Eggs)
                      </span>
                      <span>
                        Enter{" "}
                        <code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 px-1 py-0.5 rounded">
                          0.5
                        </code>{" "}
                        in any QA box below for half trays.
                      </span>
                    </div>
                  </div>
                )}

                {formData.extraType === "PIECES" &&
                  Number(formData.extraPiecesPickedUp) > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200 animate-expand-fade-in">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-blue-700 dark:text-blue-300">
                          QA Hint: {formData.extraPiecesPickedUp} Eggs ={" "}
                          {Number(
                            (formData.extraPiecesPickedUp / 30).toFixed(2),
                          )}{" "}
                          Trays
                        </span>
                        <span>
                          Enter{" "}
                          <code className="font-mono font-bold bg-blue-200/60 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 px-1 py-0.5 rounded">
                            {Number(
                              (formData.extraPiecesPickedUp / 30).toFixed(2),
                            )}
                          </code>{" "}
                          in QA breakdown for these extra eggs.
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/30 pb-2">
                  White QA Breakdown (Trays)
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                  {[
                    { key: "qtyPeewee", label: "Peewee" },
                    { key: "qtyXs", label: "XS" },
                    { key: "qtySmall", label: "Small" },
                    { key: "qtyMedium", label: "Medium" },
                    { key: "qtyLarge", label: "Large" },
                    { key: "qtyXl", label: "XL" },
                    { key: "qtyXxl", label: "XXL" },
                  ].map((size) => (
                    <div key={size.key} className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">
                        {size.label}
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={
                          formData[size.key as keyof typeof formData] === 0 &&
                          formData[
                            size.key as keyof typeof formData
                          ].toString() !== "0"
                            ? ""
                            : formData[size.key as keyof typeof formData]
                        }
                        onChange={(e) =>
                          handleNumChange(size.key, e.target.value)
                        }
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 font-mono font-bold"
                      />
                      {Number(formData[size.key as keyof typeof formData]) >
                        0 && (
                        <span className="text-[9px] font-semibold text-slate-500 text-right pr-1">
                          ={" "}
                          {Math.round(
                            Number(
                              formData[size.key as keyof typeof formData],
                            ) * 30,
                          )}{" "}
                          pcs
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-rose-400 uppercase">
                      Cracked
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        formData.qtyCracked === 0 &&
                        formData.qtyCracked.toString() !== "0"
                          ? ""
                          : formData.qtyCracked
                      }
                      onChange={(e) =>
                        handleNumChange("qtyCracked", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-mono font-bold"
                    />
                    {Number(formData.qtyCracked) > 0 && (
                      <span className="text-[9px] font-semibold text-rose-500 text-right pr-1">
                        = {Math.round(Number(formData.qtyCracked) * 30)} pcs
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-rose-400 uppercase">
                      Broken
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        formData.qtyBroken === 0 &&
                        formData.qtyBroken.toString() !== "0"
                          ? ""
                          : formData.qtyBroken
                      }
                      onChange={(e) =>
                        handleNumChange("qtyBroken", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-mono font-bold"
                    />
                    {Number(formData.qtyBroken) > 0 && (
                      <span className="text-[9px] font-semibold text-rose-500 text-right pr-1">
                        = {Math.round(Number(formData.qtyBroken) * 30)} pcs
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-orange-400 uppercase">
                      Dirty
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        formData.qtyDirty === 0 &&
                        formData.qtyDirty.toString() !== "0"
                          ? ""
                          : formData.qtyDirty
                      }
                      onChange={(e) =>
                        handleNumChange("qtyDirty", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 font-mono font-bold"
                    />
                    {Number(formData.qtyDirty) > 0 && (
                      <span className="text-[9px] font-semibold text-orange-500 text-right pr-1">
                        = {Math.round(Number(formData.qtyDirty) * 30)} pcs
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest border-b border-amber-100 dark:border-amber-900/30 pb-2">
                  Brown QA Breakdown (Trays)
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-8 gap-3">
                  {[
                    { key: "brownQtyPeewee", label: "Peewee" },
                    { key: "brownQtyXs", label: "XS" },
                    { key: "brownQtySmall", label: "Small" },
                    { key: "brownQtyMedium", label: "Medium" },
                    { key: "brownQtyLarge", label: "Large" },
                    { key: "brownQtyXl", label: "XL" },
                    { key: "brownQtyXxl", label: "XXL" },
                    { key: "brownQtyAssorted", label: "Assorted" },
                  ].map((size) => (
                    <div key={size.key} className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">
                        {size.label}
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={
                          formData[size.key as keyof typeof formData] === 0 &&
                          formData[
                            size.key as keyof typeof formData
                          ].toString() !== "0"
                            ? ""
                            : formData[size.key as keyof typeof formData]
                        }
                        onChange={(e) =>
                          handleNumChange(size.key, e.target.value)
                        }
                        onClick={(e) => e.currentTarget.select()}
                        className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 font-mono font-bold"
                      />
                      {Number(formData[size.key as keyof typeof formData]) >
                        0 && (
                        <span className="text-[9px] font-semibold text-slate-500 text-right pr-1">
                          ={" "}
                          {Math.round(
                            Number(
                              formData[size.key as keyof typeof formData],
                            ) * 30,
                          )}{" "}
                          pcs
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-rose-400 uppercase">
                      Cracked
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        formData.brownQtyCracked === 0 &&
                        formData.brownQtyCracked.toString() !== "0"
                          ? ""
                          : formData.brownQtyCracked
                      }
                      onChange={(e) =>
                        handleNumChange("brownQtyCracked", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-mono font-bold"
                    />
                    {Number(formData.brownQtyCracked) > 0 && (
                      <span className="text-[9px] font-semibold text-rose-500 text-right pr-1">
                        = {Math.round(Number(formData.brownQtyCracked) * 30)}{" "}
                        pcs
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-rose-400 uppercase">
                      Broken
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        formData.brownQtyBroken === 0 &&
                        formData.brownQtyBroken.toString() !== "0"
                          ? ""
                          : formData.brownQtyBroken
                      }
                      onChange={(e) =>
                        handleNumChange("brownQtyBroken", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-mono font-bold"
                    />
                    {Number(formData.brownQtyBroken) > 0 && (
                      <span className="text-[9px] font-semibold text-rose-500 text-right pr-1">
                        = {Math.round(Number(formData.brownQtyBroken) * 30)} pcs
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-orange-400 uppercase">
                      Dirty
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        formData.brownQtyDirty === 0 &&
                        formData.brownQtyDirty.toString() !== "0"
                          ? ""
                          : formData.brownQtyDirty
                      }
                      onChange={(e) =>
                        handleNumChange("brownQtyDirty", e.target.value)
                      }
                      onClick={(e) => e.currentTarget.select()}
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 font-mono font-bold"
                    />
                    {Number(formData.brownQtyDirty) > 0 && (
                      <span className="text-[9px] font-semibold text-orange-500 text-right pr-1">
                        = {Math.round(Number(formData.brownQtyDirty) * 30)} pcs
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto mr-auto">
                <div className="text-left flex-1 sm:flex-none">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                    Target Expected
                  </p>
                  <p className="text-lg font-mono font-bold text-slate-900 dark:text-white leading-none">
                    <NumberTicker value={totalExpectedPieces} />{" "}
                    <span className="text-xs text-slate-500 font-sans">
                      Pcs
                    </span>
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">
                    = {formatTrayCount(totalPickupTrays)} Total Trays
                  </p>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

                <div className="text-left flex-1 sm:flex-none">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Variance Check
                  </p>
                  <div className="flex items-center justify-start gap-2">
                    {variancePieces === 0 && totalExpectedPieces > 0 ? (
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Perfect
                        Match ({formatTrayCount(totalPickupTrays)} Trays)
                      </span>
                    ) : variancePieces > 0 ? (
                      <span
                        className={cn(
                          "flex items-center text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-md transition-all",
                          isShaking
                            ? "animate-shake border border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            : "border border-transparent",
                        )}
                      >
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                          Missing {formatTrayCount(Math.abs(varianceTrays))}{" "}
                          {Math.abs(varianceTrays) === 1 ? "Tray" : "Trays"} (
                          {Math.abs(variancePieces)} Pcs)
                        </span>
                      </span>
                    ) : variancePieces < 0 ? (
                      <span
                        className={cn(
                          "flex items-center text-amber-600 dark:text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md transition-all",
                          isShaking
                            ? "animate-shake border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                            : "animate-pulse border border-transparent",
                        )}
                      >
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                          Over count by{" "}
                          {formatTrayCount(Math.abs(varianceTrays))}{" "}
                          {Math.abs(varianceTrays) === 1 ? "Tray" : "Trays"} (
                          {Math.abs(variancePieces)} Pcs)
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Awaiting QA Count...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl h-10 w-full sm:w-auto font-semibold border-slate-200 dark:border-white/10 dark:text-white dark:bg-transparent dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    "relative rounded-xl h-10 w-full sm:w-[170px] font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn border-none",
                    variancePieces !== 0 ? "opacity-50 cursor-not-allowed" : "",
                    isSaving ? "opacity-70 pointer-events-none" : "",
                  )}
                >
                  <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : variancePieces !== 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Resolve Variance
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />
                      Update Batch
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
