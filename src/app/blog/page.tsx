import Link from "next/link";
import { ContentSuggestions } from "@/components/content-suggestions";

const posts = [
  {
    title: "How to choose the right gear for a weekend mountain trip",
    category: "Packing Tips",
    date: "May 12, 2026",
    excerpt:
      "A quick checklist for balancing weight, weather, and comfort before you head out on your next adventure.",
  },
  {
    title: "5 easy upgrades to make your outdoor rentals smoother",
    category: "Gear Guide",
    date: "April 28, 2026",
    excerpt:
      "Find the essentials that can help you travel lighter, stay organized, and make the most of your rental experience.",
  },
  {
    title: "What to look for in a trustworthy local gear provider",
    category: "Community",
    date: "April 02, 2026",
    excerpt:
      "From inspection standards to service quality, here&apos;s what makes a provider stand out in the outdoor community.",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="tag-label text-rust mb-4">Blog</p>
        <h1 className="font-display text-4xl sm:text-5xl text-forest leading-tight">
          Stories, gear advice, and trail-ready inspiration.
        </h1>
        <p className="mt-5 text-base text-ink-soft sm:text-lg">
          Explore practical tips, local adventures, and the ideas that help people get outside more often.
        </p>
      </div>

      <ContentSuggestions />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {posts.map(({ title, category, date, excerpt }) => (
          <article key={title} className="flex h-full flex-col border border-line bg-paper p-6">
            <p className="tag-label text-moss">{category}</p>
            <h2 className="mt-4 font-display text-2xl text-forest leading-snug">{title}</h2>
            <p className="mt-3 text-sm text-ink-soft">{date}</p>
            <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">{excerpt}</p>
            <Link href="/about" className="mt-5 inline-flex text-sm font-semibold text-rust hover:text-rust-deep">
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
