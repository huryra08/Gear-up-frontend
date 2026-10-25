"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { gearApi, rentalApi, ApiError } from "@/lib/api";
import type { Gear } from "@/lib/types";
import { formatMoney, formatDate, daysBetween } from "@/lib/utils";
import { recordGearView } from "@/lib/gear-discovery";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Star, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function GearDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [gear, setGear] = useState<Gear | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(tomorrowStr());
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    gearApi
      .get(id)
      .then((item) => {
        setGear(item);
        recordGearView(item);
      })
      .catch(() => setError("Gear not found."));
  }, [id]);

  if (error) {
    return <p className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-rust-deep text-sm">{error}</p>;
  }

  if (!gear) {
    return <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 animate-pulse text-ink-soft">Loading gear…</div>;
  }

  const rentalDays = daysBetween(new Date(startDate), new Date(endDate));
  const total = Number(gear.pricePerDay) * quantity * rentalDays;
  const isValidRange = new Date(endDate) > new Date(startDate);

  const handleRentNow = async () => {
    if (!user) {
      router.push(`/auth/login?next=/gear/${gear.id}`);
      return;
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customer accounts can rent gear.");
      return;
    }
    if (!isValidRange) {
      toast.error("End date must be after the start date.");
      return;
    }
    setBooking(true);
    try {
      const order = await rentalApi.create({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: [{ gearId: gear.id, quantity }],
      });
      toast.success("Order placed — now choose how to pay.");
      router.push(`/dashboard/customer/orders/${order.id}/pay`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't place that order.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/3] bg-canvas-raised border border-line overflow-hidden">
            {gear.images?.[activeImage] ? (
              <Image
                src={gear.images[activeImage]}
                alt={gear.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-soft/50 tag-label">
                No Photo
              </div>
            )}
          </div>
          {gear.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {gear.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 border ${i === activeImage ? "border-rust" : "border-line"} overflow-hidden shrink-0`}
                >
                  <Image src={img} alt="" fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="tag-label text-moss">{gear.category?.name ?? "Gear"}</p>
            <StatusBadge status={gear.status} />
          </div>
          <h1 className="font-display text-3xl text-forest mb-2">{gear.name}</h1>
          {gear.brand && <p className="text-sm text-ink-soft mb-4">by {gear.brand}</p>}

          <p className="font-mono text-2xl text-rust mb-4">
            {formatMoney(gear.pricePerDay)} <span className="text-sm text-ink-soft">/ day</span>
          </p>

          <p className="text-sm text-ink-soft leading-relaxed mb-6">{gear.description}</p>

          {gear.specifications && Object.keys(gear.specifications).length > 0 && (
            <div className="mb-6 border-t border-line pt-4">
              <p className="tag-label text-ink-soft mb-2">Specifications</p>
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                {Object.entries(gear.specifications).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-soft capitalize">{k}</dt>
                    <dd>{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {gear.provider && (
            <div className="flex items-center gap-2 text-sm text-ink-soft mb-6 border-t border-line pt-4">
              <ShieldCheck className="h-4 w-4 text-forest" />
              Provided by <span className="font-medium text-ink">{gear.provider.name}</span>
            </div>
          )}

          {/* Rent now box */}
          <div className="border border-line bg-paper p-5 space-y-4">
            <p className="tag-label text-rust">Rent now</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={startDate}
                  min={todayStr()}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End date</Label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                max={gear.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(gear.quantity, Number(e.target.value))))}
              />
              <p className="text-xs text-ink-soft mt-1">{gear.quantity} in stock</p>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-line pt-3">
              <span className="text-ink-soft">
                {isValidRange ? `${rentalDays} day${rentalDays > 1 ? "s" : ""}` : "Pick valid dates"}
              </span>
              <span className="font-mono text-lg text-forest">{formatMoney(total)}</span>
            </div>

            <Button
              className="w-full"
              onClick={handleRentNow}
              disabled={booking || gear.status !== "AVAILABLE" || !isValidRange}
            >
              {booking ? "Placing order…" : gear.status === "AVAILABLE" ? "Rent Now" : "Currently Unavailable"}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-2xl text-forest mb-6">
          Reviews {gear.reviews && gear.reviews.length > 0 && `(${gear.reviews.length})`}
        </h2>
        {!gear.reviews || gear.reviews.length === 0 ? (
          <p className="text-sm text-ink-soft">No reviews yet — be the first to rent and review this gear.</p>
        ) : (
          <div className="space-y-5 max-w-2xl">
            {gear.reviews.map((r) => (
              <div key={r.id} className="border border-line bg-paper p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.customer?.name ?? "Customer"}</span>
                  <span className="flex items-center gap-1 text-xs text-signal">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-signal text-signal" />
                    ))}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-ink-soft">{r.comment}</p>}
                <p className="text-xs text-ink-soft/70 mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {formatDate(r.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
