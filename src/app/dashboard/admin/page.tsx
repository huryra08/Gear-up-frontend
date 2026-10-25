"use client";

import { useEffect, useState } from "react";
import { adminApi, categoryApi } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { Users, Package, ClipboardList, Tags } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [categoryCountError, setCategoryCountError] = useState(false);

  useEffect(() => {
    adminApi.stats().then(setStats).catch(() => setStats({}));
    categoryApi
      .list()
      .then((categories) => setCategoryCount(categories.length))
      .catch(() => setCategoryCountError(true));
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
    </div>
  );
}
