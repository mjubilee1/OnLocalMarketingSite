import type { ReactNode } from 'react';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea } from './ui';
import { COLOR_KEYS, cn, color, uid } from '../lib/utils';
import { useCatalog } from '../store';
import type { EventBody } from '../types';

export function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {sub && <p className="mb-4 mt-0.5 text-sm text-slate-500">{sub}</p>}
      <div className={cn(!sub && 'mt-4')}>{children}</div>
    </Card>
  );
}

/**
 * Every reusable part of an event: shared by the event form and the event template editor.
 * `basicsTop` renders above the shared basics (the event's name and date, or a template's name).
 */
export function EventFields({
  value: v,
  onChange: set,
  basicsTop,
  dateField,
  onShiftRemoved,
  venueHint,
}: {
  value: EventBody;
  onChange: (patch: Partial<EventBody>) => void;
  basicsTop?: ReactNode;
  /** Shown beside the call time (the event's date). */
  dateField?: ReactNode;
  onShiftRemoved?: (shiftId: string) => void;
  venueHint?: string;
}) {
  const cat = useCatalog();
  const setShift = (id: string, patch: Partial<EventBody['shifts'][number]>) => set({ shifts: v.shifts.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const crew = v.shifts.reduce((a, s) => a + (Number(s.headcount) || 0), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Section title="Basics">
          <div className="space-y-4">
            {basicsTop}
            <div className="grid grid-cols-2 gap-4">
              {dateField}
              <Field label="Crew call time">
                <Input type="time" value={v.callTime} onChange={(e) => set({ callTime: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Venue" hint={venueHint}>
                <Input value={v.venue} onChange={(e) => set({ venue: e.target.value })} />
              </Field>
              <Field label="Address">
                <Input value={v.address} onChange={(e) => set({ address: e.target.value })} />
              </Field>
            </div>
            <Field label="Overview for crew">
              <Textarea rows={3} value={v.description} onChange={(e) => set({ description: e.target.value })} placeholder="What's the event, how big, anything special?" />
            </Field>
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">Color</span>
              <div className="flex gap-2">
                {COLOR_KEYS.map((k) => (
                  <button type="button" key={k} onClick={() => set({ color: k })} className={cn('h-7 w-7 rounded-full cursor-pointer', color(k).bg, v.color === k && 'ring-2 ring-offset-2 ring-slate-900')} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Shifts" sub={crew ? `${crew} crew in total` : undefined}>
          <div className="space-y-3">
            {v.shifts.map((sh, i) => {
              const roleMissing = !cat.roles.some((r) => r.id === sh.roleId);
              return (
                <div key={sh.id}>
                  <div className="grid grid-cols-[1fr_70px_90px_90px_auto] items-end gap-2">
                    <Field label={i === 0 ? 'Role' : ''}>
                      <Select value={roleMissing ? '' : sh.roleId} onChange={(e) => setShift(sh.id, { roleId: e.target.value })}>
                        {roleMissing && <option value="">Pick a role…</option>}
                        {cat.roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={i === 0 ? 'Qty' : ''}>
                      <Input type="number" min={1} value={sh.headcount} onChange={(e) => setShift(sh.id, { headcount: Math.max(1, +e.target.value || 1) })} />
                    </Field>
                    <Field label={i === 0 ? 'Start' : ''}>
                      <Input type="time" value={sh.start} onChange={(e) => setShift(sh.id, { start: e.target.value })} />
                    </Field>
                    <Field label={i === 0 ? 'End' : ''}>
                      <Input type="time" value={sh.end} onChange={(e) => setShift(sh.id, { end: e.target.value })} />
                    </Field>
                    <button
                      type="button"
                      className="mb-1.5 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      onClick={() => {
                        set({ shifts: v.shifts.filter((x) => x.id !== sh.id) });
                        onShiftRemoved?.(sh.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {roleMissing && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                      <TriangleAlert size={12} /> This role was deleted: pick another or remove the shift.
                    </p>
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!cat.roles.length}
              onClick={() => set({ shifts: [...v.shifts, { id: uid('sh-'), roleId: cat.roles[0]!.id, headcount: 2, start: v.callTime, end: '17:00' }] })}
            >
              <Plus size={14} /> Add shift
            </Button>
          </div>
        </Section>

        <Section title="Event-specific training">
          <div className="flex flex-wrap gap-2">
            {cat.courses
              .filter((c) => c.published || v.courseIds.includes(c.id))
              .map((c) => {
                const on = v.courseIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => set({ courseIds: on ? v.courseIds.filter((x) => x !== c.id) : [...v.courseIds, c.id] })}
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
              <Textarea rows={2} value={v.dressCode} onChange={(e) => set({ dressCode: e.target.value })} />
            </Field>
            <Field label="Parking & transport">
              <Textarea rows={2} value={v.parking} onChange={(e) => set({ parking: e.target.value })} />
            </Field>
          </div>
        </Section>

        <Section title="Run sheet">
          <div className="space-y-2">
            {v.schedule.map((it, i) => (
              <div key={i} className="flex gap-2">
                <Input type="time" className="w-32" value={it.time} onChange={(e) => set({ schedule: v.schedule.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)) })} />
                <Input value={it.label} onChange={(e) => set({ schedule: v.schedule.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                <button type="button" className="rounded p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer" onClick={() => set({ schedule: v.schedule.filter((_, j) => j !== i) })}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => set({ schedule: [...v.schedule, { time: '12:00', label: '' }] })}>
                <Plus size={14} /> Add time
              </Button>
              {v.schedule.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ schedule: [...v.schedule].sort((a, b) => a.time.localeCompare(b.time)) })}>
                  Sort by time
                </Button>
              )}
            </div>
          </div>
        </Section>

        <Section title="Key contacts">
          <div className="space-y-2">
            {v.contacts.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                <Input placeholder="Name" value={c.name} onChange={(e) => set({ contacts: v.contacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                <Input placeholder="Title" value={c.title} onChange={(e) => set({ contacts: v.contacts.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                <Input placeholder="Phone" value={c.phone} onChange={(e) => set({ contacts: v.contacts.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)) })} />
                <button type="button" className="rounded p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer" onClick={() => set({ contacts: v.contacts.filter((_, j) => j !== i) })}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => set({ contacts: [...v.contacts, { name: '', title: '', phone: '' }] })}>
              <Plus size={14} /> Add contact
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}
