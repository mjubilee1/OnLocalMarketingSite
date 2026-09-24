import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, FileSignature, GraduationCap, QrCode, ShieldCheck, Smartphone, Trophy, Users } from 'lucide-react';
import { Logo } from '../layouts/AdminLayout';
import { useStore } from '../store';

const FEATURES = [
  { icon: QrCode, title: 'Hire from a QR code', text: 'Share one link or poster. New crew sign up on their phone in under a minute.' },
  { icon: FileSignature, title: 'Paperless paperwork', text: 'Contracts, codes of conduct and declarations e-signed with a finger.' },
  { icon: GraduationCap, title: 'Microlearning', text: 'Bite-sized, swipeable lessons with instant quizzes. Done on the bus.' },
  { icon: ShieldCheck, title: 'Compliance on autopilot', text: 'Certificates tracked with expiry alerts. Only ready crew get rostered.' },
  { icon: CalendarDays, title: 'Event briefings', text: 'Call time, venue, dress code, schedule and contacts — one tap away.' },
  { icon: Trophy, title: 'Gamified', text: 'Points, levels and badges keep crews coming back event after event.' },
];

export default function Landing() {
  const code = useStore((s) => s.inviteCode);
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Manager sign-in →
        </Link>
      </header>
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          Built for event staffing • casual crews • high turnover
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          From sign-up to <span className="text-indigo-600">shift-ready</span> in under an hour.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          onlocalAI onboards, trains and briefs the hundreds of short-term staff your events depend on — on their phones, with zero paperwork.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
            <Users size={18} /> Open manager portal <ArrowRight size={16} />
          </Link>
          <Link to="/app" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50">
            <Smartphone size={18} /> Open crew app
          </Link>
          <Link to={`/join/${code}`} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">
            <QrCode size={18} /> Try the sign-up flow
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <f.icon size={22} />
            </div>
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
          <Logo />
          <a href="https://onlocalai.com" className="font-medium text-slate-700 hover:text-slate-900">
            onlocalai.com
          </a>
          <span>© {new Date().getFullYear()} onlocalAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
