"use client";

import { usePathname } from "next/navigation";

export function HeaderTitle() {
  const pathname = usePathname();
  const isFarmOperations = pathname.startsWith("/egg-sales/farm-operations");

  return (
    <span className="font-bold text-[18px] tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 hidden sm:inline-block">
      {isFarmOperations ? "Farm Operations" : "Egg Sales Inventory"}
    </span>
  );
}
