import type { Gear } from "@/lib/types";

const STORAGE_KEY = "gearup_discovery_v1";

export interface GearDiscoveryProfile {
  searches: string[];
  viewedGearIds: string[];
  categoryViews: Record<string, number>;
}

const emptyProfile = (): GearDiscoveryProfile => ({
  searches: [],
  viewedGearIds: [],
  categoryViews: {},
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readGearDiscoveryProfile(): GearDiscoveryProfile {
  if (typeof window === "undefined") return emptyProfile();

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("GearUp discovery history is unavailable in this browser.", error);
    return emptyProfile();
  }
  if (!raw) return emptyProfile();

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    console.error("Couldn't read GearUp discovery history.", error);
    return emptyProfile();
  }

  if (!isRecord(value)) return emptyProfile();

  const searches = Array.isArray(value.searches)
    ? value.searches.filter((item): item is string => typeof item === "string").slice(0, 8)
    : [];
  const viewedGearIds = Array.isArray(value.viewedGearIds)
    ? value.viewedGearIds
        .filter((item): item is string => typeof item === "string")
        .slice(0, 20)
    : [];
  const categoryViews: Record<string, number> = {};

  if (isRecord(value.categoryViews)) {
    for (const [categoryId, count] of Object.entries(value.categoryViews)) {
      if (typeof count === "number" && Number.isFinite(count) && count > 0) {
        categoryViews[categoryId] = count;
      }
    }
  }

  return { searches, viewedGearIds, categoryViews };
}

function saveProfile(profile: GearDiscoveryProfile): GearDiscoveryProfile {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error("Couldn't save GearUp discovery history.", error);
    }
  }
  return profile;
}

export function recordGearSearch(search: string): GearDiscoveryProfile {
  const normalized = search.trim().toLowerCase();
  const profile = readGearDiscoveryProfile();
  if (normalized.length < 2) return profile;

  return saveProfile({
    ...profile,
    searches: [normalized, ...profile.searches.filter((item) => item !== normalized)].slice(0, 8),
  });
}

export function recordGearView(gear: Gear): GearDiscoveryProfile {
  const profile = readGearDiscoveryProfile();
  const categoryViews = { ...profile.categoryViews };
  if (gear.categoryId) {
    categoryViews[gear.categoryId] = (categoryViews[gear.categoryId] ?? 0) + 1;
  }

  return saveProfile({
    ...profile,
    viewedGearIds: [gear.id, ...profile.viewedGearIds.filter((id) => id !== gear.id)].slice(0, 20),
    categoryViews,
  });
}

function gearText(gear: Gear): string {
  return [gear.name, gear.description, gear.brand, gear.category?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function recencyScore(gear: Gear, withinDays: number): number {
  const ageInDays = (Date.now() - new Date(gear.createdAt).getTime()) / 86_400_000;
  return Number.isFinite(ageInDays) && ageInDays >= 0 && ageInDays < withinDays
    ? 1 - ageInDays / withinDays
    : 0;
}

function reviewCount(gear: Gear): number {
  return gear._count?.reviews ?? gear.reviews?.length ?? 0;
}

export function recommendGear(
  gear: Gear[],
  profile: GearDiscoveryProfile,
  limit = 4
): Gear[] {
  const available = gear.filter((item) => item.status === "AVAILABLE");
  const viewed = new Set(profile.viewedGearIds);
  const candidates = available.filter((item) => !viewed.has(item.id));
  const source = candidates.length > 0 ? candidates : available;
  const searchTerms = profile.searches.flatMap((search) =>
    search.split(/\s+/).filter((word) => word.length > 2)
  );

  return source
    .map((item) => {
      const text = gearText(item);
      const searchScore = searchTerms.reduce(
        (score, term) => score + (text.includes(term) ? 2 : 0),
        0
      );
      const categoryScore = (profile.categoryViews[item.categoryId] ?? 0) * 3;
      const qualityScore = Math.min(reviewCount(item), 10) * 0.15;
      const score =
        searchScore +
        categoryScore +
        qualityScore +
        (item.isFeatured ? 1 : 0) +
        recencyScore(item, 90);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getTrendingGear(gear: Gear[], limit = 4): Gear[] {
  return gear
    .filter((item) => item.status === "AVAILABLE")
    .map((item) => {
      const reviews = item.reviews ?? [];
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
          : 0;
      const popularityScore =
        reviewCount(item) * 1.5 +
        averageRating * 0.5 +
        (item.isFeatured ? 1 : 0) +
        recencyScore(item, 45) * 2;
      return { item, popularityScore };
    })
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit)
    .map(({ item }) => item);
}
