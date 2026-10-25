"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import {
  recommendGear,
  readGearDiscoveryProfile,
  type GearDiscoveryProfile,
} from "@/lib/gear-discovery";
import type { Gear } from "@/lib/types";

export function DigestRecommendations({ gear }: { gear: Gear[] }) {
  const [digest, setDigest] = useState<{ recommendations: Gear[]; hasActivity: boolean } | null>(null);

  useEffect(() => {
    // Use local interests only; this preview does not subscribe or send email.
    const profile: GearDiscoveryProfile = readGearDiscoveryProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDigest({
      recommendations: recommendGear(gear, profile, 3),
      hasActivity: profile.searches.length > 0 || profile.viewedGearIds.length > 0,
    });
  }, [gear]);

  const recommendations = digest?.recommendations ?? [];
  if (recommendations.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14">
      <div className="border border-line bg-paper p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="tag-label mb-2 flex items-center gap-2 text-moss">
              <Mail aria-hidden="true" className="h-4 w-4" />
              Personalized digest preview
            </p>
            <h2 className="font-display text-2xl text-forest">Gear and stories for your next adventure</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              {digest?.hasActivity
                ? "A local preview based on your GearUp searches and gear views."
                : "A preview of popular gear to help you get started."}{" "}
              Email delivery is not configured.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-rust hover:text-rust-deep"
          >
            Explore stories <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {recommendations.map((item) => (
            <Link
              key={item.id}
              href={`/gear/${item.id}`}
              className="border border-line bg-canvas px-4 py-3 transition-colors hover:border-rust"
            >
              <span className="tag-label text-moss">{item.category?.name ?? "Gear"}</span>
              <span className="mt-1 block font-medium text-forest">{item.name}</span>
              <span className="mt-1 block text-xs text-ink-soft">Suggested gear</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
