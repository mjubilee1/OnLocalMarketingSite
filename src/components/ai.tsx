import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, CircleX, FileText, Loader2, Plus, RotateCcw, Sparkles, Trash2, TriangleAlert, Video } from 'lucide-react';
import { Button, Field, Input, Modal, Pill, RichText, Select, Textarea } from './ui';
import { VideoEmbed, VideoLinkInput } from './video';
import { parseVideo } from '../lib/video';
import { aiStatus, generateCourse, generateLesson, type AIEvent, type AIStatus } from '../lib/ai';
import { cn, LANGUAGES, uid } from '../lib/utils';
import { useCatalog, useStore } from '../store';
import type { Course, Lesson } from '../types';

// ---------- Shared ----------

let statusCache: Promise<AIStatus> | null = null;
export function useAIStatus() {
  const [s, setS] = useState<AIStatus | null>(null);
  useEffect(() => {
    statusCache ??= aiStatus();
    statusCache.then(setS);
  }, []);
  return s;
}

interface LogRow {
  label: string;
  state: 'trying' | 'failed' | 'done';
  reason?: string;
  seconds?: number;
}

/** Runs one streamed AI job and tracks per-model progress for display. */
export function useAIJob<T>() {
  const [log, setLog] = useState<LogRow[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!running) return;
    const t0 = Date.now();
    const iv = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [running]);
  useEffect(() => () => ctrl.current?.abort(), []);

  const onEvent = (e: AIEvent) => {
    if (e.type === 'attempt') setLog((l) => [...l, { label: e.label, state: 'trying' }]);
    if (e.type === 'failed') setLog((l) => l.map((r, i) => (i === l.length - 1 ? { ...r, state: 'failed', reason: e.reason } : r)));
    if (e.type === 'done') setLog((l) => l.map((r, i) => (i === l.length - 1 ? { ...r, state: 'done', seconds: e.seconds } : r)));
  };

  const run = async (fn: (onEvent: (e: AIEvent) => void, signal: AbortSignal) => Promise<{ data: T; label: string }>) => {
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setLog([]);
    setError('');
    setElapsed(0);
    setRunning(true);
    try {
      return await fn(onEvent, ctrl.current.signal);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
      return null;
    } finally {
      setRunning(false);
    }
  };
  const cancel = () => {
    ctrl.current?.abort();
    setRunning(false);
  };
  return { log, running, error, elapsed, run, cancel };
}

