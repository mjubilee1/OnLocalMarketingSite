import { Link } from 'react-router-dom';
import { AlertTriangle, BellRing, Building2, CalendarDays, CheckCircle2, Clock, FileSignature, GraduationCap, Megaphone, ScrollText, ShieldCheck, Trophy, UserPlus, Users } from 'lucide-react';
import { Avatar, Button, Card, DateBadge, PageHeader, Progress, Stat } from '../../components/ui';
import { avgRating, eventReadiness, expiringCerts, readiness } from '../../lib/readiness';
import { level } from '../../lib/badges';
import { countdown, daysUntil, pct, relTime } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { Activity } from '../../types';
import { stage } from '../../lib/contracts';

const ACT_ICON: Record<Activity['kind'], typeof Users> = {
  course: GraduationCap,
  doc: FileSignature,
  cert: ShieldCheck,
  event: CalendarDays,
  staff: UserPlus,
  nudge: BellRing,
  badge: Trophy,
};

export default function Dashboard() {
  const staff = useStore((s) => s.staff);
  const events = useStore((s) => s.events);
  const activity = useStore((s) => s.activity);
  const contracts = useStore((s) => s.contracts);
  const orgConfigured = useStore((s) => s.orgConfigured);
  const orgName = useStore((s) => s.orgName);
  const managerName = useStore((s) => s.managerName);
  const nudge = useStore((s) => s.nudge);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();

  const current = staff.filter((s) => s.status !== 'inactive');
  const ready = current.filter((s) => readiness(s, cat).ready);
  const withReadyTime = staff.filter((s) => s.readyAt);
  const hoursToReady = withReadyTime.length
    ? withReadyTime.reduce((a, s) => a + (new Date(s.readyAt!).getTime() - new Date(s.createdAt).getTime()) / 3600000, 0) / withReadyTime.length
    : 0;

  // Course completion across everyone's required training
  let reqCourses = 0;
  let doneCourses = 0;
  current.forEach((s) => {
    readiness(s, cat).items.filter((i) => i.kind === 'course').forEach((i) => {
      reqCourses++;
      if (i.done) doneCourses++;
    });
  });

  const upcoming = events.filter((e) => e.status !== 'completed' && daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));

  // Needs attention
  const atRisk = upcoming
    .filter((e) => daysUntil(e.date) <= 14)
    .flatMap((e) =>
      e.assignments
        .map((a) => ({ e, s: staff.find((x) => x.id === a.staffId)! }))
        .filter(({ s }) => s && !eventReadiness(s, cat, e).ready),
    );
  const expiring = staff.flatMap((s) => expiringCerts(s, 30).map((c) => ({ s, c, ct: cat.certTypes.find((t) => t.id === c.certId) })));
  const unverified = staff.flatMap((s) => s.certs.filter((c) => !c.verified).map((c) => ({ s, c, ct: cat.certTypes.find((t) => t.id === c.certId) })));
  const stalled = staff.filter((s) => s.status === 'invited');
  const toCountersign = contracts.filter((c) => stage(c) === 'awaiting_employer');

  const leaders = [...current].sort((a, b) => b.points - a.points).slice(0, 5);

  return (
    <>
      <PageHeader
        title={'Good morning, ' + managerName.split(' ')[0] + ' 👋'}
        sub="Here's how your crew is tracking for upcoming events."
        actions={
          <>
            <Link to="/admin/invite">
              <Button variant="secondary">
                <UserPlus size={16} /> Invite crew
              </Button>
            </Link>
            <Link to="/admin/events/new">
              <Button>
                <CalendarDays size={16} /> New event
              </Button>
            </Link>
          </>
        }
      />

      {!orgConfigured && (
        <Link to="/admin/settings" className="mb-6 flex items-center gap-4 rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-200 hover:bg-indigo-100">
          <div className="rounded-lg bg-white p-2 text-indigo-600">
            <Building2 size={20} />
          </div>
          <div className="flex-1 text-sm">
            <div className="font-semibold text-indigo-950">Add your company details</div>
            <div className="text-indigo-800">Documents and contracts currently show “{orgName}”. Set your legal company name, address and signatory so they appear on everything your crew signs.</div>
          </div>
          <span className="text-sm font-medium text-indigo-700">Set up →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active crew" value={current.length} sub={`${staff.filter((s) => s.status === 'inactive').length} alumni in talent pool`} icon={<Users size={18} />} />
        <Stat label="Shift-ready" value={`${pct(ready.length, current.length)}%`} sub={`${ready.length} of ${current.length} fully onboarded`} icon={<CheckCircle2 size={18} />} />
        <Stat label="Avg. time to ready" value={`${hoursToReady < 48 ? hoursToReady.toFixed(1) + ' h' : (hoursToReady / 24).toFixed(1) + ' days'}`} sub="From sign-up to 100% ready" icon={<Clock size={18} />} />
        <Stat label="Training completion" value={`${pct(doneCourses, reqCourses)}%`} sub={`${doneCourses} / ${reqCourses} required courses`} icon={<GraduationCap size={18} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Upcoming events</h2>
              <Link to="/admin/events" className="text-sm font-medium text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {upcoming.map((e) => {
                const need = e.shifts.reduce((a, s) => a + s.headcount, 0);
                const filled = e.assignments.length;
                const readyCount = e.assignments.filter((a) => {
                  const s = staff.find((x) => x.id === a.staffId);
                  return s && eventReadiness(s, cat, e).ready;
                }).length;
                return (
                  <Link key={e.id} to={`/admin/events/${e.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <DateBadge date={e.date} colorKey={e.color} />
                    <div className="min-w-40 flex-1">
                      <div className="font-medium text-slate-900">
                        {e.name} {e.status === 'draft' && <span className="ml-1 text-xs font-normal text-slate-400">Draft</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {countdown(e.date)} • {e.venue}
                      </div>
                    </div>
                    <div className="w-36">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Staffed</span>
                        <span className="font-medium text-slate-700">
                          {filled}/{need}
                        </span>
                      </div>
                      <Progress value={pct(filled, need)} barClass="bg-sky-500" />
                    </div>
                    <div className="w-36">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Ready</span>
                        <span className="font-medium text-slate-700">
                          {readyCount}/{filled}
                        </span>
                      </div>
                      <Progress value={pct(readyCount, filled)} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <AlertTriangle size={18} className="text-amber-500" /> Needs attention
              </h2>
              {atRisk.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const ids = Array.from(new Set(atRisk.map((x) => x.s.id)));
                    nudge(ids);
                    toast(`Reminders sent to ${ids.length} crew`, '📣');
                  }}
                >
                  <Megaphone size={14} /> Nudge all at-risk
                </Button>
              )}
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              {atRisk.map(({ e, s }) => {
                const r = eventReadiness(s, cat, e);
                return (
                  <div key={e.id + s.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={s.name} size="sm" />
                    <div className="flex-1">
                      <Link to={`/admin/crew/${s.id}`} className="font-medium text-slate-900 hover:underline">
                        {s.name}
                      </Link>{' '}
                      <span className="text-slate-500">
                        is {r.pct}% ready for {e.name} ({countdown(e.date).toLowerCase()})
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{s.lastNudgedAt ? `nudged ${relTime(s.lastNudgedAt)}` : `${r.total - r.done} items left`}</span>
                  </div>
                );
              })}
              {expiring.map(({ s, c, ct }) => (
                <div key={s.id + c.certId} className="flex items-center gap-3 px-5 py-3">
                  <ShieldCheck size={18} className="text-rose-500" />
                  <div className="flex-1">
                    <Link to={`/admin/crew/${s.id}`} className="font-medium text-slate-900 hover:underline">
                      {s.name}
                    </Link>{' '}
                    <span className="text-slate-500">
                      — {ct?.name} {daysUntil(c.expiresAt) < 0 ? 'has expired' : `expires in ${daysUntil(c.expiresAt)} days`}
                    </span>
                  </div>
                </div>
              ))}
              {unverified.map(({ s, c, ct }) => (
                <div key={'u' + s.id + c.certId} className="flex items-center gap-3 px-5 py-3">
                  <ShieldCheck size={18} className="text-amber-500" />
                  <div className="flex-1">
                    <Link to={`/admin/crew/${s.id}`} className="font-medium text-slate-900 hover:underline">
                      {s.name}
                    </Link>{' '}
                    <span className="text-slate-500">uploaded {ct?.name} — needs verification</span>
                  </div>
                  <Link to={`/admin/crew/${s.id}`}>
                    <Button size="sm" variant="secondary">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
              {toCountersign.map((c) => (
                <div key={'k' + c.id} className="flex items-center gap-3 px-5 py-3">
                  <ScrollText size={18} className="text-violet-500" />
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{c.staff.name}</span> <span className="text-slate-500">signed “{c.title}” — waiting for your countersignature</span>
                  </div>
                  <Link to={`/admin/contracts/${c.id}`}>
                    <Button size="sm">Sign</Button>
                  </Link>
                </div>
              ))}
              {stalled.map((s) => (
                <div key={'st' + s.id} className="flex items-center gap-3 px-5 py-3">
                  <UserPlus size={18} className="text-slate-400" />
                  <div className="flex-1">
                    <Link to={`/admin/crew/${s.id}`} className="font-medium text-slate-900 hover:underline">
                      {s.name}
                    </Link>{' '}
                    <span className="text-slate-500">was invited {relTime(s.createdAt)} but hasn't started</span>
                  </div>
                </div>
              ))}
              {atRisk.length + expiring.length + unverified.length + stalled.length + toCountersign.length === 0 && <div className="px-5 py-8 text-center text-slate-500">All clear 🎉</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <Trophy size={18} className="text-amber-500" /> Crew leaderboard
              </h2>
            </div>
            <ol className="divide-y divide-slate-100">
              {leaders.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 text-center text-sm font-bold text-slate-400">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
                  <Avatar name={s.name} size="sm" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">
                      {level(s.points).name} • {s.eventsWorked} events {s.ratings.length > 0 && `• ★ ${avgRating(s).toFixed(1)}`}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{s.points}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Live activity</h2>
            </div>
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-auto">
              {activity.slice(0, 20).map((a) => {
                const Icon = ACT_ICON[a.kind];
                return (
                  <li key={a.id} className="flex gap-3 px-5 py-3 text-sm">
                    <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <div className="flex-1 text-slate-700">{a.text}</div>
                    <span className="shrink-0 text-xs text-slate-400">{relTime(a.at)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
