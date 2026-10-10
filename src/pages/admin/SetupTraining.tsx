import { Link } from 'react-router-dom';
import { Pencil, Play, Trash2 } from 'lucide-react';
import { PageHeader, Pill } from '../../components/ui';
import { boardWhen } from '../../lib/utils';
import { useStore, useTrainingBoards } from '../../store';

export default function SetupTraining() {
  const modules = useTrainingBoards();
  const staff = useStore((s) => s.staff);
  const attempts = useStore((s) => s.trainingAttempts);
  const remove = useStore((s) => s.deleteTrainingBoard);
  const toast = useStore((s) => s.toast);
  const nameOf = (id: string) => staff.find((s) => s.id === id)?.name ?? 'Crew';

  return (
    <div>
      <PageHeader
        title="Setup cards"
        sub="A picture the crew rebuilds. Alex talks. No SOP for them to click through."
        actions={
          <div className="flex gap-2">
            <Link to="/admin/setup/library" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
              Your library
            </Link>
            <Link to="/admin/setup/new" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
              New setup card
            </Link>
          </div>
        }
      />
      {modules.length === 0 && <p className="text-sm text-slate-500">No setup cards yet. Create one and it stays a draft until you publish it.</p>}
      <div className="space-y-8">
        {modules.map((m) => {
          const rows = attempts.filter((a) => a.moduleId === m.id);
          const done = rows.filter((a) => a.passed);
          const avg = done.length ? Math.round(done.reduce((s, a) => s + a.firstTryAccuracy, 0) / done.length) : null;
          const miss = new Map<string, number>();
          rows.forEach((a) =>
            a.mistakes.forEach((x) => {
              const key = x.itemId ?? x.checkId;
              miss.set(key, (miss.get(key) ?? 0) + 1);
            }),
          );
          const topMiss = [...miss.entries()].sort((a, b) => b[1] - a[1])[0];
          const itemLabel = (id: string) => m.scene.items.find((it) => it.id === id)?.label ?? id;

          return (
            <section key={m.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500">{m.department}</div>
                  <h2 className="text-lg font-semibold text-slate-900">{m.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {[m.venue, m.status === 'draft' ? 'Draft' : `v${m.version}`, boardWhen(m.updatedAt)].filter(Boolean).join(' · ')}
                    {m.changeNotes.length ? ` · ${m.changeNotes[m.changeNotes.length - 1]!.summary}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/demo/${m.id}`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
                    <Play size={14} /> Preview
                  </Link>
                  <Link to={`/admin/setup/${m.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-slate-200">
                    <Pencil size={14} /> Edit version
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Delete “${m.title}”? Crew will no longer see this card.`)) return;
                      remove(m.id);
                      toast(`Deleted ${m.title}`);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.status === 'draft' && <Pill className="bg-amber-50 text-amber-800">Draft</Pill>}
                <Pill className="bg-indigo-50 text-indigo-700">{done.length} completed</Pill>
                {avg !== null && <Pill className="bg-emerald-50 text-emerald-700">Avg first-try {avg}%</Pill>}
                {topMiss && <Pill className="bg-amber-50 text-amber-800">Most missed: {itemLabel(topMiss[0])}</Pill>}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="pb-2 font-medium">Crew</th>
                      <th className="pb-2 font-medium">First-try</th>
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Misses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {done.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-3 text-slate-500">
                          No completions yet.
                        </td>
                      </tr>
                    )}
                    {done.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2 font-medium text-slate-800">{nameOf(a.staffId)}</td>
                        <td className="py-2">{a.firstTryAccuracy}%</td>
                        <td className="py-2 text-slate-500">{Math.round(a.durationMs / 1000)}s</td>
                        <td className="py-2 text-slate-500">
                          {a.mistakes.length ? a.mistakes.map((x) => itemLabel(x.itemId ?? x.checkId)).join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
