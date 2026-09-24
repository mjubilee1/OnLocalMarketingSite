import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Loader2, Plus, Target, Users } from 'lucide-react';
import { OnlocalMark } from '../../components/brand';
import { Button, PageHeader, Progress } from '../../components/ui';
import { courseAccent, CourseCard, courseTheme, CoverBadge } from '../../components/courseCard';
import { CreateCourseModal } from '../../components/ai';
import { requirements } from '../../lib/readiness';
import { cn, pct, uid } from '../../lib/utils';
import { autoCover, autoLessonImages, needsImage } from '../../lib/images';
import { useCatalog, useStore } from '../../store';
import type { Course } from '../../types';

export default function Training() {
  const staff = useStore((s) => s.staff);
  const upsert = useStore((s) => s.upsertCourse);
  const orgName = useStore((s) => s.orgName);
  const cat = useCatalog();
  const nav = useNavigate();
  const [ai, setAi] = useState(false);
  const toast = useStore((s) => s.toast);
  const [filling, setFilling] = useState<{ done: number; total: number } | null>(null);
  const stop = useRef<AbortController | null>(null);
  const missingPhotos = cat.courses.filter((c) => !c.cover || c.lessons.some(needsImage));

  // One course at a time: each needs AI calls plus photo searches, and free tiers are rate limited.
  const fillPhotos = async () => {
    const ids = missingPhotos.map((c) => c.id);
    const ac = new AbortController();
    stop.current = ac;
    let covers = 0;
    let cards = 0;
    let failed = '';
    setFilling({ done: 0, total: ids.length });
    for (const [i, id] of ids.entries()) {
      if (ac.signal.aborted) break;
      try {
        if (await autoCover(id, ac.signal)) covers++;
        cards += await autoLessonImages(id, ac.signal);
      } catch (e) {
        if (ac.signal.aborted) break;
        failed = (e as Error).message;
        // The photo library's hourly limit or a bad key won't fix itself on the next course.
        if (/rate limit|rejected/.test(failed)) break;
      }
      setFilling({ done: i + 1, total: ids.length });
    }
    setFilling(null);
    const parts = [covers && `${covers} cover${covers === 1 ? '' : 's'}`, cards && `${cards} card photo${cards === 1 ? '' : 's'}`].filter(Boolean).join(' and ');
    toast(parts ? `Added ${parts}${failed ? `. Stopped early: ${failed}` : ''}` : failed ? `Couldn't add photos: ${failed}` : 'No new photos added', parts ? '🖼️' : '⚠️');
  };

  const current = staff.filter((s) => s.status !== 'inactive');
  const stats = (c: Course) => {
    const assigned = current.filter((s) => requirements(s, cat).courseIds.includes(c.id));
    const done = assigned.filter((s) => s.courses[c.id]?.completedAt);
    const scores = done.flatMap((s) => Object.values(s.courses[c.id]!.quizScores));
    return {
      assigned: assigned.length,
      done: done.length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      roles: cat.roles.filter((r) => r.courseIds.includes(c.id)),
    };
  };

  const createBlank = () => {
    const c: Course = {
      id: uid('c-'),
      title: 'Untitled course',
      description: '',
      category: 'General',
      emoji: '📘',
      estMinutes: 5,
      passingScore: 80,
      points: 50,
      published: false,
      lessons: [{ id: uid('l'), title: 'Introduction', kind: 'card', body: 'Write your first lesson here.\n\n- Keep it short\n- One idea per card' }],
    };
    upsert(c);
    nav(`/admin/training/${c.id}`);
  };

  const categories = Array.from(new Set(cat.courses.map((c) => c.category)));

  return (
    <>
      <PageHeader
        title="Training"
        actions={
          <>
            {filling ? (
              <Button variant="secondary" onClick={() => stop.current?.abort()} title="Stop">
                <Loader2 size={16} className="animate-spin" /> Adding photos {filling.done}/{filling.total} · Stop
              </Button>
            ) : (
              missingPhotos.length > 0 && (
                <Button variant="secondary" onClick={fillPhotos} title="Add onlocalAI-matched cover and card photos to courses that are missing them">
                  <OnlocalMark size={16} /> onlocalAI photos ({missingPhotos.length})
                </Button>
              )
            )}
            <Button variant="secondary" onClick={() => nav('/admin/training/library')}>
              <Library size={16} /> Template library
            </Button>
            <Button variant="secondary" onClick={createBlank}>
              <Plus size={16} /> Blank course
            </Button>
            <Button onClick={() => setAi(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
              <OnlocalMark size={16} /> Create with onlocalAI
            </Button>
          </>
        }
      />
      {categories.map((catName) => (
        <section key={catName} className="mb-8">
          <h2 className={cn('mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide', courseAccent(catName))}>
            <span className={cn('h-4 w-1.5 rounded-full bg-gradient-to-b', courseTheme(catName))} />
            {catName}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cat.courses
              .filter((c) => c.category === catName)
              .map((c) => {
                const st = stats(c);
                return (
                  <CourseCard
                    key={c.id}
                    c={c}
                    provider={c.templateId ? 'onlocalAI Library' : orgName}
                    onClick={() => nav(`/admin/training/${c.id}`)}
                    badges={!c.published && <CoverBadge tone="dark">Draft</CoverBadge>}
                    corner={<CoverBadge>+{c.points} pts</CoverBadge>}
                    stat={
                      <>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Users size={12} /> {st.done}/{st.assigned} completed
                        </span>
                        {st.avgScore !== null && (
                          <span className="flex items-center gap-1">
                            <Target size={12} className="text-amber-500" /> {st.avgScore}% avg score
                          </span>
                        )}
                      </>
                    }
                    footer={
                      <>
                        <Progress value={pct(st.done, st.assigned)} className="h-1.5" />
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {st.roles.length === 0 && <span className="text-xs text-slate-400">Not assigned to any role</span>}
                          {st.roles.map((r) => (
                            <span key={r.id} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </>
                    }
                  />
                );
              })}
          </div>
        </section>
      ))}

      <CreateCourseModal open={ai} onClose={() => setAi(false)} />

    </>
  );
}
