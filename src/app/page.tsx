import type { ReactNode, SVGProps } from "react";
import { ContactLink } from "@/components/ContactLink";
import { BrandMark } from "@/components/Logo";
import { WindowsDownloadButton } from "@/components/WindowsDownloadButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const windowsDownloadUrl =
  process.env.NEXT_PUBLIC_DESKTOP_WINDOWS_URL?.trim() ||
  "https://github.com/mjubilee1/OnLocalMarketingSite/releases/latest/download/Business-AI-windows-setup.exe";

const macDownloadUrl =
  process.env.NEXT_PUBLIC_DESKTOP_MAC_URL?.trim() ||
  "https://github.com/mjubilee1/OnLocalMarketingSite/releases/latest/download/onlocalAI-mac.zip";
const macDownloadEnabled = false;

const contactEmails = ["montrell@onlocalai.com", "Subash@onlocalai.com"];
const contactHref = `mailto:${contactEmails.join(",")}?subject=${encodeURIComponent(
  "Interested in OnLocalAI"
)}`;
const bookDemoHref = `mailto:${contactEmails.join(",")}?subject=${encodeURIComponent(
  "Book a demo — OnLocalAI"
)}`;

const navLinks = [
  { label: "The problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "Privacy", href: "#privacy" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

const stats = [
  { value: "100%", label: "Runs on your hardware" },
  { value: "0 bytes", label: "Sent to the cloud" },
  { value: "8-in-1", label: "Modules, one install" },
  { value: "Win · Mac", label: "Native desktop app" },
];

const problems = [
  {
    icon: UsersIcon,
    title: "Every hire gets a different first 90 days",
    body: "Onboarding depends on who's free that week. A walkthrough for one hire, a PDF dump for the next.",
  },
  {
    icon: SearchIcon,
    title: "The real answers live in people, not the handbook",
    body: "SOPs go stale the day they're written. Hires ping Slack; managers repeat themselves.",
  },
  {
    icon: GraduationIcon,
    title: "Docs, training, and tickets don't add up to a path",
    body: "Knowledge in Drive. Training in a deck. Support in an inbox. Nobody sees what a hire has learned.",
  },
];

const features = [
  {
    icon: UsersIcon,
    title: "Onboarding from day one",
    body: "Personalized dashboard: 30-60-90 milestones, hours, open tickets, AI daily briefing. Every hire knows what's next.",
  },
  {
    icon: SearchIcon,
    title: "Grounded company Q&A",
    body: "Answers from your policies, SOPs, and wikis — with citations. Scoped by department, so people see only what they should.",
  },
  {
    icon: GraduationIcon,
    title: "Connected-worker training",
    body: "Any document becomes checklists, flashcards, and quizzes. Learning paths skip what's mastered and badge each hire.",
  },
  {
    icon: TicketIcon,
    title: "AI helpdesk, built in",
    body: "Full ticketing with SLA timers and assignment. AI triages priority, category, and sentiment — then drafts grounded replies to send.",
  },
  {
    icon: DocumentIcon,
    title: "Advanced Chat & AI reports",
    body: "Private per-session workspace. Upload PDF, Word, CSV, or Markdown, ask with citations, export a report.",
  },
  {
    icon: ClockIcon,
    title: "Timesheets with AI assist",
    body: "Log time in plain English. Submit weekly, approve or reject. Utilization and billable insights, generated for you.",
  },
];

const moreFeatures = [
  { icon: TerminalIcon, title: "IT terminal diagnostics", body: "Paste an error log and get a safe, step-by-step fix — destructive commands are flagged." },
  { icon: SparklesIcon, title: "Scenario role-play sandbox", body: "Practice sales, support, and hard conversations against an in-character AI. Get feedback." },
  { icon: CommandIcon, title: "Command palette", body: "Press ⌘/Ctrl-K anywhere to jump to a section or fire a question straight at the assistant." },
  { icon: DatabaseIcon, title: "Versioned knowledge base", body: "Upload, re-index, and AI-tag documents. Re-uploads bump the version and re-embed automatically." },
  { icon: WalkthroughIcon, title: "Guided walkthroughs", body: "Training PDFs stream as step-by-step guides with the document's own screenshots inline." },
  { icon: OrgIcon, title: "Directory & org chart", body: "Employee records, managers, and departments power both context and access control." },
];

const capabilities = [
  { icon: UsersIcon, label: "Onboarding from day one" },
  { icon: SearchIcon, label: "Grounded company Q&A" },
  { icon: GraduationIcon, label: "Connected-worker training" },
  { icon: TicketIcon, label: "AI helpdesk with SLAs" },
  { icon: DocumentIcon, label: "Advanced Chat & reports" },
  { icon: ClockIcon, label: "Timesheets with AI" },
];

const steps = [
  {
    title: "Download & enter your code",
    body: "Grab the Windows app, enter your access code, running in a minute. No servers.",
  },
  {
    title: "Create your workspace",
    body: "Set up your company. Add teammates and managers from the Admin tab.",
  },
  {
    title: "Add knowledge & go",
    body: "Upload policies and training docs to index locally. Then Chat, Training, Tickets, Timesheets.",
  },
];

const stack = [
  { icon: ChipIcon, title: "Customized open-source models", body: "Tuned open-source models run entirely on-device — no proprietary APIs, no per-token bills, no lock-in." },
  { icon: DatabaseIcon, title: "On-disk vector store", body: "Persistent local index keeps every embedding on your machine. Nothing uploaded to be indexed." },
  { icon: ServerIcon, title: "Self-contained backend", body: "The whole engine is bundled in the app. No API keys, no accounts, no telemetry." },
];

const faqs = [
  {
    question: "What does OnLocalAI do?",
    answer:
      "One private workspace for onboarding: grounded company Q&A with citations, training and quizzes, an AI helpdesk with SLAs, 30-60-90 milestones, and timesheets — all on your own machine.",
  },
  {
    question: "Do our files ever leave our computer?",
    answer:
      "No. OnLocalAI runs entirely on-premises. The language model, embeddings, vector index, tickets, training progress, and timesheets all stay on your hardware. It works fully offline once the models are pulled.",
  },
  {
    question: "How is access controlled between departments?",
    answer:
      "Retrieval is hard-scoped to each employee's department plus company-wide documents, enforced in the retrieval engine — not just requested in a prompt. People can't pull answers from documents outside their access.",
  },
  {
    question: "What can the knowledge base handle?",
    answer:
      "Policies, SOPs, wikis, contracts, and training PDFs. Chat answers with citations; Advanced Chat lets you upload files for a private session and generate grounded, downloadable reports with executive summaries.",
  },
  {
    question: "How does training work?",
    answer:
      "Upload materials and the AI turns them into checklists, flashcards, and quizzes. Learning paths resolve prerequisites, skip what an employee already knows, and award a badge on completion. Progress stays with each person.",
  },
  {
    question: "Is there a helpdesk and ticketing system?",
    answer:
      "Yes — a full desk with SLA timers, status workflow, and assignment. AI triages category, priority, and sentiment, then drafts grounded replies for an agent to send.",
  },
  {
    question: "What does it run on under the hood?",
    answer:
      "Customized open-source language and embedding models running on-device, a persistent local vector store, and a self-contained backend — all bundled inside a native desktop app for Windows and macOS. No proprietary AI services are involved.",
  },
  {
    question: "Windows SmartScreen blocked the installer. What should I do?",
    answer:
      "Since this is an early release, Windows may warn you. Click 'More info', then 'Run anyway'. On macOS, right-click the app and choose Open the first time.",
  },
  {
    question: "How do I get an access code?",
    answer:
      "Early access is invite-only. Email montrell@onlocalai.com or Subash@onlocalai.com and we'll send you a code to unlock the download.",
  },
];

// Organization, WebSite, and SoftwareApplication schema live globally in
// layout.tsx (organizationJsonLd). This page only adds the FAQ schema so we
// don't emit conflicting duplicate entities.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://onlocalai.com/#faq",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white text-slate-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ---------------- Header ---------------- */}
      <SiteHeader navLinks={navLinks} bookDemoHref={bookDemoHref} showGetApp />

      <main id="top">
        {/* ---------------- Hero (dark, immersive) ---------------- */}
        <section className="relative overflow-hidden bg-brand-950 text-white">
          <HeroGlow />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-20">
            <div className="animate-fade-up">
              <Badge tone="dark">
                <SparklesIcon className="h-3.5 w-3.5 text-brand-300" />
                For fast-growing teams
              </Badge>

<h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.15rem]">
                Fast-growing companies have{" "}
                <span className="bg-gradient-to-r from-brand-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  messy, inconsistent onboarding
                </span>
                .
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/85">
                Handbooks go stale. Training&apos;s a PDF. Real answers hide in Slack —
                so every hire learns a different version of how you work.
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-brand-100/70">
                Knowledge, training, and support in one private app. Every hire, same
                path. Nothing leaves your machine.
              </p>

              <div id="download" className="mt-9 scroll-mt-24">
                <WindowsDownloadButton
                  href={windowsDownloadUrl || "#"}
                  macHref={macDownloadEnabled ? macDownloadUrl || undefined : undefined}
                />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-brand-100/70">
                <TrustItem>Runs 100% locally</TrustItem>
                <TrustItem>Works offline</TrustItem>
                <TrustItem>Department-scoped access</TrustItem>
                <TrustItem>Windows &amp; macOS</TrustItem>
              </div>
            </div>

            <div className="animate-fade-up-slow justify-self-center lg:justify-self-end">
              <AppPreview />
            </div>
          </div>

          {/* Capabilities strip */}
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-6">
              {capabilities.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-start gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-brand-200">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xs font-medium leading-snug text-brand-100/90">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- The problem (light) ---------------- */}
        <section id="problem" className="scroll-mt-24 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <SectionHeading
              eyebrow="The problem"
              title="Growth breaks onboarding before it breaks the product"
              subtitle="Headcount outruns process — and no two hires ever get the same playbook."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {problems.map(({ icon: Icon, title, body }, i) => (
                <article
                  key={title}
                  className="rounded-[1.75rem] border border-slate-200/70 bg-white p-7 shadow-sm shadow-brand-950/[0.03] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/5"
                >
                  <IconChip Icon={Icon} mint={i % 2 === 1} />
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
                </article>
              ))}
            </div>

            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              The cost: slow ramp, repeated questions, and &ldquo;how we work&rdquo;
              meaning whoever sat next to you. OnLocalAI makes the path consistent — without
              sending a byte to the cloud.
            </p>
          </div>
        </section>

        {/* ---------------- Stats band (navy) ---------------- */}
        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 rounded-[2rem] bg-brand-950 px-8 py-10 sm:grid-cols-4 sm:px-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="bg-gradient-to-r from-brand-200 to-cyan-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wide text-brand-100/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Features (light) ---------------- */}
        <section id="features" className="scroll-mt-24 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <SectionHeading
              eyebrow="The fix"
              title="One private workspace so every hire gets the same path"
              subtitle="Knowledge, training, tickets, and 30–60–90 onboarding in one app — grounded in your docs, scoped by department, running on your hardware."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }, i) => (
                <article
                  key={title}
                  className="group rounded-[1.75rem] border border-slate-200/70 bg-white p-7 shadow-sm shadow-brand-950/[0.03] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/5"
                >
                  <IconChip Icon={Icon} mint={i % 2 === 1} hover />
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
                </article>
              ))}
            </div>

            {/* Secondary feature list */}
            <div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-brand-50/50 p-7">
              <h3 className="text-sm font-bold text-slate-900">And more — all on-device</h3>
              <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {moreFeatures.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-inset ring-slate-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Privacy / architecture (dark) ---------------- */}
        <section id="privacy" className="scroll-mt-24 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 pb-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-brand-950 p-8 text-brand-100 shadow-xl shadow-brand-900/20 sm:p-14">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
              <BrandMark className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-56 text-white/[0.04]" />

              <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div>
                  <Badge tone="dark">
                    <LockIcon className="h-3.5 w-3.5" />
                    Private by architecture
                  </Badge>
                  <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Your data never leaves the building
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-100/80">
                    No cloud to trust. No telemetry to opt out of. Model, index, and files
                    stay on your machine — working with the network unplugged.
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {[
                      "No external API keys or accounts",
                      "Department isolation enforced at retrieval",
                      "Grounded answers — 'I don't know' over invention",
                      "Runs air-gapped once models are pulled",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-brand-50">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-cyan-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3">
                  {stack.map(({ icon: Icon, title, body }) => (
                    <div
                      key={title}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
                    >
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/10 text-brand-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{title}</div>
                        <p className="mt-1 text-xs leading-relaxed text-brand-100/70">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- How it works (light) ---------------- */}
        <section id="how" className="scroll-mt-24 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <SectionHeading
              eyebrow="Get started"
              title="Up and running in three steps"
              subtitle="No servers, no DevOps. If you can install an app, you can run OnLocalAI."
            />

            <ol className="mt-12 grid gap-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-b from-brand-50/70 to-white p-7 shadow-sm shadow-brand-950/[0.03]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-lg font-extrabold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Contact CTA (dark) ---------------- */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-950 px-8 py-16 text-center shadow-xl shadow-brand-900/20 sm:px-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                See it on your own{" "}
                <span className="bg-gradient-to-r from-brand-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  machine
                </span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-100/80 sm:text-base">
                Knowledge, training, and support in one private app. Nothing leaves your
                machine. Book a demo — we&apos;ll set you up.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4">
                <ContactLink
                  href={bookDemoHref}
                  source="cta_band_book_demo"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-950 shadow-lg shadow-brand-950/30 transition hover:bg-brand-100"
                >
                  Book a demo
                  <ArrowCircle className="h-5 w-5" />
                </ContactLink>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-brand-100/70">
                  <span>or email</span>
                  {contactEmails.map((email) => (
                    <ContactLink
                      key={email}
                      href={`mailto:${email}`}
                      source="contact_section_email"
                      className="font-medium text-brand-200 transition hover:text-white hover:underline"
                    >
                      {email}
                    </ContactLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ (light) ---------------- */}
        <section id="faq" className="scroll-mt-24 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <SectionHeading eyebrow="FAQ" title="Answers on privacy, setup & capabilities" />

            <div className="mt-12 grid gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-brand-950/[0.03] transition open:border-brand-200 open:bg-brand-50/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-900">
                    {faq.question}
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-open:rotate-180 group-open:bg-brand-900 group-open:text-white">
                      <ChevronIcon className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Footer (dark) ---------------- */}
      <SiteFooter navLinks={navLinks} contactHref={contactHref} />
    </div>
  );
}

/* ============================ Building blocks ============================ */

function Badge({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  const cls =
    tone === "dark"
      ? "border-white/15 bg-white/5 text-brand-100 backdrop-blur"
      : "border-brand-200 bg-brand-50 text-brand-700";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <Badge tone="light">
        <SparklesIcon className="h-3.5 w-3.5 text-brand-500" />
        {eyebrow}
      </Badge>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
}

function IconChip({
  Icon,
  mint = false,
  hover = false,
}: {
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
  mint?: boolean;
  hover?: boolean;
}) {
  const base = mint
    ? "bg-teal-50 text-teal-600 ring-teal-600/15"
    : "bg-brand-50 text-brand-700 ring-brand-600/15";
  const hoverCls = hover
    ? mint
      ? " transition group-hover:bg-teal-600 group-hover:text-white"
      : " transition group-hover:bg-brand-900 group-hover:text-white"
    : "";
  return (
    <span
      className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset ${base}${hoverCls}`}
    >
      <Icon className="h-5.5 w-5.5" />
    </span>
  );
}

function TrustItem({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <CheckIcon className="h-3.5 w-3.5 text-cyan-300" />
      {children}
    </span>
  );
}

function HeroGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" />
      <div className="animate-float-slower absolute -right-16 top-20 h-[26rem] w-[26rem] rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
    </div>
  );
}

function AppPreview() {
  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-br from-brand-500/30 via-transparent to-cyan-400/25 blur-2xl" />
      <div className="rounded-[1.5rem] border border-white/10 bg-white shadow-2xl shadow-brand-950/40">
        <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <BrandMark className="h-3.5 w-3.5 text-brand-900" />
            OnLocalAI · Local
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            Offline
          </span>
        </div>

        <div className="flex gap-1.5 border-b border-slate-100 px-3 py-2">
          {["Chat", "Training", "Tickets", "Timesheet"].map((tab, i) => (
            <span
              key={tab}
              className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                i === 0 ? "bg-brand-100 text-brand-800" : "text-slate-400"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="space-y-3 p-4">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
            I just started. What do I actually need to do this week, and where is VPN access documented?
          </div>

          <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-brand-700">
              <SearchIcon className="h-3 w-3" />
              Answered from your knowledge base
            </div>
            <div className="space-y-1.5">
              <span className="block h-2 w-full rounded-full bg-slate-300" />
              <span className="block h-2 w-11/12 rounded-full bg-slate-300" />
              <span className="block h-2 w-4/5 rounded-full bg-slate-300" />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 ring-1 ring-inset ring-slate-200">
                <FolderIcon className="h-3 w-3" />
                vpn-and-ssh.md
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 ring-1 ring-inset ring-slate-200">
                <GraduationIcon className="h-3 w-3" />
                Day-30 milestone
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <span className="text-[12px] text-slate-400">Ask, train, or open a ticket…</span>
            <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg bg-brand-900 text-white">
              <ArrowUpIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Icons ============================ */

function ArrowCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="11" fill="currentColor" fillOpacity="0.12" />
      <path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 018 0v3.5" />
    </svg>
  );
}

function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function GraduationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

function TicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V9z" />
      <path d="M9 7v10" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0111 0" />
      <path d="M16 5.2a3 3 0 010 5.6M17.5 19a5.5 5.5 0 00-3-4.9" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  );
}

function TerminalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M13 15h4" />
    </svg>
  );
}

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
      <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
    </svg>
  );
}

function CommandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 10 3 3V6z" />
    </svg>
  );
}

function DatabaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      <path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}

function WalkthroughIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M3 8h18" />
      <path d="M10 12l3 2-3 2v-4z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function OrgIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-2h12v2" />
    </svg>
  );
}

function ChipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
    </svg>
  );
}

function ServerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
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

function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
