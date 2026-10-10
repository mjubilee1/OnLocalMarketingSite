import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button, Field, Input } from '../components/ui';
import { boardWhen, cn, uid } from '../lib/utils';
import { useStore } from '../store';
import { ITEM_LIBRARY, TEMPLATE_STARTERS, type ItemGroup } from './items';
import { ItemSwatch } from './ItemSwatch';
import { SceneBoard } from './SceneBoard';
import type { Pose, SceneItem, SceneKind, TrainingSpec } from './types';

const SCENES: { id: SceneKind; label: string; hint: string }[] = [
  { id: 'plate', label: 'Dinner plate', hint: 'Protein, starch, veg — plated banquet' },
  { id: 'round-table', label: 'Round table', hint: 'Covers, glassware, napkin, centerpiece' },
  { id: 'station', label: 'Coffee station', hint: 'Urn, cups, milk, pastry — guest line' },
];

const WIZARD = ['Start', 'Set the picture', 'What Alex says', 'Review'] as const;
const FIXED = new Set(['plate', 'table', 'cloth']);

export function Editor({
  spec,
  revising,
  onSave,
  onDraft,
}: {
  spec?: TrainingSpec;
  /** True when a published version already exists, so publish bumps the version. */
  revising?: boolean;
  onSave: (next: TrainingSpec, changeSummary: string) => void;
  onDraft?: (next: TrainingSpec) => void;
}) {
  const [step, setStep] = useState(spec ? 1 : 0);
  const [kind, setKind] = useState<SceneKind>(spec?.template ?? 'plate');
  const [title, setTitle] = useState(spec?.title ?? '');
  const [venue, setVenue] = useState(spec?.venue ?? '');
  const [nameEdited, setNameEdited] = useState(Boolean(spec?.title));
  const [draft, setDraft] = useState<TrainingSpec | null>(spec ?? null);
  const [poses, setPoses] = useState<Record<string, Pose>>(() => posesFrom(spec));
  const [lines, setLines] = useState<string[]>(spec?.steps.map((s) => s.caption) ?? []);
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(spec?.status === 'draft' ? spec.updatedAt : null);
  const [shelf, setShelf] = useState<ItemGroup | 'all' | 'mine'>(spec?.template === 'round-table' ? 'table' : spec?.template === 'station' ? 'station' : 'plate');
  const custom = useStore((s) => s.customLibrary);
  const dirty = useRef(false);
  const pending = useRef<TrainingSpec | null>(null);

  const live = useMemo(() => {
    if (!draft) return null;
    const items = draft.scene.items.map((it) => ({ ...it, ...(poses[it.id] ?? it) }));
    return {
      ...draft,
      title: title.trim() || draft.title,
      venue: venue.trim() || undefined,
      status: 'draft' as const,
      scene: { ...draft.scene, items },
      steps: draft.steps.map((s, i) => ({ ...s, caption: lines[i] ?? s.caption })),
    };
  }, [draft, title, venue, poses, lines]);

  const touch = () => {
    dirty.current = true;
  };

  useEffect(() => {
    if (!onDraft || !dirty.current || !live || step === 0) return;
    const next = live;
    pending.current = next;
    const t = window.setTimeout(() => {
      if (pending.current === next) pending.current = null;
      dirty.current = false;
      onDraft(next);
      setSavedAt(new Date().toISOString());
    }, 400);
    return () => {
      window.clearTimeout(t);
      if (pending.current === next) {
        pending.current = null;
        onDraft(next);
        setSavedAt(new Date().toISOString());
      }
    };
  }, [live, onDraft, step]);

  const begin = () => {
    const next = blankFromTemplate(kind, 'banquets', title.trim() || labelOf(kind));
    if (draft) next.id = draft.id;
    next.venue = venue.trim() || undefined;
    next.status = 'draft';
    dirty.current = false;
    setDraft(next);
    setPoses(posesFrom(next));
    setLines(next.steps.map((s) => s.caption));
    setTitle(next.title);
    setShelf(kind === 'round-table' ? 'table' : kind === 'station' ? 'station' : 'plate');
    setSelectedId(null);
    onDraft?.(next);
    setSavedAt(new Date().toISOString());
    setStep(1);
  };

  const pickScene = (id: SceneKind) => {
    setKind(id);
    if (!nameEdited) setTitle(labelOf(id));
  };

  if (!live && step === 0) {
    return (
      <WizardFrame step={0}>
        <h2 className="text-2xl font-bold text-slate-900">What’s the picture?</h2>
        <p className="mt-2 text-sm text-slate-500">Name the board, pick a start, then you’ll set the picture. It stays a draft until you publish.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Field label="Board name">
            <Input
              value={title}
              onChange={(e) => {
                setNameEdited(true);
                setTitle(e.target.value);
              }}
              placeholder={labelOf(kind)}
            />
          </Field>
          <Field label="Where" hint="The property this picture is for">
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Gaylord Hotel" />
          </Field>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pickScene(s.id)}
              className={cn(
                'rounded-2xl p-4 text-left ring-1 transition',
                kind === s.id ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-800 ring-slate-200 hover:ring-indigo-300',
              )}
            >
              <div className="font-semibold">{s.label}</div>
              <div className={cn('mt-1 text-xs', kind === s.id ? 'text-indigo-100' : 'text-slate-500')}>{s.hint}</div>
            </button>
          ))}
        </div>
        <Button className="mt-8" onClick={begin}>
          Set the picture <ChevronRight size={16} />
        </Button>
      </WizardFrame>
    );
  }

  if (!live) return null;

  const addItem = (kindName: string, label: string, look?: SceneItem['look']) => {
    touch();
    const id = uid('it');
    const n = live.scene.items.length;
    const item: SceneItem = { id, kind: kindName, label, x: 50 + (n % 3) * 8 - 8, y: 48 + (n % 2) * 8, z: n + 2, look };
    setDraft({
      ...live,
      scene: { ...live.scene, items: [...live.scene.items, item] },
      steps: [...live.steps, { id: uid('st'), caption: `${label} goes here.`, anim: 'appear', itemIds: [id] }],
    });
    setPoses((p) => ({ ...p, [id]: { x: item.x, y: item.y } }));
    setLines((c) => [...c, `${label} goes here.`]);
  };

  const removeItem = (id: string) => {
    touch();
    const it = live.scene.items.find((x) => x.id === id);
    if (!it || FIXED.has(it.kind)) return;
    const items = live.scene.items.filter((x) => x.id !== id);
    const steps = live.steps.filter((s) => !s.itemIds.includes(id) || s.itemIds.length > 1).map((s) => ({ ...s, itemIds: s.itemIds.filter((x) => x !== id) }));
    setDraft({ ...live, scene: { ...live.scene, items }, steps });
    setLines(() => {
      const byId = Object.fromEntries(live.steps.map((s, i) => [s.id, lines[i] ?? s.caption]));
      return steps.map((s) => byId[s.id] ?? s.caption);
    });
    setPoses((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const builtIn = ITEM_LIBRARY.filter((i) => shelf === 'all' || i.group === shelf).map((i) => ({ ...i, look: undefined as SceneItem['look'] }));
  const mine = custom.filter((i) => shelf === 'mine' || shelf === 'all' || i.group === shelf).map((i) => ({ kind: i.id, label: i.label, group: i.group, look: i.look }));
  const catalog = shelf === 'mine' ? mine : [...mine, ...builtIn];
  const onScene = live.scene.items.filter((it) => !FIXED.has(it.kind));
  const selected = onScene.find((it) => it.id === selectedId);

  return (
    <WizardFrame step={step}>
      {step === 1 && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{title.trim() || labelOf(kind)}</h2>
              <p className="mt-1 text-sm text-slate-500">{venue.trim() || 'Add the property so you can tell this board apart later.'}</p>
            </div>
            <p className="text-sm font-medium text-slate-500">{savedAt ? `Draft · ${boardWhen(savedAt)}` : 'Draft · saves as you update'}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Board name">
              <Input
                value={title}
                onChange={(e) => {
                  setNameEdited(true);
                  touch();
                  setTitle(e.target.value);
                }}
              />
            </Field>
            <Field label="Where">
              <Input
                value={venue}
                onChange={(e) => {
                  touch();
                  setVenue(e.target.value);
                }}
                placeholder="Gaylord Hotel"
              />
            </Field>
          </div>
          <p className="mt-4 text-sm text-slate-500">Tap an item to add it. Tap something on the picture to remove it. Drag to place it.</p>
          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="relative">
              <SceneBoard
                scene={live.scene}
                poses={poses}
                dragIds={onScene.map((it) => it.id)}
                highlightIds={selected ? [selected.id] : undefined}
                onSelect={setSelectedId}
                onDrop={(id, pose) => {
                  touch();
                  setPoses((p) => ({ ...p, [id]: pose }));
                }}
              />
              {selected && (
                <button
                  type="button"
                  onClick={() => removeItem(selected.id)}
                  className="absolute right-3 top-3 z-30 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-rose-600 shadow-sm ring-1 ring-rose-200"
                >
                  <Trash2 size={12} /> Remove {selected.label}
                </button>
              )}
            </div>
            <aside className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Library</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(['plate', 'table', 'station', 'mine', 'all'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setShelf(g)}
                    className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium capitalize', shelf === g ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600')}
                  >
                    {g === 'plate' ? 'Plate' : g === 'table' ? 'Table' : g === 'station' ? 'Station' : g === 'mine' ? 'Yours' : 'All'}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-auto pr-1">
                {catalog.map((i) => (
                  <button
                    key={`${i.group}-${i.kind}-${i.label}`}
                    type="button"
                    onClick={() => addItem(i.kind, i.label, i.look)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 px-1 py-2 text-center ring-1 ring-slate-200 hover:bg-indigo-50 hover:ring-indigo-200"
                  >
                    <ItemSwatch kind={i.kind} look={i.look} />
                    <span className="text-[10px] font-medium leading-tight text-slate-700">{i.label}</span>
                    <Plus size={10} className="text-indigo-500" />
                  </button>
                ))}
              </div>
              <Link to="/admin/setup/library" className="mt-3 block text-center text-[11px] font-medium text-indigo-700 hover:underline">
                Add your own pieces
              </Link>
              {onScene.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">On the picture</div>
                  <ul className="mt-2 space-y-1">
                    {onScene.map((it) => (
                      <li key={it.id} className="flex items-center gap-2 text-xs text-slate-700">
                        <ItemSwatch kind={it.kind} look={it.look} className="h-4 w-4" />
                        <span className="flex-1 truncate">{it.label}</span>
                        <button type="button" onClick={() => removeItem(it.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${it.label}`}>
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
          <div className="mt-6 flex justify-between">
            {!spec && (
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
            )}
            <Button className="ml-auto" onClick={() => setStep(2)}>
              What Alex says <ChevronRight size={16} />
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold text-slate-900">What Alex says</h2>
          <p className="mt-2 text-sm text-slate-500">Staff don’t read a card. Alex speaks these lines over the picture.</p>
          <div className="mt-5 rounded-2xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">What changed (he leads with this)</div>
            <Input
              className="mt-2 bg-white"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chicken moved from the left side of the plate to the right"
            />
          </div>
          <ol className="mt-5 space-y-3">
            {live.steps.map((s, i) => (
              <li key={s.id} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{i + 1}</span>
                <Input
                  value={lines[i] ?? ''}
                  onChange={(e) => {
                    touch();
                    setLines((c) => c.map((x, j) => (j === i ? e.target.value : x)));
                  }}
                />
              </li>
            ))}
          </ol>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>
              Review <ChevronRight size={16} />
            </Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold text-slate-900">Review your setup card</h2>
          <p className="mt-2 text-sm text-slate-500">This is what crew will watch. The decision to publish is yours.</p>
          {(note.trim() || live.changeNotes.length > 0) && (
            <div className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-sm text-white">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200">What changed</span>
              <div className="mt-1 font-medium">{note.trim() || live.changeNotes[live.changeNotes.length - 1]?.summary}</div>
            </div>
          )}
          <div className="mx-auto mt-5 max-w-md">
            <SceneBoard scene={live.scene} poses={poses} />
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {live.steps.slice(0, 3).map((s, i) => (
              <li key={s.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-bold text-indigo-600">{i + 1}</div>
                <p className="mt-1 text-sm text-slate-700">{s.caption}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-sm font-medium text-slate-500">The decision to publish is all yours.</p>
          <div className="mt-4 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={() => {
                const movable = live.scene.items.filter((it) => !['plate', 'table', 'cloth', 'drip'].includes(it.kind));
                onSave(
                  {
                    ...live,
                    checks: [
                      {
                        id: live.checks[0]?.id ?? uid('ck'),
                        kind: 'place',
                        prompt: live.checks[0]?.prompt ?? 'Build it. Drag each item onto the picture.',
                        itemIds: movable.map((it) => it.id),
                        start: Object.fromEntries(movable.map((it, i) => [it.id, { x: 14 + (i % 5) * 16, y: 88 }])),
                      },
                    ],
                  },
                  note.trim() || (spec ? 'Updated layout' : 'Created'),
                );
              }}
            >
              <Check size={16} /> Publish v{revising && spec ? spec.version + 1 : 1}
            </Button>
          </div>
        </>
      )}
    </WizardFrame>
  );
}

function WizardFrame({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div>
      <ol className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium">
        {WIZARD.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full',
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500',
              )}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </span>
            <span className={i === step ? 'text-slate-900' : 'text-slate-400'}>{label}</span>
            {i < WIZARD.length - 1 && <span className="hidden w-6 border-t border-slate-200 sm:block" />}
          </li>
        ))}
      </ol>
      {children}
    </div>
  );
}

function posesFrom(spec?: TrainingSpec | null): Record<string, Pose> {
  const p: Record<string, Pose> = {};
  spec?.scene.items.forEach((it) => {
    p[it.id] = { x: it.x, y: it.y, rotation: it.rotation };
  });
  return p;
}

function labelOf(kind: SceneKind) {
  return SCENES.find((s) => s.id === kind)?.label ?? 'Setup';
}

const LAYOUT: Record<string, Record<string, { x: number; y: number }>> = {
  plate: {
    plate: { x: 50, y: 52 },
    chicken: { x: 66, y: 50 },
    starch: { x: 36, y: 42 },
    veg: { x: 60, y: 62 },
    sauce: { x: 50, y: 38 },
    garnish: { x: 48, y: 64 },
  },
  'round-table': {
    table: { x: 50, y: 46 },
    cloth: { x: 50, y: 46 },
    centerpiece: { x: 50, y: 46 },
  },
  station: {
    drip: { x: 28, y: 48 },
    urn: { x: 28, y: 36 },
    cups: { x: 46, y: 40 },
    lids: { x: 58, y: 38 },
    milk: { x: 70, y: 40 },
    sugar: { x: 80, y: 42 },
    stirrers: { x: 88, y: 36 },
    napkin: { x: 46, y: 58 },
    pastry: { x: 70, y: 60 },
  },
};

export function blankFromTemplate(kind: SceneKind, department: string, title: string): TrainingSpec {
  const starters = TEMPLATE_STARTERS[kind] ?? [];
  const items = starters.map((s, i) => {
    const preset = LAYOUT[kind]?.[s.kind];
    return {
      id: uid('it'),
      kind: s.kind,
      label: s.label,
      x: preset?.x ?? 20 + (i % 5) * 16,
      y: preset?.y ?? 36,
      z: i,
    };
  });
  const movable = items.filter((it) => !['plate', 'table', 'cloth', 'drip'].includes(it.kind));
  const steps =
    kind === 'plate'
      ? [
          { id: uid('st'), caption: 'Start with a clean plate, 12 o’clock facing the guest.', anim: 'appear' as const, itemIds: items.filter((it) => it.kind === 'plate').map((it) => it.id) },
          ...movable.map((it) => ({
            id: uid('st'),
            caption: `${it.label} goes here. Watch where it sits, then you’ll place it yourself.`,
            anim: 'appear' as const,
            itemIds: [it.id],
          })),
          { id: uid('st'), caption: 'That’s the standard for every cover tonight.', anim: 'highlight' as const, itemIds: movable.map((it) => it.id) },
        ]
      : [
          { id: uid('st'), caption: 'This is the standard. Watch the picture, then rebuild it.', anim: 'appear' as const, itemIds: items.map((it) => it.id) },
        ];
  return {
    id: uid('mod-'),
    department,
    title,
    version: 1,
    updatedAt: new Date().toISOString().slice(0, 10),
    template: kind,
    scene: { kind, items },
    steps,
    checks: [
      {
        id: uid('ck'),
        kind: 'place',
        prompt: 'Build it. Drag each item onto the picture.',
        itemIds: movable.map((it) => it.id),
        start: Object.fromEntries(movable.map((it, i) => [it.id, { x: 14 + (i % 5) * 16, y: 88 }])),
      },
    ],
    changeNotes: [],
  };
}
