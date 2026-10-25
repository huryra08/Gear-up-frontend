import Link from "next/link";
import { Mail, MapPin, Mountain, Phone } from "lucide-react";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M13.5 21v-8h2.8l.4-3.1h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5v3.1h2.8v8h3.2Z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-forest text-paper/80 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display text-lg text-paper mb-3">
            <Mountain className="h-5 w-5 text-rust" />
            GEARUP
          </div>
          <p className="text-sm max-w-xs">
            Rent sports and outdoor gear instantly. Trailheads to summits, we&apos;ve got the kit.
          </p>
        </div>
        <div>
          <p className="tag-label text-paper mb-3">About GearUp</p>
          <p className="text-sm max-w-xs">
            We connect outdoor enthusiasts with local providers, making it easy to find and rent
            the gear for your next adventure.
          </p>
        </div>
        <div>
          <p className="tag-label text-paper mb-3">Explore</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/gear" className="hover:text-rust transition-colors">
                Browse Rental Gear
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-rust transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-rust transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-rust transition-colors">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="tag-label text-paper mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:ratat@gmai.com" className="flex items-center gap-2 hover:text-rust transition-colors">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                ratat@gmai.com
              </a>
            </li>
            <li>
              <a href="tel:0170000000000" className="flex items-center gap-2 hover:text-rust transition-colors">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
                0170000000000
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5" />
              <address className="not-italic">
                100 Demo Street, Suite 200, Sample City, CA, 90000
              </address>
            </li>
          </ul>
        </div>
        <div>
          <p className="tag-label text-paper mb-3">Follow us</p>
          <ul className="flex items-center gap-4">
            {socialLinks.map(({ name, href, icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="inline-flex rounded-full p-2 text-paper/80 transition-colors hover:bg-paper/10 hover:text-rust"
                >
                  {icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/50">
        &copy; {new Date().getFullYear()} GearUp.
      </div>
    </footer>
  );
}