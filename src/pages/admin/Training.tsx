import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Library, Plus, Sparkles, Users } from 'lucide-react';
import { Button, Card, PageHeader, Pill, Progress } from '../../components/ui';
import { CreateCourseModal } from '../../components/ai';
import { requirements } from '../../lib/readiness';
import { pct, uid } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { Course } from '../../types';

export default function Training() {
  const staff = useStore((s) => s.staff);
  const upsert = useStore((s) => s.upsertCourse);
  const cat = useCatalog();
  const nav = useNavigate();
  const [ai, setAi] = useState(false);

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
        sub="Bite-sized, mobile-first courses. Assign them to roles in Onboarding flows, or to specific events."
        actions={
          <>
            <Button variant="secondary" onClick={() => nav('/admin/training/library')}>
              <Library size={16} /> Template library
            </Button>
            <Button variant="secondary" onClick={createBlank}>
              <Plus size={16} /> Blank course
            </Button>
            <Button onClick={() => setAi(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
              <Sparkles size={16} /> Create with AI
            </Button>
          </>
        }
      />
      {categories.map((catName) => (
        <section key={catName} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{catName}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cat.courses
              .filter((c) => c.category === catName)
              .map((c) => {
                const st = stats(c);
                return (
                  <Card key={c.id} className="flex flex-col p-5" onClick={() => nav(`/admin/training/${c.id}`)}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl">{c.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-900">{c.title}</h3>
                          {!c.published && <Pill className="bg-slate-100 text-slate-500">Draft</Pill>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {c.estMinutes} min
                          </span>
                          <span>{c.lessons.length} cards</span>
                          {c.lessons.some((l) => l.kind === 'video') && <span>▶ {c.lessons.filter((l) => l.kind === 'video').length} video</span>}
                          <span>{c.points} pts</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">{c.description}</p>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {st.done}/{st.assigned} completed
                        </span>
                        {st.avgScore !== null && <span>avg quiz {st.avgScore}%</span>}
                      </div>
                      <Progress value={pct(st.done, st.assigned)} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {st.roles.length === 0 && <span className="text-xs text-slate-400">Not assigned to any role</span>}
                      {st.roles.map((r) => (
                        <span key={r.id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}

      <CreateCourseModal open={ai} onClose={() => setAi(false)} />

    </>
  );
}
