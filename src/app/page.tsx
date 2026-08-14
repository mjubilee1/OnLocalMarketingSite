import type { ReactNode, SVGProps } from "react";
import { ContactLink } from "@/components/ContactLink";
import { WindowsDownloadButton } from "@/components/WindowsDownloadButton";
import { Logo, BrandMark } from "@/components/Logo";

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
    body: "Onboarding depends on who had time that week. One person gets a walkthrough. The next gets a folder of PDFs. Quality becomes luck, not a process.",
  },
  {
    icon: SearchIcon,
    title: "The real answers live in people, not the handbook",
    body: "SOPs go stale the day they're written. New hires ping Slack. Managers answer the same questions again. Tribal knowledge never makes it into the system.",
  },
  {
    icon: GraduationIcon,
    title: "Training, tickets, and docs don't add up to a path",
    body: "Knowledge is in Drive. Training is a deck. Support is a shared inbox. Nobody can see what a new hire has actually learned — or what's still blocking them.",
  },
];

const features = [
  {
    icon: UsersIcon,
    title: "Onboarding from day one",
    body: "A personalized home dashboard with 30-60-90 milestones, this-week hours, open tickets, recent quiz scores, and an AI daily briefing — so every new hire knows what's next, not just the ones with a patient manager.",
  },
  {
    icon: SearchIcon,
    title: "Grounded company Q&A",
    body: "Ask across your policies, SOPs, and wikis and get answers with citations. Retrieval is scoped to each employee's department, so people only ever see what they should.",
  },
  {
    icon: GraduationIcon,
    title: "Connected-worker training",
    body: "Turn any document into interactive checklists, flashcards, and quizzes. Task-driven learning paths resolve prerequisites, skip what's already mastered, and badge employees when they finish.",
  },
  {
    icon: TicketIcon,
    title: "AI helpdesk, built in",
    body: "A full ticketing desk with SLA timers, status workflow, and assignment. AI triages priority, category, tags, and sentiment, then drafts knowledge-grounded replies for an agent to review and send.",
  },
  {
    icon: DocumentIcon,
    title: "Advanced Chat & AI reports",
    body: "Open a private, per-session workspace: upload PDF, Word, CSV, or Markdown, ask questions with source citations, then generate a grounded report with an executive summary — download or print it.",
  },
  {
    icon: ClockIcon,
    title: "Timesheets with AI assist",
    body: "Log time in plain English, submit weekly sheets, and let managers approve or reject. Utilization and billable-hour insights are generated for you against a standard week.",
  },
];

const moreFeatures = [
  { icon: TerminalIcon, title: "IT terminal diagnostics", body: "Paste an error log and get a safe, step-by-step fix — destructive commands are flagged." },
  { icon: SparklesIcon, title: "Scenario role-play sandbox", body: "Practice sales, support, and tough conversations against an AI that stays in character, then get feedback." },
  { icon: CommandIcon, title: "Command palette", body: "Press ⌘/Ctrl-K anywhere to jump to a section or fire a question straight at the assistant." },
  { icon: DatabaseIcon, title: "Versioned knowledge base", body: "Upload, re-index, and AI-tag documents. Re-uploads bump the version and re-embed automatically." },
  { icon: WalkthroughIcon, title: "Guided walkthroughs", body: "Training PDFs stream as step-by-step guides with the document's own screenshots inline." },
  { icon: OrgIcon, title: "Directory & org chart", body: "Employee records, managers, and departments power both context and access control." },
];

const steps = [
  {
    title: "Download & enter your code",
    body: "Grab the native app for Windows or Mac, enter your access code, and you're running in under a minute — no servers to stand up.",
  },
  {
    title: "Create your workspace",
    body: "Set up your company, add teammates and managers from the Admin tab, and grant admin access where you need it.",
  },
  {
    title: "Add knowledge & go",
    body: "Upload policies and training docs to index them locally, then use Chat, Training, Tickets, and Timesheets — all on your own machine.",
  },
];

const stack = [
  { icon: ChipIcon, title: "Customized open-source models", body: "Tuned open-source language and embedding models run entirely on-device — no proprietary APIs, no per-token bills, no vendor lock-in." },
  { icon: DatabaseIcon, title: "On-disk vector store", body: "A persistent local index keeps every embedding on your machine. Your documents are never uploaded to be indexed or searched." },
  { icon: ServerIcon, title: "Self-contained backend", body: "The whole engine is bundled inside the desktop app. No external API keys, no accounts, and no telemetry of any kind." },
];

