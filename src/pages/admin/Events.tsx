import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CopyPlus, LayoutTemplate, MapPin, Plus } from 'lucide-react';
import { Button, Card, DateBadge, Field, Input, Modal, PageHeader, Pill, Progress, Tabs } from '../../components/ui';
import { NewEventPicker } from './EventTemplates';
import { templateFromEvent } from '../../lib/eventTemplates';
import type { EventItem } from '../../types';
import { eventReadiness } from '../../lib/readiness';
import { countdown, daysUntil, pct } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';

type Filter = 'upcoming' | 'draft' | 'past';

export default function Events() {
  const events = useStore((s) => s.events);
  const staff = useStore((s) => s.staff);
  const clone = useStore((s) => s.cloneEvent);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const nav = useNavigate();
  const [tab, setTab] = useState<Filter>('upcoming');
  const [params, setParams] = useSearchParams();
  const [picking, setPicking] = useState(params.get('new') === '1');
  const [saveAs, setSaveAs] = useState<EventItem | null>(null);
  const [templateName, setTemplateName] = useState('');
  const upsertTemplate = useStore((s) => s.upsertEventTemplate);

  const groups: Record<Filter, typeof events> = {
    upcoming: events.filter((e) => e.status === 'published' && daysUntil(e.date) >= 0),
    draft: events.filter((e) => e.status === 'draft'),
    past: events.filter((e) => e.status === 'completed' || (e.status === 'published' && daysUntil(e.date) < 0)),
  };
  const list = [...groups[tab]].sort((a, b) => (tab === 'past' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  return (
    <>
      <PageHeader
        title="Events"
        actions={
          <>
            <Link to="/admin/events/templates">
              <Button variant="secondary">
                <LayoutTemplate size={16} /> Templates
              </Button>
            </Link>
            <Button onClick={() => setPicking(true)}>
              <Plus size={16} /> New event
            </Button>
          </>
        }
      />
      <NewEventPicker
        open={picking}
        onClose={() => {
          setPicking(false);
          if (params.get('new')) setParams({});
        }}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
          { id: 'draft', label: 'Drafts', count: groups.draft.length },
          { id: 'past', label: 'Past', count: groups.past.length },
        ]}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((e) => {
          const need = e.shifts.reduce((a, s) => a + s.headcount, 0);
          const ready = e.assignments.filter((a) => {
            const s = staff.find((x) => x.id === a.staffId);
            return s && eventReadiness(s, cat, e).ready;
          }).length;
          return (
            <Card key={e.id} className="p-5" onClick={() => nav(`/admin/events/${e.id}`)}>
              <div className="flex gap-4">
                <DateBadge date={e.date} colorKey={e.color} size="lg" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{e.name}</h3>
                    {e.status === 'draft' && <Pill className="bg-slate-100 text-slate-600">Draft</Pill>}
                    {e.status === 'completed' && <Pill className="bg-emerald-50 text-emerald-700">Wrapped</Pill>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} /> {e.venue} • {countdown(e.date)}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span>Staffed</span>
                        <span className="font-medium text-slate-700">
                          {e.assignments.length}/{need}
                        </span>
                      </div>
                      <Progress value={pct(e.assignments.length, need)} barClass="bg-sky-500" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span>Ready</span>
                        <span className="font-medium text-slate-700">
                          {ready}/{e.assignments.length}
                        </span>
                      </div>
                      <Progress value={pct(ready, e.assignments.length)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setTemplateName(`${e.name} template`);
                    setSaveAs(e);
                  }}
                >
                  <LayoutTemplate size={14} /> Save as template
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    const id = clone(e.id);
                    toast('Event duplicated with all shifts and briefing', '📋');
                    nav(`/admin/events/${id}/edit`);
                  }}
                >
                  <CopyPlus size={14} /> Duplicate
                </Button>
              </div>
            </Card>
          );
        })}
        {list.length === 0 && <div className="col-span-full py-16 text-center text-slate-500">No events here yet.</div>}
      </div>

      <Modal open={!!saveAs} onClose={() => setSaveAs(null)} title="Save as template">
        {saveAs && (
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!templateName.trim()) return;
              upsertTemplate(templateFromEvent(saveAs, templateName.trim()));
              setSaveAs(null);
              toast(`Template “${templateName.trim()}” saved`, '📋');
            }}
          >
            <Field label="Template name">
              <Input autoFocus value={templateName} onChange={(ev) => setTemplateName(ev.target.value)} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={!templateName.trim()}>
                Save template
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
