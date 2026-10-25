import type { Gear, RentalOrder } from "@/lib/types";

export interface AdminAnalyticsMetrics {
  last30DaysRentals: number;
  previous30DaysRentals: number;
  paidRevenueLast30Days: number;
  totalPaidRevenue: number;
  activeRentersLast30Days: number;
  repeatRenters: number;
  overdueRentals: number;
  failedPayments: number;
  cancellationRatePercent: number;
  unavailableGearPercent: number;
  topGear: Array<{ name: string; rentals: number }>;
}

export interface AdminAnalytics {
  metrics: AdminAnalyticsMetrics;
  monthlyTrend: Array<{ label: string; rentals: number; paidRevenue: number }>;
  topGear: Array<{ id: string; name: string; rentals: number }>;
  topRenters: Array<{ id: string; name: string; rentals: number }>;
  predictions: string[];
  anomalies: Array<{ severity: "high" | "medium"; title: string; detail: string }>;
}

function validDate(value: string): number | null {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function amount(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function moneyLabel(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function analyzeAdminData(
  orders: RentalOrder[],
  gear: Gear[],
  now = new Date()
): AdminAnalytics {
  const currentPeriodStart = now.getTime() - 30 * 86_400_000;
  const previousPeriodStart = now.getTime() - 60 * 86_400_000;
  const gearById = new Map(gear.map((item) => [item.id, item]));
  const userRentalCounts = new Map<string, number>();
  const renterNames = new Map<string, string>();
  const gearRentalCounts = new Map<string, number>();
  const categoryRentalCounts = new Map<string, number>();
  const dailyRentalCounts = new Map<string, number>();
  const monthly = new Map<string, { rentals: number; paidRevenue: number }>();
  let last30DaysRentals = 0;
  let previous30DaysRentals = 0;
  let paidRevenueLast30Days = 0;
  let totalPaidRevenue = 0;
  let overdueRentals = 0;
  let failedPayments = 0;
  let cancelledRentals = 0;
  let recentCancelledRentals = 0;
  let recentOrders = 0;
  const activeRenterIds = new Set<string>();

  for (const order of orders) {
    const createdAt = validDate(order.createdAt);
    if (order.status === "OVERDUE") overdueRentals += 1;
    if (order.paymentStatus === "FAILED") failedPayments += 1;
    if (order.status === "CANCELLED") cancelledRentals += 1;
    if (order.customerId) {
      userRentalCounts.set(order.customerId, (userRentalCounts.get(order.customerId) ?? 0) + 1);
      if (order.customer?.name) renterNames.set(order.customerId, order.customer.name);
    }

    if (createdAt !== null) {
      const createdDate = new Date(createdAt);
      const month = monthKey(createdDate);
      const monthStats = monthly.get(month) ?? { rentals: 0, paidRevenue: 0 };
      monthStats.rentals += 1;
      monthly.set(month, monthStats);
      if (createdAt >= currentPeriodStart) {
        const dayKey = createdDate.toISOString().slice(0, 10);
        dailyRentalCounts.set(dayKey, (dailyRentalCounts.get(dayKey) ?? 0) + 1);
      }

      if (createdAt >= currentPeriodStart) {
        last30DaysRentals += 1;
        recentOrders += 1;
        if (order.customerId) activeRenterIds.add(order.customerId);
        if (order.status === "CANCELLED") recentCancelledRentals += 1;
      } else if (createdAt >= previousPeriodStart) {
        previous30DaysRentals += 1;
      }

      if (order.paymentStatus === "COMPLETED") {
        const paid = amount(order.totalAmount);
        totalPaidRevenue += paid;
        monthStats.paidRevenue += paid;
        if (createdAt >= currentPeriodStart) paidRevenueLast30Days += paid;
      }
    }

    for (const item of order.items ?? []) {
      const count = Math.max(1, Number(item.quantity) || 1);
      gearRentalCounts.set(item.gearId, (gearRentalCounts.get(item.gearId) ?? 0) + count);
      const categoryId = item.gear?.categoryId ?? gearById.get(item.gearId)?.categoryId;
      if (categoryId) {
        categoryRentalCounts.set(categoryId, (categoryRentalCounts.get(categoryId) ?? 0) + count);
      }
    }
  }

  const topGear = [...gearRentalCounts.entries()]
    .map(([id, rentals]) => ({
      id,
      name: gearById.get(id)?.name ?? orders.flatMap((order) => order.items ?? []).find((item) => item.gearId === id)?.gear?.name ?? "Gear listing",
      rentals,
    }))
    .sort((a, b) => b.rentals - a.rentals)
    .slice(0, 5);
  const topRenters = [...userRentalCounts.entries()]
    .map(([id, rentals]) => ({ id, name: renterNames.get(id) ?? "Customer", rentals }))
    .sort((a, b) => b.rentals - a.rentals)
    .slice(0, 5);

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(date);
    const data = monthly.get(key) ?? { rentals: 0, paidRevenue: 0 };
    return {
      label: date.toLocaleDateString(undefined, { month: "short" }),
      rentals: data.rentals,
      paidRevenue: data.paidRevenue,
    };
  });

  const unavailableGearCount = gear.filter(
    (item) => item.status === "MAINTENANCE" || item.status === "UNAVAILABLE"
  ).length;
  const unavailableGearPercent =
    gear.length > 0 ? Math.round((unavailableGearCount / gear.length) * 100) : 0;
  const cancellationRatePercent =
    orders.length > 0 ? Math.round((cancelledRentals / orders.length) * 100) : 0;
  const repeatRenters = [...userRentalCounts.values()].filter((count) => count > 1).length;
  const topCategory = [...categoryRentalCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory
    ? gearById.get(gear.find((item) => item.categoryId === topCategory[0])?.id ?? "")?.category?.name
    : undefined;

  const predictions: string[] = [];
  if (repeatRenters > 0) {
    predictions.push(
      `${repeatRenters} renter${repeatRenters === 1 ? "" : "s"} have booked more than once; consider a returning-renter update or loyalty offer.`
    );
  }
  if (topCategory) {
    predictions.push(
      `Rental history is strongest in ${topCategoryName ?? "one gear category"}; review availability in that category before the next busy period.`
    );
  }
  if (last30DaysRentals > previous30DaysRentals) {
    predictions.push(
      "Rental activity is above the previous 30-day period; check provider inventory and support capacity."
    );
  } else if (last30DaysRentals < previous30DaysRentals) {
    predictions.push(
      "Rental activity is below the previous 30-day period; review listing availability and recent customer feedback."
    );
  }

  const anomalies: AdminAnalytics["anomalies"] = [];
  const dailyTotals = Array.from({ length: 30 }, (_, daysAgo) => {
    const day = new Date(now.getTime() - daysAgo * 86_400_000).toISOString().slice(0, 10);
    return dailyRentalCounts.get(day) ?? 0;
  });
  const last7DayTotal = dailyTotals.slice(0, 7).reduce((total, count) => total + count, 0);
  const previous23DayAverage =
    dailyTotals.slice(7).reduce((total, count) => total + count, 0) / 23;
  if (
    last7DayTotal >= 5 &&
    last7DayTotal / 7 > Math.max(previous23DayAverage * 2.5, previous23DayAverage + 1)
  ) {
    anomalies.push({
      severity: "medium",
      title: "Rental activity spike",
      detail: `The last 7 days averaged ${Math.round((last7DayTotal / 7) * 10) / 10} rentals per day, above the prior 23-day average of ${Math.round(previous23DayAverage * 10) / 10}.`,
    });
  }
  if (overdueRentals > 0) {
    anomalies.push({
      severity: "high",
      title: `${overdueRentals} overdue rental${overdueRentals === 1 ? "" : "s"}`,
      detail: "Review these orders and coordinate follow-up with the provider and renter.",
    });
  }
  if (failedPayments > 0) {
    anomalies.push({
      severity: "high",
      title: `${failedPayments} failed payment${failedPayments === 1 ? "" : "s"}`,
      detail: "Check payment status and follow up through the normal support process.",
    });
  }
  if (recentOrders >= 4 && recentCancelledRentals / recentOrders >= 0.25) {
    anomalies.push({
      severity: "medium",
      title: "Elevated recent cancellation rate",
      detail: `${Math.round((recentCancelledRentals / recentOrders) * 100)}% of rentals created in the last 30 days were cancelled.`,
    });
  }
  if (gear.length >= 5 && unavailableGearPercent >= 30) {
    anomalies.push({
      severity: "medium",
      title: "Large share of gear is unavailable",
      detail: `${unavailableGearPercent}% of listed gear is not currently marked available.`,
    });
  }

  return {
    metrics: {
      last30DaysRentals,
      previous30DaysRentals,
      paidRevenueLast30Days,
      totalPaidRevenue,
      activeRentersLast30Days: activeRenterIds.size,
      repeatRenters,
      overdueRentals,
      failedPayments,
      cancellationRatePercent,
      unavailableGearPercent,
      topGear: topGear.map(({ name, rentals }) => ({ name, rentals })),
    },
    monthlyTrend,
    topGear,
    topRenters,
    predictions,
    anomalies,
  };
}

export { moneyLabel };
