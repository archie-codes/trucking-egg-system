"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { format, parseISO, subDays } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Separator } from "@/components/ui/separator";
import {
  Egg,
  Users,
  PhilippinePeso,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Wallet,
  DollarSign,
  Bird,
  Activity,
  Boxes,
} from "lucide-react";

type EggSale = {
  id: number;
  invoiceId: string | null;
  saleDate: string;
  customerId: string;
  inventoryId: number;
  classification: string;
  quantityTrays: number;
  pricePerTray: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  datePaid: string | null;
  remarks: string | null;
  createdAt: Date;
};

export type FarmDashboardStats = {
  totalActiveBatches: number;
  currentBirdPopulation: number;
  todayTrays: number;
  todayPieces: number;
  thisMonthExpenses: number;
};

interface EggDashboardClientProps {
  userName: string;
  avatarUrl?: string | null;
  sales?: EggSale[];
  farmStats?: FarmDashboardStats | null;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const formatPHP = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

function AnimatedNumber({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    let startTime: number;
    const startValue = currentRef.current;
    const distance = value - startValue;
    if (distance === 0) return;

    let rafId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / 1000, 1);
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      const nextValue = startValue + distance * easeOut;
      currentRef.current = nextValue;
      setCurrent(nextValue);
      if (percentage < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        currentRef.current = value;
        setCurrent(value);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  if (isCurrency) {
    return <>{formatPHP(current)}</>;
  }
  return <>{Math.round(current)}</>;
}

// ✨ TREND LOGIC HELPER
const renderTrend = (
  trend: number,
  invertColors = false,
  suffix = "vs last mo.",
) => {
  if (trend === 0) {
    return (
      <span className="flex items-center gap-1 text-slate-500 font-medium">
        <Minus size={12} /> 0%{" "}
        {suffix === "vs last mo." ? "this month" : "today"}
      </span>
    );
  }

  const isUp = trend > 0;
  const isGood = invertColors ? !isUp : isUp;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const colorClass = isGood
    ? "text-emerald-600 dark:text-[#3dff9a]"
    : "text-rose-600 dark:text-[#ff5c8a]";

  return (
    <span className={`flex items-center gap-1 font-bold ${colorClass}`}>
      <TrendIcon size={12} strokeWidth={3} />
      {Math.abs(trend).toFixed(1)}%{" "}
      <span className="text-slate-500 font-medium ml-1">{suffix}</span>
    </span>
  );
};

export function EggDashboardClient({
  userName,
  avatarUrl,
  sales = [],
  farmStats,
}: EggDashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date>(new Date());

  // ✨ Compute trends and metrics in client via sales array (Self-contained)
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const todayStr = format(now, "yyyy-MM-dd");
    const yesterdayStr = format(subDays(now, 1), "yyyy-MM-dd");

    let tdGross = 0,
      tdPaid = 0;
    let ydGross = 0,
      ydPaid = 0;

    let tdWhiteTrays = 0,
      tdBrownTrays = 0;
    let ydWhiteTrays = 0,
      ydBrownTrays = 0;

    let cmGross = 0,
      cmPaid = 0,
      cmCount = 0;
    let pmGross = 0,
      pmPaid = 0,
      pmCount = 0;
    let allTimeGross = 0,
      allTimePaid = 0,
      allTimeCount = 0;

    let cmWhiteTrays = 0,
      cmBrownTrays = 0;
    let pmWhiteTrays = 0,
      pmBrownTrays = 0;
    let allTimeWhiteTrays = 0,
      allTimeBrownTrays = 0;

    const cmCustomers = new Set<string>();
    const allTimeCustomers = new Set<string>();

    sales.forEach((s) => {
      const saleDate = new Date(s.saleDate);
      const m = saleDate.getMonth();
      const y = saleDate.getFullYear();

      const gross = s.totalAmount;
      const paid = s.amountPaid;

      allTimeGross += gross;
      allTimePaid += paid;
      allTimeCount += 1;
      allTimeCustomers.add(s.customerId);

      const isBrown = s.classification.toUpperCase().startsWith("BROWN");
      if (isBrown) {
        allTimeBrownTrays += s.quantityTrays;
      } else {
        allTimeWhiteTrays += s.quantityTrays;
      }

      const dStr = format(saleDate, "yyyy-MM-dd");
      if (dStr === todayStr) {
        tdGross += gross;
        tdPaid += paid;
        if (isBrown) tdBrownTrays += s.quantityTrays;
        else tdWhiteTrays += s.quantityTrays;
      } else if (dStr === yesterdayStr) {
        ydGross += gross;
        ydPaid += paid;
        if (isBrown) ydBrownTrays += s.quantityTrays;
        else ydWhiteTrays += s.quantityTrays;
      }

      if (y === currentYear && m === currentMonth) {
        cmGross += gross;
        cmPaid += paid;
        cmCount += 1;
        cmCustomers.add(s.customerId);
        if (isBrown) {
          cmBrownTrays += s.quantityTrays;
        } else {
          cmWhiteTrays += s.quantityTrays;
        }
      } else if (y === prevYear && m === prevMonth) {
        pmGross += gross;
        pmPaid += paid;
        pmCount += 1;
        if (isBrown) {
          pmBrownTrays += s.quantityTrays;
        } else {
          pmWhiteTrays += s.quantityTrays;
        }
      }
    });

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const cmTotalTrays = cmWhiteTrays + cmBrownTrays;
    const pmTotalTrays = pmWhiteTrays + pmBrownTrays;
    const allTimeTotalTrays = allTimeWhiteTrays + allTimeBrownTrays;

    const tdTotalTrays = tdWhiteTrays + tdBrownTrays;
    const ydTotalTrays = ydWhiteTrays + ydBrownTrays;

    return {
      dailyNetIncome: tdPaid,
      dailyNetIncomeTrend: calcTrend(tdPaid, ydPaid),
      dailyGross: tdGross,
      dailyGrossTrend: calcTrend(tdGross, ydGross),
      dailyEggs: tdTotalTrays * 30,
      dailyEggsTrend: calcTrend(tdTotalTrays, ydTotalTrays),
      tdWhiteEggs: tdWhiteTrays * 30,
      tdBrownEggs: tdBrownTrays * 30,

      netIncome: cmPaid, // Collected (This Mo.)
      netIncomeTrend: calcTrend(cmPaid, pmPaid),
      allTimeNet: allTimePaid, // Overall Collected

      totalGross: cmGross, // Gross (This Mo.)
      grossTrend: calcTrend(cmGross, pmGross),
      allTimeGross: allTimeGross, // Overall Gross

      totalEggs: cmTotalTrays * 30, // Actual combined eggs sold (This Mo.)
      eggsTrend: calcTrend(cmTotalTrays, pmTotalTrays),
      cmWhiteEggs: cmWhiteTrays * 30,
      cmBrownEggs: cmBrownTrays * 30,

      allTimeEggs: allTimeTotalTrays * 30, // Overall actual eggs sold
      allTimeWhiteEggs: allTimeWhiteTrays * 30,
      allTimeBrownEggs: allTimeBrownTrays * 30,

      activeCustomers: cmCustomers.size,
      totalCustomers: allTimeCustomers.size || 1,
      totalTrips: cmCount,
      tripsTrend: calcTrend(cmCount, pmCount),
      allTimeTrips: allTimeCount,
    };
  }, [sales]);

