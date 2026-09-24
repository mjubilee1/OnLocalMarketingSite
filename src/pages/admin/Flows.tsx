import { useState } from 'react';
import { Check, Clock, FileSignature, GraduationCap, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { OnlocalMark } from '../../components/brand';
import { Button, Card, Field, Input, Modal, PageHeader } from '../../components/ui';
import { CreateCourseModal } from '../../components/ai';
import { CreateRoleModal } from '../../components/aiRole';
import { roleTimeToReady } from '../../lib/readiness';
import { COLOR_KEYS, cn, color, uid } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { ID, Role } from '../../types';

function Toggle({ on, label, sub, onClick }: { on: boolean; label: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition cursor-pointer', on ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500 hover:bg-slate-50')}>
      <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300')}>{on && <Check size={12} />}</span>
      <span className="flex-1 truncate">{label}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </button>
  );
}

export default function Flows() {
  const staff = useStore((s) => s.staff);
  const upsert = useStore((s) => s.upsertRole);
  const del = useStore((s) => s.deleteRole);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const [editing, setEditing] = useState<Role | null>(null);
  const [aiRole, setAiRole] = useState(false);
  const [gap, setGap] = useState<{ request: string; roleIds: string[]; title: string } | null>(null);
  const [drafted, setDrafted] = useState<string[]>([]);

  const toggle = (r: Role, key: 'courseIds' | 'docIds' | 'certIds', id: ID) => {
    const list = r[key].includes(id) ? r[key].filter((x) => x !== id) : [...r[key], id];
    upsert({ ...r, [key]: list });
  };

  return (
    <>
      <PageHeader
        title="Onboarding flows"
        actions={
          <>
          <Button variant="secondary" onClick={() => setEditing({ id: uid('r-'), name: '', color: 'indigo', description: '', hourlyRate: 25, courseIds: ['c-welcome', 'c-safety'], docIds: ['d-agreement', 'd-conduct'], certIds: [] })}>
            <Plus size={16} /> New role
          </Button>
          <Button onClick={() => setAiRole(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
            <OnlocalMark size={16} /> Create role with onlocalAI
          </Button>
          </>
        }
      />
      <div className="grid gap-6 2xl:grid-cols-2">
        {cat.roles.map((r) => {
          const c = color(r.color);
          const holders = staff.filter((s) => s.roleIds.includes(r.id) && s.status !== 'inactive').length;
          return (
            <Card key={r.id} className="overflow-hidden">
              <div className={cn('flex items-center justify-between gap-3 px-5 py-4', c.soft)}>
                <div>
                  <button onClick={() => setEditing(r)} className={cn('text-lg font-semibold hover:underline cursor-pointer', c.text)}>
                    {r.name}
                  </button>
                  <div className="text-sm text-slate-600">{r.description}</div>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div className="flex items-center justify-end gap-1 font-semibold">
                    <Clock size={12} /> ~{roleTimeToReady(r, cat)} min to ready
                  </div>
                  <div>
                    ${r.hourlyRate}/hr • {holders} crew
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-3">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <FileSignature size={14} /> 1. Sign
                  </div>
                  {cat.docs.map((d) => (
                    <Toggle key={d.id} on={r.docIds.includes(d.id)} label={d.title} onClick={() => toggle(r, 'docIds', d.id)} />
                  ))}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <GraduationCap size={14} /> 2. Learn
                  </div>
                  {cat.courses.map((co) => (
                    <Toggle key={co.id} on={r.courseIds.includes(co.id)} label={`${co.emoji} ${co.title}`} sub={`${co.estMinutes}m`} onClick={() => toggle(r, 'courseIds', co.id)} />
                  ))}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ShieldCheck size={14} /> 3. Certify
                  </div>
                  {cat.certTypes.map((ct) => (
                    <Toggle key={ct.id} on={r.certIds.includes(ct.id)} label={ct.name} onClick={() => toggle(r, 'certIds', ct.id)} />
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={cat.roles.some((r) => r.id === editing?.id) ? 'Edit role' : 'New role'}>
        {editing && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing.name.trim()) return;
              upsert(editing);
              toast('Role saved', '✅');
              setEditing(null);
            }}
          >
            <Field label="Role name">
              <Input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Cloakroom Attendant" />
            </Field>
            <Field label="Description">
              <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <Field label="Hourly rate ($)">
              <Input type="number" value={editing.hourlyRate} onChange={(e) => setEditing({ ...editing, hourlyRate: +e.target.value })} />
            </Field>
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">Colour</span>
              <div className="flex gap-2">
                {COLOR_KEYS.map((k) => (
                  <button type="button" key={k} onClick={() => setEditing({ ...editing, color: k })} className={cn('h-7 w-7 rounded-full cursor-pointer', color(k).bg, editing.color === k && 'ring-2 ring-slate-900 ring-offset-2')} />
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-2">
              {cat.roles.some((r) => r.id === editing.id) ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => {
                    if (confirm(`Delete the ${editing.name} role? Crew will lose this role.`)) {
                      del(editing.id);
                      setEditing(null);
                    }
                  }}
                >
                  <Trash2 size={16} /> Delete
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit">Save role</Button>
            </div>
          </form>
        )}
      </Modal>
      {/* The role modal hides (but keeps its state) while a gap course is being drafted on top. */}
      <CreateRoleModal
        open={aiRole && !gap}
        onClose={() => setAiRole(false)}
        draftedTitles={drafted}
        onDraftCourse={(request, roleId, title) => setGap({ request, roleIds: [roleId], title })}
      />
      <CreateCourseModal
        open={!!gap}
        onClose={() => setGap(null)}
        initialRequest={gap?.request}
        initialRoleIds={gap?.roleIds}
        stayOnSave
        onSaved={() => gap && setDrafted((d) => [...d, gap.title])}
      />
    </>
  );
}
