import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, CircleCheck, Clock, ExternalLink, FileSignature, Package, Scale, Search, TriangleAlert } from 'lucide-react';
import { Button, Card, Empty, Input, Modal, PageHeader, Pill, RichText, Select, Tabs } from '../../components/ui';
import { CourseCard, CoverBadge } from '../../components/courseCard';
import { BUNDLES, LIBRARY_COURSES, LIBRARY_DOCS } from '../../data/library';
import { KIND_LABEL, type LibraryCourse, type LibraryDoc, type RoleTag, type TemplateKind } from '../../data/library/types';
import { fillPlaceholders } from '../../lib/company';
import { addCourseTemplate, addDocTemplate, recommendedRoleIds } from '../../lib/library';
import { cn } from '../../lib/utils';
import { useCatalog, useCompany, useStore } from '../../store';

type Tab = 'courses' | 'docs' | 'packs';

const KIND_STYLE: Record<TemplateKind, string> = {
  legal: 'bg-rose-50 text-rose-700',
  safety: 'bg-amber-50 text-amber-800',
  welfare: 'bg-violet-50 text-violet-700',
  service: 'bg-sky-50 text-sky-700',
  operations: 'bg-slate-100 text-slate-700',
};

function Sources({ sources }: { sources: { label: string; url: string }[] }) {
  if (!sources.length) return null;
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</div>
      <ul className="space-y-1 text-xs">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
              {s.label} <ExternalLink size={10} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Pick which roles get the template. Recommended roles are pre-ticked. */
function RolePicker({ tags, value, onChange }: { tags: RoleTag[]; value: string[]; onChange: (ids: string[]) => void }) {
  const { roles } = useCatalog();
  const rec = recommendedRoleIds(tags, roles);
  return (
    <div className="space-y-1">
      {roles.map((r) => {
        const on = value.includes(r.id);
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== r.id) : [...value, r.id])}
            className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm cursor-pointer', on ? 'bg-indigo-50' : 'hover:bg-slate-50')}
          >
            <span className={cn('flex h-4 w-4 items-center justify-center rounded border', on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300')}>{on && <Check size={12} />}</span>
            <span className="flex-1">{r.name}</span>
            {rec.includes(r.id) && <span className="text-[11px] text-violet-600">recommended</span>}
          </button>
        );
      })}
    </div>
  );
}

