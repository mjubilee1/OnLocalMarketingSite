import Link from "next/link";
import { ContactLink } from "@/components/ContactLink";
import { Logo } from "@/components/Logo";

type NavLink = { label: string; href: string };

type SiteFooterProps = {
  navLinks: NavLink[];
  contactHref: string;
};

export function SiteFooter({ navLinks, contactHref }: SiteFooterProps) {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo tone="light" height={24} />
          <p className="mt-4 text-xs leading-relaxed text-brand-100/60">
            Private, on-premises AI for company knowledge, training, and support.
            Runs on your hardware — nothing leaves your machine.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm sm:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-brand-100/70 sm:justify-end">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
            <ContactLink href={contactHref} source="footer_contact" className="transition hover:text-white">
              Contact
            </ContactLink>
          </nav>
          <span className="text-xs text-brand-100/50">
            Early access · free to try. © {new Date().getFullYear()} OnLocalAI.
          </span>
        </div>
      </div>
    </footer>
  );
}
