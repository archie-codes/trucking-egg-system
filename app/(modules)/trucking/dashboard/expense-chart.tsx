"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

interface ExpenseData {
  name: string;
  value: number;
  fill: string;
}

interface ExpenseChartProps {
  data: ExpenseData[];
}

const formatPHP = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-[#0a1520]/95 border border-slate-200 dark:border-white/10 rounded-[10px] py-2.5 px-3 shadow-xl backdrop-blur-md flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-0.5">
            {data.name}
          </p>
          <p className="text-[13px] font-semibold text-slate-800 dark:text-white font-mono leading-none">
            {formatPHP(data.value)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ExpenseChart({ data }: ExpenseChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-lg p-5 sm:p-6 h-full flex flex-col relative overflow-hidden shadow-sm dark:shadow-none">
      {/* Background glow matching the rose expense aesthetic */}
      <div className="absolute -top-20 right-[60px] w-[240px] h-[240px] rounded-full bg-rose-500 dark:bg-[#ff5c8a] opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-2">
        <h2 className="font-sans text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Cost Breakdown
        </h2>
        <p className="text-xs text-slate-500 dark:text-white/40 font-normal">
          Operating expenses this month
        </p>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative z-10 min-h-[220px] flex items-center justify-center">
        {mounted && total > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="drop-shadow-sm"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-400 dark:text-white/30">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No expenses logged yet</p>
          </div>
        )}

        {/* Center Total Text */}
        {mounted && total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Total
            </span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-white mt-0.5">
              ₱{(total / 1000).toFixed(1)}k
            </span>
          </div>
        )}
      </div>

      {/* Custom Legend */}
      <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 relative z-10">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {item.name}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-500">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
