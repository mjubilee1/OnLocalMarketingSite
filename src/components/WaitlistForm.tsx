"use client";

import { useState, type FormEvent, type SVGProps } from "react";
import { trackEvent } from "@/lib/gtag";

// Paste your MailerLite embedded-form action URL here (or set the env var).
// MailerLite → Forms → Embedded form → "Or use the HTML code" → copy the
// <form action="..."> URL. It looks like:
//   https://assets.mailerlite.com/jsonp/<ACCOUNT_ID>/forms/<FORM_ID>/subscribe
const WAITLIST_ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT?.trim() || "";

const FALLBACK_MAILTO = `mailto:montrell@onlocalai.com,Subash@onlocalai.com?subject=${encodeURIComponent(
  "Request OnLocalAI early access"
)}`;

type WaitlistFormProps = {
  /** Compact single-row layout for the hero; larger stacked layout otherwise. */
  compact?: boolean;
  /** GA source label so we can tell which form converted. */
  source: string;
  className?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm({ compact = false, source, className = "" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // Honeypot: real users leave this empty; bots fill it.
  const [company, setCompany] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (company) {
      // Honeypot tripped — silently succeed without submitting.
      setStatus("success");
      return;
    }

    setStatus("loading");
    setError(null);

    // No endpoint configured yet → hand off to email so no signup is ever lost.
    if (!WAITLIST_ENDPOINT) {
      trackEvent("waitlist_signup", { source, method: "mailto_fallback" });
      window.location.href = `${FALLBACK_MAILTO}&body=${encodeURIComponent(
        `Please add me to early access: ${value}`
      )}`;
      setStatus("success");
      return;
    }

    try {
      const body = new URLSearchParams();
      // Send both shapes so it works with MailerLite (fields[email]) or a
      // generic endpoint (email).
      body.set("fields[email]", value);
      body.set("email", value);
      body.set("ml-submit", "1");
      body.set("anticsrf", "true");

      // MailerLite's endpoint is opaque to cross-origin reads, so we submit
      // no-cors and treat a resolved request as success (email is validated above).
      await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      trackEvent("waitlist_signup", { source, method: "mailerlite" });
      setStatus("success");
      setEmail("");
    } catch {
      setError("Something went wrong. Please email us and we'll add you.");
      setStatus("error");
      trackEvent("waitlist_error", { source });
    }
  }

  if (status === "success") {
    return (
      <div
        className={`flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3.5 text-sm text-brand-900 ${className}`}
        role="status"
      >
        <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-brand-700" />
        <span>
          <strong className="font-semibold">You&apos;re on the list.</strong> We&apos;ll email your
          access code and a private-AI playbook shortly.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${compact ? "max-w-md" : "max-w-lg"} ${className}`}
      noValidate
    >
      <div className={compact ? "flex flex-col gap-2 sm:flex-row sm:items-stretch" : "flex flex-col gap-3 sm:flex-row"}>
        <label className="sr-only" htmlFor={`waitlist-email-${source}`}>
          Work email
        </label>
        <input
          id={`waitlist-email-${source}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@yourfirm.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/30 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2"
        />
        {/* Honeypot — visually hidden, off-screen, not tab-focusable. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/25 transition hover:bg-brand-800 disabled:opacity-70"
        >
          {status === "loading" ? "Sending…" : "Request early access"}
          {status !== "loading" ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : (
        <p className={`mt-2 text-xs ${compact ? "text-slate-500" : "text-slate-500"}`}>
          Get an access code + our private-AI playbook. No spam, unsubscribe anytime.
        </p>
      )}
    </form>
  );
}

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
