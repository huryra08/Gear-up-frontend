import Link from "next/link";
import { ArrowRight, CalendarDays, PackageCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

const sampleRentals = [
  {
    orderNumber: "DEMO-1001",
    item: "Trail-ready tent",
    dates: "Sample rental dates",
    status: "CONFIRMED",
    paymentStatus: "COMPLETED",
    total: 4500,
  },
  {
    orderNumber: "DEMO-1002",
    item: "Mountain bike",
    dates: "Sample rental dates",
    status: "RETURNED",
    paymentStatus: "COMPLETED",
    total: 3200,
  },
];

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8 border border-signal/40 bg-signal/10 p-4">
        <p className="tag-label text-forest mb-1">Customer demo · Preview only</p>
        <p className="text-sm text-ink-soft">
          This is sample information to demonstrate the customer experience. No account is signed
          in and no bookings or payments can be changed.
        </p>
      </div>

      <p className="tag-label text-rust mb-2">Demo customer dashboard</p>
      <h1 className="font-display text-3xl sm:text-4xl text-forest mb-2">Welcome, Alex</h1>
      <p className="text-sm text-ink-soft mb-8">A preview of rental activity and payment history.</p>

      <section aria-labelledby="demo-rentals-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="tag-label text-moss mb-2">Rental orders</p>
            <h2 id="demo-rentals-heading" className="font-display text-2xl text-forest">
              Your recent rentals
            </h2>
          </div>
          <Link href="/gear" className="inline-flex items-center gap-2 text-sm font-medium hover:text-rust transition-colors">
            Browse available gear <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {sampleRentals.map((rental) => (
            <article
              key={rental.orderNumber}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 items-center border border-line bg-paper p-4"
            >
              <div>
                <p className="font-mono text-xs text-ink-soft">{rental.orderNumber}</p>
                <p className="font-medium text-forest">{rental.item}</p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft mt-1">
                  <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                  {rental.dates}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={rental.status} />
                <StatusBadge status={rental.paymentStatus} />
              </div>
              <p className="font-mono text-sm text-forest sm:text-right">{formatMoney(rental.total)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 border border-line bg-paper p-5 sm:p-6" aria-labelledby="demo-payments-heading">
        <div className="flex items-start gap-3">
          <PackageCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-moss mt-0.5" />
          <div>
            <h2 id="demo-payments-heading" className="font-display text-lg text-forest">
              Payment history preview
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Sample payments are shown with each rental above. Real bookings and payment history
              are available after signing in to a customer account.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/gear">Browse Gear</LinkButton>
        <LinkButton href="/auth/login" variant="outline">
          Sign in
        </LinkButton>
      </div>
    </div>
  );
}
