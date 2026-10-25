import Link from "next/link";
import { Headset, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

const topics = [
  {
    icon: ShoppingBag,
    title: "Bookings and payments",
    description:
      "Browse available gear, choose your rental dates and quantity, then select Rent Now. Your order and payment status are available from your customer dashboard.",
  },
  {
    icon: Truck,
    title: "Pickup and returns",
    description:
      "Check the details on your rental order and coordinate pickup and return arrangements with the gear provider.",
  },
  {
    icon: ShieldCheck,
    title: "Gear or order concerns",
    description:
      "Contact our team about overdue orders, equipment condition, cancellations, or payment problems. Include your order number, but never send passwords or card details.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-3xl">
        <p className="tag-label mb-4 text-rust">Support</p>
        <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
          Help for your next rental.
        </h1>
        <p className="mt-5 text-base text-ink-soft sm:text-lg">
          Find guidance for browsing gear, managing a booking, or getting in touch about an issue.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {topics.map(({ icon: Icon, title, description }) => (
          <article key={title} className="border border-line bg-paper p-6">
            <Icon aria-hidden="true" className="mb-4 h-7 w-7 text-rust" />
            <h2 className="font-display text-xl text-forest">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <Headset aria-hidden="true" className="mb-3 h-6 w-6 text-moss" />
          <h2 className="font-display text-2xl text-forest">Still need a hand?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Contact the GearUp team and include relevant order details.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center bg-rust px-5 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-rust-deep"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
