import { Link } from 'react-router-dom';
import { CalendarDays, Camera, ChevronRight, CircleCheck, Clock, FileSignature, GraduationCap, MapPin, ScrollText, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, Pill, Progress, Ring } from '../../components/ui';
import { eventReadiness, readiness, type ReqItem, type ReqKind } from '../../lib/readiness';
import { badge, level } from '../../lib/badges';
import { cn, color, countdown, daysUntil, fmtDay } from '../../lib/utils';
import { useCatalog, useCurrentStaff, useStore } from '../../store';

const ICON: Record<ReqKind, typeof FileSignature> = { profile: Camera, doc: FileSignature, course: GraduationCap, cert: ShieldCheck };
const LABEL: Record<ReqKind, string> = { profile: 'Profile', doc: 'Sign', course: 'Learn', cert: 'Upload' };

export const itemLink = (i: ReqItem) =>
  i.kind === 'profile' ? '/app/profile?setup=1' : i.kind === 'doc' ? `/app/docs/${i.id}` : i.kind === 'course' ? `/app/learn/${i.id}` : `/app/profile?upload=${i.id}`;

export function TodoRow({ item }: { item: ReqItem }) {
  const Icon = ICON[item.kind];
  return (
    <Link to={itemLink(item)} className="flex items-center gap-3 px-4 py-3 active:bg-slate-50">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', item.kind === 'profile' ? 'bg-amber-50 text-amber-600' : item.kind === 'doc' ? 'bg-sky-50 text-sky-600' : item.kind === 'course' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600')}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900">{item.label}</div>
        <div className="text-xs text-slate-500">
          {LABEL[item.kind]} • {item.kind === 'course' && item.progress > 0 ? `${Math.round(item.progress * 100)}% done • ` : ''}
          {item.kind === 'cert' || item.kind === 'profile' ? item.detail : `~${item.minutes} min`}
        </div>
        {item.kind === 'course' && item.progress > 0 && <Progress value={item.progress * 100} className="mt-1.5 h-1" />}
      </div>
      <ChevronRight size={18} className="text-slate-300" />
    </Link>
  );
}

