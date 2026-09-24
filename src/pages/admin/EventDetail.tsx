import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Megaphone, Pencil, ScanLine, Shirt, Sparkles, Trash2, UserPlus, X } from 'lucide-react';
import { Avatar, Button, Card, DateBadge, Empty, Input, Modal, PageHeader, Pill, Progress, RolePill, Stars, Tabs } from '../../components/ui';
import { avgRating, eventReadiness } from '../../lib/readiness';
import { cn, countdown, fmtDate, fmtTime, pct } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { AssignmentStatus, EventItem, Shift, Staff } from '../../types';

type Tab = 'roster' | 'checkin' | 'wrap' | 'briefing';

const STATUS: Record<AssignmentStatus, { label: string; cls: string }> = {
  assigned: { label: 'Awaiting confirm', cls: 'bg-slate-100 text-slate-600' },
  confirmed: { label: 'Confirmed', cls: 'bg-sky-50 text-sky-700' },
  checked_in: { label: 'Checked in', cls: 'bg-emerald-50 text-emerald-700' },
  no_show: { label: 'No-show', cls: 'bg-rose-50 text-rose-700' },
};

export default function EventDetail() {
  const { id } = useParams();
  const ev = useStore((s) => s.events.find((e) => e.id === id));
  const staff = useStore((s) => s.staff);
  const store = useStore();
  const cat = useCatalog();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('roster');
  const [adding, setAdding] = useState<Shift | null>(null);
  const [scan, setScan] = useState('');

  if (!ev) return <Empty title="Event not found" />;

  const person = (sid: string) => staff.find((s) => s.id === sid);
  const need = ev.shifts.reduce((a, s) => a + s.headcount, 0);
  const readyCount = ev.assignments.filter((a) => {
    const s = person(a.staffId);
    return s && eventReadiness(s, cat, ev).ready;
  }).length;
  const checkedIn = ev.assignments.filter((a) => a.status === 'checked_in').length;

  const candidates = (shift: Shift) =>
    staff
      .filter((s) => s.roleIds.includes(shift.roleId) && !ev.assignments.some((a) => a.staffId === s.id))
      .map((s) => ({ s, r: eventReadiness({ ...s }, cat, { ...ev, assignments: [{ staffId: s.id, shiftId: shift.id, status: 'assigned' }] }) }))
      .sort((a, b) => Number(b.s.status !== 'inactive') - Number(a.s.status !== 'inactive') || b.r.pct - a.r.pct || avgRating(b.s) - avgRating(a.s));

  const autoFill = () => {
    let n = 0;
    const taken = new Set(ev.assignments.map((a) => a.staffId));
    for (const sh of ev.shifts) {
      let open = sh.headcount - ev.assignments.filter((a) => a.shiftId === sh.id).length;
      for (const { s, r } of candidates(sh)) {
        if (open <= 0) break;
        if (!r.ready || s.status === 'inactive' || taken.has(s.id)) continue;
        store.assign(ev.id, s.id, sh.id);
        taken.add(s.id);
        open--;
        n++;
      }
    }
    store.toast(n ? `Rostered ${n} ready crew, ranked by rating` : 'No more fully-ready crew available — invite more!', n ? '✨' : '🤷');
  };

  const doScan = () => {
    const code = scan.trim().toUpperCase();
    const a = ev.assignments.find((x) => x.staffId.toUpperCase() === code || person(x.staffId)?.name.toUpperCase() === code);
    if (!a) return store.toast('Pass not found on this event', '❌');
    store.setAssignmentStatus(ev.id, a.staffId, 'checked_in');
    store.toast(`${person(a.staffId)?.name} checked in`, '✅');
    setScan('');
  };

  return (
    <>
      <Link to="/admin/events" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Events
      </Link>
      <PageHeader
        title={ev.name}
        sub={
          <span className="flex items-center gap-2">
            {fmtDate(ev.date, { weekday: 'long', month: 'long', day: 'numeric' })} • {ev.venue} • {countdown(ev.date)}
            {ev.status === 'draft' && <Pill className="bg-slate-100 text-slate-600">Draft</Pill>}
          </span>
        }
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete ${ev.name}?`)) {
                  store.deleteEvent(ev.id);
                  nav('/admin/events');
                }
              }}
            >
              <Trash2 size={16} />
            </Button>
            <Link to={`/admin/events/${ev.id}/edit`}>
              <Button variant="secondary">
                <Pencil size={16} /> Edit
              </Button>
            </Link>
            {ev.status === 'draft' && (
              <Button
                onClick={() => {
                  store.upsertEvent({ ...ev, status: 'published' });
                  store.toast('Published — crew notified', '📣');
                }}
              >
                Publish
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Staffed</div>
          <div className="mt-1 text-xl font-bold">
            {ev.assignments.length} <span className="text-sm font-normal text-slate-400">/ {need}</span>
          </div>
          <Progress className="mt-2" value={pct(ev.assignments.length, need)} barClass="bg-sky-500" />
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Fully trained & compliant</div>
          <div className="mt-1 text-xl font-bold">
            {readyCount} <span className="text-sm font-normal text-slate-400">/ {ev.assignments.length}</span>
          </div>
          <Progress className="mt-2" value={pct(readyCount, ev.assignments.length)} />
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Checked in</div>
          <div className="mt-1 text-xl font-bold">
            {checkedIn} <span className="text-sm font-normal text-slate-400">/ {ev.assignments.length}</span>
          </div>
          <Progress className="mt-2" value={pct(checkedIn, ev.assignments.length)} barClass="bg-emerald-500" />
        </Card>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'roster', label: 'Roster' },
          { id: 'checkin', label: 'Check-in' },
          { id: 'wrap', label: 'Wrap-up & ratings' },
          { id: 'briefing', label: 'Briefing' },
        ]}
      />

      <div className="mt-6">
        {tab === 'roster' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const ids = ev.assignments.filter((a) => !eventReadiness(person(a.staffId)!, cat, ev).ready).map((a) => a.staffId);
                  if (!ids.length) return store.toast('Everyone is ready 🎉');
                  store.nudge(ids);
                  store.toast(`Reminded ${ids.length} crew to finish onboarding`, '📣');
                }}
              >
                <Megaphone size={16} /> Nudge not-ready crew
              </Button>
              <Button onClick={autoFill}>
                <Sparkles size={16} /> Auto-fill with ready crew
              </Button>
            </div>
            {ev.shifts.map((sh) => {
              const role = cat.roles.find((r) => r.id === sh.roleId);
              const list = ev.assignments.filter((a) => a.shiftId === sh.id);
              return (
                <Card key={sh.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <RolePill role={role} />
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock size={14} /> {sh.start}–{sh.end}
                      </span>
                      <span className={cn('text-sm font-medium', list.length >= sh.headcount ? 'text-emerald-600' : 'text-amber-600')}>
                        {list.length}/{sh.headcount} filled
                      </span>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setAdding(sh)}>
                      <UserPlus size={14} /> Add crew
                    </Button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {list.map((a) => {
                      const s = person(a.staffId);
                      if (!s) return null;
                      const r = eventReadiness(s, cat, ev);
                      const missing = r.items.filter((i) => !i.done);
                      return (
                        <div key={a.staffId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                          <Avatar name={s.name} size="sm" />
                          <div className="min-w-40 flex-1">
                            <Link to={`/admin/crew/${s.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                              {s.name}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {r.ready ? '✅ Ready to work' : `Missing: ${missing.slice(0, 2).map((m) => m.label).join(', ')}${missing.length > 2 ? ` +${missing.length - 2}` : ''}`}
                            </div>
                          </div>
                          <div className="w-28">
                            <Progress value={r.pct} />
                            <div className="mt-0.5 text-right text-[11px] text-slate-500">{r.pct}% ready</div>
                          </div>
                          <Pill className={STATUS[a.status].cls}>{STATUS[a.status].label}</Pill>
                          <button onClick={() => store.unassign(ev.id, s.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer" title="Remove from shift">
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                    {Array.from({ length: Math.max(0, sh.headcount - list.length) }).map((_, i) => (
                      <button key={i} onClick={() => setAdding(sh)} className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-slate-400 hover:bg-slate-50 cursor-pointer">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-slate-300">
                          <UserPlus size={12} />
                        </div>
                        Open slot
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
            {ev.shifts.length === 0 && <Empty title="No shifts yet">Edit the event to add shifts.</Empty>}
          </div>
        )}

        {tab === 'checkin' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:order-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <ScanLine size={18} /> Scan crew pass
              </h3>
              <p className="mt-1 text-sm text-slate-500">Scan the QR on a crew member's phone, or type their pass code / name.</p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  doScan();
                }}
              >
                <Input value={scan} onChange={(e) => setScan(e.target.value)} placeholder="e.g. S-3" />
                <Button type="submit">Check in</Button>
              </form>
            </Card>
            <Card className="lg:col-span-2">
              <div className="divide-y divide-slate-100">
                {ev.assignments.map((a) => {
                  const s = person(a.staffId);
                  if (!s) return null;
                  const role = cat.roles.find((r) => r.id === ev.shifts.find((x) => x.id === a.shiftId)?.roleId);
                  return (
                    <div key={a.staffId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <Avatar name={s.name} size="sm" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">
                          {role?.name} • {s.phone}
                        </div>
                      </div>
                      {a.status === 'checked_in' ? (
                        <span className="text-sm text-emerald-600">✓ {a.checkedInAt && fmtTime(a.checkedInAt)}</span>
                      ) : (
                        <>
                          <Pill className={STATUS[a.status].cls}>{STATUS[a.status].label}</Pill>
                          <Button size="sm" variant="success" onClick={() => store.setAssignmentStatus(ev.id, s.id, 'checked_in')}>
                            <Check size={14} /> Check in
                          </Button>
                          {a.status !== 'no_show' && (
                            <Button size="sm" variant="ghost" onClick={() => store.setAssignmentStatus(ev.id, s.id, 'no_show')}>
                              No-show
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {ev.assignments.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No one rostered yet.</div>}
              </div>
            </Card>
          </div>
        )}

        {tab === 'wrap' && <WrapUp ev={ev} />}

        {tab === 'briefing' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <DateBadge date={ev.date} colorKey={ev.color} />
                <div>
                  <div className="font-semibold">{ev.name}</div>
                  <div className="text-sm text-slate-500">
                    Call time {ev.callTime} • {ev.address}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-700">{ev.description}</p>
              <div className="mt-4 flex gap-2 text-sm">
                <Shirt size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <span>{ev.dressCode}</span>
              </div>
              <div className="mt-4 text-sm">
                <div className="mb-2 font-medium">Run sheet</div>
                {ev.schedule.map((s, i) => (
                  <div key={i} className="flex gap-3 py-1">
                    <span className="w-12 font-mono text-slate-500">{s.time}</span>
                    {s.label}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5 text-sm">
              <div className="font-medium">Required event training</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ev.courseIds.length === 0 && <span className="text-slate-500">Role training only</span>}
                {ev.courseIds.map((cid) => {
                  const c = cat.courses.find((x) => x.id === cid);
                  return c && <Pill key={cid} className="bg-indigo-50 text-indigo-700">{c.emoji} {c.title}</Pill>;
                })}
              </div>
              <div className="mt-5 font-medium">Contacts</div>
              {ev.contacts.map((c, i) => (
                <div key={i} className="mt-2">
                  {c.name} <span className="text-slate-500">— {c.title}, {c.phone}</span>
                </div>
              ))}
              <p className="mt-6 rounded-lg bg-slate-50 p-3 text-slate-500">This is exactly what rostered crew see in their app under “Shifts”.</p>
            </Card>
          </div>
        )}
      </div>

      <Modal open={!!adding} onClose={() => setAdding(null)} title={`Add ${cat.roles.find((r) => r.id === adding?.roleId)?.name ?? ''}`} wide>
        {adding && (
          <div className="divide-y divide-slate-100">
            {candidates(adding).map(({ s, r }) => (
              <CandidateRow
                key={s.id}
                s={s}
                pctReady={r.pct}
                onAdd={() => {
                  store.assign(ev.id, s.id, adding.id);
                  store.toast(`${s.name} added — shift offer sent`, '📲');
                }}
              />
            ))}
            {candidates(adding).length === 0 && <div className="py-8 text-center text-sm text-slate-500">No one else holds this role. Invite more crew from “Invite & hire”.</div>}
          </div>
        )}
      </Modal>
    </>
  );
}

function CandidateRow({ s, pctReady, onAdd }: { s: Staff; pctReady: number; onAdd: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <Avatar name={s.name} size="sm" />
      <div className="min-w-40 flex-1">
        <div className="text-sm font-medium">
          {s.name} {s.status === 'inactive' && <Pill className="ml-1 bg-violet-50 text-violet-700">Alumni — re-engage</Pill>}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {s.ratings.length > 0 ? <Stars value={avgRating(s)} size={12} /> : 'New'} • {s.eventsWorked} events • {s.language}
        </div>
      </div>
      <div className="w-28">
        <Progress value={pctReady} />
        <div className="mt-0.5 text-right text-[11px] text-slate-500">{pctReady}% ready</div>
      </div>
      <Button size="sm" onClick={onAdd}>
        Add
      </Button>
    </div>
  );
}

function WrapUp({ ev }: { ev: EventItem }) {
  const staff = useStore((s) => s.staff);
  const rate = useStore((s) => s.rate);
  const complete = useStore((s) => s.completeEvent);
  const toast = useStore((s) => s.toast);
  const worked = ev.assignments.filter((a) => a.status === 'checked_in');
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-semibold">Rate your crew</h3>
          <p className="text-sm text-slate-500">Ratings build each person's reliability score, so your best people get first pick of future shifts.</p>
        </div>
        {ev.status !== 'completed' ? (
          <Button
            disabled={!worked.length}
            onClick={() => {
              complete(ev.id);
              toast('Event wrapped — crew profiles updated', '🎬');
            }}
          >
            Complete event
          </Button>
        ) : (
          <Pill className="bg-emerald-50 text-emerald-700">Wrapped</Pill>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {worked.map((a) => {
          const s = staff.find((x) => x.id === a.staffId);
          if (!s) return null;
          return (
            <div key={a.staffId} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={s.name} size="sm" />
              <div className="flex-1 text-sm font-medium">{s.name}</div>
              <Stars value={a.rating ?? 0} onChange={ev.status === 'completed' ? undefined : (v) => rate(ev.id, s.id, v)} size={20} />
            </div>
          );
        })}
        {worked.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Check crew in on the day, then rate them here.</div>}
      </div>
    </Card>
  );
}
