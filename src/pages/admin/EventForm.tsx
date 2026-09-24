import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LayoutTemplate } from 'lucide-react';
import { Button, Field, Input, Modal, PageHeader, Textarea } from '../../components/ui';
import { EventFields } from '../../components/eventFields';
import { eventFromTemplate, templateFromEvent } from '../../lib/eventTemplates';
import { useCatalog, useCompany, useStore } from '../../store';
import type { EventItem } from '../../types';

export default function EventForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const existing = useStore((s) => s.events.find((e) => e.id === id));
  const template = useStore((s) => s.eventTemplates.find((t) => t.id === params.get('template')));
  const upsert = useStore((s) => s.upsertEvent);
  const upsertTemplate = useStore((s) => s.upsertEventTemplate);
  const noteUsed = useStore((s) => s.noteTemplateUsed);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const company = useCompany();
  const nav = useNavigate();
  const [ev, setEv] = useState<EventItem>(() =>
    existing
      ? structuredClone(existing)
      : eventFromTemplate(template, { roles: cat.roles, courses: cat.courses, manager: { name: company.managerName, title: company.managerTitle, phone: company.phone } }),
  );
  const [saveAs, setSaveAs] = useState<{ name: string; summary: string } | null>(null);
  const set = (patch: Partial<EventItem>) => setEv((e) => ({ ...e, ...patch }));

  const save = (status?: EventItem['status']) => {
    if (!ev.name.trim()) return toast('Give the event a name first', '⚠️');
    upsert({ ...ev, status: status ?? ev.status });
    if (!existing && template) noteUsed(template.id);
    toast(status === 'published' ? 'Event published — crew can see the briefing' : 'Event saved', '✅');
    nav(`/admin/events/${ev.id}`);
  };

  return (
    <>
      <PageHeader
        title={existing ? `Edit ${existing.name}` : 'New event'}
        actions={
          <>
            <Button variant="ghost" onClick={() => setSaveAs({ name: ev.name ? `${ev.name} template` : '', summary: '' })}>
              <LayoutTemplate size={16} /> Save as template
            </Button>
            <Button variant="secondary" onClick={() => save()}>
              Save {ev.status === 'draft' ? 'draft' : ''}
            </Button>
            {ev.status === 'draft' && <Button onClick={() => save('published')}>Publish</Button>}
          </>
        }
      />
      {!existing && template && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span className="text-lg">{template.emoji}</span>
          Started from the <strong>{template.name}</strong> template. Change anything you need: the template itself won't change.
          <Link to={`/admin/events/templates/${template.id}`} className="ml-auto font-medium text-indigo-700 hover:underline">
            Edit template
          </Link>
        </div>
      )}
      <EventFields
        value={ev}
        onChange={set}
        onShiftRemoved={(shiftId) => setEv((e) => ({ ...e, assignments: e.assignments.filter((a) => a.shiftId !== shiftId) }))}
        basicsTop={
          <Field label="Event name">
            <Input value={ev.name} onChange={(e) => set({ name: e.target.value })} placeholder={template ? `e.g. ${template.name} 2026` : 'Summer Beats Festival'} autoFocus={!existing} />
          </Field>
        }
        dateField={
          <Field label="Date">
            <Input type="date" value={ev.date} onChange={(e) => set({ date: e.target.value })} />
          </Field>
        }
      />

      <Modal open={!!saveAs} onClose={() => setSaveAs(null)} title="Save as template">
        {saveAs && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!saveAs.name.trim()) return;
              const t = templateFromEvent(ev, saveAs.name.trim());
              upsertTemplate({ ...t, summary: saveAs.summary.trim() || t.summary });
              setSaveAs(null);
              toast(`Template “${t.name}” saved. Use it next time you create an event.`, '📋');
            }}
          >
            <Field label="Template name">
              <Input autoFocus value={saveAs.name} onChange={(e) => setSaveAs({ ...saveAs, name: e.target.value })} placeholder="e.g. Riverside summer concert" />
            </Field>
            <Field label="When to use it (optional)">
              <Textarea rows={2} value={saveAs.summary} onChange={(e) => setSaveAs({ ...saveAs, summary: e.target.value })} placeholder="e.g. Our standard setup for Riverside Park shows up to 5,000 people" />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={!saveAs.name.trim()}>
                Save template
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
