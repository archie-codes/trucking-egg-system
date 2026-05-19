// "use client";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";

// export interface MonthlyData {
//   name: string;
//   netIncome: number;
//   gross: number;
//   expenses: number;
// }

// interface RevenueChartProps {
//   data: MonthlyData[];
// }

// export function RevenueChart({ data }: RevenueChartProps) {
//   const formatPHP = (value: number) =>
//     new Intl.NumberFormat("en-PH", {
//       style: "currency",
//       currency: "PHP",
//       maximumFractionDigits: 0,
//     }).format(value);

//   return (
//     <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg h-full flex flex-col">
//       <CardHeader>
//         <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">
//           Monthly Net Income
//         </CardTitle>
//         <CardDescription className="text-slate-500 font-medium">
//           Financial performance across the current year
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 min-h-[300px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart
//             data={data}
//             margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
//           >
//             <CartesianGrid
//               strokeDasharray="3 3"
//               vertical={false}
//               stroke="#334155"
//               opacity={0.2}
//             />
//             <XAxis
//               dataKey="name"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#64748b" }}
//               dy={10}
//             />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#64748b" }}
//               tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
//               dx={-10}
//             />
//             <Tooltip
//               cursor={{ fill: "transparent" }}
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   const data = payload[0].payload;
//                   return (
//                     <div className="bg-slate-900 dark:bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
//                       <p className="text-slate-300 text-xs font-bold uppercase mb-2">
//                         {data.name}
//                       </p>
//                       <div className="space-y-1">
//                         <p className="text-emerald-400 font-black flex justify-between gap-4">
//                           <span>Net:</span>{" "}
//                           <span>{formatPHP(data.netIncome)}</span>
//                         </p>
//                         <p className="text-blue-400 font-semibold text-xs flex justify-between gap-4">
//                           <span>Gross:</span>{" "}
//                           <span>{formatPHP(data.gross)}</span>
//                         </p>
//                         <p className="text-rose-400 font-semibold text-xs flex justify-between gap-4">
//                           <span>Expenses:</span>{" "}
//                           <span>{formatPHP(data.expenses)}</span>
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
//             <Bar
//               dataKey="netIncome"
//               radius={[6, 6, 0, 0]}
//               fill="url(#colorNet)"
//               maxBarSize={50}
//             />
//             <defs>
//               <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
//                 <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
//               </linearGradient>
//             </defs>
//           </BarChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface MonthlyData {
  name: string;
  netIncome: number;
  gross: number;
  expenses: number;
}

interface RevenueChartProps {
  data: MonthlyData[];
}

const formatPHP = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-[#0a1520]/95 border border-emerald-200/60 dark:border-[#3dff9a]/20 rounded-lg py-2.5 px-3 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 dark:text-[#3dff9a] mb-2">
          {data.name}
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-[#3dff9a] font-mono">
              Net
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-[#3dff9a] font-mono">
              {formatPHP(data.netIncome)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-[#5cabff] font-mono">
              Gross
            </span>
            <span className="text-[11px] font-semibold text-blue-700 dark:text-[#5cabff] font-mono">
              {formatPHP(data.gross)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-[#ff5c8a] font-mono">
              Exp
            </span>
            <span className="text-[11px] font-semibold text-rose-700 dark:text-[#ff5c8a] font-mono">
              {formatPHP(data.expenses)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true; // Default to dark during SSR

  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-lg p-5 sm:p-6 h-full flex flex-col relative overflow-hidden shadow-sm dark:shadow-none">
      {/* Background glows */}
      <div className="absolute -top-20 right-[60px] w-[240px] h-[240px] rounded-full bg-emerald-500 dark:bg-[#3dff9a] opacity-5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 w-[200px] h-[200px] rounded-full bg-blue-500 dark:bg-[#5cabff] opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-5">
        <h2 className="font-sans text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Monthly Net Income
        </h2>
        <p className="text-xs text-slate-500 dark:text-white/40 font-normal">
          Financial performance across the current year
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 relative z-10 min-h-[300px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 35, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isDark ? "#3dff9a" : "#10b981"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor={isDark ? "#3dff9a" : "#10b981"}
                    stopOpacity={0.15}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                opacity={1}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDark ? "rgba(255,255,255,0.35)" : "#64748b",
                  fontFamily: "'DM Mono', monospace",
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDark ? "rgba(255,255,255,0.35)" : "#64748b",
                  fontFamily: "'DM Mono', monospace",
                }}
                tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                dx={-10}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: isDark
                    ? "rgba(61,255,154,0.08)"
                    : "rgba(16,185,129,0.08)",
                  radius: 4,
                }}
              />

              <Bar
                dataKey="netIncome"
                fill="url(#colorNet)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
