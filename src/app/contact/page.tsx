import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const contactMethods = [
  {
    icon: Mail,
    label: "Email us",
    value: "support@gearup.example",
    href: "mailto:support@gearup.example",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+1 (555) 014-8234",
    href: "tel:+15550148234",
  },
  {
    icon: MapPin,
    label: "Visit",
    value: "100 Demo Street, Suite 200, Sample City, CA",
    href: "https://maps.google.com",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="tag-label text-rust mb-4">Contact</p>
        <h1 className="font-display text-4xl sm:text-5xl text-forest leading-tight">
          We&apos;re here to help you plan the next trip.
        </h1>
        <p className="mt-5 text-base text-ink-soft sm:text-lg">
          Whether you need help choosing gear, managing a booking, or partnering with GearUp as a
          local provider, our team is ready to help.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {contactMethods.map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="border border-line bg-paper p-6 transition-colors hover:border-rust hover:bg-canvas-raised"
          >
            <Icon aria-hidden="true" className="h-7 w-7 text-rust mb-4" />
            <p className="tag-label text-moss mb-2">{label}</p>
            <p className="text-base font-medium text-forest">{value}</p>
          </a>
        ))}
      </div>

      <div className="mt-12 border border-line bg-paper p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="tag-label text-rust mb-3">Need a quick answer?</p>
            <h2 className="font-display text-2xl text-forest">Reach the support team</h2>
            <p className="mt-2 text-ink-soft">
              Our support team responds Monday through Saturday, with faster assistance for urgent
              rental issues.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <LinkButton href="mailto:support@gearup.example">Email support</LinkButton>
            <LinkButton href="/help" variant="secondary">
              Help center
            </LinkButton>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-md border border-line bg-canvas p-4 text-sm text-ink-soft">
          <MessageCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-moss" />
          <p>Prefer to talk through a trip or booking issue first? Call our team and we&apos;ll help you sort the best next step.</p>
        </div>
      </div>
    </div>
  );
}
