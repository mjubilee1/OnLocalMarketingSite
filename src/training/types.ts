export type SceneKind = 'plate' | 'round-table' | 'station';

export type AnimType = 'appear' | 'move' | 'swap' | 'highlight';

export type CheckKind = 'place' | 'spot';

export interface Pose {
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
}

export interface SceneItem extends Pose {
  id: string;
  kind: string;
  label: string;
  z?: number;
  /** Custom look. Built-in kinds fall back to ITEM_STYLE. */
  look?: {
    fill: string;
    stroke?: string;
    w: number;
    h: number;
    shape: 'circle' | 'ellipse' | 'rect' | 'diamond';
    rx?: number;
  };
}

export interface CustomLibraryItem {
  id: string;
  label: string;
  group: 'plate' | 'table' | 'station';
  look: NonNullable<SceneItem['look']>;
}

export interface Scene {
  kind: SceneKind;
  items: SceneItem[];
}

export interface Step {
  id: string;
  caption: string;
  anim: AnimType;
  itemIds: string[];
  to?: Record<string, Pose>;
}

export interface Check {
  id: string;
  kind: CheckKind;
  prompt: string;
  itemIds: string[];
  /** For spot-the-change: the item that moved or appeared. */
  correctId?: string;
  /** Scrambled starting poses for place checks. */
  start?: Record<string, Pose>;
}

export interface ChangeNote {
  version: number;
  date: string;
  summary: string;
  itemIds: string[];
}

/** Hand-written (or drafted) module. A new department is a new file that matches this. */
export interface TrainingSpec {
  id: string;
  department: string;
  title: string;
  /** Property or event this picture belongs to, e.g. Gaylord Hotel. */
  venue?: string;
  /** Drafts save while you edit. Published is what crew train on. */
  status?: 'draft' | 'published';
  version: number;
  updatedAt: string;
  template: SceneKind;
  scene: Scene;
  steps: Step[];
  checks: Check[];
  changeNotes: ChangeNote[];
  previousScene?: Scene;
}

export interface TrainingAttempt {
  id: string;
  moduleId: string;
  staffId: string;
  version: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  firstTryAccuracy: number;
  mistakes: { checkId: string; itemId?: string }[];
  passed: boolean;
}