  const salesOverviewData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "yyyy-MM-dd");
    });

    const map = new Map<
      string,
      { name: string; sales: number; revenue: number }
    >();
    last7Days.forEach((dateStr) => {
      map.set(dateStr, {
        name: format(parseISO(dateStr), "EEE"), // Mon, Tue...
        sales: 0, // Trays sold
        revenue: 0, // Amount
      });
    });

    sales.forEach((s) => {
      if (map.has(s.saleDate)) {
        const entry = map.get(s.saleDate)!;
        entry.sales += s.quantityTrays;
        entry.revenue += s.totalAmount;
      }
    });

    return Array.from(map.values());
  }, [sales]);

  const recentTransactions = useMemo(() => {
    return sales.slice(0, 5).map((s) => {
      let statusStr = "Pending";
      if (s.paymentStatus === "paid") statusStr = "Paid";
      else if (s.paymentStatus === "unpaid") statusStr = "Unpaid";
      else if (s.paymentStatus === "partial") statusStr = "Partial";

      const balanceAmount = s.totalAmount - s.amountPaid;

      return {
        id: s.id,
        invoiceStr: s.invoiceId || `INV-${s.id}`,
        customer: s.customerId,
        amount: `₱${s.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        formattedPaid: `₱${s.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        balanceAmount,
        formattedBalance: `₱${balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: statusStr,
        date: s.saleDate,
      };
    });
  }, [sales]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = String(hours % 12 || 12).padStart(2, "0");
  const displayMin = String(time.getMinutes()).padStart(2, "0");
  const displaySec = String(time.getSeconds()).padStart(2, "0");

  const overallCards = [
    {
      key: "allTimeNet" as const,
      label: "Overall Collected",
      isCurrency: true,
      bg: "bg-emerald-50/50 dark:bg-[#0a2e1a]/40",
      border: "border-emerald-200/40 dark:border-white/5",
      accentText: "text-emerald-700 dark:text-[#3dff9a]",
      accentBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-emerald-500 dark:bg-[#3dff9a]",
      hideIconBg: "responsive" as const,
      icon: ({
        size,
        isTabletIcon,
      }: {
        size?: number;
        isTabletIcon?: boolean;
        isDesktopIcon?: boolean;
      }) => {
        if (isTabletIcon) return <Wallet size={size} />;
        return (
          <Image
            src="/3dicon/onetincome.png"
            alt="Overall Collected"
            width={130}
            height={130}
            className="absolute max-w-none object-contain drop-shadow-xl opacity-90 z-0 pointer-events-none transition-transform hover:scale-110
                       w-[85px] h-[85px] top-[-20px] right-[-20px] 
                       lg:w-[100px] lg:h-[100px] lg:top-[-20px] lg:right-[-20px]"
          />
        );
      },
      footer: () => (
        <span className="text-slate-500 font-medium flex items-center gap-1.5">
          <Globe size={12} /> All-time record
        </span>
      ),
    },
    {
      key: "allTimeGross" as const,
      label: "Overall Gross Sales",
      isCurrency: true,
      bg: "bg-blue-50/50 dark:bg-[#0d1f3c]/40",
      border: "border-blue-200/40 dark:border-white/5",
      accentText: "text-blue-700 dark:text-[#5cabff]",
      accentBg: "bg-blue-600/10 dark:bg-[#5cabff]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-blue-500 dark:bg-[#5cabff]",
      hideIconBg: "responsive" as const,
      icon: ({
        size,
        isTabletIcon,
      }: {
        size?: number;
        isTabletIcon?: boolean;
        isDesktopIcon?: boolean;
      }) => {
        if (isTabletIcon) return <DollarSign size={size} />;
        return (
          <Image
            src="/3dicon/o-gross.png"
            alt="Overall Gross"
            width={130}
            height={130}
            className="absolute max-w-none object-contain drop-shadow-xl opacity-90 z-0 pointer-events-none transition-transform hover:scale-110
                       w-[85px] h-[85px] top-[-20px] right-[-20px] 
                       lg:w-[100px] lg:h-[100px] lg:top-[-20px] lg:right-[-20px]"
          />
        );
      },
      footer: () => (
        <span className="text-slate-500 font-medium flex items-center gap-1.5">
          <Globe size={12} /> All-time record
        </span>
      ),
    },
    {
      key: "allTimeEggs" as const,
      label: "Overall Eggs Sold",
      isCurrency: false,
      bg: "bg-rose-50/50 dark:bg-[#2d0d1a]/40",
      border: "border-rose-200/40 dark:border-white/5",
      accentText: "text-rose-700 dark:text-[#ff5c8a]",
      accentBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-rose-500 dark:bg-[#ff5c8a]",
      hideIconBg: "responsive" as const,
      icon: ({
        size,
        isTabletIcon,
      }: {
        size?: number;
        isTabletIcon?: boolean;
        isDesktopIcon?: boolean;
      }) => {
        if (isTabletIcon) return <Egg size={size} />;
        return (
          <Image
            src="/3dicon/egg-tray.png"
            alt="Overall Eggs Sold"
            width={130}
            height={130}
            className="absolute max-w-none object-contain drop-shadow-xl opacity-90 z-0 pointer-events-none transition-transform hover:scale-110
                       w-[85px] h-[85px] top-[-20px] right-[-20px] 
                       lg:w-[100px] lg:h-[100px] lg:top-[-20px] lg:right-[-20px]"
          />
        );
      },
      footer: (m: typeof metrics) => (
        <span className="text-slate-500 font-medium">
          White: {m.allTimeWhiteEggs.toLocaleString()} | Brown:{" "}
          {m.allTimeBrownEggs.toLocaleString()} pcs
        </span>
      ),
    },
  ];

  const thisMonthCards = [
    {
      key: "netIncome" as const,
      label: "Monthly Collected",
      isCurrency: true,
      bg: "bg-emerald-50 dark:bg-[#0a2e1a]",
      border: "border-emerald-200/60 dark:border-white/10",
      accentText: "text-emerald-700 dark:text-[#3dff9a]",
      accentBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-emerald-500 dark:bg-[#3dff9a]",
      icon: Wallet,
      footer: (m: typeof metrics) => renderTrend(m.netIncomeTrend, false),
    },
    {
      key: "totalGross" as const,
      label: "Monthly Gross",
      isCurrency: true,
      bg: "bg-blue-50 dark:bg-[#0d1f3c]",
      border: "border-blue-200/60 dark:border-white/10",
      accentText: "text-blue-700 dark:text-[#5cabff]",
      accentBg: "bg-blue-600/10 dark:bg-[#5cabff]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-blue-500 dark:bg-[#5cabff]",
      icon: PhilippinePeso,
      footer: (m: typeof metrics) => renderTrend(m.grossTrend, false),
    },
    {
      key: "totalEggs" as const,
      label: "Monthly Eggs Sold",
      isCurrency: false,
      bg: "bg-rose-50 dark:bg-[#2d0d1a]",
      border: "border-rose-200/60 dark:border-white/10",
      accentText: "text-rose-700 dark:text-[#ff5c8a]",
      accentBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-rose-500 dark:bg-[#ff5c8a]",
      icon: Egg,
      footer: (m: typeof metrics) => (
        <div className="flex flex-col gap-1.5">
          {renderTrend(m.eggsTrend, false)}
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
            White: {m.cmWhiteEggs.toLocaleString()} | Brown:{" "}
            {m.cmBrownEggs.toLocaleString()} pcs
          </div>
        </div>
      ),
    },
  ];

  const dailyCards = [
    {
      key: "dailyNetIncome" as const,
      label: "Daily Collected",
      isCurrency: true,
      bg: "bg-emerald-50 dark:bg-[#0a2e1a]",
      border: "border-emerald-200/60 dark:border-white/10",
      accentText: "text-emerald-700 dark:text-[#3dff9a]",
      accentBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-emerald-500 dark:bg-[#3dff9a]",
      icon: Wallet,
      footer: (m: typeof metrics) =>
        renderTrend(m.dailyNetIncomeTrend, false, "vs yesterday"),
    },
    {
      key: "dailyGross" as const,
      label: "Daily Gross",
      isCurrency: true,
      bg: "bg-blue-50 dark:bg-[#0d1f3c]",
      border: "border-blue-200/60 dark:border-white/10",
      accentText: "text-blue-700 dark:text-[#5cabff]",
      accentBg: "bg-blue-600/10 dark:bg-[#5cabff]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-blue-500 dark:bg-[#5cabff]",
      icon: PhilippinePeso,
      footer: (m: typeof metrics) =>
        renderTrend(m.dailyGrossTrend, false, "vs yesterday"),
    },
    {
      key: "dailyEggs" as const,
      label: "Daily Eggs Sold",
      isCurrency: false,
      bg: "bg-rose-50 dark:bg-[#2d0d1a]",
      border: "border-rose-200/60 dark:border-white/10",
      accentText: "text-rose-700 dark:text-[#ff5c8a]",
      accentBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/12",
      amountText: "text-slate-900 dark:text-white",
      glow: "bg-rose-500 dark:bg-[#ff5c8a]",
      icon: Egg,
      footer: (m: typeof metrics) => (
        <div className="flex flex-col gap-1.5">
          {renderTrend(m.dailyEggsTrend, false, "vs yesterday")}
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
            White: {m.tdWhiteEggs.toLocaleString()} | Brown:{" "}
            {m.tdBrownEggs.toLocaleString()} pcs
          </div>
        </div>
      ),
    },
  ];

  const renderCard = ({
    key,
    label,
    isCurrency,
    bg,
    border,
    accentText,
    accentBg,
    amountText,
    glow,
    icon: Icon,
    footer,
    hideIconBg,
  }: {
    key: string;
    label: string;
    isCurrency: boolean;
    bg: string;
    border: string;
    accentText: string;
    accentBg: string;
    amountText: string;
    glow: string;
    icon: React.ElementType;
    footer: (m: typeof metrics) => React.ReactNode;
    hideIconBg?: boolean | "responsive";
  }) => (
    <div
      key={key}
      className={`rounded-lg p-5 flex flex-col justify-between relative overflow-hidden border ${bg} ${border} transition-transform duration-200 hover:translate-y-[-3px] min-h-[160px] cursor-default`}
    >
      <div
        className={`absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-12 pointer-events-none ${glow}`}
      />

      <div className="relative z-10 font-sans">
        <p
          className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5 relative z-10 ${accentText}`}
        >
          {label}
        </p>
        {(!hideIconBg || hideIconBg === "responsive") && (
          <div
            className={`absolute -top-0.5 right-0 w-[38px] h-[38px] rounded-xl flex items-center justify-center z-10 ${accentBg} ${accentText} ${
              hideIconBg === "responsive" ? "hidden md:flex lg:hidden" : ""
            }`}
          >
            {hideIconBg === "responsive" ? (
              <Icon size={18} isTabletIcon={true} />
            ) : (
              <Icon size={18} />
            )}
          </div>
        )}

        {(hideIconBg === true || hideIconBg === "responsive") && (
          <div
            className={`absolute right-0 top-0 z-0 ${
              hideIconBg === "responsive" ? "block md:hidden lg:block" : ""
            }`}
          >
            {hideIconBg === "responsive" ? (
              <Icon size={18} isDesktopIcon={true} />
            ) : (
              <Icon size={18} />
            )}
          </div>
        )}
        <div
          className={`font-mono text-[17px] font-medium tracking-tight leading-none relative z-10 truncate ${amountText}`}
          title={
            isCurrency
              ? formatPHP(metrics[key as keyof typeof metrics])
              : String(Math.round(metrics[key as keyof typeof metrics]))
          }
        >
          <AnimatedNumber
            value={metrics[key as keyof typeof metrics]}
            isCurrency={isCurrency}
          />
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4 font-sans">
        <div className={`w-full h-[0.5px] mb-2.5 ${accentBg}`} />
        <div className="text-[10px] tracking-[0.04em]">{footer(metrics)}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#0d1117] rounded-lg p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-200 dark:border-white/10 dark:shadow-none relative overflow-hidden mb-3">
        {/* Background glows */}
        <div className="absolute -top-16 -left-10 w-[220px] h-[220px] rounded-full bg-emerald-500 dark:bg-[#3dff9a] opacity-5 pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[180px] h-[180px] rounded-full bg-blue-500 dark:bg-[#5cabff] opacity-5 pointer-events-none" />

        {/* Left — Avatar + Greeting */}
        <div className="flex items-center gap-3.5 relative z-10">
          <Avatar className="w-[52px] h-[52px] border-[1.5px] border-slate-200 dark:border-white/10 shrink-0 shadow-sm dark:shadow-none">
            <AvatarImage
              src={avatarUrl || ""}
              alt={userName}
              className="object-cover"
            />
            <AvatarFallback className="bg-linear-to-br from-emerald-100 to-blue-100 dark:from-[#3dff9a]/15 dark:to-[#5cabff]/20 text-slate-800 dark:text-white font-sans text-xl font-extrabold">
              {userName ? userName.charAt(0).toUpperCase() : ""}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-sans text-[clamp(17px,2.5vw,20px)] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
              Welcome ,{" "}
              <span className="text-emerald-600 dark:text-[#3dff9a]">
                {userName}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-white/40 font-normal tracking-[0.01em]">
              Here&apos;s what&apos;s happening with your egg sales today.
            </p>
          </div>
        </div>

        {/* Right — Date + Clock (Desktop) */}
        <div className="hidden md:flex items-center justify-center md:justify-start gap-4 sm:gap-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[14px] px-4 sm:px-6 py-3 relative z-10 shrink-0 shadow-inner dark:shadow-none w-full md:w-auto">
          {/* Calendar tile */}
          <div className="flex flex-col items-center bg-emerald-50 dark:bg-[#0a2e1a] border border-emerald-200/60 dark:border-[#3dff9a]/15 rounded-[10px] overflow-hidden w-11 shrink-0">
            <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-emerald-700 dark:text-[#3dff9a] bg-emerald-100/80 dark:bg-[#3dff9a]/10 w-full text-center py-[3px]">
              {mounted ? MONTHS[time.getMonth()] : "---"}
            </div>
            <div className="font-mono text-[22px] font-medium text-slate-800 dark:text-white pt-1 pb-[5px] leading-none">
              {mounted ? String(time.getDate()).padStart(2, "0") : "--"}
            </div>
          </div>

          {/* Separator */}
          <div className="w-[0.5px] h-9 bg-slate-200 dark:bg-white/10 shrink-0" />

          {/* Time */}
          <div className="flex flex-col justify-center">
            <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/35 mb-[3px]">
              {mounted ? format(time, "EEEE") : "Loading..."}
            </div>
            <div className="font-mono text-[20px] font-medium text-slate-800 dark:text-white tracking-[-0.02em] leading-none">
              {mounted
                ? `${displayHour}:${displayMin}:${displaySec}`
                : "--:--:--"}
              {mounted && (
                <span className="text-slate-400 dark:text-white/35 text-[13px] ml-1">
                  {ampm}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Simple Date + Clock (Bottom Right) */}
        <div className="md:hidden w-full text-right relative z-10 -mt-2">
          <span className="text-[11px] sm:text-[12px] font-bold text-emerald-600 dark:text-[#3dff9a]">
            {mounted ? format(time, "MMM d, yyyy") : "---"}
          </span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>
          <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {mounted ? format(time, "hh:mm a") : "---"}
          </span>
        </div>
      </div>

      {/* ── SECTION 1: FARM OPERATIONS ── */}
      <div className="space-y-3 mb-6">
        <h2 className="text-[clamp(17px,2.5vw,20px)] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-500" />
          Farm Operations
        </h2>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Active Batches */}
          <Card className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0d1117] p-5 shadow-xs transition-transform duration-200 hover:translate-y-[-3px] relative overflow-hidden">
            <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-15 bg-emerald-500 pointer-events-none" />
            <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-700 dark:text-[#3dff9a]">
                Total Active Batches
              </CardTitle>
              <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-emerald-600/10 dark:bg-[#3dff9a]/12 text-emerald-700 dark:text-[#3dff9a]">
                <Boxes className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="font-mono text-lg font-medium tracking-tight text-slate-900 dark:text-white">
                {farmStats
                  ? farmStats.totalActiveBatches.toLocaleString()
                  : "0"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Active production flocks
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Current Bird Population */}
          <Card className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0d1117] p-5 shadow-xs transition-transform duration-200 hover:translate-y-[-3px] relative overflow-hidden">
            <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-15 bg-blue-500 pointer-events-none" />
            <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold tracking-[0.12em] uppercase text-blue-700 dark:text-[#5cabff]">
                Current Bird Population
              </CardTitle>
              <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-blue-600/10 dark:bg-[#5cabff]/12 text-blue-700 dark:text-[#5cabff]">
                <Bird className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="font-mono text-lg font-medium tracking-tight text-slate-900 dark:text-white">
                {farmStats
                  ? farmStats.currentBirdPopulation.toLocaleString()
                  : "0"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Live bird headcount
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Today's Production */}
          <Card className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0d1117] p-5 shadow-xs transition-transform duration-200 hover:translate-y-[-3px] relative overflow-hidden">
            <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-15 bg-amber-500 pointer-events-none" />
            <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold tracking-[0.12em] uppercase text-amber-700 dark:text-amber-400">
                Today&apos;s Production
              </CardTitle>
              <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-amber-600/10 dark:bg-amber-400/12 text-amber-700 dark:text-amber-400">
                <Egg className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="font-mono text-lg font-medium tracking-tight text-slate-900 dark:text-white">
                {farmStats ? (
                  <>
                    {farmStats.todayTrays.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      trays
                    </span>
                    {farmStats.todayPieces > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 ml-1.5 font-medium">
                        + {farmStats.todayPieces} pcs
                      </span>
                    )}
                  </>
                ) : (
                  "0 trays"
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Total daily egg collection
              </p>
            </CardContent>
          </Card>

          {/* Card 4: This Month's Expenses */}
          <Card className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0d1117] p-5 shadow-xs transition-transform duration-200 hover:translate-y-[-3px] relative overflow-hidden">
            <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-15 bg-rose-500 pointer-events-none" />
            <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold tracking-[0.12em] uppercase text-rose-700 dark:text-[#ff5c8a]">
                This Month&apos;s Expenses
              </CardTitle>
              <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-rose-600/10 dark:bg-[#ff5c8a]/12 text-rose-700 dark:text-[#ff5c8a]">
                <TrendingDown className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="font-mono text-lg font-medium tracking-tight text-slate-900 dark:text-white">
                {farmStats
                  ? `${farmStats.thisMonthExpenses.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "0.00"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Feed & operational costs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── VISUAL DIVIDER ── */}
      <Separator className="my-8 bg-slate-200/80 dark:bg-white/10" />

      {/* ── SECTION 2: EGG SALES & INVENTORY ── */}
      <h2 className="text-[clamp(17px,2.5vw,20px)] font-bold tracking-tight mb-4 text-slate-900 dark:text-white flex items-center gap-2">
        <Egg className="w-6 h-6 text-amber-500" />
        Egg Sales & Inventory
      </h2>

      {/* Metrics Cards — Double Row Layout (Ported from Trucking StatCards) */}
      <div className="space-y-3 font-sans mb-3">
        {/* ROW 2: OVERALL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {overallCards.map(renderCard)}
        </div>
        {/* ROW 1: THIS MONTH METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {thisMonthCards.map(renderCard)}

          {/* Active Customers Card (Included in Row 1 for Balance) */}
          <div className="rounded-lg p-5 flex flex-col justify-between relative overflow-hidden border bg-purple-50 dark:bg-[#160b2e] border-purple-200/60 dark:border-white/10 transition-transform duration-200 hover:translate-y-[-3px] min-h-[160px] cursor-default">
            <div className="absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-12 pointer-events-none bg-purple-500 dark:bg-[#b97aff]" />

            <div className="relative z-10 font-sans">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5 text-purple-700 dark:text-[#b97aff]">
                Active Customers
              </p>
              <div className="absolute -top-0.5 right-0 w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-purple-600/10 dark:bg-[#b97aff]/12 text-purple-700 dark:text-[#b97aff]">
                <Users size={18} />
              </div>
              <div className="flex items-baseline gap-1">
                <div className="font-mono text-[17px] font-medium tracking-tight leading-none text-slate-900 dark:text-white">
                  <AnimatedNumber value={metrics.activeCustomers} />
                </div>
                <div className="font-mono text-[14px] font-medium text-slate-400 dark:text-white/30 ml-0.5">
                  / {metrics.totalCustomers}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-4 font-sans">
              <div className="w-full h-[0.5px] mb-2.5 bg-purple-600/10 dark:bg-[#b97aff]/12" />
              <div className="text-[10px] tracking-[0.04em] text-slate-500 font-medium">
                Overall Sales:{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {metrics.allTimeTrips}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* ROW 3: DAILY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailyCards.map(renderCard)}
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        <Card className="rounded-lg lg:col-span-3 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Weekly revenue and sales volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full min-w-0 pb-4">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <BarChart
                data={salesOverviewData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#888888"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888888", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888888", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-lg lg:col-span-4 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest egg sales records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-white/10">
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-slate-200 dark:border-white/10"
                  >
                    <TableCell className="font-medium">
                      <div className="text-slate-900 dark:text-white">
                        {tx.customer}
                      </div>
                      <div className="text-xs text-slate-500">{tx.date}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          tx.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400"
                            : tx.status === "Partial"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400"
                              : "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                      {tx.balanceAmount > 0 ? (
                        <div className="text-rose-500 font-bold">
                          {tx.formattedBalance}
                        </div>
                      ) : (
                        <div className="text-slate-400 dark:text-slate-500 font-normal">
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                      <div>{tx.amount}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                        Paid: {tx.formattedPaid}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
