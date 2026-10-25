import { Headset, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const supportTopics = [
  {
    icon: ShoppingBag,
    title: "Booking support",
    description: "Need help with dates, pricing, or a rental you already placed? We can guide you through the next step.",
  },
  {
    icon: Headset,
    title: "Account help",
    description: "Manage logins, profile details, and access requests for customer or provider accounts.",
  },
  {
    icon: Truck,
    title: "Pickup & delivery",
    description: "Review where and when your gear will be available, and what to do if plans change.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & policy",
    description: "Find guidance on gear conditions, refund expectations, and community standards.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="tag-label text-rust mb-4">Help / Support</p>
        <h1 className="font-display text-4xl sm:text-5xl text-forest leading-tight">
          Need a hand before or after your rental?
        </h1>
        <p className="mt-5 text-base text-ink-soft sm:text-lg">
          We&apos;re here to make gear rentals simple, whether you&apos;re booking a weekend trip or managing a listing as a provider.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {supportTopics.map(({ icon: Icon, title, description }) => (
          <article key={title} className="border border-line bg-paper p-6">
            <Icon aria-hidden="true" className="h-7 w-7 text-rust mb-4" />
            <h2 className="font-display text-xl text-forest">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 border border-line bg-paper p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="tag-label text-moss mb-2">Still need help?</p>
            <h2 className="font-display text-2xl text-forest">Speak with our support team</h2>
          </div>
          <LinkButton href="/contact">Contact support</LinkButton>
        </div>
      </div>
    </div>
  );
}
