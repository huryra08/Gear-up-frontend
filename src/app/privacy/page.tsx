const privacyPoints = [
  "We collect only the information needed to process rentals, payments, and account access.",
  "Your personal data is protected and used only to support bookings, communication, and service improvements.",
  "We do not sell or rent your information to third parties for marketing purposes.",
  "We may share limited data with payment providers or logistics partners required to complete a booking.",
  "Searches and gear views may be stored in your browser to personalize recommendations; this discovery history is not sent to GearUp.",
  "When you use the AI assistant, your messages are sent to OpenAI to generate replies. Recent searches are sent only when you explicitly request personalized content ideas. Do not share passwords, payment details, or private account information.",
  "GearUp does not store AI chat history. If an OpenAI API key is not configured by the site operator, the assistant and content suggestions use basic non-AI responses instead.",
];

const terms = [
  "Bookings are subject to gear availability, provider confirmation, and the rental dates selected at checkout.",
  "Users are responsible for returning equipment in the condition it was received and by the agreed time.",
  "Any damage, loss, or misuse should be reported immediately so we can coordinate the correct next step.",
  "GearUp may update these terms from time to time; the latest version is always available on this page.",
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="tag-label text-rust mb-4">Privacy / Terms</p>
        <h1 className="font-display text-4xl sm:text-5xl text-forest leading-tight">
          Clear policies for a trusted rental experience.
        </h1>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="border border-line bg-paper p-6 sm:p-8">
          <h2 className="font-display text-2xl text-forest">Privacy policy</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-ink-soft">
            {privacyPoints.map((point) => (
              <li key={point} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-rust" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-line bg-paper p-6 sm:p-8">
          <h2 className="font-display text-2xl text-forest">Terms of use</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-ink-soft">
            {terms.map((point) => (
              <li key={point} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-moss" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
