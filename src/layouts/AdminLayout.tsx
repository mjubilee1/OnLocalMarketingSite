import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, CalendarDays, FileSignature, GraduationCap, LayoutDashboard, ListChecks, Menu, QrCode, RotateCcw, ScrollText, Smartphone, Users, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCompany, useStore } from '../store';
import { initialsOf } from '../lib/company';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/crew', label: 'Crew', icon: Users },
  { to: '/admin/training', label: 'Training', icon: GraduationCap },
  { to: '/admin/flows', label: 'Onboarding flows', icon: ListChecks },
  { to: '/admin/paperwork', label: 'Paperwork & certs', icon: FileSignature },
  { to: '/admin/contracts', label: 'Contracts', icon: ScrollText },
  { to: '/admin/invite', label: 'Invite & hire', icon: QrCode },
  { to: '/admin/settings', label: 'Company profile', icon: Building2 },
];

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center" aria-label="onlocalAI home">
      <img src={light ? '/brand/onlocalai-logo-white.svg' : '/brand/onlocalai-logo.svg'} alt="onlocalAI" className="h-7 w-auto" />
    </Link>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const company = useCompany();
  const reset = useStore((s) => s.resetDemo);
  const toast = useStore((s) => s.toast);
  const loc = useLocation();

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 px-3 py-5">
      <div className="px-2">
        <Logo light />
        <Link to="/admin/settings" className="mt-1 block truncate text-xs text-slate-400 hover:text-white" title="Company profile">
          {company.name}
        </Link>
      </div>
      <nav className="mt-8 flex-1 space-y-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')
            }
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 pt-4">
        <Link to="/app" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
          <Smartphone size={18} /> Open crew app
        </Link>
        <button
          onClick={() => {
            if (confirm('Reset all demo data back to the starting state?')) {
              reset();
              toast('Demo data reset', '🔄');
            }
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer"
        >
          <RotateCcw size={18} /> Reset demo data
        </button>
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">{initialsOf(company.managerName)}</div>
          <div className="text-xs">
            <div className="font-medium text-white">{company.managerName}</div>
            <div className="text-slate-400">{company.managerTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50" />
          <aside className="absolute inset-y-0 left-0 w-64" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      <main key={loc.pathname} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 anim-pop">
        <Outlet />
      </main>
    </div>
  );
}
