import { useState, type ReactNode } from 'react';
import { Check, CircleCheck, Clock, FileSignature, GraduationCap, Plus, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Field, Input, Modal, Pill, Textarea } from './ui';
import { ErrorBox, NotConfigured, Progress, useAIJob, useAIStatus } from './ai';
import { generateRole, type RoleSuggestion } from '../lib/ai';
import { roleTimeToReady } from '../lib/readiness';
import { cn, color, COLOR_KEYS, uid } from '../lib/utils';
import { useCatalog, useStore } from '../store';
import type { CertType, Role } from '../types';

const ROLE_EXAMPLES = [
  'Cloakroom attendant at black-tie gala dinners',
  'First aider roaming a large outdoor festival',
  'Barista running a coffee cart at conferences',
  'Artist liaison looking after performers backstage',
  'Waste & recycling steward at a zero-waste festival',
];

interface RoleDraft extends RoleSuggestion {
  /** Which AI-suggested new certification types to create. */
  addCerts: boolean[];
}

function Section({ icon: Icon, title, children }: { icon: typeof Check; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon size={14} /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Item({ on, label, why, sub, onClick }: { on: boolean; label: string; why?: string; sub?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition cursor-pointer', on ? 'bg-indigo-50' : 'hover:bg-slate-50')}>
      <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300')}>
        {on && <Check size={12} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate', on ? 'text-indigo-950' : 'text-slate-500')}>{label}</span>
        {why && on && <span className="block text-[11px] leading-snug text-violet-700">✨ {why}</span>}
      </span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </button>
  );
}

export function CreateRoleModal({
  open,
  onClose,
  onDraftCourse,
  draftedTitles,
}: {
  open: boolean;
  onClose: () => void;
  /** Opens the AI course creator for a training gap, pre-filled for the new role. */
  onDraftCourse: (request: string, roleId: string, title: string) => void;
  draftedTitles: string[];
}) {
  const cat = useCatalog();
  const orgName = useStore((s) => s.orgName);
  const upsertRole = useStore((s) => s.upsertRole);
  const upsertCertType = useStore((s) => s.upsertCertType);
  const toast = useStore((s) => s.toast);
  const status = useAIStatus();
  const job = useAIJob<RoleSuggestion>();
  const [description, setDescription] = useState('');
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const [label, setLabel] = useState('');
  const [saved, setSaved] = useState<Role | null>(null);

  const reset = () => {
    setDraft(null);
    setSaved(null);
    setDescription('');
  };
  const close = () => {
    job.cancel();
    onClose();
    if (saved) reset();
  };

  const start = async () => {
    setDraft(null);
    const r = await job.run((onEvent, signal) =>
      generateRole(
        {
          description,
          orgName,
          catalog: {
            docs: cat.docs.map(({ id, title, description }) => ({ id, title, description })),
            courses: cat.courses.filter((c) => c.published).map(({ id, title, description, category, estMinutes }) => ({ id, title, description, category, estMinutes })),
            certTypes: cat.certTypes.map(({ id, name, description }) => ({ id, name, description })),
            roles: cat.roles.map(({ name, hourlyRate, docIds, courseIds, certIds }) => ({ name, hourlyRate, docIds, courseIds, certIds })),
          },
        },
        onEvent,
        signal,
      ),
    );
    if (r) {
      setDraft({ ...r.data, addCerts: r.data.newCerts.map(() => true) });
      setLabel(r.label);
    }
  };

  const toggle = (key: 'docIds' | 'courseIds' | 'certIds', id: string) =>
    draft && setDraft({ ...draft, [key]: draft[key].includes(id) ? draft[key].filter((x) => x !== id) : [...draft[key], id] });

  const save = () => {
    if (!draft || !draft.name.trim()) return;
    const newCertIds: string[] = [];
    draft.newCerts.forEach((c, i) => {
      if (!draft.addCerts[i]) return;
      const ct: CertType = { id: uid('ct-'), name: c.name, description: c.description, validMonths: c.validMonths };
      upsertCertType(ct);
      newCertIds.push(ct.id);
    });
    const role: Role = {
      id: uid('r-'),
      name: draft.name.trim(),
      description: draft.description.trim(),
      color: draft.color,
      hourlyRate: Math.max(0, draft.hourlyRate),
      docIds: draft.docIds,
      courseIds: draft.courseIds,
      certIds: [...draft.certIds, ...newCertIds],
    };
    upsertRole(role);
    toast(`${role.name} role created`, '✅');
    setSaved(role);
  };

  const preview: Role | null = draft && {
    id: 'preview',
    name: draft.name,
    description: draft.description,
    color: draft.color,
    hourlyRate: draft.hourlyRate,
    docIds: draft.docIds,
    courseIds: draft.courseIds,
    certIds: draft.certIds,
  };

  return (
    <Modal open={open} onClose={close} title={saved ? `✅ ${saved.name} is ready` : '✨ Create a role with AI'} wide>
      {status && !status.configured ? (
        <NotConfigured />
      ) : saved ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            The role is live in your onboarding flows. New crew can pick it when they sign up, and its checklist appears in their app straight away.
          </p>
          {draft && draft.newCourses.length > 0 && (
            <div className="rounded-xl ring-1 ring-slate-200">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="text-sm font-semibold">Training gaps the AI found</div>
                <div className="text-xs text-slate-500">Nothing in your library covers these yet. Draft each one with AI and it's added to this role automatically.</div>
              </div>
              <div className="divide-y divide-slate-100">
                {draft.newCourses.map((c) => {
                  const done = draftedTitles.includes(c.title);
                  return (
                    <div key={c.title} className="flex items-center gap-3 px-4 py-3">
                      <GraduationCap size={18} className="shrink-0 text-indigo-500" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{c.title}</div>
                        <div className="text-xs text-slate-500">{c.why}</div>
                      </div>
                      {done ? (
                        <Pill className="bg-emerald-50 text-emerald-700">
                          <CircleCheck size={12} /> Drafted
                        </Pill>
                      ) : (
                        <Button size="sm" onClick={() => onDraftCourse(`${c.title}. For the ${saved.name} role: ${saved.description} ${c.why}`, saved.id, c.title)}>
                          <Sparkles size={14} /> Draft with AI
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="ghost" onClick={reset}>
              <Plus size={16} /> Create another role
            </Button>
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      ) : job.running ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">“{description}”</div>
          <Progress log={job.log} running={job.running} elapsed={job.elapsed} what="role" />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={job.cancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : draft && preview ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
            <Field label="Role name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Hourly rate ($)">
              <Input type="number" min={0} value={draft.hourlyRate} onChange={(e) => setDraft({ ...draft, hourlyRate: +e.target.value })} />
            </Field>
          </div>
          {draft.rateNote && <p className="-mt-3 text-xs text-slate-500">💡 {draft.rateNote} Check it against local minimum wage and any award or union rates.</p>}
          <Field label="What they do">
            <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Colour</span>
            <div className="flex gap-1.5">
              {COLOR_KEYS.map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setDraft({ ...draft, color: k })}
                  className={cn('h-6 w-6 rounded-full cursor-pointer', color(k).bg, draft.color === k && 'ring-2 ring-slate-900 ring-offset-2')}
                />
              ))}
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-600">
              <Clock size={12} /> ~{roleTimeToReady(preview, cat)} min to get ready
            </span>
          </div>

          <div className="grid gap-4 rounded-xl p-4 ring-1 ring-slate-200 md:grid-cols-3">
            <Section icon={FileSignature} title="1. Sign">
              {cat.docs.map((d) => (
                <Item key={d.id} on={draft.docIds.includes(d.id)} label={d.title} why={draft.reasons[d.id]} onClick={() => toggle('docIds', d.id)} />
              ))}
            </Section>
            <Section icon={GraduationCap} title="2. Learn">
              {cat.courses
                .filter((c) => c.published)
                .map((c) => (
                  <Item
                    key={c.id}
                    on={draft.courseIds.includes(c.id)}
                    label={`${c.emoji} ${c.title}`}
                    sub={`${c.estMinutes}m`}
                    why={draft.reasons[c.id]}
                    onClick={() => toggle('courseIds', c.id)}
                  />
                ))}
            </Section>
            <Section icon={ShieldCheck} title="3. Certify">
              {cat.certTypes.map((c) => (
                <Item key={c.id} on={draft.certIds.includes(c.id)} label={c.name} why={draft.reasons[c.id]} onClick={() => toggle('certIds', c.id)} />
              ))}
              {draft.newCerts.map((c, i) => (
                <div key={c.name} className="rounded-lg border border-dashed border-violet-300 p-1">
                  <Item
                    on={draft.addCerts[i]!}
                    label={`New: ${c.name}`}
                    why={`${c.why} (valid ${c.validMonths} months)`}
                    onClick={() => setDraft({ ...draft, addCerts: draft.addCerts.map((v, j) => (j === i ? !v : v)) })}
                  />
                </div>
              ))}
            </Section>
          </div>

          {draft.newCourses.length > 0 && (
            <div className="rounded-lg bg-violet-50 p-3 text-sm text-violet-900">
              <div className="font-medium">Training gaps found. You can draft these with AI next:</div>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {draft.newCourses.map((c) => (
                  <li key={c.title}>
                    <strong>{c.title}</strong>: {c.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">These are AI suggestions. Confirm the pay rate and any licence requirements for your location before hiring.</p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <Button variant="ghost" onClick={start}>
              <RotateCcw size={16} /> Try again
            </Button>
            <span className="flex items-center gap-2">
              <Pill className="bg-violet-50 text-violet-700">
                <Sparkles size={10} /> {label}
              </Pill>
              <Button onClick={save} disabled={!draft.name.trim()}>
                Create role
              </Button>
            </span>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (description.trim().length >= 3) start();
          }}
        >
          {job.error && <ErrorBox message={job.error} />}
          <Field
            label="Describe the role"
            hint="What they do, where, and anything special (alcohol, food, cash, children, heights, licences). The AI picks paperwork, training and certificates from your library."
          >
            <Textarea
              autoFocus
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cloakroom attendant at black-tie gala dinners. Takes coats and bags, issues tickets, returns items at the end of the night."
            />
          </Field>
          <div className="-mt-1 flex flex-wrap gap-1.5">
            {ROLE_EXAMPLES.map((ex) => (
              <button type="button" key={ex} onClick={() => setDescription(ex)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 cursor-pointer">
                {ex}
              </button>
            ))}
          </div>
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button type="submit" disabled={description.trim().length < 3}>
              <Sparkles size={16} /> Design role
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
