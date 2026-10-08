import { useMemo, useState } from 'react';
import { Button, Field, Input } from '../components/ui';
import { uid } from '../lib/utils';
import { TEMPLATE_STARTERS } from './items';
import { SceneBoard } from './SceneBoard';
import type { Pose, SceneKind, TrainingSpec } from './types';

const TEMPLATES: { id: SceneKind; label: string }[] = [
  { id: 'plate', label: 'Plate setup' },
  { id: 'round-table', label: 'Banquet round table' },
  { id: 'station', label: 'Coffee / buffet station' },
];

export function Editor({ spec, onSave }: { spec: TrainingSpec; onSave: (next: TrainingSpec, changeSummary: string) => void }) {
  const [title, setTitle] = useState(spec.title);
  const [captions, setCaptions] = useState(spec.steps.map((s) => s.caption));
  const [poses, setPoses] = useState<Record<string, Pose>>(() => {
    const p: Record<string, Pose> = {};
    spec.scene.items.forEach((it) => {
      p[it.id] = { x: it.x, y: it.y, rotation: it.rotation };
    });
    return p;
  });
  const [note, setNote] = useState('');

  const live: TrainingSpec = useMemo(() => {
    const items = spec.scene.items.map((it) => ({ ...it, ...(poses[it.id] ?? it) }));
    return {
      ...spec,
      title,
      scene: { ...spec.scene, items },
      steps: spec.steps.map((s, i) => ({ ...s, caption: captions[i] ?? s.caption })),
    };
  }, [spec, title, captions, poses]);

  return (
    <div className="space-y-5">
      <Field label="Module title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <p className="text-xs text-slate-500">
        Template: <strong>{TEMPLATES.find((t) => t.id === spec.template)?.label}</strong>. Drag items to set tonight’s standard, then save a new version.
      </p>
      <SceneBoard
        scene={live.scene}
        poses={poses}
        dragIds={spec.scene.items.filter((it) => it.kind !== 'table' && it.kind !== 'cloth' && it.kind !== 'plate').map((it) => it.id)}
        onDrop={(id, pose) => setPoses((p) => ({ ...p, [id]: pose }))}
      />
      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-800">Walkthrough captions</div>
        {live.steps.map((s, i) => (
          <Input key={s.id} value={captions[i] ?? ''} onChange={(e) => setCaptions((c) => c.map((x, j) => (j === i ? e.target.value : x)))} />
        ))}
      </div>
      <Field label="What changed in this version">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Chicken moved from left to right" />
      </Field>
      <Button
        className="w-full"
        onClick={() => onSave(live, note.trim() || 'Updated layout')}
      >
        Save as version {spec.version + 1}
      </Button>
    </div>
  );
}

export function blankFromTemplate(kind: SceneKind, department: string, title: string): TrainingSpec {
  const starters = TEMPLATE_STARTERS[kind] ?? [];
  const items = starters.map((s, i) => ({
    id: uid('it'),
    kind: s.kind,
    label: s.label,
    x: 20 + (i % 5) * 16,
    y: 30 + Math.floor(i / 5) * 22,
    z: i,
  }));
  return {
    id: uid('mod-'),
    department,
    title,
    version: 1,
    updatedAt: new Date().toISOString().slice(0, 10),
    template: kind,
    scene: { kind, items },
    steps: [{ id: uid('st'), caption: 'This is the standard. Watch, then rebuild it.', anim: 'appear', itemIds: items.map((it) => it.id) }],
    checks: [
      {
        id: uid('ck'),
        kind: 'place',
        prompt: 'Drag each item to the correct spot.',
        itemIds: items.filter((it) => !['plate', 'table', 'cloth', 'drip'].includes(it.kind)).map((it) => it.id),
        start: Object.fromEntries(items.map((it, i) => [it.id, { x: 12 + (i % 6) * 14, y: 88 }])),
      },
    ],
    changeNotes: [],
  };
}
