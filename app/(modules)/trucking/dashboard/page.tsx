import { db } from "@/db";
import { truckingTrips, truckingFleet, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { DashboardHeader } from "./dashboard-header";
import { StatCards } from "./stat-cards";
import { RevenueChart, MonthlyData } from "./revenue-chart";
import { RecentTrips } from "./recent-trips";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    const userId = payload.id as number;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  } catch (error) {
    return null;
  }
}

export default async function TruckingDashboardPage() {
  const currentUser = await getCurrentUser();
  const userName = currentUser?.name || "User";
  const avatarUrl = currentUser?.avatarUrl || null;

  // 1. Data Fetching
  const allTrips = await db
    .select()
    .from(truckingTrips)
    .orderBy(desc(truckingTrips.createdAt));

  const allTrucks = await db.select().from(truckingFleet);

  // 2. Compute Top-Level Metrics
  const activeTrucks = allTrucks.filter((t) => t.status === "active").length;
  const totalTrucks = allTrucks.length;
  const totalTrips = allTrips.length;

  let totalGross = 0;
  let totalExpenses = 0;

  allTrips.forEach((trip) => {
    totalGross += trip.rate * trip.qtyHeads;
    totalExpenses +=
      trip.tollFees +
      trip.dieselCash +
      trip.dieselPo +
      trip.meals +
      trip.roroShip +
      trip.salary +
      trip.others;
  });

  const netIncome = totalGross - totalExpenses;

  const metrics = {
    totalGross,
    totalExpenses,
    netIncome,
    activeTrucks,
    totalTrucks,
    totalTrips,
  };

  // 3. Compute Monthly Chart Data
  // Initialize all 12 months for the current year
  const currentYear = new Date().getFullYear();
  const monthMap: Record<string, MonthlyData> = {
    Jan: { name: "Jan", netIncome: 0, gross: 0, expenses: 0 },
    Feb: { name: "Feb", netIncome: 0, gross: 0, expenses: 0 },
    Mar: { name: "Mar", netIncome: 0, gross: 0, expenses: 0 },
    Apr: { name: "Apr", netIncome: 0, gross: 0, expenses: 0 },
    May: { name: "May", netIncome: 0, gross: 0, expenses: 0 },
    Jun: { name: "Jun", netIncome: 0, gross: 0, expenses: 0 },
    Jul: { name: "Jul", netIncome: 0, gross: 0, expenses: 0 },
    Aug: { name: "Aug", netIncome: 0, gross: 0, expenses: 0 },
    Sep: { name: "Sep", netIncome: 0, gross: 0, expenses: 0 },
    Oct: { name: "Oct", netIncome: 0, gross: 0, expenses: 0 },
    Nov: { name: "Nov", netIncome: 0, gross: 0, expenses: 0 },
    Dec: { name: "Dec", netIncome: 0, gross: 0, expenses: 0 },
  };

  allTrips.forEach((trip) => {
    const tripDate = new Date(trip.date);
    if (tripDate.getFullYear() === currentYear) {
      const monthName = tripDate.toLocaleDateString("en-US", {
        month: "short",
      });
      if (monthMap[monthName]) {
        const gross = trip.rate * trip.qtyHeads;
        const expenses =
          trip.tollFees +
          trip.dieselCash +
          trip.dieselPo +
          trip.meals +
          trip.roroShip +
          trip.salary +
          trip.others;

        monthMap[monthName].gross += gross;
        monthMap[monthName].expenses += expenses;
        monthMap[monthName].netIncome += gross - expenses;
      }
    }
  });

  const chartData = Object.values(monthMap);

  // 4. Compute Recent Trips (Top 5)
  const recentTrips = allTrips.slice(0, 5);
  const trucksMap = allTrucks.reduce(
    (acc, truck) => {
      acc[truck.id] = truck.fleetCode;
      return acc;
    },
    {} as Record<number, string>,
  );

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-300">
      <DashboardHeader userName={userName} avatarUrl={avatarUrl} />

      <StatCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 min-h-[400px]">
          <RevenueChart data={chartData} />
        </div>
        <div className="col-span-1 min-h-[400px]">
          <RecentTrips trips={recentTrips} trucksMap={trucksMap} />
        </div>
      </div>
    </div>
  );
}
