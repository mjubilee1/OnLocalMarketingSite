import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from '../../components/ui';
import { COLOR_KEYS, cn, color, addDays, toDateISO, uid } from '../../lib/utils';
import { useCatalog, useCompany, useStore } from '../../store';
import type { EventItem } from '../../types';

const blank = (manager: { name: string; title: string; phone: string }): EventItem => ({
  id: uid('e-'),
  name: '',
  venue: '',
  address: '',
  date: toDateISO(addDays(14)),
  callTime: '09:00',
  description: '',
  dressCode: 'All black, closed-toe shoes. Crew shirt provided at check-in.',
  parking: '',
  color: 'indigo',
  status: 'draft',
  courseIds: [],
  contacts: [manager],
  schedule: [
    { time: '09:00', label: 'Crew check-in' },
    { time: '09:30', label: 'Team briefing' },
  ],
  shifts: [],
  assignments: [],
});

function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {sub && <p className="mb-4 mt-0.5 text-sm text-slate-500">{sub}</p>}
      <div className={cn(!sub && 'mt-4')}>{children}</div>
    </Card>
  );
}

export default function EventForm() {
  const { id } = useParams();
  const existing = useStore((s) => s.events.find((e) => e.id === id));
  const upsert = useStore((s) => s.upsertEvent);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const company = useCompany();
  const nav = useNavigate();
  const [ev, setEv] = useState<EventItem>(() =>
    existing ? structuredClone(existing) : blank({ name: company.managerName, title: company.managerTitle, phone: company.phone }),
  );
  const set = (patch: Partial<EventItem>) => setEv((e) => ({ ...e, ...patch }));

  const save = (status?: EventItem['status']) => {
    if (!ev.name.trim()) return toast('Give the event a name first', '⚠️');
    upsert({ ...ev, status: status ?? ev.status });
    toast(status === 'published' ? 'Event published — crew can see the briefing' : 'Event saved', '✅');
    nav(`/admin/events/${ev.id}`);
  };

  return (
    <>
      <PageHeader
        title={existing ? `Edit ${existing.name}` : 'New event'}
        sub="Everything here becomes the crew's event briefing in the app."
        actions={
          <>
            <Button variant="secondary" onClick={() => save()}>
              Save {ev.status === 'draft' ? 'draft' : ''}
            </Button>
            {ev.status === 'draft' && <Button onClick={() => save('published')}>Publish</Button>}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Section title="Basics">
            <div className="space-y-4">
              <Field label="Event name">
                <Input value={ev.name} onChange={(e) => set({ name: e.target.value })} placeholder="Summer Beats Festival" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date">
                  <Input type="date" value={ev.date} onChange={(e) => set({ date: e.target.value })} />
                </Field>
                <Field label="Crew call time">
                  <Input type="time" value={ev.callTime} onChange={(e) => set({ callTime: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Venue">
                  <Input value={ev.venue} onChange={(e) => set({ venue: e.target.value })} />
                </Field>
                <Field label="Address">
                  <Input value={ev.address} onChange={(e) => set({ address: e.target.value })} />
                </Field>
              </div>
              <Field label="Overview for crew">
                <Textarea rows={3} value={ev.description} onChange={(e) => set({ description: e.target.value })} placeholder="What's the event, how big, anything special?" />
              </Field>
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-700">Colour</span>
                <div className="flex gap-2">
                  {COLOR_KEYS.map((k) => (
                    <button key={k} onClick={() => set({ color: k })} className={cn('h-7 w-7 rounded-full cursor-pointer', color(k).bg, ev.color === k && 'ring-2 ring-offset-2 ring-slate-900')} />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Shifts" sub="How many of each role do you need?">
            <div className="space-y-3">
              {ev.shifts.map((sh, i) => (
                <div key={sh.id} className="grid grid-cols-[1fr_70px_90px_90px_auto] items-end gap-2">
                  <Field label={i === 0 ? 'Role' : ''}>
                    <Select value={sh.roleId} onChange={(e) => set({ shifts: ev.shifts.map((x) => (x.id === sh.id ? { ...x, roleId: e.target.value } : x)) })}>
                      {cat.roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={i === 0 ? 'Qty' : ''}>
                    <Input type="number" min={1} value={sh.headcount} onChange={(e) => set({ shifts: ev.shifts.map((x) => (x.id === sh.id ? { ...x, headcount: +e.target.value } : x)) })} />
                  </Field>
                  <Field label={i === 0 ? 'Start' : ''}>
                    <Input type="time" value={sh.start} onChange={(e) => set({ shifts: ev.shifts.map((x) => (x.id === sh.id ? { ...x, start: e.target.value } : x)) })} />
                  </Field>
                  <Field label={i === 0 ? 'End' : ''}>
                    <Input type="time" value={sh.end} onChange={(e) => set({ shifts: ev.shifts.map((x) => (x.id === sh.id ? { ...x, end: e.target.value } : x)) })} />
                  </Field>
                  <button
                    className="mb-1.5 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    onClick={() => set({ shifts: ev.shifts.filter((x) => x.id !== sh.id), assignments: ev.assignments.filter((a) => a.shiftId !== sh.id) })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => set({ shifts: [...ev.shifts, { id: uid('sh-'), roleId: cat.roles[0]!.id, headcount: 2, start: ev.callTime, end: '17:00' }] })}
              >
                <Plus size={14} /> Add shift
              </Button>
            </div>
          </Section>

          <Section title="Event-specific training" sub="Extra courses crew must finish for this event, on top of their role training.">
            <div className="flex flex-wrap gap-2">
              {cat.courses.map((c) => {
                const on = ev.courseIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => set({ courseIds: on ? ev.courseIds.filter((x) => x !== c.id) : [...ev.courseIds, c.id] })}
                    className={cn('rounded-full px-3 py-1.5 text-sm ring-1 transition cursor-pointer', on ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50')}
                  >
                    {c.emoji} {c.title}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Crew briefing">
            <div className="space-y-4">
              <Field label="Dress code">
                <Textarea rows={2} value={ev.dressCode} onChange={(e) => set({ dressCode: e.target.value })} />
              </Field>
              <Field label="Parking & transport">
                <Textarea rows={2} value={ev.parking} onChange={(e) => set({ parking: e.target.value })} />
              </Field>
            </div>
          </Section>

          <Section title="Run sheet" sub="Key times crew need to know.">
            <div className="space-y-2">
              {ev.schedule.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <Input type="time" className="w-32" value={it.time} onChange={(e) => set({ schedule: ev.schedule.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)) })} />
                  <Input value={it.label} onChange={(e) => set({ schedule: ev.schedule.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                  <button className="rounded p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer" onClick={() => set({ schedule: ev.schedule.filter((_, j) => j !== i) })}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => set({ schedule: [...ev.schedule, { time: '12:00', label: '' }] })}>
                <Plus size={14} /> Add time
              </Button>
            </div>
          </Section>

          <Section title="Key contacts">
            <div className="space-y-2">
              {ev.contacts.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <Input placeholder="Name" value={c.name} onChange={(e) => set({ contacts: ev.contacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                  <Input placeholder="Title" value={c.title} onChange={(e) => set({ contacts: ev.contacts.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                  <Input placeholder="Phone" value={c.phone} onChange={(e) => set({ contacts: ev.contacts.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)) })} />
                  <button className="rounded p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer" onClick={() => set({ contacts: ev.contacts.filter((_, j) => j !== i) })}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => set({ contacts: [...ev.contacts, { name: '', title: '', phone: '' }] })}>
                <Plus size={14} /> Add contact
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