export default function Home() {
  const me = useCurrentStaff();
  const events = useStore((s) => s.events);
  const orgName = useStore((s) => s.orgName);
  const setStatus = useStore((s) => s.setAssignmentStatus);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const contracts = useStore((s) => s.contracts);
  const toSign = contracts.filter((c) => c.staffId === me.id && c.status === 'sent' && !c.staff.signedAt);

  const mine = events
    .filter((e) => e.status === 'published' && daysUntil(e.date) >= 0 && e.assignments.some((a) => a.staffId === me.id))
    .sort((a, b) => a.date.localeCompare(b.date));
  // Event-specific training for shifts I'm rostered on counts toward my readiness too
  const r = readiness(me, cat, me.roleIds, mine.flatMap((e) => e.courseIds));
  const lvl = level(me.points);
  const todo = r.items.filter((i) => !i.done).sort((a, b) => ['profile', 'doc', 'course', 'cert'].indexOf(a.kind) - ['profile', 'doc', 'course', 'cert'].indexOf(b.kind));
  const next = mine[0];
  const nextA = next?.assignments.find((a) => a.staffId === me.id);
  const nextShift = next?.shifts.find((s) => s.id === nextA?.shiftId);
  const nextRole = cat.roles.find((ro) => ro.id === nextShift?.roleId);
  const nextR = next ? eventReadiness(me, cat, next) : null;

  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pb-20 pt-6 text-white">
        <div className="text-xs opacity-80">{orgName}</div>
        <h1 className="mt-1 text-2xl font-bold">Hi {me.name.split(' ')[0]} 👋</h1>
        <div className="mt-3 flex items-center gap-3">
          <Pill className="bg-white/20 text-white">
            <Sparkles size={12} /> {lvl.name}
          </Pill>
          <span className="text-sm opacity-90">{me.points} pts</span>
          {lvl.next && (
            <div className="flex flex-1 items-center gap-2 text-[11px] opacity-80">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${lvl.progress * 100}%` }} />
              </div>
              {lvl.toNext} to {lvl.next}
            </div>
          )}
        </div>
      </div>

      <div className="-mt-14 space-y-4 px-4">
        <Card className="flex items-center gap-4 p-5">
          <Ring value={r.pct} size={96} stroke={9}>
            <span className="text-xl font-bold">{r.pct}%</span>
          </Ring>
          <div className="flex-1">
            {r.ready ? (
              <>
                <div className="text-lg font-bold text-emerald-600">You're shift-ready! 🚀</div>
                <p className="text-sm text-slate-500">All paperwork, training and certificates are done. Grab a shift!</p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-slate-900">Almost there</div>
                <p className="text-sm text-slate-500">
                  {todo.length} {todo.length === 1 ? 'step' : 'steps'} left • about <strong>{r.minutesLeft} min</strong>
                </p>
                {todo[0] && (
                  <Link to={itemLink(todo[0])} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white">
                    Continue <ChevronRight size={14} />
                  </Link>
                )}
              </>
            )}
          </div>
        </Card>

        {toSign.map((c) => (
          <Link key={c.id} to={`/app/contracts/${c.id}`}>
            <Card className="flex items-center gap-3 p-4 ring-2 ring-violet-300 active:bg-violet-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <ScrollText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900">Contract to sign</div>
                <div className="truncate text-xs text-slate-500">
                  {c.title} · from {c.employer.name}
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </Card>
          </Link>
        ))}

        {next && nextR && (
          <Card className="overflow-hidden">
            <Link to={`/app/events/${next.id}`} className="block">
              <div className={cn('flex items-center justify-between px-4 py-2 text-xs font-semibold text-white', color(next.color).bg)}>
                <span>NEXT SHIFT • {countdown(next.date).toUpperCase()}</span>
                <ChevronRight size={16} />
              </div>
              <div className="p-4">
                <div className="font-semibold text-slate-900">{next.name}</div>
                <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} /> {fmtDay(next.date)} • call {next.callTime}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} /> {next.venue}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} /> {nextRole?.name} • {nextShift?.start}–{nextShift?.end}
                  </div>
                </div>
                {!nextR.ready && (
                  <div className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
                    ⚠️ Finish {nextR.total - nextR.done} more {nextR.total - nextR.done === 1 ? 'item' : 'items'} before {fmtDay(next.date)} to keep this shift.
                  </div>
                )}
              </div>
            </Link>
            {nextA?.status === 'assigned' && (
              <div className="border-t border-slate-100 p-3">
                <button
                  onClick={() => {
                    setStatus(next.id, me.id, 'confirmed');
                    toast("Shift confirmed — see you there!", '🙌');
                  }}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white active:bg-emerald-700"
                >
                  Confirm I'll be there
                </button>
              </div>
            )}
          </Card>
        )}

        {todo.length > 0 && (
          <Card>
            <div className="px-4 pb-1 pt-4 text-sm font-semibold text-slate-900">Your next steps</div>
            <div className="divide-y divide-slate-100">
              {todo.map((i) => (
                <TodoRow key={i.kind + i.id} item={i} />
              ))}
            </div>
          </Card>
        )}

        {r.items.some((i) => i.done) && (
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold text-slate-900">Completed</div>
            <div className="space-y-1.5">
              {r.items
                .filter((i) => i.done)
                .map((i) => (
                  <div key={i.kind + i.id} className="flex items-center gap-2 text-sm text-slate-500">
                    <CircleCheck size={16} className="text-emerald-500" /> {i.label}
                  </div>
                ))}
            </div>
          </Card>
        )}

        {me.badges.length > 0 && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-900">
              Badges
              <Link to="/app/profile" className="text-xs font-medium text-indigo-600">
                See all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {me.badges.map((b) => (
                <div key={b} className="flex w-16 shrink-0 flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl ring-2 ring-amber-200">{badge(b)?.emoji}</div>
                  <span className="mt-1 text-[10px] leading-tight text-slate-600">{badge(b)?.name}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
