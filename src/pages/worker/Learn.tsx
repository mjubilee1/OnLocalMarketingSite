import type { ReactNode } from 'react';
import { CircleCheck, Star } from 'lucide-react';
import { CourseCard, CoverBadge } from '../../components/courseCard';
import { courseProgress, requirements } from '../../lib/readiness';
import { useCatalog, useCurrentStaff, useStore } from '../../store';
import type { Course } from '../../types';

function Card({ c, prog, required, provider, compact }: { c: Course; prog: number; required?: boolean; provider: string; compact?: boolean }) {
  return (
    <CourseCard
      c={c}
      provider={provider}
      to={`/app/learn/${c.id}`}
      progress={prog}
      badges={
        prog >= 1 ? (
          <CoverBadge tone="green">
            <CircleCheck size={11} /> Completed
          </CoverBadge>
        ) : required ? (
          <CoverBadge tone="red">Required</CoverBadge>
        ) : null
      }
      corner={<CoverBadge>+{c.points} pts</CoverBadge>}
      stat={
        prog > 0 && prog < 1 ? (
          <span className="font-medium text-indigo-700">{Math.round(prog * 100)}% complete · pick up where you left off</span>
        ) : prog >= 1 ? (
          <span className="flex items-center gap-1 font-medium text-emerald-700">
            <Star size={12} className="fill-amber-400 text-amber-400" /> Earned {c.points} points
          </span>
        ) : undefined
      }
      className={compact ? 'w-64' : undefined}
    />
  );
}

function Shelf({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      {/* Horizontal shelf, like a course catalog */}
      <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">{children}</div>
    </section>
  );
}

export default function Learn() {
  const me = useCurrentStaff();
  const events = useStore((s) => s.events);
  const orgName = useStore((s) => s.orgName);
  const cat = useCatalog();
  const eventCourseIds = events.filter((e) => e.status === 'published' && e.assignments.some((a) => a.staffId === me.id)).flatMap((e) => e.courseIds);
  const reqIds = Array.from(new Set([...requirements(me, cat).courseIds, ...eventCourseIds]));
  const required = cat.courses.filter((c) => c.published && reqIds.includes(c.id));
  const todo = required.filter((c) => courseProgress(me, c) < 1);
  const done = required.filter((c) => courseProgress(me, c) === 1);
  const extra = cat.courses.filter((c) => c.published && !reqIds.includes(c.id));
  const provider = (c: Course) => (c.templateId ? 'onlocalAI Library' : orgName);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">Learn</h1>

      {todo.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-slate-900">
            To do <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">{todo.length}</span>
          </h2>
          <div className="mt-3 space-y-4">
            {todo.map((c) => (
              <Card key={c.id} c={c} prog={courseProgress(me, c)} required provider={provider(c)} />
            ))}
          </div>
        </section>
      )}
      {todo.length === 0 && required.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <CircleCheck size={20} className="shrink-0 text-emerald-600" /> All your required training is done. Nice work!
        </div>
      )}
      {done.length > 0 && (
        <Shelf title="Completed">
          {done.map((c) => (
            <div key={c.id} className="shrink-0 snap-start">
              <Card c={c} prog={1} provider={provider(c)} compact />
            </div>
          ))}
        </Shelf>
      )}
      {extra.length > 0 && (
        <Shelf title="Level up">
          {extra.map((c) => (
            <div key={c.id} className="shrink-0 snap-start">
              <Card c={c} prog={courseProgress(me, c)} provider={provider(c)} compact />
            </div>
          ))}
        </Shelf>
      )}
    </div>
  );
}