const faqs = [
  {
    question: "What does OnLocalAI do?",
    answer:
      "It replaces messy, inconsistent onboarding with one private workspace: grounded company Q&A with citations, hands-on training and quizzes, an AI helpdesk with SLAs, 30-60-90 onboarding milestones, and timesheets — all running on your own machine.",
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
      "Upload materials and the AI turns them into interactive checklists, flashcards, and quizzes. Task-driven learning paths resolve the full prerequisite chain, skip what an employee already knows, and award a badge on completion. Progress and certifications stay with each person.",
  },
  {
    question: "Is there a helpdesk and ticketing system?",
    answer:
      "Yes — a full Zendesk-style desk with SLA timers, a status workflow, and assignment. AI suggests category, priority, tags, and sentiment on triage, then drafts replies grounded in your knowledge base for an agent to send.",
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

export default function MarketingHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-700">
      <BackdropGlow />

      {/* ---------------- Header ---------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="#top" aria-label="OnLocalAI home" className="shrink-0">
            <Logo height={26} />
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-brand-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ContactLink
              href={bookDemoHref}
              source="header_book_demo"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:px-4"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Book demo
            </ContactLink>
            <a
              href="#download"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:text-brand-900 sm:inline-flex"
            >
              Get the app
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10 mx-auto w-full max-w-6xl px-6">
        {/* ---------------- Hero ---------------- */}
        <section className="grid items-center gap-12 pb-10 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-brand-600" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-700" />
              </span>
              For fast-growing teams
            </span>

            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem]">
              Fast-growing companies have{" "}
              <span className="text-brand-900">messy, inconsistent onboarding</span>.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Handbooks go stale. Training is a PDF. The real answers live in Slack.
              Every new hire gets a different version of &ldquo;how we do things here&rdquo; —
              and it only gets worse as you scale.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              OnLocalAI puts knowledge, training, and support in one private app on your
              machine, so every hire follows the same grounded path. Nothing leaves the building.
            </p>

            <div id="download" className="mt-9 scroll-mt-24">
              <WindowsDownloadButton
                href={windowsDownloadUrl || "#"}
                macHref={macDownloadEnabled ? macDownloadUrl || undefined : undefined}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <TrustItem>Runs 100% locally</TrustItem>
              <TrustItem>Works offline</TrustItem>
              <TrustItem>Department-scoped access</TrustItem>
              <TrustItem>Windows &amp; macOS</TrustItem>
            </div>
          </div>

          <div className="animate-fade-up-slow lg:justify-self-end">
            <AppPreview />
          </div>
        </section>

        {/* ---------------- The problem ---------------- */}
        <section id="problem" className="scroll-mt-24 py-16 lg:py-20">
          <SectionHeading
            eyebrow="The problem"
            title="Growth breaks onboarding before it breaks the product"
            subtitle="When headcount outruns process, new hires don't fail because they're unprepared — they fail because the company never gave them the same playbook twice."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {problems.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/15">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            That&apos;s the cost: managers repeat themselves, ramp time stretches, and
            &ldquo;how we work&rdquo; becomes whoever happened to sit next to you.
            OnLocalAI is built to make that path consistent — without sending a byte to the cloud.
          </p>
        </section>

        {/* ---------------- Stats strip ---------------- */}
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-6 text-center">
              <div className="text-2xl font-semibold tracking-tight text-brand-900">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="scroll-mt-24 py-16 lg:py-20">
          <SectionHeading
            eyebrow="The fix"
            title="One private workspace so every hire gets the same path"
            subtitle="Knowledge, training, tickets, and 30–60–90 onboarding in one app — grounded in your docs, scoped by department, running on your hardware."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/15 transition group-hover:bg-brand-900 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>

          {/* Secondary feature list */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
            <h3 className="text-sm font-semibold text-slate-900">And more — all on-device</h3>
            <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {moreFeatures.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-inset ring-slate-200">
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
        </section>

        {/* ---------------- Privacy / architecture ---------------- */}
        <section id="privacy" className="scroll-mt-24 py-4">
          <div className="relative overflow-hidden rounded-3xl border border-brand-800 bg-brand-950 p-8 text-brand-100 shadow-xl shadow-brand-900/20 sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
                  <LockIcon className="h-3.5 w-3.5" />
                  Private by architecture
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Your data never leaves the building
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-100/80">
                  There&apos;s no cloud to trust and no telemetry to opt out of. The model,
                  the vector index, and every file live on your machine — so OnLocalAI keeps
                  working with the network unplugged.
                </p>

                <ul className="mt-6 space-y-2.5">
                  {[
                    "No external API keys or accounts",
                    "Department isolation enforced at retrieval",
                    "Grounded answers — 'I don't know' over invention",
                    "Runs air-gapped once models are pulled",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-brand-50">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-brand-300" />
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
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how" className="scroll-mt-24 py-16 lg:py-20">
          <SectionHeading
            eyebrow="Get started"
            title="Up and running in three steps"
            subtitle="No servers, no DevOps. If you can install an app, you can run OnLocalAI."
          />

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- Contact CTA ---------------- */}
        <section className="py-4">
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-8 shadow-sm sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Interested? Let&apos;s talk.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                If onboarding is already slipping as you hire, we can show you a private
                workspace that makes the path consistent — without sending a single byte
                to the cloud. Reach out and we&apos;ll get you a demo and an access code.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <ContactLink
                  href={contactHref}
                  source="contact_section_cta"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800"
                >
                  <MailIcon className="h-4 w-4" />
                  Contact us
                </ContactLink>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {contactEmails.map((email) => (
                    <ContactLink
                      key={email}
                      href={`mailto:${email}`}
                      source="contact_section_email"
                      className="font-medium text-brand-800 transition hover:text-brand-900 hover:underline"
                    >
                      {email}
                    </ContactLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="scroll-mt-24 py-16 lg:py-20">
          <SectionHeading
            eyebrow="FAQ"
            title="Answers on privacy, setup & capabilities"
          />

          <div className="mt-10 grid gap-3">
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
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative z-10 border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo height={24} />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Private, on-premises AI for company knowledge, training, and support.
              Runs on your own hardware — nothing leaves your machine.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm sm:items-end">
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-slate-600">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="transition hover:text-brand-900">
                  {link.label}
                </a>
              ))}
              <ContactLink href={contactHref} source="footer_contact" className="transition hover:text-brand-900">
                Contact
              </ContactLink>
            </nav>
            <span className="text-xs text-slate-500">
              Early access · free to try. © {new Date().getFullYear()} OnLocalAI.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================ Building blocks ============================ */

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
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}

function TrustItem({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <CheckIcon className="h-3.5 w-3.5 text-brand-600" />
      {children}
    </span>
  );
}

function BackdropGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="animate-float-slower absolute -right-16 top-40 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-900/10 to-transparent" />
    </div>
  );
}

function AppPreview() {
  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/50 via-transparent to-sky-200/40 blur-2xl" />
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-brand-900/10">
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

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}
