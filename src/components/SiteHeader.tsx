"use client";

import { useState, type SVGProps } from "react";
import Link from "next/link";
import { ContactLink } from "@/components/ContactLink";
import { Logo } from "@/components/Logo";

type NavLink = { label: string; href: string };

type SiteHeaderProps = {
  navLinks: NavLink[];
  bookDemoHref: string;
  /** Show the ghost "Get the app" button (homepage only). */
  showGetApp?: boolean;
};

export function SiteHeader({ navLinks, bookDemoHref, showGetApp = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-950/85 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" aria-label="OnLocalAI home" className="shrink-0">
          <Logo tone="light" height={26} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/compare/onlocalai-vs-chatgpt-enterprise-vs-copilot"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Compare
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ContactLink
            href={bookDemoHref}
            source="header_book_demo"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition hover:bg-brand-100"
          >
            Get a demo
            <ArrowCircle className="h-5 w-5" />
          </ContactLink>
          {showGetApp ? (
            <a
              href="/#download"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50 sm:inline-flex lg:inline-flex"
            >
              Get the app
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="border-t border-white/10 bg-brand-950 lg:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/compare/onlocalai-vs-chatgpt-enterprise-vs-copilot"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Compare
            </Link>
            <a
              href="/#download"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Get the app
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function ArrowCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="11" fill="currentColor" fillOpacity="0.12" />
      <path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