function CoursePreview({ t, onClose, onAdd }: { t: LibraryCourse; onClose: () => void; onAdd: () => void }) {
  const [open, setOpen] = useState<string | undefined>(t.course.lessons[0]?.id);
  const c = t.course;
  const added = useStore((s) => s.courses.some((x) => x.templateId === c.id));
  return (
    <Modal open onClose={onClose} title={`${c.emoji} ${c.title}`} wide>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{c.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Pill className={KIND_STYLE[t.kind]}>{KIND_LABEL[t.kind]}</Pill>
          <Pill className="bg-slate-100 text-slate-600">
            <Clock size={11} /> {c.estMinutes} min
          </Pill>
          <Pill className="bg-slate-100 text-slate-600">{c.lessons.length} cards</Pill>
          
        </div>
        {t.legal && (
          <div className="flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
            <Scale size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Where it's a legal requirement</div>
              <div className="mt-0.5">{t.legal}</div>
            </div>
          </div>
        )}
        {t.customise && (
          <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Customise before publishing</div>
              <div className="mt-0.5">{t.customise}</div>
            </div>
          </div>
        )}
        <div className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
          {c.lessons.map((l, i) => (
            <div key={l.id}>
              <button onClick={() => setOpen(open === l.id ? undefined : l.id)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50 cursor-pointer">
                <span className="w-5 text-xs text-slate-400">{i + 1}</span>
                <span className="flex-1 font-medium">{l.title}</span>
                <span className="text-xs text-slate-400">{l.kind === 'quiz' ? `${l.questions?.length} questions` : l.kind}</span>
              </button>
              {open === l.id && (
                <div className="bg-slate-50/60 px-4 pb-4 pl-11 text-sm">
                  {l.body && <RichText text={l.body} />}
                  {l.questions?.map((q) => (
                    <div key={q.id} className="mb-3">
                      <div className="font-medium">{q.prompt}</div>
                      <ul className="mt-1 space-y-0.5">
                        {q.options.map((o, oi) => (
                          <li key={oi} className={oi === q.correct ? 'font-medium text-emerald-700' : 'text-slate-600'}>
                            {oi === q.correct ? '✓' : '·'} {o}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && <div className="mt-1 text-xs text-slate-500">{q.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <Sources sources={t.sources} />
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button onClick={onAdd}>{added ? 'Assign to more roles' : 'Add to my library'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function AddCourseModal({ t, onClose }: { t: LibraryCourse; onClose: () => void }) {
  const cat = useCatalog();
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const existing = useStore((s) => s.courses.find((x) => x.templateId === t.course.id));
  const [roleIds, setRoleIds] = useState(() => recommendedRoleIds(t.roles, cat.roles).filter((id) => !existing || !cat.roles.find((r) => r.id === id)?.courseIds.includes(existing.id)));
  // Templates that need local details start as drafts so crew never see placeholder text.
  const [publish, setPublish] = useState(!t.customise);

  const add = (open: boolean) => {
    const { course, isNew } = addCourseTemplate(t, roleIds, publish);
    toast(isNew ? `Added “${course.title}”${roleIds.length ? ` to ${roleIds.length} role${roleIds.length === 1 ? '' : 's'}` : ''}` : `Assigned to ${roleIds.length} more role${roleIds.length === 1 ? '' : 's'}`, '📚');
    onClose();
    if (open) nav(`/admin/training/${course.id}`);
  };

  return (
    <Modal open onClose={onClose} title={existing ? `Assign “${t.course.title}”` : `Add “${t.course.title}”`}>
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-sm font-medium text-slate-700">Required for these roles</div>
          <RolePicker tags={t.roles} value={roleIds} onChange={setRoleIds} />
        </div>
        {!existing && (
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-600" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
            <span>
              Publish to crew now
              {t.customise && <span className="block text-xs text-amber-700">Recommended: leave off until you've filled in: {t.customise}</span>}
            </span>
          </label>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {!existing && (
            <Button variant="secondary" onClick={() => add(true)}>
              Add & edit
            </Button>
          )}
          <Button onClick={() => add(false)} disabled={!!existing && !roleIds.length}>
            {existing ? 'Assign' : 'Add'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DocCard({ t }: { t: LibraryDoc }) {
  const cat = useCatalog();
  const company = useCompany();
  const toast = useStore((s) => s.toast);
  const added = useStore((s) => s.docs.some((d) => d.templateId === t.doc.id));
  const [preview, setPreview] = useState(false);
  const [adding, setAdding] = useState(false);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <FileSignature size={20} className="mt-0.5 shrink-0 text-indigo-600" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{t.doc.title}</h3>
            
          </div>
          <p className="mt-1 text-sm text-slate-600">{t.why}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-1 items-end justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setPreview(true)}>
          Preview
        </Button>
        {added ? (
          <Pill className="bg-emerald-50 text-emerald-700">
            <CircleCheck size={12} /> Added
          </Pill>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              setRoleIds(recommendedRoleIds(t.roles, cat.roles));
              setAdding(true);
            }}
          >
            Add
          </Button>
        )}
      </div>
      {preview && (
        <Modal open onClose={() => setPreview(false)} title={t.doc.title} wide>
          <div className="space-y-4">
            <div className="max-h-[50vh] overflow-auto whitespace-pre-line rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{fillPlaceholders(t.doc.body, company)}</div>
            <Sources sources={t.sources} />
          </div>
        </Modal>
      )}
      {adding && (
        <Modal open onClose={() => setAdding(false)} title={`Add “${t.doc.title}”`}>
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-700">Crew in these roles must sign it</div>
            <RolePicker tags={t.roles} value={roleIds} onChange={setRoleIds} />
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                onClick={() => {
                  addDocTemplate(t, roleIds);
                  toast(`Added “${t.doc.title}” to Paperwork`, '✍️');
                  setAdding(false);
                }}
              >
                Add document
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}

export default function TemplateLibrary() {
  const cat = useCatalog();
  const courses = useStore((s) => s.courses);
  const toast = useStore((s) => s.toast);
  const [tab, setTab] = useState<Tab>('courses');
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<TemplateKind | ''>('');
  const [role, setRole] = useState('');
  const [preview, setPreview] = useState<LibraryCourse | null>(null);
  const [adding, setAdding] = useState<LibraryCourse | null>(null);

  const installed = (id: string) => courses.some((c) => c.templateId === id);
  const list = useMemo(
    () =>
      LIBRARY_COURSES.filter((t) => !kind || t.kind === kind)
        .filter((t) => !role || t.roles.includes('all') || (t.roles as string[]).includes(role))
        .filter((t) => !q || `${t.course.title} ${t.course.description} ${t.course.category} ${t.legal ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, kind, role],
  );
  const docs = LIBRARY_DOCS;

  const addBundle = (bundleId: string) => {
    const b = BUNDLES.find((x) => x.id === bundleId)!;
    let n = 0;
    let drafts = 0;
    for (const id of b.courseIds) {
      const t = LIBRARY_COURSES.find((x) => x.course.id === id);
      if (!t) continue;
      if (addCourseTemplate(t, recommendedRoleIds(t.roles, useStore.getState().roles), !t.customise).isNew) {
        n++;
        if (t.customise) drafts++;
      }
    }
    let d = 0;
    for (const id of b.docIds ?? []) {
      const t = LIBRARY_DOCS.find((x) => x.doc.id === id);
      if (t && addDocTemplate(t, recommendedRoleIds(t.roles, useStore.getState().roles)).isNew) d++;
    }
    toast(
      n + d
        ? `${b.name}: added ${n} course${n === 1 ? '' : 's'}${d ? ` and ${d} document${d === 1 ? '' : 's'}` : ''}.${drafts ? ` ${drafts} saved as drafts until you add your local details.` : ''}`
        : `${b.name} is already in your library`,
      b.emoji,
    );
  };

  return (
    <>
      <Link to="/admin/training" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Training
      </Link>
      <PageHeader title="Template library" />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'courses', label: 'Courses', count: LIBRARY_COURSES.length },
          { id: 'docs', label: 'Policy documents', count: LIBRARY_DOCS.length },
          { id: 'packs', label: 'Starter packs', count: BUNDLES.length },
        ]}
      />

      {tab !== 'packs' && (
        <div className="my-4 flex flex-wrap items-center gap-2">
          {tab === 'courses' && (
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <Input className="pl-9" placeholder="Search e.g. heat, alcohol, lost child" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          )}
          {tab === 'courses' && (
            <>
              <Select className="w-auto" value={kind} onChange={(e) => setKind(e.target.value as TemplateKind | '')}>
                <option value="">All types</option>
                {(Object.keys(KIND_LABEL) as TemplateKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </Select>
              <Select className="w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">All roles</option>
                {cat.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </>
          )}
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((t) => {
            const c = t.course;
            const done = installed(c.id);
            return (
              <CourseCard
                key={c.id}
                c={c}
                provider="onlocalAI Library"
                onClick={() => setPreview(t)}
                badges={
                  <>
                    <CoverBadge>{KIND_LABEL[t.kind]}</CoverBadge>
                    {t.legal && (
                      <CoverBadge tone="red">
                        <Scale size={10} /> Legally required in places
                      </CoverBadge>
                    )}
                  </>
                }
                stat={<span>{c.lessons.reduce((a, l) => a + (l.questions?.length ?? 0), 0)} quiz questions</span>}
                footer={
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-slate-500">
                      {t.roles.includes('all') ? 'All crew' : t.roles.map((r) => cat.roles.find((x) => x.id === r)?.name).filter(Boolean).join(', ')}
                    </span>
                    {done ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdding(t);
                        }}
                      >
                        <CircleCheck size={14} className="text-emerald-600" /> Added
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdding(t);
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                }
              />
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full">
              <Empty icon={<BookOpen size={28} />} title="No templates match" />
            </div>
          )}
        </div>
      )}

      {tab === 'docs' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((t) => (
            <DocCard key={t.doc.id} t={t} />
          ))}
        </div>
      )}

      {tab === 'packs' && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {BUNDLES.map((b) => {
            const items = b.courseIds.map((id) => LIBRARY_COURSES.find((x) => x.course.id === id)).filter(Boolean) as LibraryCourse[];
            const docItems = (b.docIds ?? []).map((id) => LIBRARY_DOCS.find((x) => x.doc.id === id)).filter(Boolean) as LibraryDoc[];
            const allAdded = items.every((t) => installed(t.course.id));
            return (
              <Card key={b.id} className="flex flex-col p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{b.emoji}</div>
                  <div>
                    <h3 className="font-semibold">{b.name}</h3>
                    <div className="text-xs text-slate-500">
                      {items.length} courses{docItems.length ? ` · ${docItems.length} document${docItems.length === 1 ? '' : 's'}` : ''} · ~{items.reduce((a, t) => a + t.course.estMinutes, 0)} min
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{b.description}</p>
                <ul className="mt-3 flex-1 space-y-1 text-sm">
                  {items.map((t) => (
                    <li key={t.course.id} className="flex items-center gap-2">
                      {installed(t.course.id) ? <CircleCheck size={14} className="text-emerald-500" /> : <span className="w-3.5 text-center">{t.course.emoji}</span>}
                      <span className="truncate">{t.course.title}</span>
                    </li>
                  ))}
                  {docItems.map((t) => (
                    <li key={t.doc.id} className="flex items-center gap-2 text-slate-600">
                      <FileSignature size={14} className="text-slate-400" /> <span className="truncate">{t.doc.title}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-4" variant={allAdded ? 'secondary' : 'primary'} onClick={() => addBundle(b.id)}>
                  <Package size={16} /> {allAdded ? 'Added' : 'Add pack'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {preview && (
        <CoursePreview
          t={preview}
          onClose={() => setPreview(null)}
          onAdd={() => {
            setAdding(preview);
            setPreview(null);
          }}
        />
      )}
      {adding && <AddCourseModal t={adding} onClose={() => setAdding(null)} />}
    </>
  );
}
