"use client";

import React, { useMemo, useState } from "react";
import {
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Banknote,
  TrendingUp,
  PackageOpen,
  AlertCircle,
  Clock,
  MoreVertical,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Assuming EggSaleRecord shape matches the schema
type EggSaleRecord = {
  id: number;
  saleDate: string; // YYYY-MM-DD
  customerId: string;
  classification: string;
  quantityTrays: number;
  pricePerTray: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
};

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

// Custom Tooltip for Recharts
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl text-slate-200">
        <p className="font-bold text-white mb-2 pb-2 border-b border-slate-700">
          {label}
        </p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm my-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span className="font-bold text-white ml-auto">
              {entry.name.includes("Sales") ||
              entry.name.includes("Paid") ||
              entry.name.includes("Balance")
                ? `₱${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SummaryDashboard({
  data,
}: {
  data: EggSaleRecord[];
  isAdmin: boolean;
}) {
  const [timeframe, setTimeframe] = useState<"daily" | "monthly" | "yearly">(
    "monthly",
  );

  // Aggregation Logic
  const aggregatedData = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        displayDate: string;
        totalTrays: number;
        grossSales: number;
        amountPaid: number;
        balance: number;
      }
    >();

    data.forEach((sale) => {
      const date = parseISO(sale.saleDate);
      let key = "";
      let displayDate = "";

      if (timeframe === "daily") {
        key = format(startOfDay(date), "yyyy-MM-dd");
        displayDate = format(date, "MMM dd, yyyy");
      } else if (timeframe === "monthly") {
        key = format(startOfMonth(date), "yyyy-MM");
        displayDate = format(date, "MMMM yyyy");
      } else if (timeframe === "yearly") {
        key = format(startOfYear(date), "yyyy");
        displayDate = format(date, "yyyy");
      }

      if (!map.has(key)) {
        map.set(key, {
          key,
          displayDate,
          totalTrays: 0,
          grossSales: 0,
          amountPaid: 0,
          balance: 0,
        });
      }

      const current = map.get(key);
      if (current) {
        current.totalTrays += sale.quantityTrays;
        current.grossSales += sale.totalAmount;
        current.amountPaid += sale.amountPaid;
        current.balance += sale.totalAmount - sale.amountPaid;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [data, timeframe]);

  // Totals for KPI Cards
  const totals = useMemo(() => {
    return aggregatedData.reduce(
      (acc, curr) => {
        acc.trays += curr.totalTrays;
        acc.gross += curr.grossSales;
        acc.paid += curr.amountPaid;
        acc.balance += curr.balance;
        return acc;
      },
      { trays: 0, gross: 0, paid: 0, balance: 0 },
    );
  }, [aggregatedData]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Sales & Income Summary (${timeframe})`, 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [
        ["Period", "Trays Dispatched", "Gross Sales", "Amount Paid", "Balance"],
      ],
      body: aggregatedData.map((row) => [
        row.displayDate,
        row.totalTrays.toLocaleString(),
        `P${row.grossSales.toLocaleString()}`,
        `P${row.amountPaid.toLocaleString()}`,
        `P${row.balance.toLocaleString()}`,
      ]),
    });

    doc.save(`sales_summary_${timeframe}.pdf`);
  };

  return (
    <div className="flex flex-col gap-3 pb-8">
      {/* Top Controls */}
      <div className="flex justify-between items-center">
        {/* Timeframe Tabs */}
        <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-lg w-max border border-slate-200 dark:border-slate-800">
          {(["daily", "monthly", "yearly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300",
                timeframe === t
                  ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-500 dark:text-slate-400">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={exportToPDF}
              className="cursor-pointer gap-2"
            >
              <FileDown className="w-4 h-4" />
              Download as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" aria-hidden />
            Gross Sales
          </div>
          <div className="min-w-0">
            <p
              className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none truncate"
              title={`₱${totals.gross.toLocaleString()}`}
            >
              <span className="text-emerald-500 text-xl mr-1">₱</span>
              {totals.gross.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 truncate">
              Total invoiced amount
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
            <Banknote className="w-3.5 h-3.5 text-teal-500" aria-hidden />
            Net Collections
          </div>
          <div className="min-w-0">
            <p
              className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none truncate"
              title={`₱${totals.paid.toLocaleString()}`}
            >
              <span className="text-teal-500 text-xl mr-1">₱</span>
              {totals.paid.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 truncate">
              Total cash received
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" aria-hidden />
            Outstanding Balance
          </div>
          <div className="min-w-0">
            <p
              className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none truncate"
              title={`₱${totals.balance.toLocaleString()}`}
            >
              <span className="text-rose-500 text-xl mr-1">₱</span>
              {totals.balance.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 truncate">
              Unpaid receivables
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-500 uppercase tracking-widest mb-4">
            <PackageOpen className="w-3.5 h-3.5 text-blue-500" aria-hidden />
            Trays Dispatched
          </div>
          <div className="min-w-0">
            <p
              className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none truncate"
              title={totals.trays.toLocaleString()}
            >
              {totals.trays.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 truncate">
              Total physical inventory sold
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Financial Area Chart */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Income vs Receivables
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Financial trend over time
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={aggregatedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Area
                  type="monotone"
                  dataKey="amountPaid"
                  name="Amount Paid"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPaid)"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Outstanding Balance"
                  stroke="#e11d48"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Bar Chart */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Physical Outbound
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total trays dispatched
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aggregatedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalTrays"
                  name="Trays Dispatched"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Breakdown List
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            Aggregated by {timeframe}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4 text-right">Trays Dispatched</th>
                <th className="px-6 py-4 text-right">Gross Sales</th>
                <th className="px-6 py-4 text-right">Amount Paid</th>
                <th className="px-6 py-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {aggregatedData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {row.displayDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {row.totalTrays.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-600 dark:text-slate-300">
                    ₱{row.grossSales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                    ₱{row.amountPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {row.balance > 0 ? `₱${row.balance.toLocaleString()}` : "0"}
                  </td>
                </tr>
              ))}
              {aggregatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
