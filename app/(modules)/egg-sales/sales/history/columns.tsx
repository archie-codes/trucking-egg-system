"use client";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { format, isToday } from "date-fns";
import { eggSales } from "@/db/schema";
import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarIcon,
  Clock,
  X,
  MessageSquareText,
  Printer,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { deleteEggSale, updateEggSale } from "@/app/actions/egg-actions";
import { toast } from "sonner";
import { NumberTicker } from "@/components/ui/number-ticker";

export type EggSaleRecord = typeof eggSales.$inferSelect;

function RemarksCell({ note }: { note?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!note || note.trim() === "") {
    return <div className="text-slate-400 text-center opacity-50">-</div>;
  }

  return (
    <div
      className="flex justify-center"
      onClick={(e) => {
        // Prevent click from bubbling to the TableRow
        e.stopPropagation();
      }}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors focus:outline-none cursor-pointer"
            title="View Note"
          >
            <MessageSquareText className="h-4 w-4 fill-amber-500/20" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          className="w-auto max-w-[280px] p-3 rounded-lg border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/95 shadow-lg z-200"
        >
          <div className="flex items-center justify-between mb-1.5 border-b border-amber-200 dark:border-amber-900/50 pb-1 gap-4">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
              Notes
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-amber-700/50 hover:text-amber-700 dark:text-amber-500/50 dark:hover:text-amber-500 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {note}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const getColumns = (
  isAdmin: boolean,
  onRowUpdate?: (id: number) => void,
): ColumnDef<EggSaleRecord>[] => [
  {
    accessorKey: "invoiceId",
    header: "Invoice No.",
    cell: ({ row }) => (
      <div className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md w-fit">
        {row.getValue("invoiceId") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "saleDate",
    header: "Date Delivered",
    cell: ({ row }) => {
      const dateStr = row.getValue("saleDate") as string;
      const isNew = isToday(new Date(dateStr));
      return (
        <div className="flex flex-col">
          {isNew && (
            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5 animate-pulse">
              Today
            </span>
          )}
          <div className="font-bold whitespace-nowrap text-slate-900 dark:text-slate-100">
            {format(new Date(dateStr), "MMM dd, yyyy")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "datePaid",
    header: "Date Paid",
    cell: ({ row }) => {
      const dateStr = row.getValue("datePaid") as string | null;
      const isNew = dateStr ? isToday(new Date(dateStr)) : false;
      return (
        <div className="flex flex-col">
          {isNew && (
            <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mb-0.5 animate-pulse">
              Today
            </span>
          )}
          <div className="text-slate-500 whitespace-nowrap text-[12px] font-medium">
            {dateStr ? format(new Date(dateStr), "MMM dd, yyyy") : "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: "Customer Name",
    cell: ({ row }) => (
      <div className="font-bold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
        {row.getValue("customerId")}
      </div>
    ),
  },
  {
    accessorKey: "classification",
    header: "Size",
    cell: ({ row }) => {
      const cls = (row.getValue("classification") as string).toUpperCase();
      let colorClass = "text-blue-600 dark:text-blue-400";

      if (cls === "CRACKED" || cls === "BROWN_CRACKED")
        colorClass = "text-red-600 dark:text-red-400";
      else if (cls === "BROKEN" || cls === "BROWN_BROKEN")
        colorClass = "text-rose-600 dark:text-rose-400";
      else if (cls === "DIRTY" || cls === "BROWN_DIRTY")
        colorClass = "text-stone-600 dark:text-stone-400";
      else if (cls.startsWith("BROWN_"))
        colorClass = "text-amber-700 dark:text-amber-500";

      return <div className={`font-black uppercase ${colorClass}`}>{cls}</div>;
    },
  },
  {
    accessorKey: "quantityTrays",
    header: () => <div className="text-right">Trays</div>,
    cell: ({ row }) => (
      <div className="text-right font-black text-slate-700 dark:text-slate-300">
        {row.getValue("quantityTrays")}
      </div>
    ),
  },
  {
    accessorKey: "pricePerTray",
    header: () => <div className="text-right">Price (₱)</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-slate-500">
        {(row.getValue("pricePerTray") as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: () => (
      <div className="text-right font-bold text-slate-800 dark:text-slate-200">
        Total (₱)
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono text-slate-900 dark:text-white">
        {(row.getValue("totalAmount") as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "amountPaid",
    header: () => (
      <div className="text-right text-emerald-600 dark:text-emerald-500">
        Paid (₱)
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("amountPaid") as number;
      return (
        <div className="text-right font-mono text-emerald-600 dark:text-emerald-500">
          {val > 0 ? <NumberTicker value={val} /> : "-"}
        </div>
      );
    },
  },
  {
    id: "balance",
    header: () => <div className="text-right text-rose-500">Balance (₱)</div>,
    cell: ({ row }) => {
      const total = row.original.totalAmount;
      const paid = row.original.amountPaid;
      const balance = total - paid;

      return (
        <div
          className={cn(
            "text-right font-mono font-bold px-2 py-1 rounded ml-auto w-fit",
            balance > 0
              ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30"
              : "text-slate-400",
          )}
        >
          {balance > 0 ? <NumberTicker value={balance} /> : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("paymentStatus") as string)?.toLowerCase();

      if (status === "paid") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
            <CheckCircle2
              className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
              strokeWidth={3}
            />{" "}
            Paid
          </span>
        );
      }
      if (status === "partial") {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
            <Clock
              className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"
              strokeWidth={3}
            />{" "}
            Partial
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800/50 animate-pulse">
          <AlertCircle
            className="w-3.5 h-3.5 text-red-600 dark:text-red-400"
            strokeWidth={3}
          />{" "}
          Unpaid
        </span>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: () => <div className="text-center">Remarks</div>,
    cell: ({ row }) => <RemarksCell note={row.getValue("remarks") as string} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionCell
        sale={row.original}
        isAdmin={isAdmin}
        onRowUpdate={onRowUpdate}
      />
    ),
  },
];

const ActionCell = ({
  sale,
  isAdmin,
  onRowUpdate,
}: {
  sale: EggSaleRecord;
  isAdmin: boolean;
  onRowUpdate?: (id: number) => void;
}) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaleCalendarOpen, setIsSaleCalendarOpen] = useState(false);

  const [formData, setFormData] = useState({
    saleDate: sale.saleDate,
    customerId: sale.customerId,
    quantityTrays: sale.quantityTrays,
    pricePerTray: sale.pricePerTray,
    amountPaid: sale.amountPaid,
    datePaid: sale.datePaid || "",
    remarks: sale.remarks || "",
  });

  const isPaidOrPartial =
    sale.paymentStatus === "paid" || sale.paymentStatus === "partial";

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteEggSale(sale.id);

    if (result.success) {
      toast.success("Sale deleted successfully. Inventory reversed.");
      router.refresh();
    } else {
      toast.error("Deletion Failed", { description: result.error });
    }

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gross = formData.quantityTrays * formData.pricePerTray;
    if (formData.amountPaid > gross) {
      toast.error("Invalid Payment Amount", {
        description: `Amount paid (₱${formData.amountPaid.toLocaleString()}) cannot exceed the total gross amount (₱${gross.toLocaleString()}).`,
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Updating sale...");

    const result = await updateEggSale({
      id: sale.id,
      saleDate: formData.saleDate,
      customerId: formData.customerId,
      quantityTrays: formData.quantityTrays,
      pricePerTray: formData.pricePerTray,
      amountPaid: formData.amountPaid,
      datePaid: formData.datePaid || null,
      remarks: formData.remarks || null,
    });

    if (result.success) {
      toast.success("Sale record updated successfully.", { id: toastId });
      setIsEditOpen(false);
      onRowUpdate?.(sale.id);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update sale.", { id: toastId });
    }

    setIsSaving(false);
  };

  const handleNumChange = (field: string, val: string) => {
    const parsed = val === "" ? 0 : Number(val);
    setFormData((prev) => ({ ...prev, [field]: isNaN(parsed) ? 0 : parsed }));
  };

  return (
    <>
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
            className="gap-2 font-medium cursor-pointer text-slate-700 dark:text-slate-300"
            onClick={() =>
              router.push(`/egg-sales/sales/receipt/${sale.invoiceId}`)
            }
          >
            <Printer className="w-4 h-4" /> View Receipt
          </DropdownMenuItem>
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
                saleDate: sale.saleDate,
                customerId: sale.customerId,
                quantityTrays: sale.quantityTrays,
                pricePerTray: sale.pricePerTray,
                amountPaid: sale.amountPaid,
                datePaid: sale.datePaid || "",
                remarks: sale.remarks || "",
              });
              setIsEditOpen(true);
            }}
          >
            <Edit className="w-4 h-4" /> Edit Sale
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "gap-2 font-medium cursor-pointer",
              isAdmin && !isPaidOrPartial
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
              if (isPaidOrPartial) {
                e.preventDefault();
                toast.error("Deletion Restricted", {
                  description:
                    "Cannot delete sales that have payments attached.",
                });
                return;
              }
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete Sale
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
              This will permanently delete this sale for{" "}
              <span className="font-bold text-slate-800 dark:text-white">
                {sale.customerId}
              </span>
              . The sold trays will be returned back to the active bodega
              inventory.
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
              {isDeleting ? "Deleting..." : "Delete Sale"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] sm:w-[95vw] max-h-[90dvh] flex flex-col bg-white dark:bg-[#0d1117] border-slate-200 dark:border-white/10 rounded-xl p-0 overflow-hidden shadow-2xl [&>button]:hidden">
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#0d1117] relative z-10 flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600 dark:text-[#5cabff]" />{" "}
                Edit Sale Record
              </DialogTitle>
              <DialogDescription className="mt-1.5 font-medium text-slate-500 dark:text-white/50 text-sm">
                Modify sale details for{" "}
                <span className="font-bold text-slate-700 dark:text-white">
                  {sale.customerId}
                </span>
                .{" "}
                {isPaidOrPartial
                  ? "Since this sale has payments attached, financial fields are locked."
                  : "Changes to quantities will alter bodega stock!"}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Sale Date
                    </Label>
                    <Popover
                      open={isSaleCalendarOpen}
                      onOpenChange={setIsSaleCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isPaidOrPartial}
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900",
                            !formData.saleDate && "text-muted-foreground",
                            isPaidOrPartial && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          {formData.saleDate ? (
                            format(new Date(formData.saleDate), "MMMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-200 rounded-xl"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            formData.saleDate
                              ? new Date(formData.saleDate)
                              : undefined
                          }
                          defaultMonth={
                            formData.saleDate
                              ? new Date(formData.saleDate)
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              setFormData({
                                ...formData,
                                saleDate: format(date, "yyyy-MM-dd"),
                              });
                              setIsSaleCalendarOpen(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Customer Name
                    </Label>
                    <Input
                      value={formData.customerId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerId: e.target.value.toUpperCase(),
                        })
                      }
                      className="h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Quantity Trays{" "}
                      <span className="text-blue-500">
                        ({sale.classification})
                      </span>
                    </Label>
                    <Input
                      type="number"
                      disabled={isPaidOrPartial}
                      value={
                        formData.quantityTrays === 0 &&
                        formData.quantityTrays.toString() !== "0"
                          ? ""
                          : formData.quantityTrays
                      }
                      onChange={(e) =>
                        handleNumChange("quantityTrays", e.target.value)
                      }
                      onClick={(e) =>
                        !isPaidOrPartial && e.currentTarget.select()
                      }
                      className={cn(
                        "h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-bold",
                        isPaidOrPartial && "opacity-50 cursor-not-allowed",
                      )}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Price Per Tray (₱)
                    </Label>
                    <Input
                      type="number"
                      disabled={isPaidOrPartial}
                      value={
                        formData.pricePerTray === 0 &&
                        formData.pricePerTray.toString() !== "0"
                          ? ""
                          : formData.pricePerTray
                      }
                      onChange={(e) =>
                        handleNumChange("pricePerTray", e.target.value)
                      }
                      onClick={(e) =>
                        !isPaidOrPartial && e.currentTarget.select()
                      }
                      className={cn(
                        "h-11 border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 font-bold",
                        isPaidOrPartial && "opacity-50 cursor-not-allowed",
                      )}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">
                      Remarks
                    </Label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      placeholder="Add any notes here..."
                      className="w-full h-20 p-3 text-sm border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center mt-auto shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
