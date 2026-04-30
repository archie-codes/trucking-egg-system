// components/truck-sheet.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Truck, Hash, Wrench } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerTruck } from "@/app/actions/truck-actions";

export function TruckSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerTruck(formData);

    if (result.success) {
      toast.success("Truck Registered", {
        description: `${formData.get("fleetCode")} has been added to the fleet.`,
        className:
          "border-emerald-500/30 bg-emerald-50/80 backdrop-blur-md shadow-xl",
      });
      onClose(); // Slide the panel away
    } else {
      toast.error("Registration Failed", { description: result.error });
    }
    setIsSubmitting(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-hidden w-full sm:max-w-md bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-l border-white/20 dark:border-slate-800/50 shadow-2xl p-0 flex flex-col h-full">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-90 z-10" />

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <SheetHeader className="mb-8 mt-2">
            <SheetTitle className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm flex items-center gap-2">
              <Truck className="w-7 h-7 text-blue-600" />
              Register Truck
            </SheetTitle>
            <SheetDescription className="text-base text-slate-500 dark:text-slate-400">
              Add a new hauling asset to the Fhernie Logistics database.
            </SheetDescription>
          </SheetHeader>

          <form
            id="add-truck-form"
            onSubmit={handleSubmit}
            className="space-y-6 pb-10"
          >
            <Field className="space-y-2 group">
              <FieldLabel
                htmlFor="fleetCode"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
              >
                <Hash className="w-4 h-4 text-blue-500" /> Internal Fleet Code
              </FieldLabel>
              <Input
                id="fleetCode"
                name="fleetCode"
                placeholder="e.g., F1"
                required
                className="px-4 rounded-xl uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
              />
            </Field>

            <Field className="space-y-2 group">
              <FieldLabel
                htmlFor="plateNumber"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
              >
                <Hash className="w-4 h-4 text-blue-500" /> Plate Number
              </FieldLabel>
              <Input
                id="plateNumber"
                name="plateNumber"
                placeholder="e.g., TQC 585"
                required
                className="px-4 rounded-xl uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
              />
            </Field>

            <Field className="space-y-2 group">
              <FieldLabel
                htmlFor="status"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
              >
                <Wrench className="w-4 h-4 text-blue-500" /> Current Status
              </FieldLabel>
              <Select name="status" defaultValue="active">
                <SelectTrigger className="h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/50 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl">
                  <SelectItem
                    value="active"
                    className="cursor-pointer text-emerald-600 font-medium hover:bg-slate-100"
                  >
                    Active (Ready for Haul)
                  </SelectItem>
                  <SelectItem
                    value="maintenance"
                    className="cursor-pointer text-amber-600 font-medium hover:bg-slate-100"
                  >
                    Under Maintenance
                  </SelectItem>
                  <SelectItem
                    value="inactive"
                    className="cursor-pointer text-slate-500 font-medium hover:bg-slate-100"
                  >
                    Inactive / Sold
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </form>
        </div>

        {/* Fixed Footer for Save Button */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0">
          <Button
            type="submit"
            form="add-truck-form"
            disabled={isSubmitting}
            className="relative w-full h-14 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all font-bold text-base overflow-hidden group/btn"
          >
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Registering...
              </>
            ) : (
              <>
                <Save className="mr-3 h-5 w-5 transition-transform group-hover/btn:scale-110" />{" "}
                Register Truck
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
