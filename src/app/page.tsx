"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gearApi, categoryApi } from "@/lib/api";
import type { Gear, Category } from "@/lib/types";
import { GearCard } from "@/components/gear-card";
import { GearCardSkeleton } from "@/components/gear-card-skeleton";
import { GearDiscovery } from "@/components/gear-discovery";
import { DigestRecommendations } from "@/components/digest-recommendations";
import { LinkButton } from "@/components/ui/button";
import { ArrowRight, Tent, Bike, Snowflake, Waves } from "lucide-react";

const CATEGORY_ICONS = [Tent, Bike, Snowflake, Waves];

export default function HomePage() {
  const [gear, setGear] = useState<Gear[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gearApi
      .list()
      .then((data) => setGear(data))
      .catch(() => setError("Couldn't load gear right now. Check that the API server is running."));
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  const featured = gear?.filter((g) => g.status === "AVAILABLE").slice(0, 8) ?? [];

  return (
    <div>
      <section className="contour-bg border-b border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <p className="tag-label text-rust mb-4">Trailhead to summit</p>
          <h1 className="font-display text-4xl sm:text-6xl text-forest leading-[1.05] max-w-3xl">
            Rent sports &amp; outdoor gear instantly.
          </h1>
          <p className="mt-6 text-ink-soft max-w-xl text-base sm:text-lg">
            Tents, bikes, skis, kayaks, and more — from local providers who keep their kit trail-ready.
            Book your dates, pay securely, and go.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="/gear" size="lg">
              Browse Gear <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <p className="tag-label text-moss mb-4">Categories</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat, i) => {
              const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
              return (
                <Link
                  key={cat.id}
                  href={`/gear?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 border border-line bg-paper p-6 hover:border-rust transition-colors text-center"
                >
                  <Icon className="h-6 w-6 text-forest" />
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="tag-label text-rust mb-2">In stock now</p>
            <h2 className="font-display text-2xl sm:text-3xl text-forest">Featured Gear</h2>
          </div>
          <Link href="/gear" className="text-sm font-medium hover:text-rust transition-colors hidden sm:block">
            View all &rarr;
          </Link>
        </div>

        {error && <p className="text-rust-deep text-sm">{error}</p>}

        {!gear && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <GearCardSkeleton key={i} />
            ))}
          </div>
        )}

        {gear && featured.length === 0 && (
          <p className="text-ink-soft text-sm">No gear listed yet — check back soon.</p>
        )}

        {featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((g) => (
              <GearCard key={g.id} gear={g} />
            ))}
          </div>
        )}
      </section>

      {gear && <GearDiscovery gear={gear} />}
      {gear && <DigestRecommendations gear={gear} />}
    </div>
  );
}