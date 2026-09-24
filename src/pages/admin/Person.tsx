import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ContractStagePill } from '../../components/contract';
import { NewContractModal } from './Contracts';
import { ArrowLeft, BadgeCheck, CheckCircle2, Circle, FileSignature, GraduationCap, Mail, Megaphone, Phone, ShieldCheck, Smartphone } from 'lucide-react';
import { Avatar, Button, Card, Empty, PageHeader, Pill, Progress, RolePill, Stars, StatusPill } from '../../components/ui';
import { avgRating, readiness, type ReqKind } from '../../lib/readiness';
import { badge, level } from '../../lib/badges';
import { cn, daysUntil, fmtDate, relTime } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';

const KIND_ICON: Record<ReqKind, typeof Circle> = { doc: FileSignature, course: GraduationCap, cert: ShieldCheck };

export default function Person() {
  const { id } = useParams();
  const s = useStore((st) => st.staff.find((x) => x.id === id));
  const events = useStore((st) => st.events);
  const store = useStore();
  const cat = useCatalog();
  const nav = useNavigate();
  const [newContract, setNewContract] = useState(false);

  if (!s) return <Empty title="Crew member not found" />;
  const r = readiness(s, cat);
  const lvl = level(s.points);
  const history = events.filter((e) => e.assignments.some((a) => a.staffId === s.id)).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Link to="/admin/crew" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Crew
      </Link>
      <PageHeader
        title={s.name}
        sub={
          <span className="flex flex-wrap items-center gap-3">
            <StatusPill status={s.status} />
            <span className="flex items-center gap-1">
              <Mail size={14} /> {s.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={14} /> {s.phone}
            </span>
            <span>🌐 {s.language}</span>
          </span>
        }
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                store.updateStaff(s.id, { status: s.status === 'inactive' ? (r.ready ? 'active' : 'onboarding') : 'inactive' });
                store.toast(s.status === 'inactive' ? `${s.name} re-activated` : `${s.name} moved to alumni`, '👤');
              }}
            >
              {s.status === 'inactive' ? 'Re-activate' : 'Move to alumni'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                store.setCurrentStaff(s.id);
                nav('/app');
              }}
            >
              <Smartphone size={16} /> View their app
            </Button>
            <Button
              onClick={() => {
                store.nudge([s.id]);
                store.toast(`Reminder sent to ${s.name}`, '📣');
              }}
            >
              <Megaphone size={16} /> Send reminder
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold">Onboarding checklist</h2>
                <p className="text-sm text-slate-500">
                  {r.done}/{r.total} complete {!r.ready && `• ~${r.minutesLeft} min of work left`}
                </p>
              </div>
              <div className="w-40">
                <Progress value={r.pct} />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {r.items.map((it) => {
                const Icon = KIND_ICON[it.kind];
                const cert = it.kind === 'cert' ? s.certs.find((c) => c.certId === it.id) : undefined;
                const doc = it.kind === 'doc' ? s.docs[it.id] : undefined;
                const course = it.kind === 'course' ? s.courses[it.id] : undefined;
                const scores = course ? Object.values(course.quizScores) : [];
                return (
                  <div key={it.kind + it.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                    {it.done ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}
                    <Icon size={16} className="text-slate-400" />
                    <div className="min-w-40 flex-1">
                      <div className={cn('font-medium', it.done ? 'text-slate-900' : 'text-slate-700')}>{it.label}</div>
                      <div className="text-xs text-slate-500">
                        {doc && `Signed ${relTime(doc.signedAt)}`}
                        {course && (course.completedAt ? `Completed ${relTime(course.completedAt)}` : `In progress — ${Math.round(it.progress * 100)}%`)}
                        {scores.length > 0 && ` • quiz ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%`}
                        {it.kind === 'cert' && (cert ? `#${cert.number} • expires ${fmtDate(cert.expiresAt)}${cert.fileName ? ` • ${cert.fileName}` : ''}` : 'Not uploaded')}
                        {!doc && !course && it.kind !== 'cert' && 'Not started'}
                      </div>
                    </div>
                    {doc && !doc.typed && <img src={doc.signature} alt="signature" className="h-8 rounded bg-slate-50" />}
                    {doc?.typed && <span className="font-script text-xl text-indigo-900">{doc.signature}</span>}
                    {cert && !cert.verified && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          store.verifyCert(s.id, cert.certId);
                          store.toast('Certificate verified', '✅');
                        }}
                      >
                        <BadgeCheck size={14} /> Verify
                      </Button>
                    )}
                    {cert?.verified && (
                      <Pill className={daysUntil(cert.expiresAt) <= 30 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}>
                        {daysUntil(cert.expiresAt) < 0 ? 'Expired' : daysUntil(cert.expiresAt) <= 30 ? `Expires in ${daysUntil(cert.expiresAt)}d` : 'Verified'}
                      </Pill>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold">Event history</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {history.map((e) => {
                const a = e.assignments.find((x) => x.staffId === s.id)!;
                const role = cat.roles.find((ro) => ro.id === e.shifts.find((sh) => sh.id === a.shiftId)?.roleId);
                return (
                  <Link key={e.id} to={`/admin/events/${e.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-slate-500">
                        {fmtDate(e.date)} • {role?.name}
                      </div>
                    </div>
                    {a.rating ? <Stars value={a.rating} size={13} /> : <span className="text-xs capitalize text-slate-400">{a.status.replace('_', ' ')}</span>}
                  </Link>
                );
              })}
              {history.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Not rostered on any events yet.</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 text-center">
            <Avatar name={s.name} size="xl" />
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {s.roleIds.map((rid) => (
                <RolePill key={rid} role={cat.roles.find((x) => x.id === rid)} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold">{s.eventsWorked}</div>
                <div className="text-xs text-slate-500">Events</div>
              </div>
              <div>
                <div className="text-xl font-bold">{s.ratings.length ? avgRating(s).toFixed(1) : '—'}</div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div>
                <div className="text-xl font-bold">{s.points}</div>
                <div className="text-xs text-slate-500">{lvl.name}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Joined {fmtDate(s.createdAt)} {s.readyAt && `• ready in ${Math.max(1, Math.round((new Date(s.readyAt).getTime() - new Date(s.createdAt).getTime()) / 3600000))}h`}
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Contracts</h3>
              <Button size="sm" variant="secondary" onClick={() => setNewContract(true)}>
                New
              </Button>
            </div>
            <div className="space-y-2">
              {store.contracts
                .filter((k) => k.staffId === s.id)
                .map((k) => (
                  <Link key={k.id} to={`/admin/contracts/${k.id}`} className="block rounded-lg p-2 text-sm hover:bg-slate-50">
                    <div className="truncate font-medium">{k.title}</div>
                    <div className="mt-1">
                      <ContractStagePill c={k} />
                    </div>
                  </Link>
                ))}
              {!store.contracts.some((k) => k.staffId === s.id) && <p className="text-sm text-slate-500">No contracts yet.</p>}
            </div>
            <NewContractModal open={newContract} onClose={() => setNewContract(false)} staffId={s.id} />
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {s.badges.map((b) => (
                <Pill key={b} className="bg-amber-50 text-amber-800">
                  {badge(b)?.emoji} {badge(b)?.name}
                </Pill>
              ))}
              {s.badges.length === 0 && <span className="text-sm text-slate-500">None yet</span>}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 font-semibold">Manager notes</h3>
            <textarea
              className="h-24 w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-400"
              placeholder="Private notes (only managers see these)"
              defaultValue={s.notes}
              onBlur={(e) => store.updateStaff(s.id, { notes: e.target.value })}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
