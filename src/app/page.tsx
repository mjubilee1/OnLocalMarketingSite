import type { ReactNode, SVGProps } from "react";
import { WindowsDownloadButton } from "@/components/WindowsDownloadButton";

const windowsDownloadUrl =
  process.env.NEXT_PUBLIC_DESKTOP_WINDOWS_URL?.trim() ||
  "https://github.com/mjubilee1/Local-LLM-releases/releases/latest/download/Business-AI-windows-setup.exe";

const macDownloadUrl =
  process.env.NEXT_PUBLIC_DESKTOP_MAC_URL?.trim() ||
  "https://github.com/mjubilee1/Local-LLM-releases/releases/latest/download/Business-AI-mac.zip";

const contactEmails = ["montrell@onlocalai.com", "Subash@onlocalai.com"];
const contactHref = `mailto:${contactEmails.join(",")}?subject=${encodeURIComponent(
  "Interested in OnLocalAI"
)}`;

const features = [
  {
    icon: SearchIcon,
    title: "Company knowledge, on demand",
    body: "Ask questions grounded in your policies, SOPs, and wiki — with citations. Draft reports and memos from uploads in a private workspace."
  },
  {
    icon: GraduationIcon,
    title: "Hands-on training that sticks",
    body: "Turn docs into checklists, quizzes, flashcards, and task-based learning paths. Track progress and certify skill levels."
  },
  {
    icon: TicketIcon,
    title: "AI helpdesk built in",
    body: "Employees open tickets; AI triages priority and tags, drafts knowledge-grounded replies, and tracks SLAs for your team."
  },
  {
    icon: UsersIcon,
    title: "Onboarding from day one",
    body: "30-60-90 milestones, role-play practice, and a daily briefing so new hires know what to do next — without chasing experts."
  },
  {
    icon: ClockIcon,
    title: "Timesheets with AI assist",
    body: "Log time in plain English, submit weekly sheets, and let managers approve — with utilization insights when you need them."
  },
  {
    icon: ShieldIcon,
    title: "100% on your machine",
    body: "Models, files, tickets, and training data stay local. Works offline. Nothing is sent to the cloud."
  }
];

const steps = [
  {
    title: "Download the app",
    body: "Enter your access code, then download for Windows or Mac and get running in under a minute."
  },
  {
    title: "Create your company",
    body: "Set up your team, add teammates, and grant admin access where you need it."
  },
  {
    title: "Add knowledge and go",
    body: "Upload policies and training docs, then use chat, training, tickets, and timesheets — all on your computer."
  }
];

const faqs = [
  {
    question: "What does OnLocalAI do?",
    answer:
      "It's a private AI workspace for your team: company knowledge Q&A and report drafting, hands-on training and quizzes, an AI helpdesk, onboarding milestones, and timesheets — all running on your machine."
  },
  {
    question: "Do our files leave our computer?",
    answer:
      "No. OnLocalAI runs locally. Your documents, tickets, training progress, and timesheets never leave your machine."
  },
  {
    question: "What can the knowledge base handle?",
    answer:
      "Policies, SOPs, wikis, contracts, training PDFs, and more. Chat answers with citations; Advanced Chat lets you upload files for a private session and generate grounded reports."
  },
  {
    question: "How does training work?",
    answer:
      "Upload training materials and the AI turns them into interactive checklists, quizzes, flashcards, and prerequisite learning paths. Progress and certifications stay with each employee."
  },
  {
    question: "Is there a helpdesk / ticketing system?",
    answer:
      "Yes. Employees file tickets; AI suggests category, priority, and tags, then drafts replies grounded in your knowledge base. Agents manage SLA, assignment, and resolution."
  },
  {
    question: "Windows SmartScreen blocked the installer. What should I do?",
    answer:
      "Since this is an early release, Windows may warn you. Click 'More info', then 'Run anyway'."
  },
  {
    question: "How do I get an access code?",
    answer:
      "Early access is invite-only. Email montrell@onlocalai.com or Subash@onlocalai.com and we’ll send you a code to unlock the download."
  }
];

