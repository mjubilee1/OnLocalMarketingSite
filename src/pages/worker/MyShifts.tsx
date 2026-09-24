import { Link } from 'react-router-dom';
import { ChevronRight, Lock } from 'lucide-react';
import { Card, DateBadge, Pill } from '../../components/ui';
import { readiness } from '../../lib/readiness';
import { countdown, daysUntil } from '../../lib/utils';
import { useCatalog, useCurrentStaff, useStore } from '../../store';

export default function MyShifts() {
  const me = useCurrentStaff();
  const events = useStore((s) => s.events);
  const assign = useStore((s) => s.assign);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();

  const live = events.filter((e) => e.status === 'published' && daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const mine = live.filter((e) => e.assignments.some((a) => a.staffId === me.id));
  const past = events.filter((e) => (e.status === 'completed' || daysUntil(e.date) < 0) && e.assignments.some((a) => a.staffId === me.id));

  // Open shifts for roles I hold
  const open = live
    .filter((e) => !e.assignments.some((a) => a.staffId === me.id))
    .flatMap((e) =>
      e.shifts
        .filter((sh) => me.roleIds.includes(sh.roleId) && e.assignments.filter((a) => a.shiftId === sh.id).length < sh.headcount)
        .map((sh) => ({ e, sh, role: cat.roles.find((r) => r.id === sh.roleId)! })),
    );

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">Shifts</h1>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">My upcoming shifts</h2>
        <div className="space-y-3">
          {mine.map((e) => {
            const a = e.assignments.find((x) => x.staffId === me.id)!;
            const sh = e.shifts.find((x) => x.id === a.shiftId);
            const role = cat.roles.find((r) => r.id === sh?.roleId);
            return (
              <Link key={e.id} to={`/app/events/${e.id}`}>
                <Card className="flex items-center gap-3 p-4">
                  <DateBadge date={e.date} colorKey={e.color} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{e.name}</div>
                    <div className="text-xs text-slate-500">
                      {role?.name} • {sh?.start}–{sh?.end} • {countdown(e.date)}
                    </div>
                    <div className="mt-1">
                      {a.status === 'assigned' ? <Pill className="bg-amber-50 text-amber-700">Please confirm</Pill> : <Pill className="bg-emerald-50 text-emerald-700">Confirmed</Pill>}
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300" />
                </Card>
              </Link>
            );
          })}
          {mine.length === 0 && <Card className="p-6 text-center text-sm text-slate-500">No shifts yet — pick one below!</Card>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Open shifts for you</h2>
        <div className="space-y-3">
          {open.map(({ e, sh, role }) => {
            const ready = readiness(me, cat, [role.id], e.courseIds).ready;
            return (
              <Card key={sh.id} className="flex items-center gap-3 p-4">
                <DateBadge date={e.date} colorKey={e.color} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{e.name}</div>
                  <div className="text-xs text-slate-500">
                    {role.name} • {sh.start}–{sh.end} • ${role.hourlyRate}/hr
                  </div>
                  <div className="text-xs text-slate-400">{e.venue}</div>
                </div>
                {ready ? (
                  <button
                    onClick={() => {
                      assign(e.id, me.id, sh.id);
                      toast('Shift claimed! Check your briefing.', '🎟️');
                    }}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white active:bg-indigo-700"
                  >
                    Claim
                  </button>
                ) : (
                  <Link to="/app" className="flex flex-col items-center rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-medium text-slate-500">
                    <Lock size={14} />
                    Finish training
                  </Link>
                )}
              </Card>
            );
          })}
          {open.length === 0 && <Card className="p-6 text-center text-sm text-slate-500">No open shifts for your roles right now. We'll notify you when new ones drop.</Card>}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Past</h2>
          <div className="space-y-2">
            {past.map((e) => (
              <Card key={e.id} className="flex items-center justify-between p-3 text-sm">
                <span>{e.name}</span>
                <span className="text-xs text-slate-400">{countdown(e.date)}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
