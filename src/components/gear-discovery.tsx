"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { GearCard } from "@/components/gear-card";
import {
  getTrendingGear,
  readGearDiscoveryProfile,
  recommendGear,
  type GearDiscoveryProfile,
} from "@/lib/gear-discovery";
import type { Gear } from "@/lib/types";

export function GearDiscovery({ gear }: { gear: Gear[] }) {
  const [profile, setProfile] = useState<GearDiscoveryProfile | null>(null);

  useEffect(() => {
    // Browser history is intentionally loaded after hydration to keep server and client markup consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(readGearDiscoveryProfile());
  }, []);

  if (!gear.length) return null;

  const recommendations = recommendGear(gear, profile ?? { searches: [], viewedGearIds: [], categoryViews: {} });
  const trending = getTrendingGear(gear);
  const hasHistory =
    !!profile && (profile.searches.length > 0 || profile.viewedGearIds.length > 0);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 space-y-14">
      {recommendations.length > 0 && (
        <div>
          <div className="mb-6">
            <p className="tag-label text-rust mb-2 flex items-center gap-2">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Personalized picks
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-forest">Recommended for you</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {hasHistory
                ? "Based on your recent searches and gear views on this device."
                : "Explore a few items and we’ll tailor these picks to your interests."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((item) => (
              <GearCard key={item.id} gear={item} />
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <div className="mb-6">
            <p className="tag-label text-moss mb-2 flex items-center gap-2">
              <TrendingUp aria-hidden="true" className="h-4 w-4" />
              Popular right now
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-forest">Trending gear</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Ranked using review activity, featured listings, and recently added gear.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((item) => (
              <GearCard key={item.id} gear={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
