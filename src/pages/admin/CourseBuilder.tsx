import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, CircleHelp, Eye, FileText, Plus, Sparkles, Trash2, Video } from 'lucide-react';
import { Button, Card, Empty, Field, Input, PageHeader, RichText, Textarea } from '../../components/ui';
import { AILessonModal } from '../../components/ai';
import { VideoEmbed, VideoLinkInput } from '../../components/video';
import { cn, uid } from '../../lib/utils';
import { useStore } from '../../store';
import type { Course, Lesson, LessonKind, Question } from '../../types';

const KIND: Record<LessonKind, { label: string; icon: typeof FileText; cls: string }> = {
  card: { label: 'Card', icon: FileText, cls: 'bg-sky-50 text-sky-700' },
  video: { label: 'Video', icon: Video, cls: 'bg-violet-50 text-violet-700' },
  quiz: { label: 'Quiz', icon: CircleHelp, cls: 'bg-amber-50 text-amber-700' },
};

const newQuestion = (): Question => ({ id: uid('q'), prompt: '', options: ['', '', ''], correct: 0, explanation: '' });

export default function CourseBuilder() {
  const { id } = useParams();
  const original = useStore((s) => s.courses.find((c) => c.id === id));
  const upsert = useStore((s) => s.upsertCourse);
  const del = useStore((s) => s.deleteCourse);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [c, setC] = useState<Course | undefined>(() => original && structuredClone(original));
  const [activeId, setActiveId] = useState<string | undefined>(original?.lessons[0]?.id);
  const [ai, setAi] = useState<'new' | 'rewrite' | null>(null);

  if (!c) return <Empty title="Course not found" />;
  const set = (patch: Partial<Course>) => setC({ ...c, ...patch });
  const setLesson = (lid: string, patch: Partial<Lesson>) => set({ lessons: c.lessons.map((l) => (l.id === lid ? { ...l, ...patch } : l)) });
  const active = c.lessons.find((l) => l.id === activeId);
  const dirty = JSON.stringify(c) !== JSON.stringify(original);

  const addLesson = (kind: LessonKind) => {
    const l: Lesson = {
      id: uid('l'),
      title: kind === 'quiz' ? 'Quick check' : kind === 'video' ? 'Watch: ' : 'New card',
      kind,
      body: kind === 'quiz' ? undefined : '',
      videoUrl: kind === 'video' ? '' : undefined,
      questions: kind === 'quiz' ? [newQuestion()] : undefined,
    };
    // Cards and videos go before the first quiz so the quiz stays at the end.
    const qi = c.lessons.findIndex((x) => x.kind === 'quiz');
    const lessons = [...c.lessons];
    lessons.splice(kind === 'quiz' || qi === -1 ? lessons.length : qi, 0, l);
    set({ lessons });
    setActiveId(l.id);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...c.lessons];
    const [x] = arr.splice(idx, 1);
    arr.splice(idx + dir, 0, x!);
    set({ lessons: arr });
  };

  return (
    <>
      <Link to="/admin/training" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Training
      </Link>
      <PageHeader
        title={`${c.emoji} ${c.title}`}
        sub={`${c.lessons.length} cards • ${c.estMinutes} min • pass mark ${c.passingScore}%`}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm('Delete this course? It will be removed from all roles and events.')) {
                  del(c.id);
                  nav('/admin/training');
                }
              }}
            >
              <Trash2 size={16} />
            </Button>
            <Link to={`/app/learn/${c.id}?preview=1`} target="_blank">
              <Button variant="secondary">
                <Eye size={16} /> Preview
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                upsert({ ...c, published: !c.published });
                set({ published: !c.published });
                toast(c.published ? 'Moved to draft' : 'Published to crew', c.published ? '📝' : '🚀');
              }}
            >
              {c.published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              disabled={!dirty}
              onClick={() => {
                upsert(c);
                toast('Course saved', '✅');
              }}
            >
              Save changes
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <div className="grid grid-cols-[64px_1fr] gap-2">
              <Field label="Icon">
                <Input value={c.emoji} onChange={(e) => set({ emoji: e.target.value })} className="text-center text-lg" />
              </Field>
              <Field label="Title">
                <Input value={c.title} onChange={(e) => set({ title: e.target.value })} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={2} value={c.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Category">
                <Input value={c.category} onChange={(e) => set({ category: e.target.value })} />
              </Field>
              <Field label="Minutes">
                <Input type="number" min={1} value={c.estMinutes} onChange={(e) => set({ estMinutes: +e.target.value })} />
              </Field>
              <Field label="Points">
                <Input type="number" min={0} value={c.points} onChange={(e) => set({ points: +e.target.value })} />
              </Field>
              <Field label="Pass mark %">
                <Input type="number" min={0} max={100} value={c.passingScore} onChange={(e) => set({ passingScore: +e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card className="p-2">
            <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cards</div>
            {c.lessons.map((l, i) => {
              const K = KIND[l.kind];
              return (
                <div
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  className={cn('group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm', activeId === l.id ? 'bg-indigo-50' : 'hover:bg-slate-50')}
                >
                  <span className="w-5 text-center text-xs text-slate-400">{i + 1}</span>
                  <span className={cn('rounded p-1', K.cls)}>
                    <K.icon size={14} />
                  </span>
                  <span className="flex-1 truncate">{l.title}</span>
                  <span className="hidden gap-0.5 group-hover:flex">
                    <button disabled={i === 0} onClick={(e) => (e.stopPropagation(), move(i, -1))} className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                      <ArrowUp size={14} />
                    </button>
                    <button
                      disabled={i === c.lessons.length - 1}
                      onClick={(e) => (e.stopPropagation(), move(i, 1))}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        set({ lessons: c.lessons.filter((x) => x.id !== l.id) });
                      }}
                      className="rounded p-0.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
              );
            })}
            <div className="mt-2 grid grid-cols-4 gap-1 border-t border-slate-100 p-2">
              {(Object.keys(KIND) as LessonKind[]).map((k) => {
                const K = KIND[k];
                return (
                  <button key={k} onClick={() => addLesson(k)} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer">
                    <Plus size={14} />
                    {K.label}
                  </button>
                );
              })}
              <button onClick={() => setAi('new')} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-violet-700 hover:bg-violet-50 cursor-pointer">
                <Sparkles size={14} />
                AI
              </button>
            </div>
          </Card>
        </div>

        {active ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card className="space-y-4 p-5">
              {active.kind !== 'video' && (
                <div className="-mb-1 flex justify-end">
                  <Button size="sm" variant="ghost" className="text-violet-700 hover:bg-violet-50" onClick={() => setAi('rewrite')}>
                    <Sparkles size={14} /> Rewrite with AI
                  </Button>
                </div>
              )}
              <Field label="Card title">
                <Input value={active.title} onChange={(e) => setLesson(active.id, { title: e.target.value })} />
              </Field>
              {active.kind === 'video' && (
                <div>
                  <span className="mb-1 block text-sm font-medium text-slate-700">Video link</span>
                  <VideoLinkInput
                    autoFocus={!active.videoUrl}
                    value={active.videoUrl ?? ''}
                    onChange={(url) => setLesson(active.id, { videoUrl: url })}
                    onMeta={(m) => {
                      // Fill in the title from the video, unless the manager already wrote one.
                      if (m.title && (!active.title.trim() || /^(watch:?\s*|new card|video)$/i.test(active.title.trim()))) setLesson(active.id, { title: `Watch: ${m.title}`.slice(0, 100) });
                    }}
                  />
                  <p className="mt-1 text-xs text-slate-400">Tip: videos under 2 minutes get the best completion. Unlisted YouTube and private-link Vimeo videos work too.</p>
                </div>
              )}
              {active.kind !== 'quiz' && (
                <Field label={active.kind === 'video' ? 'Caption / key points' : 'Content'} hint='Blank line = new paragraph. Start a line with "- " for bullets, "## " for a heading, wrap **bold** text.'>
                  <Textarea rows={14} value={active.body ?? ''} onChange={(e) => setLesson(active.id, { body: e.target.value })} className="font-mono text-[13px]" />
                </Field>
              )}
              {active.kind === 'quiz' && (
                <div className="space-y-4">
                  {(active.questions ?? []).map((q, qi) => {
                    const setQ = (patch: Partial<Question>) => setLesson(active.id, { questions: active.questions!.map((x) => (x.id === q.id ? { ...x, ...patch } : x)) });
                    return (
                      <div key={q.id} className="rounded-xl bg-slate-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase text-slate-500">Question {qi + 1}</span>
                          <button onClick={() => setLesson(active.id, { questions: active.questions!.filter((x) => x.id !== q.id) })} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <Input value={q.prompt} onChange={(e) => setQ({ prompt: e.target.value })} placeholder="Ask a question" />
                        <div className="mt-3 space-y-2">
                          {q.options.map((o, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input type="radio" checked={q.correct === oi} onChange={() => setQ({ correct: oi })} title="Correct answer" />
                              <Input value={o} onChange={(e) => setQ({ options: q.options.map((x, j) => (j === oi ? e.target.value : x)) })} placeholder={`Option ${oi + 1}`} />
                              {q.options.length > 2 && (
                                <button
                                  onClick={() => setQ({ options: q.options.filter((_, j) => j !== oi), correct: q.correct >= oi && q.correct > 0 ? q.correct - 1 : q.correct })}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {q.options.length < 5 && (
                            <button onClick={() => setQ({ options: [...q.options, ''] })} className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer">
                              + Add option
                            </button>
                          )}
                        </div>
                        <Input className="mt-3" value={q.explanation ?? ''} onChange={(e) => setQ({ explanation: e.target.value })} placeholder="Explanation shown after answering (optional)" />
                      </div>
                    );
                  })}
                  <Button variant="secondary" size="sm" onClick={() => setLesson(active.id, { questions: [...(active.questions ?? []), newQuestion()] })}>
                    <Plus size={14} /> Add question
                  </Button>
                </div>
              )}
            </Card>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Phone preview</div>
              <div className="rounded-[2rem] bg-slate-900 p-3 shadow-xl">
                <div className="h-[560px] overflow-auto rounded-[1.5rem] bg-white p-5">
                  <div className="mb-4 flex gap-1">
                    {c.lessons.map((l) => (
                      <div key={l.id} className={cn('h-1 flex-1 rounded-full', l.id === active.id ? 'bg-indigo-500' : 'bg-slate-200')} />
                    ))}
                  </div>
                  <h3 className="mb-3 text-lg font-bold">{active.title}</h3>
                  {active.kind === 'video' && (
                    <VideoEmbed url={active.videoUrl} title={active.title} className="mb-3" />
                  )}
                  {active.body && <RichText text={active.body} className="text-sm" />}
                  {active.kind === 'quiz' && active.questions?.[0] && (
                    <div>
                      <p className="mb-3 font-medium">{active.questions[0].prompt || 'Your question'}</p>
                      {active.questions[0].options.map((o, i) => (
                        <div key={i} className="mb-2 rounded-lg p-3 text-sm ring-1 ring-slate-200">
                          {o || `Option ${i + 1}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Empty title="Add your first card">Cards, videos and quizzes — keep each one to a single idea.</Empty>
        )}
      </div>
      <AILessonModal
        open={!!ai}
        onClose={() => setAi(null)}
        course={c}
        lesson={ai === 'rewrite' ? active : undefined}
        onResult={(l) => {
          if (ai === 'rewrite') set({ lessons: c.lessons.map((x) => (x.id === l.id ? l : x)) });
          else {
            // New quizzes go last; new cards go just before the first quiz.
            const qi = c.lessons.findIndex((x) => x.kind === 'quiz');
            const lessons = [...c.lessons];
            lessons.splice(l.kind === 'quiz' || qi === -1 ? lessons.length : qi, 0, l);
            set({ lessons });
            setActiveId(l.id);
          }
          toast(ai === 'rewrite' ? 'Card rewritten — remember to save' : 'AI card added — remember to save', '✨');
        }}
      />
    </>
  );
}
