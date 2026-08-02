import type { ReactNode, SVGProps } from "react";

const windowsDownloadUrl =
  process.env.NEXT_PUBLIC_DESKTOP_WINDOWS_URL?.trim() ||
  "https://github.com/mjubilee1/Local-LLM/releases/latest/download/Business-AI-windows-setup.exe";

const contactEmails = ["mjubil96@gmail.com", "guptazsubash@gmail.com"];
const contactHref = `mailto:${contactEmails.join(",")}?subject=${encodeURIComponent(
  "Interested in OnLocalAI"
)}`;

const features = [
  {
    icon: BookIcon,
    title: "Learns your company's voice",
    body: "Analyzes your documents to instantly match your organization's writing style and knowledge. No manual setup needed."
  },
  {
    icon: PenIcon,
    title: "Drafts in your tone",
    body: "Generates reports, memos, and replies that sound exactly like your team wrote them."
  },
  {
    icon: UsersIcon,
    title: "Keeps expertise in-house",
    body: "Turns senior experts' knowledge into onboarding material, so their judgment stays when they leave."
  },
  {
    icon: SearchIcon,
    title: "Answers from your files",
    body: "Get clear answers instantly pulled from your documents, no matter how large your library is."
  }
];

const steps = [
  {
    title: "Download the app",
    body: "Get the app running on Mac or Windows in under a minute."
  },
  {
    title: "Sign up for OnLocalAI",
    body: "Create an account and get a team license to grant access to your entire team."
  },
  {
    title: "Point it at your documents",
    body: "Add your files to safely ask questions and draft memos. Everything stays on your computer."
  }
];

const faqs = [
  {
    question: "What does OnLocalAI do?",
    answer:
      "It learns from your documents to answer questions, draft reports, and create onboarding materials."
  },
  {
    question: "Do our files leave our computer?",
    answer:
      "No. OnLocalAI runs locally. Your documents never leave your machine."
  },
  {
    question: "What kind of documents can we use?",
    answer:
      "Use reports, memos, notes, policies, contracts, or any files your team relies on."
  },
  {
    question: "Can it write in our company's style?",
    answer:
      "Yes. It learns your organization's tone to draft material that matches your style."
  },
  {
    question: "How does this help with onboarding?",
    answer:
      "It converts your documents' expertise into training material, bringing new hires up to speed faster."
  },
  {
    question: "Windows SmartScreen blocked the installer. What should I do?",
    answer:
      "Since this is an early release, Windows may warn you. Click 'More info', then 'Run anyway'."
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
              Your company&apos;s knowledge, captured and put to work.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Learn from your documents to draft reports in your voice, answer questions, and
              preserve expert judgment. 100% local, nothing sent to the cloud.
            </p>

            <div id="download" className="mt-9 flex flex-wrap items-center gap-3">
              <a
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                href={windowsDownloadUrl || "#"}
              >
                <WindowsIcon className="h-4 w-4" />
                Download for Windows
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Alpha
                </span>
              </a>

              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <AppleIcon className="h-4 w-4 text-slate-400" />
                Mac version coming soon
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <TrustItem>Data Privacy</TrustItem>
              <TrustItem>Custom Model</TrustItem>
              <TrustItem>Works Offline</TrustItem>
            </div>
          </div>

          <div className="animate-fade-up lg:justify-self-end">
            <AppPreview />
          </div>
        </section>

        <section className="grid gap-4 border-t border-slate-200 py-14 sm:grid-cols-2 lg:grid-cols-4">
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
                Capture your institutional knowledge while keeping it private. Reach out to get
                started.
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
            OnLocalAI — your private assistant that runs on your own computer.
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

      <div className="space-y-3 p-4">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
          Draft the Q3 vendor review memo in our house style.
        </div>

        <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
            <PenIcon className="h-3 w-3" />
            Drafted in your company&apos;s voice
          </div>
          <div className="space-y-1.5">
            <span className="block h-2 w-full rounded-full bg-slate-300" />
            <span className="block h-2 w-11/12 rounded-full bg-slate-300" />
            <span className="block h-2 w-4/5 rounded-full bg-slate-300" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
            <FolderIcon className="h-3 w-3" />
            Based on 240 of your documents
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <span className="text-[12px] text-slate-400">Ask, draft, or search your documents…</span>
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

function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5v-12z" />
      <path d="M20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5v-12z" />
    </svg>
  );
}

function PenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 5.5l4 4M4 20l1-4L16 5a2.1 2.1 0 013 3L8 19l-4 1z" />
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

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.36 12.85c-.02-2.03 1.66-3 1.74-3.05-.95-1.39-2.42-1.58-2.95-1.6-1.26-.13-2.45.74-3.09.74-.63 0-1.61-.72-2.65-.7-1.37.02-2.63.79-3.33 2.01-1.42 2.46-.36 6.11 1.02 8.11.67.98 1.48 2.08 2.54 2.04 1.02-.04 1.4-.66 2.64-.66 1.23 0 1.58.66 2.65.64 1.09-.02 1.79-1 2.46-1.98.77-1.13 1.09-2.22 1.1-2.28-.02-.01-2.12-.81-2.14-3.21zM14.6 6.86c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.55-.85 2.47.9.07 1.82-.46 2.38-1.13z" />
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

function WindowsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 5.4l7.3-1v7.1H3V5.4zm0 13.2l7.3 1v-7H3v6zm8.3 1.1L21 21V12.5h-9.7v7.2zm0-15.4v7.2H21V3l-9.7 1.3z" />
    </svg>
  );
}