export default function MarketingHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/60 text-slate-700">
      <BackdropGlow />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-inset ring-emerald-600/20">
            <ShieldIcon className="h-5 w-5 text-emerald-600" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">OnLocalAI</span>
        </div>
        <a
          href="#download"
          className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500/50 hover:text-slate-900 sm:inline-flex"
        >
          Download
        </a>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <section className="grid items-center gap-12 pb-8 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
          <div className="animate-fade-up">
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Private AI for knowledge, training, and support.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              OnLocalAI runs on your computer — company Q&amp;A, hands-on training, helpdesk,
              onboarding, and timesheets. Nothing leaves your machine.
            </p>

            <div id="download" className="mt-9 flex flex-col gap-3">
              <WindowsDownloadButton
                href={windowsDownloadUrl || "#"}
                macHref={macDownloadUrl || undefined}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <TrustItem>Runs Locally</TrustItem>
              <TrustItem>Works Offline</TrustItem>
              <TrustItem>Team Workspace</TrustItem>
            </div>
          </div>

          <div className="animate-fade-up lg:justify-self-end">
            <AppPreview />
          </div>
        </section>

        <section className="border-t border-slate-200 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Everything your team needs — still fully local
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
            Beyond documents: training, tickets, onboarding, and time tracking in one private workspace.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500/40 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Up and running in three easy steps</h2>
          <p className="mt-1.5 text-sm text-slate-600">No tech skills required. If you can install an app, you can use this.</p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-slate-200 py-14">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-600/20 bg-gradient-to-br from-emerald-50 via-white to-white p-8 shadow-sm sm:p-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Interested? Let&apos;s talk.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Bring knowledge, training, and support in-house — without sending data to the cloud.
                Reach out to get started.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={contactHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  <MailIcon className="h-4 w-4" />
                  Contact us
                </a>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {contactEmails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="transition hover:text-emerald-700"
                    >
                      {email}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">FAQ</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Answers about privacy, setup, and capabilities.
          </p>

          <div className="mt-8 grid gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-emerald-500/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  {faq.question}
                  <ChevronIcon className="h-4 w-4 flex-none text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-slate-500 sm:flex-row">
          <span className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-emerald-600/80" />
            OnLocalAI — private AI for knowledge, training, and support.
          </span>
          <span className="flex items-center gap-4">
            <a href={contactHref} className="transition hover:text-emerald-700">
              Contact
            </a>
            <span>Early access version · free to try.</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
      {children}
    </span>
  );
}

function BackdropGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="animate-float-slower absolute -right-16 top-40 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-900/10 to-transparent" />
    </div>
  );
}

function AppPreview() {
  return (
    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="ml-3 text-[11px] font-medium text-slate-500">OnLocalAI · Local</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Offline
        </span>
      </div>

      <div className="flex gap-1.5 border-b border-slate-100 px-3 py-2">
        {["Chat", "Training", "Tickets", "Timesheet"].map((tab, i) => (
          <span
            key={tab}
            className={`rounded-md px-2 py-1 text-[10px] font-medium ${
              i === 0 ? "bg-emerald-100 text-emerald-700" : "text-slate-400"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="space-y-3 p-4">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
          How do I request VPN access, and who owns the onboarding checklist?
        </div>

        <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
            <SearchIcon className="h-3 w-3" />
            Answered from your knowledge base
          </div>
          <div className="space-y-1.5">
            <span className="block h-2 w-full rounded-full bg-slate-300" />
            <span className="block h-2 w-11/12 rounded-full bg-slate-300" />
            <span className="block h-2 w-4/5 rounded-full bg-slate-300" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <FolderIcon className="h-3 w-3" />
              vpn-and-ssh.md
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationIcon className="h-3 w-3" />
              Day-30 milestone
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <span className="text-[12px] text-slate-400">Ask, train, or open a ticket…</span>
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ArrowUpIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
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
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 00-2 2 2 2 0 002 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 002-2 2 2 0 00-2-2V9z" />
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

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

