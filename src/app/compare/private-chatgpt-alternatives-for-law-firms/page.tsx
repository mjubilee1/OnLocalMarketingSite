import type { Metadata } from "next";
import type { ReactNode, SVGProps } from "react";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Logo } from "@/components/Logo";

const PAGE_URL =
  "https://onlocalai.com/compare/private-chatgpt-alternatives-for-law-firms/";
const PAGE_TITLE =
  "Private ChatGPT alternatives for law firms (2026): keep client data confidential";
const PAGE_DESCRIPTION =
  "The best private and on-premises AI options for law firms that can't put client data into ChatGPT — how each handles confidentiality, deployment, and cost, with an honest comparison.";

export const metadata: Metadata = {
  title: "Private ChatGPT alternatives for law firms",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/compare/private-chatgpt-alternatives-for-law-firms" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "article",
    images: [{ url: "/brand/og-card.png", width: 1200, height: 630, alt: "OnLocalAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/brand/og-card.png"],
  },
};

/* ---------- Criteria ---------- */

const criteria = [
  {
    title: "Where the data is processed",
    body: "The core question for a law firm: does the client matter ever leave your hardware? On-premises tools keep it local; cloud tools send it to a vendor, however well-secured.",
  },
  {
    title: "Confidentiality & privilege fit",
    body: "Your duty of confidentiality doesn't pause for convenience. The safest posture is one you can defend to a client or a bar committee — ideally, data that physically can't leave the office.",
  },
  {
    title: "Team workspace, not just chat",
    body: "A single-user chat window doesn't onboard associates, answer HR questions, or run a helpdesk. Firms usually need shared, access-controlled knowledge — not one more app per person.",
  },
  {
    title: "Deployment effort",
    body: "Most firms don't have a DevOps team. A tool that needs servers stood up and models wired together is a different commitment than a desktop install.",
  },
  {
    title: "Cost model",
    body: "Per-seat cloud subscriptions scale with headcount and never stop. A local license or a tool that replaces several subscriptions can change the math.",
  },
];

/* ---------- Alternatives ---------- */

type Alt = {
  name: string;
  tag: string;
  highlight?: boolean;
  body: ReactNode;
  bestFor: string;
};

const alternatives: Alt[] = [
  {
    name: "OnLocalAI",
    tag: "On-premises · all-in-one team workspace",
    highlight: true,
    body: (
      <>
        A native desktop app that runs entirely on your own machines — the model, the search index,
        and every file stay local, and it works with the network unplugged. Beyond chat, it bundles
        grounded company Q&amp;A with citations, training, an AI helpdesk, onboarding, and timesheets,
        with retrieval scoped by department so people only see what they&apos;re allowed to. Built for
        firms whose rule is <em>&quot;client data cannot leave the building.&quot;</em>
      </>
    ),
    bestFor: "Small-to-mid firms that need private AI for the whole team, not just a chat box.",
  },
  {
    name: "Local LLM desktop apps (LM Studio, Jan, GPT4All, Msty)",
    tag: "On-device · single-user chat",
    body: (
      <>
        These run an open-source model locally on one person&apos;s computer, so prompts stay on the
        device. They&apos;re genuinely private and free, but they&apos;re single-user chat tools:
        there&apos;s no shared, access-controlled knowledge base, no training or helpdesk, and
        document handling is largely do-it-yourself. Good for an individual; not a firm-wide system.
      </>
    ),
    bestFor: "A solo practitioner or a tech-comfortable lawyer experimenting privately.",
  },
  {
    name: "Ollama + Open WebUI (self-hosted)",
    tag: "Self-hosted · DIY",
    body: (
      <>
        A popular way to self-host a local model with a chat UI. Private if you keep it on your own
        hardware, and flexible — but you assemble and maintain it yourself (model, vector store,
        access control, updates). Realistically a project for an IT-savvy firm or its MSP, not an
        off-the-shelf product.
      </>
    ),
    bestFor: "Firms with in-house IT or an MSP willing to build and maintain a stack.",
  },
  {
    name: "Microsoft 365 Copilot",
    tag: "Cloud · in-tenant",
    body: (
      <>
        AI embedded across Word, Outlook, Excel, and Teams. Content stays inside your Microsoft 365
        service boundary and honors your existing permissions, and Microsoft states it isn&apos;t used
        to train its foundation models. But processing still happens in Microsoft&apos;s cloud — not on
        your hardware — so it isn&apos;t on-premises or air-gappable, and it requires the licensing
        estate underneath it.
      </>
    ),
    bestFor: "Firms already all-in on Microsoft 365 that accept cloud processing.",
  },
  {
    name: "ChatGPT Enterprise",
    tag: "Cloud · strongest models",
    body: (
      <>
        The most capable general models, with enterprise controls: your data is encrypted, isn&apos;t
        used for training, and carries serious security certifications. The catch for a law firm is
        unchanged — matter content is processed in OpenAI&apos;s cloud, which is exactly what many
        confidentiality obligations don&apos;t allow.
      </>
    ),
    bestFor: "Firms where cloud processing is acceptable and raw model power is the priority.",
  },
  {
    name: "Legal-specific AI (Harvey, Thomson Reuters CoCounsel)",
    tag: "Cloud · legal research & drafting",
    body: (
      <>
        Purpose-built for legal research, review, and drafting, trained on legal materials and often
        integrated with research databases. Powerful for legal work product — but cloud-hosted and
        priced for larger firms, and they solve legal research rather than firm-wide knowledge,
        onboarding, and internal support.
      </>
    ),
    bestFor: "Larger firms wanting AI for legal research and drafting, with cloud budgets.",
  },
];