export function Progress({ log, running, elapsed, what }: { log: LogRow[]; running: boolean; elapsed: number; what: string }) {
  return (
    <div className="space-y-3">
      {running && (
        <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
          <Loader2 className="animate-spin" size={20} />
          <div className="flex-1">
            <div className="font-medium">Writing your {what}…</div>
            <div className="text-xs text-indigo-700">Free models usually take 15–60 seconds. We'll switch models automatically if one is busy.</div>
          </div>
          <span className="font-mono text-xs">{elapsed}s</span>
        </div>
      )}
      <ul className="space-y-1.5 text-sm">
        {log.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            {r.state === 'trying' && <Loader2 size={14} className="animate-spin text-indigo-500" />}
            {r.state === 'failed' && <CircleX size={14} className="text-slate-400" />}
            {r.state === 'done' && <CircleCheck size={14} className="text-emerald-500" />}
            <span className={cn(r.state === 'failed' && 'text-slate-400 line-through decoration-slate-300')}>{r.label}</span>
            {r.reason && <span className="text-xs text-slate-400">— {r.reason}</span>}
            {r.seconds !== undefined && <span className="text-xs text-emerald-600">— done in {r.seconds}s</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
      <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {message}
    </div>
  );
}

const ReviewNote = () => (
  <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
    AI can get things wrong. Check facts — especially laws, limits, procedures and phone numbers — against your own policies before publishing.
  </p>
);

export function NotConfigured() {
  return (
    <div className="space-y-2 text-sm text-slate-600">
      <ErrorBox message="AI isn't set up on this server yet." />
      <p>
        Add <code className="rounded bg-slate-100 px-1">OPENROUTER_API_KEY=…</code> to <code className="rounded bg-slate-100 px-1">.env.local</code> in the project root and restart the dev server.
      </p>
    </div>
  );
}

const Chip = ({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn('rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition cursor-pointer', on ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50')}
  >
    {children}
  </button>
);

// ---------- Create a whole course ----------

const EXAMPLES = [
  'Heat stress & hydration for outdoor festival crew',
  'Handling lost children at a music festival',
  'Using contactless card terminals at pop-up bars',
  'Evacuation procedure for our convention centre venue',
  'De-escalating difficult guests at the entry gate',
];

const SIZES = [
  { id: 'quick', label: 'Quick', sub: '3 cards · 3 questions', cards: 3, questions: 3 },
  { id: 'standard', label: 'Standard', sub: '5 cards · 4 questions', cards: 5, questions: 4 },
  { id: 'deep', label: 'Deep dive', sub: '8 cards · 6 questions', cards: 8, questions: 6 },
] as const;

interface VideoDraft {
  url: string;
  title: string;
  durationSec?: number;
}

/** Spread manager-supplied videos evenly between the AI's cards (never first, always before the quiz). */
function withVideos(course: Course, videos: VideoDraft[]): Course {
  const valid = videos.filter((v) => parseVideo(v.url));
  if (!valid.length) return course;
  const cards = course.lessons.filter((l) => l.kind !== 'quiz');
  const quizzes = course.lessons.filter((l) => l.kind === 'quiz');
  const out = [...cards];
  valid.forEach((v, i) => {
    const pos = Math.min(out.length, Math.max(1, Math.round(((i + 1) * cards.length) / (valid.length + 1))) + i);
    out.splice(pos, 0, { id: uid('l'), kind: 'video', title: v.title.trim() ? `Watch: ${v.title.trim()}`.slice(0, 100) : 'Watch this video', videoUrl: v.url.trim(), body: '' });
  });
  const extraMin = valid.reduce((a, v) => a + (v.durationSec ? Math.ceil(v.durationSec / 60) : 2), 0);
  const estMinutes = course.estMinutes + extraMin;
  return { ...course, lessons: [...out, ...quizzes], estMinutes, points: estMinutes * 10 };
}

export function CreateCourseModal({
  open,
  onClose,
  initialRequest,
  initialRoleIds,
  stayOnSave,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Pre-fill from elsewhere, e.g. a gap the role designer found. */
  initialRequest?: string;
  initialRoleIds?: string[];
  /** Keep the manager on the current page after saving instead of opening the builder. */
  stayOnSave?: boolean;
  onSaved?: (c: Course) => void;
}) {
  const cat = useCatalog();
  const orgName = useStore((s) => s.orgName);
  const upsertCourse = useStore((s) => s.upsertCourse);
  const upsertRole = useStore((s) => s.upsertRole);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const status = useAIStatus();
  const job = useAIJob<Course>();

  const [request, setRequest] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [size, setSize] = useState<(typeof SIZES)[number]['id']>('standard');
  const [language, setLanguage] = useState('English');
  const [attachRoles, setAttachRoles] = useState(true);
  const [videos, setVideos] = useState<VideoDraft[]>([]);
  const setVideo = (i: number, patch: Partial<VideoDraft>) => setVideos((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const [result, setResult] = useState<{ course: Course; label: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialRequest !== undefined) {
      setRequest(initialRequest);
      setResult(null);
    }
    if (initialRoleIds) setRoleIds(initialRoleIds);
  }, [open, initialRequest, initialRoleIds]);

  const close = () => {
    job.cancel();
    onClose();
  };

  const start = async () => {
    const sz = SIZES.find((s) => s.id === size)!;
    setResult(null);
    const r = await job.run((onEvent, signal) =>
      generateCourse(
        {
          request,
          roles: cat.roles.filter((r) => roleIds.includes(r.id)).map((r) => r.name),
          source,
          cards: sz.cards,
          questions: sz.questions,
          language,
          orgName,
          categories: Array.from(new Set(cat.courses.map((c) => c.category))),
        },
        onEvent,
        signal,
      ),
    );
    if (r) setResult({ course: withVideos(r.data, videos), label: r.label });
  };

  const save = () => {
    if (!result) return;
    const c = result.course;
    upsertCourse(c);
    // Read roles fresh from the store: a role may have been created moments ago.
    if (attachRoles) for (const r of useStore.getState().roles.filter((x) => roleIds.includes(x.id))) upsertRole({ ...r, courseIds: [...r.courseIds, c.id] });
    toast(stayOnSave ? `Draft “${c.title}” saved to Training — publish it when reviewed` : 'Draft saved — review it, then publish', '✨');
    onClose();
    setResult(null);
    setRequest('');
    setSource('');
    setVideos([]);
    onSaved?.(c);
    if (!stayOnSave) nav(`/admin/training/${c.id}`);
  };

  const phase = result ? 'review' : job.running ? 'running' : 'form';

  return (
    <Modal open={open} onClose={close} title="✨ Create a course with AI" wide>
      {status && !status.configured ? (
        <NotConfigured />
      ) : phase === 'form' ? (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (request.trim().length >= 3) start();
          }}
        >
          {job.error && <ErrorBox message={job.error} />}
          <Field label="What should your crew learn?">
            <Textarea
              autoFocus
              rows={3}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="e.g. How to spot and respond to heat exhaustion at an outdoor summer festival, including where the water points and first aid tents are."
            />
          </Field>
          <div className="-mt-3 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button type="button" key={ex} onClick={() => setRequest(ex)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 cursor-pointer">
                {ex}
              </button>
            ))}
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Who is it for?</span>
            <div className="flex flex-wrap gap-1.5">
              {cat.roles.map((r) => (
                <Chip key={r.id} on={roleIds.includes(r.id)} onClick={() => setRoleIds(roleIds.includes(r.id) ? roleIds.filter((x) => x !== r.id) : [...roleIds, r.id])}>
                  {r.name}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Length</span>
              <div className="grid grid-cols-3 gap-1.5">
                {SIZES.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={cn('rounded-lg p-2 text-left ring-1 cursor-pointer', size === s.id ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'ring-slate-200 hover:bg-slate-50')}
                  >
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[11px] text-slate-500">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>
            <Field label="Write it in">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Video size={15} /> Videos <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <div className="space-y-3">
              {videos.map((v, i) => (
                <div key={i} className="rounded-lg bg-slate-50 p-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <VideoLinkInput
                        autoFocus={!v.url}
                        value={v.url}
                        onChange={(url) => setVideo(i, { url })}
                        onMeta={(m) => setVideo(i, { durationSec: m.durationSec, ...(m.title ? { title: m.title } : {}) })}
                      />
                    </div>
                    <button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))} className="h-9 rounded p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer" title="Remove video">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Input className="mt-2" value={v.title} onChange={(e) => setVideo(i, { title: e.target.value })} placeholder="Video title (filled in automatically)" />
                </div>
              ))}
              {videos.length < 5 && (
                <button type="button" onClick={() => setVideos([...videos, { url: '', title: '' }])} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline cursor-pointer">
                  <Plus size={14} /> Add a video link
                </button>
              )}
              {videos.length > 0 && <p className="text-xs text-slate-400">Videos are placed between the AI's cards, before the quiz. The AI doesn't watch them, so check they match.</p>}
            </div>
          </div>

          {showSource ? (
            <Field label="Your source material (optional)" hint="Paste an SOP, venue notes or policy. The AI will base the course on it and won't contradict it.">
              <Textarea rows={6} value={source} onChange={(e) => setSource(e.target.value.slice(0, 20000))} placeholder="Paste text here…" className="text-xs" />
            </Field>
          ) : (
            <button type="button" onClick={() => setShowSource(true)} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline cursor-pointer">
              <FileText size={14} /> Add your own SOP or policy text for the AI to follow
            </button>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400">{status?.models.length ? `Uses free models: ${status.models.slice(0, 3).join(', ')}…` : ''}</span>
            <Button type="submit" disabled={request.trim().length < 3 || videos.some((v) => v.url.trim() && !parseVideo(v.url))}>
              <Sparkles size={16} /> Generate course
            </Button>
          </div>
        </form>
      ) : phase === 'running' ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">“{request}”</div>
          <Progress log={job.log} running={job.running} elapsed={job.elapsed} what="course" />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={job.cancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        result && <CourseReview result={result} roleNames={cat.roles.filter((r) => roleIds.includes(r.id)).map((r) => r.name)} attach={attachRoles} setAttach={setAttachRoles} onRegenerate={start} onSave={save} />
      )}
    </Modal>
  );
}

function CourseReview({
  result,
  roleNames,
  attach,
  setAttach,
  onRegenerate,
  onSave,
}: {
  result: { course: Course; label: string };
  roleNames: string[];
  attach: boolean;
  setAttach: (v: boolean) => void;
  onRegenerate: () => void;
  onSave: () => void;
}) {
  const c = result.course;
  const cards = c.lessons.filter((l) => l.kind === 'card');
  const quiz = c.lessons.filter((l) => l.kind === 'quiz');
  const [openId, setOpenId] = useState<string | undefined>(cards[0]?.id);
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl">{c.emoji}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{c.title}</h3>
          <p className="text-sm text-slate-600">{c.description}</p>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            <Pill className="bg-slate-100 text-slate-600">{c.category}</Pill>
            <Pill className="bg-slate-100 text-slate-600">{c.estMinutes} min</Pill>
            <Pill className="bg-slate-100 text-slate-600">
              {cards.length} cards · {quiz.reduce((a, q) => a + (q.questions?.length ?? 0), 0)} quiz questions
            </Pill>
            <Pill className="bg-violet-50 text-violet-700">
              <Sparkles size={10} /> {result.label}
            </Pill>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
        {c.lessons.map((l, i) => (
          <div key={l.id}>
            <button onClick={() => setOpenId(openId === l.id ? undefined : l.id)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50 cursor-pointer">
              <span className="w-5 text-xs text-slate-400">{i + 1}</span>
              <span className="flex-1 font-medium">{l.title}</span>
              <span className="text-xs text-slate-400">{l.kind === 'quiz' ? `${l.questions?.length} questions` : l.kind === 'video' ? '▶ your video' : 'card'}</span>
            </button>
            {openId === l.id && (
              <div className="bg-slate-50/60 px-4 pb-4 pl-11 text-sm">
                {l.kind === 'card' && l.body && <RichText text={l.body} />}
                {l.kind === 'video' && <VideoEmbed url={l.videoUrl} title={l.title} className="max-w-md" />}
                {l.kind === 'quiz' &&
                  l.questions?.map((q) => (
                    <div key={q.id} className="mb-3">
                      <div className="font-medium">{q.prompt}</div>
                      <ul className="mt-1 space-y-0.5">
                        {q.options.map((o, oi) => (
                          <li key={oi} className={cn(oi === q.correct ? 'font-medium text-emerald-700' : 'text-slate-600')}>
                            {oi === q.correct ? '✓' : '·'} {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <ReviewNote />
      {roleNames.length > 0 && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
          Add to the onboarding flow for {roleNames.join(', ')}
        </label>
      )}
      <div className="flex justify-between gap-2 border-t border-slate-100 pt-4">
        <Button variant="ghost" onClick={onRegenerate}>
          <RotateCcw size={16} /> Try again
        </Button>
        <Button onClick={onSave}>Save as draft & edit</Button>
      </div>
    </div>
  );
}

// ---------- Add / rewrite a single lesson inside the builder ----------

const REWRITES = ['Use simpler words', 'Make it shorter', 'Add a real on-shift example', 'Make it more upbeat', 'Turn it into a checklist'];

export function AILessonModal({
  open,
  onClose,
  course,
  lesson,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  course: Course;
  /** When set, rewrite this lesson; otherwise add a new one. */
  lesson?: Lesson;
  onResult: (l: Lesson) => void;
}) {
  const orgName = useStore((s) => s.orgName);
  const status = useAIStatus();
  const job = useAIJob<Lesson>();
  const [kind, setKind] = useState<'card' | 'quiz'>('card');
  const [instruction, setInstruction] = useState('');
  const [language, setLanguage] = useState('English');
  const rewrite = !!lesson;

  useEffect(() => {
    if (open) {
      setInstruction('');
      setKind(lesson?.kind === 'quiz' ? 'quiz' : 'card');
    }
  }, [open, lesson]);

  const close = () => {
    job.cancel();
    onClose();
  };

  const start = async () => {
    const r = await job.run((onEvent, signal) =>
      generateLesson(
        {
          mode: rewrite ? 'rewrite' : 'new',
          kind: rewrite ? (lesson!.kind === 'quiz' ? 'quiz' : 'card') : kind,
          instruction: language !== 'English' && rewrite ? `${instruction ? instruction + '. ' : ''}Translate into ${language}.` : instruction,
          language,
          orgName,
          course: { title: course.title, description: course.description, lessons: course.lessons },
          lesson,
        },
        onEvent,
        signal,
      ),
    );
    if (r) {
      // Keep the original id when rewriting so the learner's progress still counts.
      onResult(rewrite ? { ...r.data, id: lesson!.id } : r.data);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={close} title={rewrite ? `✨ Rewrite “${lesson!.title}”` : '✨ Add a card with AI'}>
      {status && !status.configured ? (
        <NotConfigured />
      ) : job.running ? (
        <div className="space-y-4">
          <Progress log={job.log} running={job.running} elapsed={job.elapsed} what={kind === 'quiz' ? 'quiz' : 'card'} />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={job.cancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          {job.error && <ErrorBox message={job.error} />}
          {!rewrite && (
            <div className="grid grid-cols-2 gap-2">
              {(['card', 'quiz'] as const).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={cn('rounded-lg p-3 text-left ring-1 cursor-pointer', kind === k ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'ring-slate-200 hover:bg-slate-50')}
                >
                  <div className="text-sm font-medium">{k === 'card' ? 'Lesson card' : 'Quiz'}</div>
                  <div className="text-xs text-slate-500">{k === 'card' ? 'Teach one new idea' : 'Test what the cards cover'}</div>
                </button>
              ))}
            </div>
          )}
          <Field label={rewrite ? 'How should it change?' : kind === 'quiz' ? 'Anything to focus on? (optional)' : 'What should this card cover?'}>
            <Textarea
              autoFocus
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={rewrite ? 'e.g. Make it friendlier and add what to say to the guest' : kind === 'quiz' ? 'e.g. Focus on what to do in the first 2 minutes' : 'e.g. What to say on the radio when you find a lost child'}
            />
          </Field>
          {rewrite && (
            <div className="-mt-2 flex flex-wrap gap-1.5">
              {REWRITES.map((r) => (
                <button type="button" key={r} onClick={() => setInstruction(r)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 cursor-pointer">
                  {r}
                </button>
              ))}
            </div>
          )}
          <Field label={rewrite ? 'Language' : 'Write it in'}>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <ReviewNote />
          <div className="flex justify-end">
            <Button type="submit" disabled={!rewrite && kind === 'card' && instruction.trim().length < 3}>
              <Sparkles size={16} /> {rewrite ? 'Rewrite' : 'Generate'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
