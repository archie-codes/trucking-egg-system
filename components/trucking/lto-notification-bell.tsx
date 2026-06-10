"use client";

import { useEffect, useState, useMemo } from "react";
import { Bell, AlertTriangle, CalendarX2 } from "lucide-react";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLtoAlerts } from "@/app/actions/truck-actions";

export function LtoNotificationBell() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      const result = await getLtoAlerts();
      if (result.success && result.data) {
        setAlerts(result.data);
      }
    }
    fetchAlerts();

    // Optional: Refresh alerts every hour
    const interval = setInterval(fetchAlerts, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const actualAlerts = useMemo(() => {
    const today = startOfDay(new Date());
    const targetDate = addDays(today, 7);
    return alerts.flatMap((truck) => {
      const alertsList = [];
      if (truck.ltoExpiry) {
        const ltoDate = new Date(truck.ltoExpiry);
        if (ltoDate <= targetDate) {
          alertsList.push({ ...truck, type: "LTO", date: ltoDate });
        }
      }
      if (truck.baiExpiry) {
        const baiDate = new Date(truck.baiExpiry);
        if (baiDate <= targetDate) {
          alertsList.push({ ...truck, type: "BAI", date: baiDate });
        }
      }
      return alertsList;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [alerts]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Bell className="h-5 w-5" />

          {/* Red Ping Dot if there are alerts */}
          {actualAlerts.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-slate-900"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-72 sm:w-80 md:w-96 p-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-200"
      >
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Fleet Expiry Alerts
          </h4>
          <Badge
            variant="secondary"
            className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-0"
          >
            {actualAlerts.length > 0 ? "Action Needed" : "0 Alerts"}
          </Badge>
        </div>

        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {actualAlerts.length === 0 ? (
            <div className="py-8 text-center px-4">
              <CalendarX2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">
                All fleets are up to date.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                No LTO or BAI renewals needed within 7 days.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {actualAlerts.map((alert, index) => {
                const today = startOfDay(new Date());
                const isExpired = isBefore(alert.date, today);

                return (
                  <div
                    key={`${alert.id}-${alert.type}-${index}`}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3"
                  >
                    <div
                      className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${isExpired ? "bg-rose-500" : "bg-amber-500"}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {alert.fleetCode}{" "}
                        <span className="font-normal text-slate-500">-</span>{" "}
                        <span className="font-mono">{alert.plateNumber}</span>
                      </p>
                      <p
                        className={`text-xs mt-0.5 font-medium ${isExpired ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}
                      >
                        <span className="font-bold">{alert.type}</span> {isExpired ? "Expired on: " : "Expiring on: "}
                        {format(alert.date, "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
