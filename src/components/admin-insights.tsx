"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bot, LoaderCircle, TrendingDown, TrendingUp } from "lucide-react";
import type { AdminAnalytics } from "@/lib/admin-analytics";
import { moneyLabel } from "@/lib/admin-analytics";

export function AdminInsights({ analytics }: { analytics: AdminAnalytics }) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiFallback, setAiFallback] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trendMax = useMemo(
    () => Math.max(1, ...analytics.monthlyTrend.map((month) => month.rentals)),
    [analytics.monthlyTrend]
  );
  const rentalChange =
    analytics.metrics.previous30DaysRentals > 0
      ? Math.round(
          ((analytics.metrics.last30DaysRentals - analytics.metrics.previous30DaysRentals) /
            analytics.metrics.previous30DaysRentals) *
            100
        )
      : null;

  const requestAiSummary = async () => {
    setLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "analytics", metrics: analytics.metrics }),
      });
      const result: { text?: string; error?: string; fallback?: boolean } = await response.json();
      if (!response.ok || !result.text) {
        throw new Error(result.error || "Couldn't generate dashboard insights.");
      }
      setAiSummary(result.text);
      setAiFallback(result.fallback === true);
    } catch (requestError) {
      setAiError(
        requestError instanceof Error
          ? requestError.message
          : "Couldn't generate dashboard insights."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-5">
          <p className="tag-label text-moss mb-2">Performance</p>
          <h2 className="font-display text-2xl text-forest">Rental and sales trends</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Sales figures include rental orders marked as paid. Monthly bars show rental volume.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="border border-line bg-paper p-5 sm:p-6">
            <div className="flex h-44 items-end gap-3 sm:gap-5" aria-label="Rental orders over the last six months">
              {analytics.monthlyTrend.map((month) => (
                <div key={month.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                  <p className="mb-2 text-center text-xs text-ink-soft">{month.rentals}</p>
                  <div className="flex h-32 items-end border-b border-line">
                    <div
                      className="w-full bg-moss transition-[height]"
                      style={{ height: `${Math.max(month.rentals > 0 ? 8 : 0, (month.rentals / trendMax) * 100)}%` }}
                      title={`${month.label}: ${month.rentals} rentals`}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-ink-soft">{month.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="border border-line bg-paper p-5">
              <p className="tag-label text-ink-soft mb-2">Paid revenue · last 30 days</p>
              <p className="font-display text-3xl text-forest">
                {moneyLabel(analytics.metrics.paidRevenueLast30Days)}
              </p>
            </article>
            <article className="border border-line bg-paper p-5">
              <p className="tag-label text-ink-soft mb-2">Paid revenue · all orders</p>
              <p className="font-display text-3xl text-forest">
                {moneyLabel(analytics.metrics.totalPaidRevenue)}
              </p>
            </article>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border border-line bg-paper p-5 sm:p-6">
          <p className="tag-label text-rust mb-2">Product performance</p>
          <h2 className="font-display text-xl text-forest">Most rented gear</h2>
          {analytics.topGear.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {analytics.topGear.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-sm text-ink">
                    <span className="mr-2 font-mono text-xs text-ink-soft">{index + 1}.</span>
                    {item.name}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">{item.rentals} rented</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">No rental item history is available yet.</p>
          )}
        </div>

        <div className="border border-line bg-paper p-5 sm:p-6">
          <p className="tag-label text-rust mb-2">Customer activity</p>
          <h2 className="font-display text-xl text-forest">Most active renters</h2>
          {analytics.topRenters.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {analytics.topRenters.map((renter, index) => (
                <li key={renter.id} className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-sm text-ink">
                    <span className="mr-2 font-mono text-xs text-ink-soft">{index + 1}.</span>
                    {renter.name}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">{renter.rentals} rental(s)</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">No renter activity is available yet.</p>
          )}
        </div>

        <div className="border border-line bg-paper p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="tag-label text-moss mb-2">Behavior signals</p>
              <h2 className="font-display text-xl text-forest">Likely next actions</h2>
            </div>
            {rentalChange !== null && (
              <span className={`inline-flex items-center gap-1 text-sm font-medium ${rentalChange >= 0 ? "text-forest" : "text-rust-deep"}`}>
                {rentalChange >= 0 ? <TrendingUp aria-hidden="true" className="h-4 w-4" /> : <TrendingDown aria-hidden="true" className="h-4 w-4" />}
                {rentalChange > 0 ? "+" : ""}{rentalChange}%
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Heuristics based on rental history, not guaranteed predictions. Customer names are not sent to AI.
          </p>
          <ul className="mt-4 space-y-3">
            {analytics.predictions.length > 0 ? analytics.predictions.map((prediction) => (
              <li key={prediction} className="border-t border-line pt-3 text-sm leading-5 text-ink">
                {prediction}
              </li>
            )) : (
              <li className="border-t border-line pt-3 text-sm leading-5 text-ink-soft">
                More rental activity is needed before behavior patterns can be suggested.
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">
            {analytics.metrics.activeRentersLast30Days} active renter(s) in the last 30 days ·{" "}
            {analytics.metrics.repeatRenters} repeat renter(s) overall
          </p>
        </div>
      </div>

      <div className="border border-line bg-paper p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="tag-label text-rust mb-2">Anomaly monitoring</p>
            <h2 className="font-display text-xl text-forest">Needs attention</h2>
          </div>
          <span className="text-xs text-ink-soft">Threshold-based checks on current data</span>
        </div>
        {analytics.anomalies.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {analytics.anomalies.map((anomaly) => (
              <li key={anomaly.title} className="flex gap-3 border-t border-line pt-3">
                <AlertTriangle
                  aria-hidden="true"
                  className={`mt-0.5 h-4 w-4 shrink-0 ${anomaly.severity === "high" ? "text-rust-deep" : "text-signal"}`}
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{anomaly.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{anomaly.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t border-line pt-3 text-sm text-ink-soft">
            No configured rental, payment, cancellation, or availability thresholds are currently exceeded.
          </p>
        )}
      </div>

      <div className="border border-line bg-canvas-raised p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="tag-label mb-2 flex items-center gap-2 text-rust">
              <Bot aria-hidden="true" className="h-4 w-4" />
              AI-assisted analysis
            </p>
            <h2 className="font-display text-xl text-forest">Summarize these dashboard signals</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Only aggregate counts, revenue, and top gear labels are sent. No customer names,
              emails, or order IDs are included.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void requestAiSummary()}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 bg-forest px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
            {loading ? "Analyzing…" : "Generate insights"}
          </button>
        </div>
        {aiError && <p role="alert" className="mt-4 text-sm text-rust-deep">{aiError}</p>}
        {aiSummary && (
          <>
            {aiFallback && (
              <p className="mt-4 text-xs text-ink-soft">
                AI is not configured; showing rule-based insights instead.
              </p>
            )}
            <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm leading-6 text-ink">
              {aiSummary}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
