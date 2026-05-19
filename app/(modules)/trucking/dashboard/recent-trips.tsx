"use client";

import { Truck, MapPin } from "lucide-react";

interface Trip {
  id: number;
  date: string;
  origin: string;
  destination: string;
  rate: number;
  qtyHeads: number;
  tollFees: number;
  dieselCash: number;
  dieselPo: number;
  meals: number;
  roroShip: number;
  salary: number;
  others: number;
  status: string;
  truckId?: number;
}

interface RecentTripsProps {
  trips: Trip[];
  trucksMap: Record<number, string>;
}

const formatPHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export function RecentTrips({ trips, trucksMap }: RecentTripsProps) {
  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-lg p-5 sm:p-6 relative overflow-hidden min-h-[400px] flex flex-col shadow-sm dark:shadow-none">
      {/* Background glows */}
      <div className="absolute -top-16 right-10 w-[220px] h-[220px] rounded-full bg-emerald-500 dark:bg-[#3dff9a] opacity-5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-[200px] h-[200px] rounded-full bg-blue-500 dark:bg-[#5cabff] opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-5">
        <h2 className="font-sans text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Recent Activity
        </h2>
        <p className="text-xs text-slate-500 dark:text-white/40 font-normal">
          Latest logistics operations
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1">
        {trips.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-white/30 text-xs italic">
            No recent trips recorded.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {trips.map((trip) => {
              const gross = trip.rate * trip.qtyHeads;
              const expenses =
                trip.tollFees +
                trip.dieselCash +
                trip.dieselPo +
                trip.meals +
                trip.roroShip +
                trip.salary +
                trip.others;
              const net = gross - expenses;

              const tripDate = new Date(trip.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              const truckName = trucksMap[trip.truckId || 0] || "Unknown";

              return (
                <div
                  key={trip.id}
                  className="flex items-center justify-between px-3.5 py-3 border border-slate-100 dark:border-white/5 rounded-xl bg-transparent transition-all duration-200 cursor-pointer hover:bg-slate-50 hover:border-emerald-200 dark:hover:bg-white/5 dark:hover:border-[#3dff9a]/20"
                >
                  {/* Left side */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#3dff9a]/10 flex items-center justify-center shrink-0">
                      <Truck
                        size={16}
                        className="text-emerald-600 dark:text-[#3dff9a]"
                      />
                    </div>

                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-800 dark:text-white mb-[3px] font-mono">
                        {truckName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-white/40 flex items-center gap-1 m-0">
                        <MapPin
                          size={12}
                          className="text-rose-500 dark:text-[#ff5c8a]"
                        />
                        {trip.destination}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div
                      className={`font-mono text-sm font-semibold ${
                        net >= 0
                          ? "text-emerald-600 dark:text-[#3dff9a]"
                          : "text-rose-600 dark:text-[#ff5c8a]"
                      }`}
                    >
                      {formatPHP(net)}
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-400 dark:text-white/30">
                      {tripDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
