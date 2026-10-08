import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui';
import { cn } from '../lib/utils';
import { SceneBoard, dist } from './SceneBoard';
import type { Check as CheckSpec, Pose, SceneItem, TrainingSpec } from './types';

type Phase = 'changed' | 'walk' | 'check' | 'done';

const SNAP = 9;

export function Player({
  spec,
  onComplete,
  onExit,
  startAt,
}: {
  spec: TrainingSpec;
  onComplete?: (r: { firstTryAccuracy: number; durationMs: number; mistakes: { checkId: string; itemId?: string }[]; passed: boolean }) => void;
  onExit?: () => void;
  startAt?: Phase;
}) {
  const hasDiff = !!(spec.previousScene && spec.changeNotes.length);
  const [phase, setPhase] = useState<Phase>(startAt ?? (hasDiff ? 'changed' : 'walk'));
  const [stepI, setStepI] = useState(0);
  const [checkI, setCheckI] = useState(0);
  const started = useRef(Date.now());
  const firstWrong = useRef(new Set<string>());
  const mistakes = useRef<{ checkId: string; itemId?: string }[]>([]);

  const finish = (passed: boolean) => {
    const keys = new Set<string>();
    for (const c of spec.checks) {
      if (c.kind === 'place') c.itemIds.forEach((id) => keys.add(`${c.id}:${id}`));
      else keys.add(c.id);
    }
    const wrong = firstWrong.current.size;
    const total = Math.max(1, keys.size);
    const firstTryAccuracy = Math.round(((total - wrong) / total) * 100);
    onComplete?.({
      firstTryAccuracy,
      durationMs: Date.now() - started.current,
      mistakes: mistakes.current,
      passed,
    });
    setPhase('done');
    setResult({ firstTryAccuracy, durationMs: Date.now() - started.current, passed });
  };

  const [result, setResult] = useState<{ firstTryAccuracy: number; durationMs: number; passed: boolean } | null>(null);

  if (phase === 'changed' && spec.previousScene) {
    return (
      <WhatChanged
        spec={spec}
        onDone={() => {
          setStepI(0);
          setPhase('walk');
        }}
      />
    );
  }

  if (phase === 'walk') {
    return (
      <Walkthrough
        spec={spec}
        index={stepI}
        setIndex={setStepI}
        onDone={() => {
          setCheckI(0);
          setPhase('check');
        }}
      />
    );
  }

  if (phase === 'check') {
    const check = spec.checks[checkI];
    if (!check) return null;
    return (
      <CheckPlay
        key={check.id}
        spec={spec}
        check={check}
        onFirstMiss={(itemId) => {
          const k = check.kind === 'place' && itemId ? `${check.id}:${itemId}` : check.id;
          if (!firstWrong.current.has(k)) {
            firstWrong.current.add(k);
            mistakes.current.push({ checkId: check.id, itemId });
          }
        }}
        onPass={() => {
          if (checkI + 1 >= spec.checks.length) finish(true);
          else setCheckI((n) => n + 1);
        }}
      />
    );
  }

  const acc = result?.firstTryAccuracy ?? 100;
  const secs = Math.max(1, Math.round((result?.durationMs ?? 0) / 1000));

  return (
    <div className="anim-pop px-1 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check size={28} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900">First-try accuracy {acc}%</h2>
      <p className="mt-1 text-sm text-slate-500">Finished in {secs}s. Wrong drops snap back — you can’t skip the standard.</p>
      <Button className="mt-6 w-full" onClick={() => onExit?.()}>
        Done
      </Button>
    </div>
  );
}

function Walkthrough({
  spec,
  index,
  setIndex,
  onDone,
}: {
  spec: TrainingSpec;
  index: number;
  setIndex: (n: number | ((n: number) => number)) => void;
  onDone: () => void;
}) {
  const step = spec.steps[index];
  const visible = useMemo(() => {
    const ids = new Set<string>();
    spec.steps.slice(0, index + 1).forEach((s) => {
      if (s.anim === 'appear') s.itemIds.forEach((id) => ids.add(id));
    });
    if (step?.anim !== 'appear') spec.scene.items.forEach((it) => ids.add(it.id));
    if (ids.size === 0) spec.scene.items.forEach((it) => ids.add(it.id));
    return [...ids];
  }, [spec, index, step]);

  const poses: Record<string, Pose> = {};
  spec.scene.items.forEach((it) => {
    poses[it.id] = it;
  });
  if (step?.anim === 'move' && step.to) {
    Object.assign(poses, step.to);
  }

  return (
    <div>
      <SceneBoard scene={spec.scene} visibleIds={visible} highlightIds={step?.itemIds} dimOthers={step?.anim === 'highlight'} poses={poses} />
      <p className="mt-4 min-h-16 text-sm font-medium leading-relaxed text-slate-800">{step?.caption}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          disabled={index === 0}
          onClick={() => setIndex((n) => Math.max(0, n - 1))}
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs text-slate-500">
          {index + 1} / {spec.steps.length}
        </span>
        {index + 1 >= spec.steps.length ? (
          <Button onClick={onDone}>Start check</Button>
        ) : (
          <Button onClick={() => setIndex((n) => n + 1)}>
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
      <button type="button" className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800" onClick={() => setIndex(0)}>
        <RotateCcw size={12} /> Replay
      </button>
    </div>
  );
}

function WhatChanged({ spec, onDone }: { spec: TrainingSpec; onDone: () => void }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), 400);
    return () => window.clearTimeout(t);
  }, [spec.id, spec.version]);

  const note = spec.changeNotes[spec.changeNotes.length - 1];
  const base = spec.previousScene!;
  const poses: Record<string, Pose> = {};
  (on ? spec.scene : base).items.forEach((it) => {
    poses[it.id] = it;
  });

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">What changed · v{spec.version}</p>
      <SceneBoard scene={spec.scene} poses={poses} highlightIds={note?.itemIds} dimOthers />
      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-800">{note?.summary}</p>
      <Button className="mt-5 w-full" onClick={onDone}>
        Show me the full standard
      </Button>
    </div>
  );
}

