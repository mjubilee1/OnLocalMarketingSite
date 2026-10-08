import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Play } from 'lucide-react';
import { Logo } from '../layouts/AdminLayout';
import { Button, Card } from '../components/ui';
import { Player } from '../training/Player';
import { useCurrentStaff, useStore, useTrainingModule, useTrainingModules } from '../store';

export default function Demo() {
  const { moduleId } = useParams();
  const spec = useTrainingModule(moduleId);
  const nav = useNavigate();
  const me = useCurrentStaff();
  const record = useStore((s) => s.recordTrainingAttempt);
  const toast = useStore((s) => s.toast);

  if (moduleId && spec) {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button type="button" className="inline-flex items-center gap-1 text-sm text-slate-600" onClick={() => nav('/demo')}>
            <ArrowLeft size={16} /> Modules
          </button>
          <Logo />
          <Link to={`/admin/setup/${spec.id}`} className="text-sm text-indigo-700">
            Edit
          </Link>
        </header>
        <div className="mx-auto max-w-md px-4 pb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {spec.department} · v{spec.version}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{spec.title}</h1>
          <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <Player
              spec={spec}
              onComplete={(r) => {
                record({ ...r, moduleId: spec.id, staffId: me.id, version: spec.version, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() });
                toast(`First-try accuracy ${r.firstTryAccuracy}%`, '🎯');
              }}
              onExit={() => nav('/admin/setup')}
            />
          </div>
        </div>
      </div>
    );
  }

  return <DemoHub />;
}

function DemoHub() {
  const modules = useTrainingModules();
  const attempts = useStore((s) => s.trainingAttempts);
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex gap-4 text-sm">
          <Link to="/" className="text-slate-500 hover:text-slate-900">
            Home
          </Link>
          <Link to="/admin/setup" className="font-medium text-indigo-700">
            Manager results
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Proof of concept · banquets</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Same training, every cover, every room.</h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Chef moved the chicken. Watch the change, then rebuild the plate. You can’t click through — you have to place it.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => {
            const n = attempts.filter((a) => a.moduleId === m.id && a.passed).length;
            return (
              <Card key={m.id} className="p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{m.department}</div>
                <h2 className="mt-1 font-semibold text-slate-900">{m.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  v{m.version} · {m.updatedAt}
                  {m.changeNotes.length ? ` · ${m.changeNotes[m.changeNotes.length - 1]!.summary}` : ''}
                </p>
                <p className="mt-2 text-xs text-slate-500">{n} completed</p>
                <div className="mt-4 flex gap-2">
                  <Link to={`/demo/${m.id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                    <Play size={14} /> Train
                  </Link>
                  <Link to={`/admin/setup/${m.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    <Pencil size={14} /> Edit
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
        <Button className="mt-8" variant="secondary" onClick={() => (window.location.href = '/admin/setup')}>
          Open results
        </Button>
      </main>
    </div>
  );
}
