import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, FilePlus2, Pencil, RotateCcw, Trash2, TriangleAlert } from 'lucide-react';
import { Button, Card, Modal, PageHeader, Pill } from '../../components/ui';
import { crewCount, templateIssues } from '../../lib/eventTemplates';
import { BUILT_IN_EVENT_TEMPLATES } from '../../data/eventTemplates';
import { cn, color, uid } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { EventTemplate } from '../../types';

function Stats({ t }: { t: EventTemplate }) {
  const cat = useCatalog();
  const roles = new Set(t.body.shifts.map((s) => s.roleId).filter((id) => cat.roles.some((r) => r.id === id)));
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
      <span>{crewCount(t.body)} crew</span>
      <span>{roles.size} role{roles.size === 1 ? '' : 's'}</span>
      <span>{t.body.schedule.length} run-sheet times</span>
      <span>call {t.body.callTime}</span>
    </div>
  );
}

/** "New event" chooser: start blank or from any template. */
export function NewEventPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const templates = useStore((s) => s.eventTemplates);
  const nav = useNavigate();
  const sorted = [...templates].sort((a, b) => b.timesUsed - a.timesUsed || a.name.localeCompare(b.name));
  const go = (templateId?: string) => {
    onClose();
    nav(templateId ? `/admin/events/new?template=${templateId}` : '/admin/events/new');
  };
  return (
    <Modal open={open} onClose={onClose} title="New event" wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => go()} className="flex items-start gap-3 rounded-xl border-2 border-dashed border-slate-300 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer">
          <FilePlus2 size={24} className="mt-0.5 text-slate-400" />
          <div>
            <div className="font-medium">Blank event</div>
            <div className="text-xs text-slate-500">Start from scratch.</div>
          </div>
        </button>
        {sorted.map((t) => (
          <button key={t.id} onClick={() => go(t.id)} className="flex items-start gap-3 rounded-xl p-4 text-left ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-indigo-300 cursor-pointer">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl', color(t.body.color).soft)}>{t.emoji}</span>
            <div className="min-w-0">
              <div className="font-medium">{t.name}</div>
              <div className="line-clamp-2 text-xs text-slate-500">{t.summary}</div>
              <div className="mt-1">
                <Stats t={t} />
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link to="/admin/events/templates" onClick={onClose} className="text-sm font-medium text-indigo-600 hover:underline">
          Manage templates →
        </Link>
      </div>
    </Modal>
  );
}

export default function EventTemplates() {
  const templates = useStore((s) => s.eventTemplates);
  const upsert = useStore((s) => s.upsertEventTemplate);
  const del = useStore((s) => s.deleteEventTemplate);
  const restore = useStore((s) => s.restoreEventTemplate);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const nav = useNavigate();
  const missingBuiltIns = BUILT_IN_EVENT_TEMPLATES.filter((b) => !templates.some((t) => t.id === b.id));

  const duplicate = (t: EventTemplate) => {
    const now = new Date().toISOString();
    const copy: EventTemplate = {
      ...structuredClone(t),
      id: uid('et-'),
      name: `${t.name} (copy)`,
      builtIn: false,
      createdAt: now,
      updatedAt: now,
      timesUsed: 0,
      body: { ...structuredClone(t.body), shifts: t.body.shifts.map((s) => ({ ...s, id: uid('tsh-') })) },
    };
    upsert(copy);
    nav(`/admin/events/templates/${copy.id}`);
  };

  return (
    <>
      <Link to="/admin/events" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Events
      </Link>
      <PageHeader
        title="Event templates"
        actions={
          <>
            {missingBuiltIns.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  missingBuiltIns.forEach((b) => restore(b.id));
                  toast(`Restored ${missingBuiltIns.length} built-in template${missingBuiltIns.length === 1 ? '' : 's'}`, '↩️');
                }}
              >
                <RotateCcw size={16} /> Restore {missingBuiltIns.length} deleted built-in{missingBuiltIns.length === 1 ? '' : 's'}
              </Button>
            )}
            <Button onClick={() => nav('/admin/events/templates/new')}>
              <FilePlus2 size={16} /> New template
            </Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => {
          const issues = templateIssues(t, cat.roles, cat.courses);
          const edited = t.builtIn && t.updatedAt !== t.createdAt;
          return (
            <Card key={t.id} className="flex flex-col p-5">
              <button onClick={() => nav(`/admin/events/templates/${t.id}`)} className="flex flex-1 flex-col text-left cursor-pointer">
                <div className="flex items-start gap-3">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl', color(t.body.color).soft)}>{t.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-snug">{t.name}</h3>
                      {t.builtIn ? <Pill className="bg-slate-100 text-slate-500">{edited ? 'Built-in · edited' : 'Built-in'}</Pill> : <Pill className="bg-indigo-50 text-indigo-700">Yours</Pill>}
                    </div>
                    <Stats t={t} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">{t.summary || 'No description yet.'}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.from(new Set(t.body.shifts.map((s) => s.roleId)))
                    .map((rid) => cat.roles.find((r) => r.id === rid))
                    .filter(Boolean)
                    .map((r) => (
                      <span key={r!.id} className={cn('rounded px-1.5 py-0.5 text-[11px]', color(r!.color).soft, color(r!.color).text)}>
                        {r!.name}
                      </span>
                    ))}
                </div>
                {issues.length > 0 && (
                  <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                    <TriangleAlert size={13} className="mt-0.5 shrink-0" /> {issues.join('; ')}. Edit the template to fix.
                  </div>
                )}
              </button>
              <div className="mt-4 flex items-center justify-between gap-1 border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-400">{t.timesUsed ? `Used ${t.timesUsed}×` : 'Not used yet'}</span>
                <span className="flex gap-1">
                  <Button size="sm" variant="ghost" title="Edit" onClick={() => nav(`/admin/events/templates/${t.id}`)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" title="Duplicate" onClick={() => duplicate(t)}>
                    <Copy size={14} />
                  </Button>
                  {edited && (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Restore original"
                      onClick={() => {
                        if (confirm(`Restore “${t.name}” to its original version? Your edits to it will be lost.`)) {
                          restore(t.id);
                          toast('Template restored', '↩️');
                        }
                      }}
                    >
                      <RotateCcw size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Delete"
                    className="hover:text-rose-600"
                    onClick={() => {
                      if (confirm(`Delete the “${t.name}” template? Events already created from it are not affected.`)) {
                        del(t.id);
                        toast('Template deleted', '🗑️');
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button size="sm" onClick={() => nav(`/admin/events/new?template=${t.id}`)}>
                    Use
                  </Button>
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      {templates.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No templates. Create one, or save an event as a template from its edit page.</p>}
    </>
  );
}
