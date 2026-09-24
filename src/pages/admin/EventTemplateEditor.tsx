import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Save } from 'lucide-react';
import { Button, Empty, Field, Input, PageHeader, Pill, Textarea } from '../../components/ui';
import { EventFields } from '../../components/eventFields';
import { BLANK_BODY, crewCount } from '../../lib/eventTemplates';
import { uid } from '../../lib/utils';
import { useCompany, useStore } from '../../store';
import type { EventTemplate } from '../../types';

export default function EventTemplateEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const original = useStore((s) => s.eventTemplates.find((t) => t.id === id));
  const upsert = useStore((s) => s.upsertEventTemplate);
  const toast = useStore((s) => s.toast);
  const company = useCompany();
  const nav = useNavigate();
  const [t, setT] = useState<EventTemplate | undefined>(() => {
    if (original) return structuredClone(original);
    if (!isNew) return undefined;
    const now = new Date().toISOString();
    return {
      id: uid('et-'),
      name: '',
      summary: '',
      emoji: '📋',
      body: BLANK_BODY({ name: company.managerName, title: company.managerTitle, phone: company.phone }),
      builtIn: false,
      createdAt: now,
      updatedAt: now,
      timesUsed: 0,
    };
  });

  if (!t) return <Empty title="Template not found" />;
  const dirty = isNew || JSON.stringify(t) !== JSON.stringify(original);
  const valid = t.name.trim().length > 0;

  const save = (then?: 'use') => {
    if (!valid) return toast('Give the template a name first', '⚠️');
    upsert({ ...t, name: t.name.trim(), summary: t.summary.trim() });
    toast(isNew ? 'Template created' : 'Template saved', '✅');
    if (then === 'use') nav(`/admin/events/new?template=${t.id}`);
    else if (isNew) nav(`/admin/events/templates/${t.id}`, { replace: true });
  };

  return (
    <>
      <Link
        to="/admin/events/templates"
        onClick={(e) => {
          if (dirty && !isNew && !confirm('Discard your unsaved changes to this template?')) e.preventDefault();
        }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> Event templates
      </Link>
      <PageHeader
        title={isNew ? 'New event template' : `${t.emoji} ${t.name || 'Untitled template'}`}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            {t.builtIn && <Pill className="bg-slate-100 text-slate-600">Built-in: you can edit it, and restore the original any time</Pill>}
            <span>
              {crewCount(t.body)} crew across {t.body.shifts.length} shift{t.body.shifts.length === 1 ? '' : 's'}. Changes apply to new events only.
            </span>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" disabled={!valid} onClick={() => save('use')}>
              <CalendarPlus size={16} /> {dirty ? 'Save & create event' : 'Create event from this'}
            </Button>
            <Button disabled={!dirty || !valid} onClick={() => save()}>
              <Save size={16} /> {isNew ? 'Create template' : 'Save template'}
            </Button>
          </>
        }
      />
      <EventFields
        value={t.body}
        onChange={(patch) => setT({ ...t, body: { ...t.body, ...patch } })}
        basicsTop={
          <>
            <div className="grid grid-cols-[72px_1fr] gap-3">
              <Field label="Icon">
                <Input value={t.emoji} onChange={(e) => setT({ ...t, emoji: e.target.value.slice(0, 4) })} className="text-center text-lg" />
              </Field>
              <Field label="Template name">
                <Input autoFocus={isNew} value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} placeholder="e.g. Riverside summer concert" />
              </Field>
            </div>
            <Field label="When to use it">
              <Textarea rows={2} value={t.summary} onChange={(e) => setT({ ...t, summary: e.target.value })} placeholder="e.g. Our standard setup for outdoor shows up to 5,000 people" />
            </Field>
          </>
        }
      />
    </>
  );
}
