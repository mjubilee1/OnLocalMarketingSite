import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, House, LayoutDashboard, UserRound } from 'lucide-react';
import { displayName } from '../lib/company';
import { cn } from '../lib/utils';
import { useCompany, useCurrentStaff, useStore } from '../store';

const TABS = [
  { to: '/app', label: 'Home', icon: House, end: true },
  { to: '/app/learn', label: 'Learn', icon: BookOpen },
  { to: '/app/events', label: 'Shifts', icon: CalendarDays },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

export default function WorkerLayout() {
  const me = useCurrentStaff();
  const team = displayName(useCompany());
  const staff = useStore((s) => s.staff);
  const setCurrent = useStore((s) => s.setCurrentStaff);
  const loc = useLocation();
  const immersive = /^\/app\/(learn|docs|contracts)\/[^/]+/.test(loc.pathname);

  return (
    <div className="min-h-screen bg-slate-200/60">
      {/* Demo bar: lets you view the app as any crew member */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-white/80" style={{ backgroundColor: 'var(--brand-ink)' }}>
        <Link to="/admin" className="inline-flex items-center gap-1 hover:text-white">
          <LayoutDashboard size={14} /> Manager view
        </Link>
        <span className="min-w-0 flex-1 truncate text-center font-medium text-white/70">{team}</span>
        <label className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Viewing as</span>
          <select value={me.id} onChange={(e) => setCurrent(e.target.value)} className="rounded bg-white/15 px-1.5 py-0.5 text-white outline-none">
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-28px)] max-w-md flex-col bg-slate-50 shadow-xl">
        <main key={loc.pathname + me.id} className={cn('flex-1 anim-pop', !immersive && 'pb-24')}>
          <Outlet />
        </main>
        {!immersive && (
          <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-4 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium', isActive ? 'text-indigo-600' : 'text-slate-500')}
              >
                <t.icon size={22} />
                {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
