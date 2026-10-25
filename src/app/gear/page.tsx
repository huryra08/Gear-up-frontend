"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { gearApi, categoryApi } from "@/lib/api";
import type { Gear, Category } from "@/lib/types";
import { GearCard } from "@/components/gear-card";
import { GearCardSkeleton } from "@/components/gear-card-skeleton";
import { Input, Select, Label } from "@/components/ui/input";
import { recordGearSearch, readGearDiscoveryProfile } from "@/lib/gear-discovery";
import { Search, Sparkles } from "lucide-react";

type SearchSuggestion =
  | { type: "gear"; id: string; label: string; detail: string }
  | { type: "category"; id: string; label: string; detail: string }
  | { type: "recent"; label: string; detail: string };

function GearBrowse() {
  const searchParams = useSearchParams();
  const [gear, setGear] = useState<Gear[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    gearApi
      .list()
      .then(setGear)
      .catch(() => setError("Couldn't load gear. Check that the API server is running."));
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) return;

    const timeoutId = window.setTimeout(() => {
      const profile = recordGearSearch(query);
      setRecentSearches(profile.searches);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    if (!gear) return [];
    return gear.filter((g) => {
      if (g.status !== "AVAILABLE") return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const hit =
          g.name.toLowerCase().includes(term) ||
          g.description.toLowerCase().includes(term) ||
          (g.brand?.toLowerCase().includes(term) ?? false) ||
          (g.category?.name.toLowerCase().includes(term) ?? false);
        if (!hit) return false;
      }
      if (category && g.categoryId !== category) return false;
      const price = Number(g.pricePerDay);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      return true;
    });
  }, [gear, searchTerm, category, minPrice, maxPrice]);

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const pastSearches = recentSearches
      .filter((search) => search.includes(query) && search !== query)
      .slice(0, 2)
      .map((search): SearchSuggestion => ({
        type: "recent",
        label: search,
        detail: "Recent search",
      }));
    const matchingGear = (gear ?? [])
      .filter((item) => {
        const text = [item.name, item.brand, item.category?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return item.status === "AVAILABLE" && text.includes(query);
      })
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(query) ? 1 : 0;
        const bStarts = b.name.toLowerCase().startsWith(query) ? 1 : 0;
        return bStarts - aStarts;
      })
      .slice(0, 4)
      .map(
        (item): SearchSuggestion => ({
          type: "gear",
          id: item.id,
          label: item.name,
          detail: [item.category?.name, item.brand].filter(Boolean).join(" · ") || "Available gear",
        })
      );
    const matchingCategories = categories
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 2)
      .map(
        (item): SearchSuggestion => ({
          type: "category",
          id: item.id,
          label: item.name,
          detail: "Category",
        })
      );

    return [...pastSearches, ...matchingGear, ...matchingCategories].slice(0, 6);
  }, [categories, gear, recentSearches, searchTerm]);

  const applySuggestion = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === "category") {
      setCategory(suggestion.id);
      setSearchTerm("");
      return;
    }

    setSearchTerm(suggestion.label);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <p className="tag-label text-rust mb-2">Full inventory</p>
      <h1 className="font-display text-3xl sm:text-4xl text-forest mb-8">Browse Gear</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-5 border border-line bg-paper p-5 h-fit">
          <div>
            <Label>Search</Label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-2.5 top-3 h-4 w-4 text-ink-soft" />
              <Input
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-controls="gear-search-suggestions"
                autoComplete="off"
                className="pl-8"
                placeholder="Tent, bike, kayak…"
                value={searchTerm}
                onFocus={() => {
                  setRecentSearches(readGearDiscoveryProfile().searches);
                  setShowSuggestions(true);
                }}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setShowSuggestions(false);
                  if (event.key === "Enter" && suggestions[0]) {
                    event.preventDefault();
                    applySuggestion(suggestions[0]);
                    if (suggestions[0].type !== "category") {
                      recordGearSearch(suggestions[0].label);
                    }
                  }
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  id="gear-search-suggestions"
                  role="listbox"
                  aria-label="Search suggestions"
                  className="absolute z-20 mt-1 w-full border border-line bg-paper shadow-lg"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.type}-${suggestion.type === "recent" ? suggestion.label : suggestion.id}`}
                      type="button"
                      role="option"
                      aria-selected="false"
                      className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-canvas-raised"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        applySuggestion(suggestion);
                        if (suggestion.type !== "category") {
                          recordGearSearch(suggestion.label);
                        }
                      }}
                    >
                      {suggestion.type === "recent" ? (
                        <Sparkles aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                      ) : (
                        <Search aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{suggestion.label}</span>
                        <span className="block text-xs text-ink-soft">{suggestion.detail}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Price per day</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <div>
          {error && <p className="text-rust-deep text-sm mb-4">{error}</p>}

          {!gear && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <GearCardSkeleton key={i} />
              ))}
            </div>
          )}

          {gear && (
            <>
              <p className="text-sm text-ink-soft mb-4">{filtered.length} items available</p>
              {filtered.length === 0 ? (
                <p className="text-ink-soft text-sm">No gear matches those filters. Try widening your search.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((g) => (
                    <GearCard key={g.id} gear={g} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GearPage() {
  return (
    <Suspense fallback={null}>
      <GearBrowse />
    </Suspense>
  );
}
