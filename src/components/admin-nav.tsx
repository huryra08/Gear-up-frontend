"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users", href: "/dashboard/admin/users" },
  { label: "Gear", href: "/dashboard/admin/gear" },
  { label: "Categories", href: "/dashboard/admin/categories" },
  { label: "Rentals", href: "/dashboard/admin/rentals" },
 
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-paper">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 flex gap-6 overflow-x-auto">
        {TABS.map((tab) => {
          // Overview only matches the exact root path; every other tab
          // matches its own path and any nested routes under it.
          const active =
            tab.href === "/dashboard/admin"
              ? pathname === "/dashboard/admin"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap py-3 text-sm font-medium border-b-2 transition-colors",
                active ? "border-rust text-rust-deep" : "border-transparent text-ink-soft hover:text-ink"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}