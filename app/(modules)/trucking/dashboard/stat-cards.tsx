"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Truck,
  DollarSign,
  CreditCard,
  Wallet,
  Minus,
  Globe,
} from "lucide-react";

interface StatCardsProps {
  metrics: {
    totalGross: number;
    grossTrend: number;
    allTimeGross: number;
    totalExpenses: number;
    expensesTrend: number;
    allTimeExpenses: number;
    netIncome: number;
    netIncomeTrend: number;
    allTimeNet: number;
    activeTrucks: number;
    totalTrucks: number;
    totalTrips: number;
    tripsTrend: number;
    allTimeTrips: number;
  };
}

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
  useEffect(() => {
    let startTime: number;
    const startValue = current;
    const distance = value - startValue;
    if (distance === 0) return;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / 1000, 1);
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCurrent(startValue + distance * easeOut);
      if (percentage < 1) requestAnimationFrame(animate);
      else setCurrent(value);
    };
    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (isCurrency) {
    return <>{formatPHP(current)}</>;
  }
  return <>{Math.round(current)}</>;
}

// ✨ TREND LOGIC HELPER
const renderTrend = (trend: number, invertColors = false) => {
  if (trend === 0) {
    return (
      <span className="flex items-center gap-1 text-slate-500 font-medium">
        <Minus size={12} /> 0% this month
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
      <span className="text-slate-500 font-medium ml-1">vs last mo.</span>
    </span>
  );
};

const thisMonthCards = [
  {
    key: "netIncome" as const,
    label: "Net Income (This Mo.)",
    isCurrency: true,
    bg: "bg-emerald-50 dark:bg-[#0a2e1a]",
    border: "border-emerald-200/60 dark:border-white/10",
    accentText: "text-emerald-700 dark:text-[#3dff9a]",
    accentBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/12",
    amountText: "text-slate-900 dark:text-white",
    glow: "bg-emerald-500 dark:bg-[#3dff9a]",
    icon: Wallet,
    footer: (m: StatCardsProps["metrics"]) =>
      renderTrend(m.netIncomeTrend, false),
  },
  {
    key: "totalGross" as const,
    label: "Gross (This Mo.)",
    isCurrency: true,
    bg: "bg-blue-50 dark:bg-[#0d1f3c]",
    border: "border-blue-200/60 dark:border-white/10",
    accentText: "text-blue-700 dark:text-[#5cabff]",
    accentBg: "bg-blue-600/10 dark:bg-[#5cabff]/12",
    amountText: "text-slate-900 dark:text-white",
    glow: "bg-blue-500 dark:bg-[#5cabff]",
    icon: DollarSign,
    footer: (m: StatCardsProps["metrics"]) => renderTrend(m.grossTrend, false),
  },
  {
    key: "totalExpenses" as const,
    label: "Expenses (This Mo.)",
    isCurrency: true,
    bg: "bg-rose-50 dark:bg-[#2d0d1a]",
    border: "border-rose-200/60 dark:border-white/10",
    accentText: "text-rose-700 dark:text-[#ff5c8a]",
    accentBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/12",
    amountText: "text-slate-900 dark:text-white",
    glow: "bg-rose-500 dark:bg-[#ff5c8a]",
    icon: CreditCard,
    footer: (m: StatCardsProps["metrics"]) =>
      renderTrend(m.expensesTrend, true),
  },
];

const overallCards = [
  {
    key: "allTimeNet" as const,
    label: "Overall Net Income",
    isCurrency: true,
    bg: "bg-emerald-50/50 dark:bg-[#0a2e1a]/40",
    border: "border-emerald-200/40 dark:border-white/5",
    accentText: "text-emerald-700 dark:text-[#3dff9a]",
    accentBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/12",
    amountText: "text-slate-900 dark:text-white",
    glow: "bg-emerald-500 dark:bg-[#3dff9a]",
    hideIconBg: "responsive",
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
          alt="Net Income"
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
    label: "Overall Gross",
    isCurrency: true,
    bg: "bg-blue-50/50 dark:bg-[#0d1f3c]/40",
    border: "border-blue-200/40 dark:border-white/5",
    accentText: "text-blue-700 dark:text-[#5cabff]",
    accentBg: "bg-blue-600/10 dark:bg-[#5cabff]/12",
    amountText: "text-slate-900 dark:text-white",
    glow: "bg-blue-500 dark:bg-[#5cabff]",
    // icon: DollarSign,
    hideIconBg: "responsive",
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
          alt="Gross Income"
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
    key: "allTimeExpenses" as const,
    label: "Overall Expenses",
    isCurrency: true,
    bg: "bg-rose-50/50 dark:bg-[#2d0d1a]/40",
    border: "border-rose-200/40 dark:border-white/5",
    accentText: "text-rose-700 dark:text-[#ff5c8a]",
    accentBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/12",
    amountText: "text-slate-900 dark:text-white",
    glow: "bg-rose-500 dark:bg-[#ff5c8a]",
    // icon: CreditCard,
    hideIconBg: "responsive",
    icon: ({
      size,
      isTabletIcon,
    }: {
      size?: number;
      isTabletIcon?: boolean;
      isDesktopIcon?: boolean;
    }) => {
      if (isTabletIcon) return <CreditCard size={size} />;
      return (
        <Image
          src="/3dicon/expenses.png"
          alt="Expenses"
          width={130}
          height={130}
          className="absolute max-w-none object-contain drop-shadow-xl opacity-90 z-0 pointer-events-none transition-transform hover:scale-110
                     w-[85px] h-[85px] top-[-30px] right-[-20px] 
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
];

export function StatCards({ metrics }: StatCardsProps) {
  // Active Assets tailwind classes
  const aaBg = "bg-purple-50 dark:bg-[#160b2e]";
  const aaBorder = "border-purple-200/60 dark:border-white/10";
  const aaAccentText = "text-purple-700 dark:text-[#b97aff]";
  const aaAccentBg = "bg-purple-600/10 dark:bg-[#b97aff]/12";
  const aaAmountText = "text-slate-900 dark:text-white";
  const aaGlow = "bg-purple-500 dark:bg-[#b97aff]";

  // Helper to render standard cards
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any) => (
    <div
      key={key}
      className={`rounded-lg p-5 flex flex-col justify-between relative overflow-hidden border ${bg} ${border} transition-transform duration-200 hover:translate-y-[-3px] min-h-[160px] cursor-default`}
    >
      <div
        className={`absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-12 pointer-events-none ${glow}`}
      />

      <div className="relative z-10">
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
          className={`font-mono text-[17px] font-medium tracking-tight leading-none relative z-10 ${amountText}`}
        >
          <AnimatedNumber
            value={metrics[key as keyof typeof metrics]}
            isCurrency={isCurrency}
          />
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4">
        <div className={`w-full h-[0.5px] mb-2.5 ${accentBg}`} />
        <div className="text-[10px] tracking-[0.04em]">{footer(metrics)}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 font-sans">
      {/* ROW 2: OVERALL METRICS */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {overallCards.map(renderCard)}
      </div>
      {/* ROW 1: THIS MONTH METRICS */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {thisMonthCards.map(renderCard)}

        {/* Active Fleet Card (Included in Row 1 for Balance) */}
        <div
          className={`rounded-lg p-5 flex flex-col justify-between relative overflow-hidden border ${aaBg} ${aaBorder} transition-transform duration-200 hover:translate-y-[-3px] min-h-[160px] cursor-default`}
        >
          <div
            className={`absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-12 pointer-events-none ${aaGlow}`}
          />

          <div className="relative z-10">
            <p
              className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5 ${aaAccentText}`}
            >
              Active Trucks
            </p>
            <div
              className={`absolute -top-0.5 right-0 w-[38px] h-[38px] rounded-xl flex items-center justify-center ${aaAccentBg} ${aaAccentText}`}
            >
              <Truck size={18} />
            </div>
            <div className="flex items-baseline gap-1">
              <div
                className={`font-mono text-[17px] font-medium tracking-tight leading-none ${aaAmountText}`}
              >
                <AnimatedNumber value={metrics.activeTrucks} />
              </div>
              <div className="font-mono text-[14px] font-medium text-slate-400 dark:text-white/30 ml-0.5">
                / {metrics.totalTrucks}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-4">
            <div className={`w-full h-[0.5px] mb-2.5 ${aaAccentBg}`} />
            <div className="text-[10px] tracking-[0.04em] text-slate-500 font-medium">
              Overall Trips:{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {metrics.allTimeTrips}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