/* ---------- Summary table ---------- */

const tableRows = [
  { tool: "OnLocalAI", data: "On your machine", team: "Yes — all-in-one", setup: "Desktop install" },
  { tool: "Local LLM apps", data: "On your device", team: "No — single user", setup: "Desktop install" },
  { tool: "Ollama + Open WebUI", data: "Your hardware", team: "Partial (DIY)", setup: "Self-host / build" },
  { tool: "Microsoft 365 Copilot", data: "Microsoft cloud", team: "Yes (in 365)", setup: "365 rollout" },
  { tool: "ChatGPT Enterprise", data: "OpenAI cloud", team: "Yes", setup: "Cloud config" },
  { tool: "Harvey / CoCounsel", data: "Vendor cloud", team: "Yes", setup: "Vendor onboarding" },
];

const faqs = [
  {
    question: "Can law firms use ChatGPT with client data?",
    answer:
      "As a rule, no — not the consumer version. A lawyer's duty of confidentiality generally means client matter data shouldn't be entered into a tool that processes it in a third party's cloud without informed consent and appropriate safeguards. That's why many firms look for a private or on-premises alternative where client data never leaves their own machines. This is general information, not legal or ethics advice; check your jurisdiction's bar guidance.",
  },
  {
    question: "What is the best private AI for a law firm?",
    answer:
      "It depends on scope. For an individual lawyer, a local desktop LLM app keeps prompts on the device. For a whole firm that needs shared knowledge, onboarding, training, and support with nothing leaving the building, an on-premises team workspace like OnLocalAI fits best. If cloud processing is acceptable, Microsoft 365 Copilot or a legal-specific tool may suit — but those are not on-premises.",
  },
  {
    question: "Is there a private ChatGPT that works offline?",
    answer:
      "Yes. Tools that run an open-source model locally — from single-user apps to a full on-premises workspace like OnLocalAI — work with no internet connection once set up. OnLocalAI keeps the model, the search index, and your documents on your own hardware, so it keeps answering with the network unplugged.",
  },
  {
    question: "Do local AI tools keep client data confidential?",
    answer:
      "Local and on-premises tools keep processing on your own hardware, so client data isn't sent to a vendor's cloud — a much stronger confidentiality posture than cloud AI. You still control the surrounding practices (device security, access control, retention). On-premises design gives you something verifiable: you can disconnect the network and confirm nothing is leaving.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://onlocalai.com/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://onlocalai.com/compare/" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Private ChatGPT alternatives for law firms",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function LawFirmAlternativesPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="OnLocalAI home" className="shrink-0">
            <Logo height={26} />
          </Link>
          <Link
            href="/#early-access"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
          >
            Get early access
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-12 lg:py-16">
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-800">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700">Compare</span>
        </nav>

        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          Private ChatGPT alternatives for law firms
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          If your firm can&apos;t put client data into ChatGPT, here are the real options for getting
          AI without sending a single matter to the cloud — compared honestly.
        </p>

        {/* TL;DR */}
        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-800">
            The short version
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            For a single lawyer, a local desktop LLM app keeps prompts on the device. For a whole firm
            that needs shared knowledge, onboarding, training, and internal support with nothing
            leaving the building, an on-premises team workspace like <strong>OnLocalAI</strong> is the
            closest fit. Cloud tools (Microsoft 365 Copilot, ChatGPT Enterprise, legal-specific AI)
            are capable but process your data off-site — the exact thing many confidentiality duties
            don&apos;t allow.
          </p>
        </div>

        {/* Why */}
        <DeepDive
          title="Why law firms look for an alternative"
          body={
            <>
              <p>
                The pull toward AI is real — associates want to move faster, and clients increasingly
                expect it. But a lawyer&apos;s duty of confidentiality doesn&apos;t bend for
                convenience. Pasting a contract, a filing, or client facts into consumer ChatGPT sends
                that material to a third party&apos;s cloud, which for most firms is a confidentiality
                and privilege problem nobody wants to own.
              </p>
              <p className="mt-3">
                The quiet risk is <strong>shadow AI</strong>: staff already using cloud tools on client
                work because the firm hasn&apos;t offered a safe option. The answer isn&apos;t
                &quot;ban AI&quot; — it&apos;s to give the firm AI that can&apos;t leak, by keeping it
                on your own machines.
              </p>
            </>
          }
        />

        {/* Criteria */}
        <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
          What to look for
        </h2>
        <div className="mt-5 grid gap-3">
          {criteria.map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Alternatives */}
        <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
          The alternatives
        </h2>
        <div className="mt-5 grid gap-4">
          {alternatives.map((alt, i) => (
            <article
              key={alt.name}
              className={`rounded-2xl border p-6 shadow-sm ${
                alt.highlight ? "border-brand-300 bg-brand-50/50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-base font-semibold text-slate-900">
                  {i + 1}. {alt.name}
                </h3>
                <span className="text-xs font-medium text-brand-700">{alt.tag}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{alt.body}</p>
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Best for:</span> {alt.bestFor}
              </p>
            </article>
          ))}
        </div>

        {/* Table */}
        <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
          At a glance
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="p-4 font-semibold">Tool</th>
                <th className="p-4 font-semibold">Where data lives</th>
                <th className="p-4 font-semibold">Team workspace</th>
                <th className="p-4 font-semibold">Setup</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={row.tool} className={i % 2 ? "bg-slate-50/40" : "bg-white"}>
                  <th className="p-4 text-left align-top text-sm font-semibold text-slate-800">
                    {row.tool}
                  </th>
                  <td className="p-4 align-top text-slate-600">{row.data}</td>
                  <td className="p-4 align-top text-slate-600">{row.team}</td>
                  <td className="p-4 align-top text-slate-600">{row.setup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Vendor behavior as publicly documented; verify current terms with each vendor. Last reviewed
          August 2026. Not legal or ethics advice.
        </p>

        {/* FAQ */}
        <h2 className="mt-14 text-xl font-semibold tracking-tight text-slate-900">
          Frequently asked questions
        </h2>
        <div className="mt-5 grid gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition open:border-brand-300 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                {faq.question}
                <ChevronIcon className="h-4 w-4 flex-none text-slate-400 transition group-open:rotate-180 group-open:text-brand-700" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>

        {/* Related */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-sm">
          <span className="font-semibold text-slate-800">Related:</span>{" "}
          <Link
            href="/compare/onlocalai-vs-chatgpt-enterprise-vs-copilot"
            className="font-medium text-brand-800 underline-offset-2 hover:underline"
          >
            OnLocalAI vs ChatGPT Enterprise vs Microsoft Copilot
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Give your firm AI that can&apos;t leak
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            OnLocalAI runs entirely on your own machines — knowledge, training, and support with
            nothing leaving the office. Drop your email for an access code and our private-AI playbook.
          </p>
          <div className="mt-6">
            <WaitlistForm source="law_firm_alternatives" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Logo height={22} />
          <span>Private, on-premises AI for your whole team. © {new Date().getFullYear()} OnLocalAI.</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- building blocks ---------- */

function DeepDive({ title, body }: { title: string; body: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate-600">{body}</div>
    </section>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
