"use client";

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
import { Egg, Users, DollarSign, Activity } from "lucide-react";

// Mock Data
const salesData = [
  { name: "Mon", sales: 4000, revenue: 2400 },
  { name: "Tue", sales: 3000, revenue: 1398 },
  { name: "Wed", sales: 2000, revenue: 9800 },
  { name: "Thu", sales: 2780, revenue: 3908 },
  { name: "Fri", sales: 1890, revenue: 4800 },
  { name: "Sat", sales: 2390, revenue: 3800 },
  { name: "Sun", sales: 3490, revenue: 4300 },
];

const recentTransactions = [
  {
    id: "INV001",
    customer: "John Doe",
    amount: "$250.00",
    status: "Paid",
    date: "Today",
  },
  {
    id: "INV002",
    customer: "Jane Smith",
    amount: "$150.00",
    status: "Pending",
    date: "Yesterday",
  },
  {
    id: "INV003",
    customer: "Bob Johnson",
    amount: "$350.00",
    status: "Paid",
    date: "2 days ago",
  },
  {
    id: "INV004",
    customer: "Alice Brown",
    amount: "$120.00",
    status: "Failed",
    date: "3 days ago",
  },
];

interface EggDashboardClientProps {
  userName: string;
  avatarUrl?: string | null;
}

export function EggDashboardClient({
  userName,
  avatarUrl,
}: EggDashboardClientProps) {
  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#0d1117] rounded-lg p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-200 dark:border-white/10 dark:shadow-none relative overflow-hidden mb-3">
        {/* Background glows */}
        <div className="absolute -top-16 -left-10 w-[220px] h-[220px] rounded-full bg-orange-500 dark:bg-amber-400 opacity-5 pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[180px] h-[180px] rounded-full bg-yellow-500 dark:bg-yellow-400 opacity-5 pointer-events-none" />

        {/* Left — Avatar + Greeting */}
        <div className="flex items-center gap-3.5 relative z-10">
          <Avatar className="w-[52px] h-[52px] border-[1.5px] border-slate-200 dark:border-white/10 shrink-0 shadow-sm dark:shadow-none">
            <AvatarImage
              src={avatarUrl || ""}
              alt={userName}
              className="object-cover"
            />
            <AvatarFallback className="bg-linear-to-br from-orange-100 to-yellow-100 dark:from-amber-400/15 dark:to-yellow-400/20 text-slate-800 dark:text-white font-sans text-xl font-extrabold">
              {userName ? userName.charAt(0).toUpperCase() : ""}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-sans text-[clamp(17px,2.5vw,20px)] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
              Welcome back,{" "}
              <span className="text-orange-600 dark:text-amber-400">
                {userName}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-white/40 font-normal tracking-[0.01em]">
              Here&apos;s what&apos;s happening with your egg sales today.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: "Total Revenue",
            value: "$45,231.89",
            icon: DollarSign,
            trend: "+20.1% from last month",
          },
          {
            title: "Eggs Sold (Trays)",
            value: "12,450",
            icon: Egg,
            trend: "+15% from last week",
          },
          {
            title: "Active Customers",
            value: "342",
            icon: Users,
            trend: "+12 new today",
          },
          {
            title: "Sales Activity",
            value: "+573",
            icon: Activity,
            trend: "+201 since last hour",
          },
        ].map((metric, idx) => (
          <Card
            key={idx}
            className="border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-lg"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {metric.value}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        <Card className="rounded-lg lg:col-span-4 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Weekly revenue and sales volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full min-w-0 pb-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart
                data={salesData}
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

        <Card className="rounded-lg lg:col-span-3 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none">
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
                            : tx.status === "Pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400"
                              : "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                      {tx.amount}
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
