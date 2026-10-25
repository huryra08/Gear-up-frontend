"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { readGearDiscoveryProfile } from "@/lib/gear-discovery";

export function ContentSuggestions() {
  const [interests, setInterests] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    // Load browser-only interests after hydration to keep the initial render consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInterests(readGearDiscoveryProfile().searches);
  }, []);

  const generateIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "content", interests }),
      });
      const result: { text?: string; error?: string; fallback?: boolean } = await response.json();
      if (!response.ok || !result.text) {
        throw new Error(result.error || "Couldn't generate suggestions. Please try again.");
      }
      setUsingFallback(result.fallback === true);
      setIdeas(result.text);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Couldn't generate suggestions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 border border-line bg-canvas-raised p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="tag-label mb-2 flex items-center gap-2 text-rust">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            For your next read
          </p>
          <h2 className="font-display text-2xl text-forest">Get outdoor content ideas picked for you</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {interests.length > 0
              ? `Suggestions can be tailored to your recent searches: ${interests.slice(0, 3).join(", ")}.`
              : "Ask for fresh blog and newsletter ideas for outdoor gear renters."}
            {" "}Your search interests are sent to OpenAI only when you request suggestions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void generateIdeas()}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-forest px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {loading ? "Generating…" : "Suggest content"}
        </button>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-rust-deep">{error}</p>}
      {usingFallback && (
        <p className="mt-4 text-xs text-ink-soft">
          AI is not configured yet; these are starter ideas. Configure OPENAI_API_KEY to enable personalized AI suggestions.
        </p>
      )}
      {ideas && (
        <div className="mt-5 whitespace-pre-wrap border-t border-line pt-5 text-sm leading-6 text-ink">
          {ideas}
        </div>
      )}
    </section>
  );
}
