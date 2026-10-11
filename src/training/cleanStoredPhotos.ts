import { cutoutBoardDataUrl } from '../lib/profile';
import { lookFromCutout } from './items';
import type { CustomLibraryItem, SceneItem, TrainingSpec } from './types';

type CleanHooks = {
  customLibrary: CustomLibraryItem[];
  trainingEdits: Record<string, TrainingSpec>;
  trainingDrafts: Record<string, TrainingSpec>;
  saveLibraryItem: (item: CustomLibraryItem) => void;
  saveTrainingDraft: (draft: TrainingSpec) => void;
  /** Quiet rewrite of a published board’s embedded photos (no version bump). */
  patchTrainingEdit: (spec: TrainingSpec) => void;
};

async function cleanLook(image: string | undefined, shape: NonNullable<SceneItem['look']>['shape'] = 'rect') {
  if (!image) return null;
  const cut = await cutoutBoardDataUrl(image);
  return lookFromCutout(cut, shape === 'diamond' ? 'rect' : shape);
}

async function cleanSceneItems(items: SceneItem[]): Promise<{ items: SceneItem[]; n: number }> {
  let n = 0;
  const next: SceneItem[] = [];
  for (const it of items) {
    if (!it.look?.image) {
      next.push(it);
      continue;
    }
    try {
      const look = await cleanLook(it.look.image, it.look.shape);
      if (look) {
        next.push({ ...it, look });
        n += 1;
      } else next.push(it);
    } catch {
      next.push(it);
    }
  }
  return { items: next, n };
}

/** Run magic-eraser on every custom library photo and any photos already placed on boards. */
export async function cleanStoredPhotos(hooks: CleanHooks): Promise<{ library: number; boards: number }> {
  let library = 0;
  let boards = 0;

  for (const item of hooks.customLibrary) {
    if (!item.look?.image) continue;
    try {
      const look = await cleanLook(item.look.image, item.look.shape);
      if (!look) continue;
      hooks.saveLibraryItem({ ...item, look });
      library += 1;
    } catch {
      /* keep original */
    }
  }

  const patchSpec = async (spec: TrainingSpec, kind: 'draft' | 'edit') => {
    const { items, n } = await cleanSceneItems(spec.scene.items);
    if (!n) return;
    const next = { ...spec, scene: { ...spec.scene, items }, updatedAt: new Date().toISOString() };
    if (kind === 'edit') hooks.patchTrainingEdit(next);
    else hooks.saveTrainingDraft(next);
    boards += n;
  };

  for (const spec of Object.values(hooks.trainingDrafts ?? {})) await patchSpec(spec, 'draft');
  for (const spec of Object.values(hooks.trainingEdits ?? {})) await patchSpec(spec, 'edit');

  return { library, boards };
}
