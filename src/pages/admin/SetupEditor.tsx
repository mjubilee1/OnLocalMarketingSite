import { useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Editor } from '../../training/Editor';
import { PageHeader } from '../../components/ui';
import { useStore, useTrainingModule } from '../../store';
import type { TrainingSpec } from '../../training/types';

export default function SetupEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const published = useTrainingModule(isNew ? undefined : id);
  const draft = useStore((s) => (isNew || !id ? undefined : s.trainingDrafts?.[id]));
  const working = draft ?? published;
  const save = useStore((s) => s.saveTrainingSpec);
  const saveDraft = useStore((s) => s.saveTrainingDraft);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const opened = useRef(false);

  const keepDraft = useCallback(
    (next: TrainingSpec) => {
      saveDraft(next);
      if (isNew && !opened.current) {
        opened.current = true;
        nav(`/admin/setup/${next.id}`, { replace: true });
      }
    },
    [isNew, saveDraft, nav],
  );

  const publish = (next: TrainingSpec, summary: string) => {
    const version = published ? published.version + 1 : 1;
    save(next, summary);
    toast(`Published v${version}`, '✅');
    nav('/admin/setup');
  };

  if (isNew) {
    return (
      <div>
        <PageHeader title="New setup card" sub="Name the board, pick a start, and set the picture. It saves as a draft while you update it." />
        <Editor onSave={publish} onDraft={keepDraft} />
      </div>
    );
  }

  if (!working) {
    return (
      <p className="text-sm text-slate-500">
        Unknown card. <Link to="/admin/setup">Back</Link>
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title={working.venue ? `${working.title} · ${working.venue}` : working.title}
        sub="Add or remove pieces, drag the standard, and the draft saves as you go. Publish when crew should train on it."
      />
      <Editor spec={working} revising={!!published} onSave={publish} onDraft={keepDraft} />
    </div>
  );
}
