import type { Metadata } from "next";
import type { ReactNode, SVGProps } from "react";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Logo } from "@/components/Logo";

const PAGE_URL =
  "https://onlocalai.com/compare/onlocalai-vs-chatgpt-enterprise-vs-copilot/";
const PAGE_TITLE =
  "OnLocalAI vs ChatGPT Enterprise vs Microsoft Copilot: privacy, cost & control";
const PAGE_DESCRIPTION =
  "A side-by-side comparison of OnLocalAI, ChatGPT Enterprise, and Microsoft 365 Copilot for teams that handle confidential data — how each handles data residency, pricing, control, and offline use.";

export const metadata: Metadata = {
  title: "OnLocalAI vs ChatGPT Enterprise vs Microsoft Copilot",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/compare/onlocalai-vs-chatgpt-enterprise-vs-copilot" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
};

/* ---------- Comparison data ---------- */

type Col = "onlocal" | "chatgpt" | "copilot";

const columns: { key: Col; name: string; note: string }[] = [
  { key: "onlocal", name: "OnLocalAI", note: "On-premises / on-device" },
  { key: "chatgpt", name: "ChatGPT Enterprise", note: "Cloud (OpenAI)" },
  { key: "copilot", name: "Microsoft 365 Copilot", note: "Cloud (Microsoft)" },
];

type Row = {
  label: string;
  onlocal: string;
  chatgpt: string;
  copilot: string;
};

const rows: Row[] = [
  {
    label: "Where your data is processed",
    onlocal: "On your own machine — never uploaded",
    chatgpt: "OpenAI's cloud",
    copilot: "Microsoft's cloud (your 365 tenant)",
  },
  {
    label: "Works fully offline / air-gapped",
    onlocal: "Yes — unplug the network and it still answers",
    chatgpt: "No — requires internet",
    copilot: "No — requires internet",
  },
  {
    label: "Pricing model",
    onlocal: "Local license (early access: free). No per-token bills",
    chatgpt: "Custom / contact sales (annual, seat minimums)",
    copilot: "Publicly listed at ~$30/user/mo + a qualifying 365 license",
  },
  {
    label: "Telemetry / accounts required",
    onlocal: "None — no external accounts or API keys",
    chatgpt: "Cloud account required",
    copilot: "Microsoft 365 account required",
  },
  {
    label: "Access control on your documents",
    onlocal: "Department-scoped retrieval enforced in the engine",
    chatgpt: "Workspace controls; content still processed in cloud",
    copilot: "Honors existing Microsoft 365 / Graph permissions",
  },
  {
    label: "Scope beyond chat",
    onlocal: "All-in-one: Q&A, training, helpdesk, onboarding, timesheets",
    chatgpt: "Chat, assistants, and data analysis",
    copilot: "AI inside Word, Excel, Outlook, Teams, etc.",
  },
  {
    label: "Raw model ceiling",
    onlocal: "Customized open-source models (swappable as they improve)",
    chatgpt: "Frontier proprietary models — strongest raw capability",
    copilot: "Frontier proprietary models via Microsoft",
  },
  {
    label: "Setup",
    onlocal: "Single desktop install — no servers, no DevOps",
    chatgpt: "Cloud rollout + admin config",
    copilot: "Requires Microsoft 365 estate + licensing",
  },
];

