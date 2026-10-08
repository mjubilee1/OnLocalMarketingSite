import { Link, useNavigate, useParams } from 'react-router-dom';
import { Editor, blankFromTemplate } from '../../training/Editor';
import { Button, PageHeader } from '../../components/ui';
import { useStore, useTrainingModule } from '../../store';
import type { SceneKind } from '../../training/types';
import { useState } from 'react';

export default function SetupEditor() {
  const { id } = useParams();
  const spec = useTrainingModule(id);
  const save = useStore((s) => s.saveTrainingSpec);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [kind, setKind] = useState<SceneKind>('plate');

  if (id === 'new') {
    return (
      <div>
        <PageHeader title="New setup module" sub="Pick a template. You’ll drag the standard after it’s created." />
        <div className="flex flex-wrap gap-2">
          {(['plate', 'round-table', 'station'] as SceneKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-lg px-3 py-2 text-sm ring-1 ${kind === k ? 'bg-indigo-600 text-white ring-indigo-600' : 'ring-slate-200'}`}
            >
              {k}
            </button>
          ))}
        </div>
        <Button
          className="mt-6"
          onClick={() => {
            const draft = blankFromTemplate(kind, 'banquets', 'Untitled setup');
            save(draft, 'Created');
            toast('Module created', '🍽️');
            nav(`/admin/setup/${draft.id}`);
          }}
        >
          Create
        </Button>
      </div>
    );
  }

  if (!spec) {
    return (
      <p className="text-sm text-slate-500">
        Unknown module. <Link to="/admin/setup">Back</Link>
      </p>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit · ${spec.title}`} sub={`Saving bumps this to v${spec.version + 1} and records “what changed”.`} />
      <Editor
        spec={spec}
        onSave={(next, summary) => {
          save(next, summary);
          toast(`Saved v${spec.version + 1}`, '✅');
          nav('/admin/setup');
        }}
      />
    </div>
  );
}
