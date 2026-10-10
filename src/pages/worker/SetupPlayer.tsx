import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Player } from '../../training/Player';
import { useCurrentStaff, useStore, useTrainingModule } from '../../store';

export default function SetupPlayer() {
  const { id } = useParams();
  const spec = useTrainingModule(id);
  const me = useCurrentStaff();
  const record = useStore((s) => s.recordTrainingAttempt);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();

  if (!spec) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        Module not found. <Link to="/app/learn">Back to Learn</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <Link to="/app/learn" className="inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft size={14} /> Learn
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
        {spec.department} · v{spec.version}
      </p>
      <h1 className="text-xl font-bold text-slate-900">{spec.title}</h1>
      <div className="mt-4">
        <Player
          spec={spec}
          onComplete={(r) => {
            record({ ...r, moduleId: spec.id, staffId: me.id, version: spec.version, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() });
            toast(`First-try accuracy ${r.firstTryAccuracy}%`, '🎯');
          }}
          onExit={() => nav('/app/learn')}
        />
      </div>
    </div>
  );
}
