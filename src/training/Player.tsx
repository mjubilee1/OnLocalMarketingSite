import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui';
import { cn } from '../lib/utils';
import { CoachBar, CoachProvider, SceneRow } from './Coach';
import { ItemSwatch } from './ItemSwatch';
import { SceneBoard, dist } from './SceneBoard';
import { unlockAudio } from './voice';
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
  const acc = result?.firstTryAccuracy ?? 100;
  const secs = Math.max(1, Math.round((result?.durationMs ?? 0) / 1000));

  return (
    <CoachProvider spec={spec}>
      {phase === 'changed' && spec.previousScene && (
        <WhatChanged
          spec={spec}
          onDone={() => {
            unlockAudio();
            setStepI(0);
            setPhase('walk');
          }}
        />
      )}
      {phase === 'walk' && (
        <Walkthrough
          spec={spec}
          index={stepI}
          setIndex={setStepI}
          onDone={() => {
            unlockAudio();
            setCheckI(0);
            setPhase('check');
          }}
        />
      )}
      {phase === 'check' && spec.checks[checkI] && (
        <CheckPlay
          key={spec.checks[checkI]!.id}
          spec={spec}
          check={spec.checks[checkI]!}
          onFirstMiss={(itemId) => {
            const check = spec.checks[checkI]!;
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
      )}
      {phase === 'done' && (
        <div className="anim-pop px-1 py-4 text-center">
          <SceneRow lookingAt={{ phase: 'done', caption: `First-try accuracy ${acc} percent. That’s the standard.`, highlights: [] }}>
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={28} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">First-try accuracy {acc}%</h2>
              <p className="mt-1 px-4 text-sm text-slate-500">
                Finished in {secs}s.{' '}
                {spec.template === 'service'
                  ? 'A wrong move flashes and you retry. You can’t skip the standard.'
                  : 'Wrong drops snap back — you can’t skip the standard.'}
              </p>
            </div>
          </SceneRow>
          <Button className="mt-6 w-full" onClick={() => onExit?.()}>
            Done
          </Button>
        </div>
      )}
      <CoachBar />
    </CoachProvider>
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

  const hi = step?.itemIds ?? [];
  const looking = {
    phase: 'walk' as const,
    caption: step?.caption ?? '',
    highlights: hi.map((id) => spec.scene.items.find((it) => it.id === id)?.label ?? id),
  };

  if (spec.source?.video && step?.at != null) {
    return (
      <div>
        <SceneRow lookingAt={looking}>
          <BeatFilm key={`${step.id}-${index}`} src={spec.source.video} start={step.at} end={step.until ?? step.at + 8} label={looking.highlights[0] ?? spec.title} />
        </SceneRow>
        <WalkNav index={index} total={spec.steps.length} setIndex={setIndex} onDone={onDone} />
      </div>
    );
  }

  return (
    <div>
      <SceneRow lookingAt={looking}>
        <SceneBoard scene={spec.scene} visibleIds={visible} highlightIds={step?.itemIds} dimOthers={step?.anim === 'highlight'} poses={poses} />
      </SceneRow>
      <WalkNav index={index} total={spec.steps.length} setIndex={setIndex} onDone={onDone} />
    </div>
  );
}

function WalkNav({
  index,
  total,
  setIndex,
  onDone,
}: {
  index: number;
  total: number;
  setIndex: (n: number | ((n: number) => number)) => void;
  onDone: () => void;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          disabled={index === 0}
          onClick={() => {
            unlockAudio();
            setIndex((n) => Math.max(0, n - 1));
          }}
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs text-slate-500">
          {index + 1} / {total}
        </span>
        {index + 1 >= total ? (
          <Button onClick={onDone}>Start check</Button>
        ) : (
          <Button
            onClick={() => {
              unlockAudio();
              setIndex((n) => n + 1);
            }}
          >
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800"
        onClick={() => {
          unlockAudio();
          setIndex(0);
        }}
      >
        <RotateCcw size={12} /> Replay
      </button>
    </>
  );
}

/** A few seconds of the workstation film. Muted so Alex owns the spoken line, and cut off before the check. */
function BeatFilm({ src, start, end, label }: { src: string; start: number; end: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let cancel = false;
    const arm = () => {
      if (cancel) return;
      const go = () => {
        if (!cancel) v.play().catch(() => {});
      };
      v.addEventListener('seeked', go, { once: true });
      try {
        v.currentTime = start;
      } catch {
        /* Metadata can arrive before the browser will seek. The next loadeddata retries. */
      }
    };
    const onTime = () => {
      if (v.currentTime < end) return;
      v.pause();
      if (v.currentTime > end + 0.08) v.currentTime = end;
    };
    const onError = () => {
      // 1 = the browser aborted a load (strict mode, or a seek). The file is still there.
      if (!v.error || v.error.code === 1) return;
      setFailed(true);
    };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('error', onError);
    if (v.readyState >= 1) arm();
    else v.addEventListener('loadedmetadata', arm, { once: true });
    return () => {
      cancel = true;
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('error', onError);
      v.pause();
    };
  }, [src, start, end]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200">
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-medium text-white">
          {label}
        </div>
      )}
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
      <SceneRow lookingAt={{ phase: 'changed', caption: note?.summary ?? '', highlights: note?.itemIds.map((id) => spec.scene.items.find((it) => it.id === id)?.label ?? id) ?? [] }}>
        <SceneBoard scene={spec.scene} poses={poses} highlightIds={note?.itemIds} dimOthers />
      </SceneRow>
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
  if (check.kind === 'move') {
    return <MoveCheck check={check} onPass={onPass} onFirstMiss={onFirstMiss} />;
  }
  return <PlaceCheck spec={spec} check={check} onPass={onPass} onFirstMiss={onFirstMiss} />;
}

function MoveCheck({
  check,
  onPass,
  onFirstMiss,
}: {
  check: CheckSpec;
  onPass: () => void;
  onFirstMiss: (itemId?: string) => void;
}) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const choices = check.choices ?? [];

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">{check.prompt}</p>
      <SceneRow lookingAt={{ phase: 'check', caption: check.prompt, highlights: [] }}>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your move</p>
          <ul className="mt-3 space-y-2">
            {choices.map((choice) => {
              const missed = wrongId === choice.id;
              const picked = ok && choice.correct;
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    disabled={ok}
                    className={cn(
                      'w-full rounded-xl px-3 py-3 text-left text-sm font-medium ring-1',
                      picked && 'bg-emerald-50 text-emerald-900 ring-emerald-200',
                      missed && 'anim-shake bg-rose-50 text-rose-900 ring-rose-200',
                      !picked && !missed && 'bg-white text-slate-800 ring-slate-200 hover:ring-indigo-300',
                    )}
                    onClick={() => {
                      if (ok) return;
                      if (choice.correct) {
                        setWrongId(null);
                        setOk(true);
                        return;
                      }
                      onFirstMiss(choice.id);
                      setWrongId(choice.id);
                    }}
                  >
                    {choice.label}
                    {missed && choice.miss && <span className="mt-1 block text-xs font-normal">{choice.miss}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </SceneRow>
      {ok ? (
        <Button className="mt-4 w-full" onClick={onPass}>
          That’s the move
        </Button>
      ) : (
        <p className="mt-3 text-center text-xs text-slate-500">Pick the move. A wrong one flashes and you retry.</p>
      )}
    </div>
  );
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
      <SceneRow lookingAt={{ phase: 'check', caption: check.prompt, highlights: check.itemIds.map((id) => spec.scene.items.find((it) => it.id === id)?.label ?? id) }}>
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
      </SceneRow>
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
      p[it.id] = it;
    });
    return p;
  });
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number; hot: boolean } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef(ghost);
  ghostRef.current = ghost;

  const loose = check.itemIds.filter((id) => !locked.has(id));
  const visible = spec.scene.items.filter((it) => !loose.includes(it.id)).map((it) => it.id);
  const placed = loose.length === 0;

  const dropAt = (id: string, pose: Pose) => {
    if (locked.has(id)) return;
    const t = targets[id];
    if (!t) return;
    if (dist(pose, t) <= SNAP) {
      setPoses((prev) => ({ ...prev, [id]: { x: t.x, y: t.y, rotation: t.rotation, scale: t.scale } }));
      setLocked((prev) => new Set(prev).add(id));
    } else {
      onFirstMiss(id);
      setWrong([id]);
      window.setTimeout(() => setWrong([]), 450);
    }
  };

  const pointerOnBoard = (clientX: number, clientY: number): Pose | null => {
    const board = boardRef.current;
    if (!board) return null;
    const r = board.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    if (x < -4 || x > 104 || y < -4 || y > 104) return null;
    return { x, y };
  };

  const track = (id: string, clientX: number, clientY: number) => {
    const pose = pointerOnBoard(clientX, clientY);
    const t = targets[id];
    const next = { id, x: clientX, y: clientY, hot: !!(pose && t && dist(pose, t) <= SNAP) };
    ghostRef.current = next;
    setGhost(next);
  };

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">{check.prompt}</p>
      <SceneRow bare lookingAt={{ phase: 'check', caption: check.prompt, highlights: check.itemIds.map((id) => spec.scene.items.find((it) => it.id === id)?.label ?? id) }}>
        <SceneBoard
          boardRef={boardRef}
          className="mx-auto w-full max-w-md"
          scene={spec.scene}
          poses={poses}
          visibleIds={visible}
          slotIds={loose}
          hotId={ghost?.hot ? ghost.id : undefined}
          highlightIds={[...locked]}
          wrongIds={wrong}
        />
      </SceneRow>
      {loose.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500">Drag a piece onto its dashed spot.</p>
          <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {loose.map((id) => {
              const it = targets[id];
              if (!it) return null;
              const missed = wrong.includes(id);
              const held = ghost?.id === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-label={`Drag ${it.label}`}
                    className={cn(
                      'flex w-full touch-none flex-col items-center rounded-2xl bg-white px-1 py-2 ring-1 select-none',
                      missed ? 'anim-shake ring-rose-300' : 'ring-slate-200',
                      held ? 'cursor-grabbing opacity-40' : 'cursor-grab active:cursor-grabbing',
                    )}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      try {
                        e.currentTarget.setPointerCapture(e.pointerId);
                      } catch {
                        /* Pointer capture needs a real pointer. The drag still tracks from this event. */
                      }
                      track(id, e.clientX, e.clientY);
                    }}
                    onPointerMove={(e) => {
                      if (ghostRef.current?.id !== id) return;
                      track(id, e.clientX, e.clientY);
                    }}
                    onPointerUp={(e) => {
                      if (ghostRef.current?.id !== id) return;
                      const pose = pointerOnBoard(e.clientX, e.clientY);
                      ghostRef.current = null;
                      setGhost(null);
                      if (pose) dropAt(id, pose);
                    }}
                    onPointerCancel={() => {
                      if (ghostRef.current?.id !== id) return;
                      ghostRef.current = null;
                      setGhost(null);
                    }}
                  >
                    <ItemSwatch kind={it.kind} look={it.look} className="h-10 w-10" />
                    <span className="mt-1 w-full truncate text-center text-[11px] font-semibold text-slate-700">{it.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {ghost && targets[ghost.id] && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: ghost.x, top: ghost.y }}>
          <ItemSwatch kind={targets[ghost.id]!.kind} look={targets[ghost.id]!.look} className="h-14 w-14 drop-shadow-lg" />
        </div>
      )}
      <p className="mt-3 text-center text-xs text-slate-500">
        {placed ? 'That’s the standard.' : `${locked.size} of ${check.itemIds.length} in place. A miss stays in the tray.`}
      </p>
      <Button className="mt-4 w-full" disabled={!placed} onClick={onPass}>
        {placed ? 'Continue' : 'Place every item to continue'}
      </Button>
    </div>
  );
}

