"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Truck,
  DollarSign,
  CreditCard,
  Wallet,
} from "lucide-react";

interface StatCardsProps {
  metrics: {
    totalGross: number;
    totalExpenses: number;
    netIncome: number;
    activeTrucks: number;
    totalTrucks: number;
    totalTrips: number;
  };
}

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

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(value);
      }
    };

    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  if (isCurrency) {
    return (
      <>
        {new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          maximumFractionDigits: 0,
        }).format(current)}
      </>
    );
  }

  return <>{Math.round(current)}</>;
}

const cardConfig = [
  {
    key: "netIncome" as const,
    label: "Net Income",
    isCurrency: true,
    bg: "bg-emerald-50 dark:bg-[#0a2e1a]",
    border: "border-emerald-200/60 dark:border-white/10",
    accentText: "text-emerald-700 dark:text-[#3dff9a]",
    accentBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/12",
    amountText: "text-slate-900 dark:text-white",
    footerPillBg: "bg-emerald-600/10 dark:bg-[#3dff9a]/10",
    footerPillText: "text-emerald-800 dark:text-[#3dff9a]/90",
    glow: "bg-emerald-500 dark:bg-[#3dff9a]",
    icon: Wallet,
    footer: (metrics: StatCardsProps["metrics"]) => (
      <>
        <TrendingUp size={12} />
        <AnimatedNumber value={metrics.totalTrips} /> total trips
      </>
    ),
  },
  {
    key: "totalGross" as const,
    label: "Total Gross",
    isCurrency: true,
    bg: "bg-blue-50 dark:bg-[#0d1f3c]",
    border: "border-blue-200/60 dark:border-white/10",
    accentText: "text-blue-700 dark:text-[#5cabff]",
    accentBg: "bg-blue-600/10 dark:bg-[#5cabff]/12",
    amountText: "text-slate-900 dark:text-white",
    footerPillBg: "bg-blue-600/10 dark:bg-[#5cabff]/10",
    footerPillText: "text-blue-800 dark:text-[#5cabff]/90",
    glow: "bg-blue-500 dark:bg-[#5cabff]",
    icon: DollarSign,
    footer: () => <>All combined revenue</>,
  },
  {
    key: "totalExpenses" as const,
    label: "Total Expenses",
    isCurrency: true,
    bg: "bg-rose-50 dark:bg-[#2d0d1a]",
    border: "border-rose-200/60 dark:border-white/10",
    accentText: "text-rose-700 dark:text-[#ff5c8a]",
    accentBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/12",
    amountText: "text-slate-900 dark:text-white",
    footerPillBg: "bg-rose-600/10 dark:bg-[#ff5c8a]/10",
    footerPillText: "text-rose-800 dark:text-[#ff5c8a]/90",
    glow: "bg-rose-500 dark:bg-[#ff5c8a]",
    icon: CreditCard,
    footer: () => <>Operational costs</>,
  },
];

export function StatCards({ metrics }: StatCardsProps) {
  // Active Assets tailwind classes
  const aaBg = "bg-purple-50 dark:bg-[#160b2e]";
  const aaBorder = "border-purple-200/60 dark:border-white/10";
  const aaAccentText = "text-purple-700 dark:text-[#b97aff]";
  const aaAccentBg = "bg-purple-600/10 dark:bg-[#b97aff]/12";
  const aaAmountText = "text-slate-900 dark:text-white";
  const aaFooterPillBg = "bg-purple-600/10 dark:bg-[#b97aff]/10";
  const aaFooterPillText = "text-purple-800 dark:text-[#b97aff]/90";
  const aaGlow = "bg-purple-500 dark:bg-[#b97aff]";

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 font-sans">
      {/* Metric Cards */}
      {cardConfig.map(
        ({
          key,
          label,
          isCurrency,
          bg,
          border,
          accentText,
          accentBg,
          amountText,
          footerPillBg,
          footerPillText,
          glow,
          icon: Icon,
          footer,
        }) => (
          <div
            key={key}
            className={`rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border ${bg} ${border} transition-transform duration-200 hover:translate-y-[-3px] min-h-[172px] cursor-default`}
          >
            {/* Background glows */}
            <div
              className={`absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-12 pointer-events-none ${glow}`}
            />
            <div
              className={`absolute -bottom-10 -left-5 w-[80px] h-[80px] rounded-full opacity-5 dark:opacity-10 pointer-events-none ${glow}`}
            />

            {/* Top section */}
            <div className="relative z-10">
              <p
                className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5 ${accentText}`}
              >
                {label}
              </p>

              {/* Icon box */}
              <div
                className={`absolute -top-0.5 right-0 w-[38px] h-[38px] rounded-xl flex items-center justify-center ${accentBg} ${accentText}`}
              >
                <Icon size={18} />
              </div>

              {/* Amount */}
              <div
                className={`font-mono text-[22px] font-medium tracking-tight leading-none ${amountText}`}
              >
                <AnimatedNumber value={metrics[key]} isCurrency={isCurrency} />
              </div>
            </div>

            {/* Bottom section */}
            <div className="relative z-10 mt-auto pt-4">
              <div className={`w-full h-[0.5px] mb-2.5 ${accentBg}`} />
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full tracking-[0.04em] ${footerPillBg} ${footerPillText}`}
              >
                {footer(metrics)}
              </span>
            </div>
          </div>
        ),
      )}

      {/* Active Fleet Card */}
      <div
        className={`rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border ${aaBg} ${aaBorder} transition-transform duration-200 hover:translate-y-[-3px] min-h-[172px] cursor-default`}
      >
        <div
          className={`absolute -top-7 -right-7 w-[100px] h-[100px] rounded-full opacity-10 dark:opacity-12 pointer-events-none ${aaGlow}`}
        />
        <div
          className={`absolute -bottom-10 -left-5 w-[80px] h-[80px] rounded-full opacity-5 dark:opacity-10 pointer-events-none ${aaGlow}`}
        />

        <div className="relative z-10">
          <p
            className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5 ${aaAccentText}`}
          >
            Active Assets
          </p>

          <div
            className={`absolute -top-0.5 right-0 w-[38px] h-[38px] rounded-xl flex items-center justify-center ${aaAccentBg} ${aaAccentText}`}
          >
            <Truck size={18} />
          </div>

          <div className="flex items-baseline gap-1">
            <div
              className={`font-mono text-[22px] font-medium tracking-tight leading-none ${aaAmountText}`}
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
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full tracking-[0.04em] ${aaFooterPillBg} ${aaFooterPillText}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${aaGlow}`}
            />
            Currently deployed
          </span>
        </div>
      </div>
    </div>
  );
}