const faqs = [
  {
    question: "What is the most private alternative to ChatGPT Enterprise for a small firm?",
    answer:
      "If your requirement is that confidential or client data never leaves your building, an on-premises tool like OnLocalAI is the most private option: the model, the search index, and your files all stay on your own machine, and it works with the network unplugged. ChatGPT Enterprise and Microsoft 365 Copilot are both strong products, but they process your data in the vendor's cloud — which is the exact thing regulated firms often can't allow.",
  },
  {
    question: "Is Microsoft 365 Copilot data private?",
    answer:
      "Microsoft 365 Copilot keeps your prompts and content within your Microsoft 365 service boundary and honors your existing permissions, and Microsoft states it doesn't use your tenant data to train its foundation models. However, processing still happens in Microsoft's cloud, not on your own hardware — so it is not on-premises or air-gappable. For firms whose rule is 'data cannot leave our machines,' that distinction matters.",
  },
  {
    question: "How much does each option cost?",
    answer:
      "Microsoft 365 Copilot is publicly listed at about $30 per user per month on an annual commitment, and requires a qualifying Microsoft 365 license underneath it. ChatGPT Enterprise is custom-priced through OpenAI's sales team, typically annual with seat minimums. OnLocalAI is a local license with no per-token cloud bills; it's currently free during early access.",
  },
  {
    question: "Do I have to give up model quality to keep data on-premises?",
    answer:
      "You trade some raw model ceiling for total privacy. Cloud tools run the largest frontier models. For grounded question-answering over your own documents, though, retrieval quality matters more than raw model size — and OnLocalAI lets you swap in stronger open-source models as they ship, without changing your privacy posture.",
  },
  {
    question: "Who should choose OnLocalAI over ChatGPT Enterprise or Copilot?",
    answer:
      "Choose OnLocalAI if you handle confidential or regulated data (legal, healthcare, accounting/finance), you're a 10–200 person team, and you need AI for knowledge, onboarding, training, and support without any of it going to the cloud. Choose ChatGPT Enterprise if maximum model capability for general knowledge work is the priority and cloud processing is acceptable. Choose Microsoft 365 Copilot if your team lives in Microsoft 365 and you want AI embedded across those apps.",
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
          name: "OnLocalAI vs ChatGPT Enterprise vs Microsoft Copilot",
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

export default function ComparisonPage() {
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
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-800">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700">Compare</span>
        </nav>

        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          OnLocalAI vs ChatGPT Enterprise vs Microsoft Copilot
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          A side-by-side look at three ways to give a team AI — for firms weighing{" "}
          <strong className="font-semibold text-slate-800">privacy, cost, and control</strong>.
        </p>

        {/* TL;DR */}
        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-800">
            The short version
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            <strong>ChatGPT Enterprise</strong> and <strong>Microsoft 365 Copilot</strong> are
            powerful cloud products with the strongest raw models — but both process your data in the
            vendor&apos;s cloud. <strong>OnLocalAI</strong> is the only one of the three that runs
            entirely on your own machines, works offline, and bundles knowledge Q&amp;A, training, a
            helpdesk, onboarding, and timesheets into one install. If your firm legally or
            contractually <em>can&apos;t</em> send client data to the cloud, that architecture
            difference is the whole decision.
          </p>
        </div>

        {/* At-a-glance table */}
        <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
          At a glance
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-semibold text-slate-500">&nbsp;</th>
                {columns.map((col) => (
                  <th key={col.key} className="p-4 align-bottom">
                    <div className="font-semibold text-slate-900">{col.name}</div>
                    <div className="mt-0.5 text-xs font-medium text-slate-500">{col.note}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-slate-50/40" : "bg-white"}>
                  <th className="p-4 align-top text-sm font-semibold text-slate-700">{row.label}</th>
                  <td className="p-4 align-top text-slate-700">
                    <span className="font-medium text-brand-900">{row.onlocal}</span>
                  </td>
                  <td className="p-4 align-top text-slate-600">{row.chatgpt}</td>
                  <td className="p-4 align-top text-slate-600">{row.copilot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Competitor pricing and behavior as publicly documented; verify current terms with each
          vendor. Last reviewed August 2026.
        </p>

        {/* Deep dives */}
        <DeepDive
          title="Privacy & data residency"
          body={
            <>
              <p>
                This is the fork in the road. With <strong>ChatGPT Enterprise</strong>, your prompts
                and documents are sent to OpenAI&apos;s cloud to be processed. With{" "}
                <strong>Microsoft 365 Copilot</strong>, content stays inside your Microsoft 365
                service boundary and honors your existing permissions — but it is still processed in
                Microsoft&apos;s cloud, not on your hardware. Both vendors state your data isn&apos;t
                used to train their foundation models, and both carry serious enterprise security
                certifications.
              </p>
              <p className="mt-3">
                <strong>OnLocalAI</strong> is different by architecture: the model, the vector index,
                and every file live on your own machine. There is no cloud to trust and no telemetry
                to opt out of — you can literally unplug the network and it keeps answering. For a law,
                accounting, or healthcare firm whose rule is <em>&quot;client data cannot leave the
                building,&quot;</em> that&apos;s not a nice-to-have; it&apos;s the requirement.
              </p>
            </>
          }
        />

        <DeepDive
          title="Cost & pricing model"
          body={
            <>
              <p>
                <strong>Microsoft 365 Copilot</strong> is publicly listed at roughly $30 per user per
                month on an annual commitment — on top of the qualifying Microsoft 365 license each
                person already needs. <strong>ChatGPT Enterprise</strong> is custom-priced through
                sales, typically annual with seat minimums. Both are per-seat cloud subscriptions that
                grow with headcount.
              </p>
              <p className="mt-3">
                <strong>OnLocalAI</strong> is a local license with no per-token cloud bills and no
                metered usage — and it&apos;s free during early access. Because it consolidates several
                tools (a wiki, an LMS, a helpdesk, and timesheets) into one app, the comparison
                isn&apos;t only against the AI subscription but against the stack it can replace.
              </p>
            </>
          }
        />

        <DeepDive
          title="Control & customization"
          body={
            <>
              <p>
                Cloud tools give you admin consoles, but the engine itself is the vendor&apos;s — you
                can&apos;t run it where you want, and you depend on their roadmap and uptime.{" "}
                <strong>OnLocalAI</strong> runs on customized open-source models with no vendor
                lock-in; you choose the model size to fit your hardware and can swap in stronger open
                models as they ship. Retrieval is department-scoped and enforced in the engine, so
                people only ever see documents they&apos;re allowed to.
              </p>
            </>
          }
        />

        {/* Who each is for */}
        <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
          Who each one is best for
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <BestFor
            name="OnLocalAI"
            highlight
            points={[
              "Firms that can't send data to the cloud (legal, health, finance)",
              "10–200 person teams",
              "Want knowledge, training, helpdesk & onboarding in one app",
              "Value offline / air-gapped operation",
            ]}
          />
          <BestFor
            name="ChatGPT Enterprise"
            points={[
              "Cloud processing is acceptable",
              "Maximum raw model capability is the priority",
              "General knowledge work across many domains",
            ]}
          />
          <BestFor
            name="Microsoft 365 Copilot"
            points={[
              "Team already lives in Microsoft 365",
              "Want AI embedded in Word, Excel, Outlook, Teams",
              "Have the licensing estate to support it",
            ]}
          />
        </div>

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

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Want AI without sending data to the cloud?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            OnLocalAI gives your team knowledge, training, and support that runs entirely on your own
            machines. Drop your email for an access code and our private-AI playbook.
          </p>
          <div className="mt-6">
            <WaitlistForm source="compare_page" />
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

function BestFor({
  name,
  points,
  highlight = false,
}: {
  name: string;
  points: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight ? "border-brand-300 bg-brand-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <h3 className={`text-sm font-semibold ${highlight ? "text-brand-900" : "text-slate-900"}`}>
        {name}
      </h3>
      <ul className="mt-3 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
            <CheckIcon className={`mt-0.5 h-3.5 w-3.5 flex-none ${highlight ? "text-brand-600" : "text-slate-400"}`} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12.5l4 4 10-10" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
