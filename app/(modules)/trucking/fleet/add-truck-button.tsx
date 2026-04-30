// app/trucking/fleet/add-truck-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TruckSheet } from "@/components/truck-sheet";

export function AddTruckButton() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsSheetOpen(true)}
        className="relative h-12 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold"
      >
        <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
        <Plus className="w-5 h-5 mr-2 transition-transform group-hover/btn:rotate-90 duration-300" />
        Register Truck
      </Button>

      <TruckSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </>
  );
}
