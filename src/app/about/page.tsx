import { LinkButton } from "@/components/ui/button";
import { Compass, ShieldCheck, Tent, Users } from "lucide-react";

const values = [
  {
    icon: Tent,
    title: "Adventure made easier",
    description:
      "Find outdoor equipment for your next trip without needing to buy and store every item yourself.",
  },
  {
    icon: Users,
    title: "Powered by local providers",
    description:
      "Discover gear offered by local providers and support the people who help make outdoor adventures possible.",
  },
  {
    icon: ShieldCheck,
    title: "A simple rental journey",
    description:
      "Browse available gear, choose your rental dates, and manage your bookings in one place.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="contour-bg border-b border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <p className="tag-label text-rust mb-4">About GearUp</p>
          <h1 className="font-display text-4xl sm:text-6xl text-forest leading-[1.05] max-w-3xl">
            More time outside. Less gear standing in the way.
          </h1>
          <p className="mt-6 text-ink-soft max-w-2xl text-base sm:text-lg">
            GearUp connects outdoor enthusiasts with local providers so it&apos;s easier to find
            and rent the equipment you need for your next adventure.
          </p>
          <div className="mt-8">
            <LinkButton href="/gear" size="lg">
              Explore Rental Gear
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <p className="tag-label text-moss mb-3">What we do</p>
          <h2 className="font-display text-2xl sm:text-3xl text-forest mb-4">
            Gear up for the experience, not the storage.
          </h2>
          <p className="text-ink-soft">
            From tents and bikes to skis and kayaks, GearUp helps you discover rentable outdoor
            equipment. Browse listings, check availability, and book what fits your plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map(({ icon: Icon, title, description }) => (
            <article key={title} className="border border-line bg-paper p-6">
              <Icon aria-hidden="true" className="h-7 w-7 text-rust mb-4" />
              <h3 className="font-display text-lg text-forest mb-2">{title}</h3>
              <p className="text-sm text-ink-soft">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-3 border-t border-line pt-8 text-sm text-ink-soft">
          <Compass aria-hidden="true" className="h-5 w-5 shrink-0 text-moss" />
          <p>Wherever you&apos;re headed, start by finding the gear that gets you there.</p>
        </div>
      </section>
    </div>
  );
}
