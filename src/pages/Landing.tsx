import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Mail, RefreshCw, Users } from 'lucide-react';
import { Logo } from '../layouts/AdminLayout';
import { DEMO_BOOKING_HREF } from '../lib/company';

const HEADACHES = [
  {
    icon: Users,
    title: 'New faces every banquet',
    text: 'Temps and floaters show up cold. You need them guest-ready tonight — not after a week of shadowing.',
  },
  {
    icon: RefreshCw,
    title: 'Standards slip when you’re not on the floor',
    text: 'Plate, table, and station look different by room. Guests notice. You find out from a complaint.',
  },
  {
    icon: ClipboardCheck,
    title: '“Trained” on paper isn’t ready on shift',
    text: 'Certificates and slide decks don’t prove they can build your house standard. You still don’t know who’s safe to roster.',
  },
];

const AUDIENCE = ['Banquet managers', 'F&B training leads', 'Property ops'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_-10%,#e0e7ff_0%,#f8fafc_45%,#ffffff_100%)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <a href={DEMO_BOOKING_HREF} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Book a demo
        </a>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-8 text-center sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">For hotel & banquet managers</p>
        <h1 className="mx-auto mt-6 max-w-3xl font-extrabold tracking-tight text-slate-900">
          <span className="block text-4xl sm:text-6xl">onlocalAI</span>
          <span className="mt-4 block text-2xl font-bold text-slate-800 sm:text-4xl">
            Stop babysitting every cover. Get crew that can actually do the job.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          You need certified, trained workers on the floor — and you don’t have hours to train each one yourself. We turn your house standard into a short video plus a hands-on practice drill, so people prove they can plate, set, and run the station before you put them on the call sheet.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={DEMO_BOOKING_HREF}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            Book a demo <ArrowRight size={16} />
          </a>
          <a
            href={DEMO_BOOKING_HREF}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <Mail size={16} className="text-indigo-600" /> Email us
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">The headaches we take off your plate</h2>
        <ol className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {HEADACHES.map((b) => (
            <li key={b.title} className="text-center sm:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-700 sm:mx-0">
                <b.icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.text}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-600">
          Watch your standard → practice on the picture → know who’s ready for the shift.{' '}
          <a href={DEMO_BOOKING_HREF} className="font-medium text-indigo-700 hover:underline">
            Book a 15-minute walkthrough
          </a>
          .
        </p>
      </section>

      <section className="border-y border-slate-200/80 bg-white/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Built for</h2>
            <p className="mt-1 text-lg font-semibold text-slate-900">Managers who own the floor when the room fills up.</p>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-slate-700">
            {AUDIENCE.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
          <Logo />
          <div className="flex flex-wrap items-center gap-4">
            <a href={DEMO_BOOKING_HREF} className="font-medium text-indigo-700 hover:text-indigo-900">
              Book a demo
            </a>
            <Link to="/admin" className="font-medium text-slate-600 hover:text-slate-900">
              Manager sign-in
            </Link>
            <a href="https://onlocalai.com" className="font-medium text-slate-700 hover:text-slate-900">
              onlocalai.com
            </a>
          </div>
          <span>© {new Date().getFullYear()} onlocalAI</span>
        </div>
      </footer>
    </div>
  );
}