function CheckPlay({
  spec,
  check,
  onPass,
  onFirstMiss,
}: {
  spec: TrainingSpec;
  check: CheckSpec;
  onPass: () => void;
  onFirstMiss: (itemId?: string) => void;
}) {
  if (check.kind === 'spot') {
    return <SpotCheck spec={spec} check={check} onPass={onPass} onFirstMiss={onFirstMiss} />;
  }
  return <PlaceCheck spec={spec} check={check} onPass={onPass} onFirstMiss={onFirstMiss} />;
}

function SpotCheck({
  spec,
  check,
  onPass,
  onFirstMiss,
}: {
  spec: TrainingSpec;
  check: CheckSpec;
  onPass: () => void;
  onFirstMiss: (itemId?: string) => void;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [ok, setOk] = useState(false);
  const targets = spec.scene.items.filter((it) => check.itemIds.includes(it.id));

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">{check.prompt}</p>
      <div className="relative">
        <SceneBoard scene={{ ...spec.scene, items: targets.length ? targets : spec.scene.items }} highlightIds={ok ? [check.correctId!] : undefined} wrongIds={wrong} />
        {targets.map((it) => (
          <button
            key={it.id}
            type="button"
            aria-label={it.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${it.x}%`, top: `${it.y}%`, width: '14%', height: '14%' }}
            onClick={() => {
              if (ok) return;
              if (it.id === check.correctId) setOk(true);
              else {
                onFirstMiss(it.id);
                setWrong([it.id]);
                window.setTimeout(() => setWrong([]), 400);
              }
            }}
          />
        ))}
      </div>
      {ok ? (
        <Button className="mt-4 w-full" onClick={onPass}>
          Correct — continue
        </Button>
      ) : (
        <p className="mt-3 text-center text-xs text-slate-500">Tap the right item. Wrong taps flash and you retry.</p>
      )}
    </div>
  );
}

function PlaceCheck({
  spec,
  check,
  onPass,
  onFirstMiss,
}: {
  spec: TrainingSpec;
  check: CheckSpec;
  onPass: () => void;
  onFirstMiss: (itemId?: string) => void;
}) {
  const targets = useMemo(() => {
    const map: Record<string, SceneItem> = {};
    spec.scene.items.forEach((it) => {
      map[it.id] = it;
    });
    return map;
  }, [spec]);

  const [poses, setPoses] = useState<Record<string, Pose>>(() => {
    const p: Record<string, Pose> = {};
    spec.scene.items.forEach((it) => {
      p[it.id] = check.itemIds.includes(it.id) && check.start?.[it.id] ? check.start[it.id] : it;
    });
    return p;
  });
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);

  const placed = check.itemIds.every((id) => locked.has(id));

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">{check.prompt}</p>
      <SceneBoard
        scene={spec.scene}
        poses={poses}
        dragIds={check.itemIds.filter((id) => !locked.has(id))}
        slotIds={check.itemIds.filter((id) => !locked.has(id))}
        highlightIds={[...locked]}
        wrongIds={wrong}
        onDrop={(id, pose) => {
          if (locked.has(id)) return;
          const t = targets[id];
          if (!t) return;
          if (dist(pose, t) <= SNAP) {
            setPoses((prev) => ({ ...prev, [id]: { x: t.x, y: t.y, rotation: t.rotation } }));
            setLocked((prev) => new Set(prev).add(id));
          } else {
            onFirstMiss(id);
            setWrong([id]);
            setPoses((prev) => ({ ...prev, [id]: check.start?.[id] ?? prev[id] }));
            window.setTimeout(() => setWrong([]), 400);
          }
        }}
      />
      <p className="mt-2 text-center text-xs text-slate-500">
        {placed ? 'That’s the standard.' : `${locked.size} of ${check.itemIds.length} in place. Misses snap back.`}
      </p>
      <Button className="mt-4 w-full" disabled={!placed} onClick={onPass}>
        {placed ? 'Continue' : 'Place every item to continue'}
      </Button>
    </div>
  );
}
