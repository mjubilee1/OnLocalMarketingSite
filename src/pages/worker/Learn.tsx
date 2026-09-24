import { Link } from 'react-router-dom';
import { CircleCheck, Clock } from 'lucide-react';
import { Card, Progress } from '../../components/ui';
import { courseProgress, requirements } from '../../lib/readiness';
import { useCatalog, useCurrentStaff, useStore } from '../../store';
import type { Course } from '../../types';

function CourseCard({ c, prog, required }: { c: Course; prog: number; required?: boolean }) {
  return (
    <Link to={`/app/learn/${c.id}`}>
      <Card className="flex items-center gap-4 p-4 active:bg-slate-50">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl">{c.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-slate-900">{c.title}</span>
            {prog === 1 && <CircleCheck size={16} className="shrink-0 text-emerald-500" />}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} /> {c.estMinutes} min • {c.lessons.length} cards{c.lessons.some((l) => l.kind === 'video') ? ' • ▶ video' : ''} • +{c.points} pts
            {required && prog < 1 && <span className="font-medium text-rose-600">Required</span>}
          </div>
          {prog > 0 && prog < 1 && <Progress value={prog * 100} className="mt-2 h-1.5" />}
        </div>
      </Card>
    </Link>
  );
}

export default function Learn() {
  const me = useCurrentStaff();
  const events = useStore((s) => s.events);
  const cat = useCatalog();
  const eventCourseIds = events.filter((e) => e.status === 'published' && e.assignments.some((a) => a.staffId === me.id)).flatMap((e) => e.courseIds);
  const reqIds = Array.from(new Set([...requirements(me, cat).courseIds, ...eventCourseIds]));
  const required = cat.courses.filter((c) => c.published && reqIds.includes(c.id));
  const todo = required.filter((c) => courseProgress(me, c) < 1);
  const done = required.filter((c) => courseProgress(me, c) === 1);
  const extra = cat.courses.filter((c) => c.published && !reqIds.includes(c.id));

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">Learn</h1>
      <p className="mt-1 text-sm text-slate-500">Short lessons you can finish on the bus. Earn points for every card.</p>

      {todo.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">To do ({todo.length})</h2>
          <div className="space-y-3">
            {todo.map((c) => (
              <CourseCard key={c.id} c={c} prog={courseProgress(me, c)} required />
            ))}
          </div>
        </section>
      )}
      {done.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</h2>
          <div className="space-y-3">
            {done.map((c) => (
              <CourseCard key={c.id} c={c} prog={1} />
            ))}
          </div>
        </section>
      )}
      {extra.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Level up — optional</h2>
          <p className="mb-3 text-xs text-slate-500">Extra courses unlock new roles and earn bonus points.</p>
          <div className="space-y-3">
            {extra.map((c) => (
              <CourseCard key={c.id} c={c} prog={courseProgress(me, c)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
