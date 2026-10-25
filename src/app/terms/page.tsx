const terms = [
  {
    title: "Bookings",
    description:
      "Rental requests depend on gear availability and provider confirmation. Review your dates, item quantity, and order details before completing payment.",
  },
  {
    title: "Using rented gear",
    description:
      "Use equipment responsibly and follow any care or safety instructions provided with the listing. Return rented gear as arranged with the provider.",
  },
  {
    title: "Changes or problems",
    description:
      "Contact the provider and GearUp promptly if plans change or equipment is lost, damaged, or unavailable. Payment, cancellation, and refund outcomes depend on the applicable order and provider terms.",
  },
  {
    title: "Account responsibilities",
    description:
      "Keep your account details secure, provide accurate information, and do not share passwords or payment credentials in support messages.",
  },
  {
    title: "Updates",
    description:
      "These terms may be updated as the service changes. Check this page for the current version before placing a rental.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-3xl">
        <p className="tag-label mb-4 text-rust">Terms</p>
        <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
          GearUp terms of use.
        </h1>
        <p className="mt-5 text-base text-ink-soft sm:text-lg">
          A few basics for using GearUp to discover and rent outdoor equipment.
        </p>
      </div>

      <div className="mt-10 max-w-4xl space-y-4">
        {terms.map(({ title, description }) => (
          <section key={title} className="border border-line bg-paper p-6">
            <h2 className="font-display text-xl text-forest">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
