"use client";

import { useEffect, useState } from "react";
import { adminApi, categoryApi } from "@/lib/api";
import type { DashboardStats, Gear, RentalOrder } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { Users, Package, ClipboardList, Tags } from "lucide-react";
import { analyzeAdminData } from "@/lib/admin-analytics";
import { AdminInsights } from "@/components/admin-insights";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [categoryCountError, setCategoryCountError] = useState<string | null>(null);
  const [orders, setOrders] = useState<RentalOrder[] | null>(null);
  const [gear, setGear] = useState<Gear[] | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.stats().then(setStats).catch(() => setStats({}));
    categoryApi
      .list()
      .then((categories) => setCategoryCount(categories.length))
      .catch(() => setCategoryCountError("Category totals are unavailable."));
    Promise.all([adminApi.allRentals(), adminApi.allGear()])
      .then(([rentalOrders, listedGear]) => {
        setOrders(rentalOrders);
        setGear(listedGear);
      })
      .catch(() => setAnalyticsError("Analytics data could not be loaded. Check admin API access and try refreshing."));
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, href: "/dashboard/admin/users" },
    { label: "Active Gear", value: stats?.totalGear, icon: Package, href: "/dashboard/admin/gear" },
    { label: "Total Rentals", value: stats?.totalRentals, icon: ClipboardList, href: "/dashboard/admin/rentals" },
    {
      label: "Total Categories",
      value: categoryCountError ? "Unavailable" : categoryCount === null ? "—" : categoryCount,
      icon: Tags,
      href: "/dashboard/admin/categories",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <p className="tag-label text-rust mb-2">Admin dashboard</p>
      <h1 className="font-display text-3xl text-forest mb-8">Platform Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border border-line bg-paper p-6">
            <c.icon className="h-6 w-6 text-rust mb-3" />
            <p className="tag-label text-ink-soft mb-1">{c.label}</p>
            <p className="font-display text-3xl text-forest mb-4">
              {String(c.value ?? "—")}
            </p>
            <LinkButton href={c.href} variant="outline" size="sm">
              Manage
            </LinkButton>
          </div>
        ))}
      </div>

      {categoryCountError && <p role="alert" className="mb-4 text-sm text-rust-deep">{categoryCountError}</p>}
      {analyticsError && <p role="alert" className="mb-6 border border-rust/40 bg-rust/5 p-4 text-sm text-rust-deep">{analyticsError}</p>}
      {(!orders || !gear) && !analyticsError && (
        <p className="mb-6 text-sm text-ink-soft">Loading rental and gear analytics…</p>
      )}
      {orders && gear && (
        <AdminInsights analytics={analyzeAdminData(orders, gear)} />
      )}
    </div>
  );
}
