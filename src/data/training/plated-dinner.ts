import type { Scene, TrainingSpec } from '../../training/types';

const v1: Scene = {
  kind: 'plate',
  items: [
    { id: 'plate', kind: 'plate', label: 'Plate', x: 50, y: 52, z: 0 },
    { id: 'chicken', kind: 'chicken', label: 'Chicken', x: 34, y: 50, z: 2 },
    { id: 'starch', kind: 'starch', label: 'Potato', x: 62, y: 42, z: 2 },
    { id: 'veg', kind: 'veg', label: 'Vegetables', x: 60, y: 62, z: 2 },
    { id: 'sauce', kind: 'sauce', label: 'Sauce', x: 50, y: 38, z: 2 },
    { id: 'garnish', kind: 'garnish', label: 'Garnish', x: 48, y: 64, z: 3 },
  ],
};

const v2: Scene = {
  kind: 'plate',
  items: v1.items.map((it) => (it.id === 'chicken' ? { ...it, x: 66, y: 50 } : it.id === 'starch' ? { ...it, x: 36, y: 42 } : it)),
};

export const platedDinner: TrainingSpec = {
  id: 'banquet-plated-dinner',
  department: 'banquets',
  title: 'Plated dinner — banquet standard',
  version: 2,
  updatedAt: '2026-10-08',
  template: 'plate',
  scene: v2,
  previousScene: v1,
  steps: [
    { id: 's1', caption: 'Start with a clean dinner plate, 12 o’clock facing the guest.', anim: 'appear', itemIds: ['plate'] },
    { id: 's2', caption: 'Protein sits on the guest’s right. Chef moved chicken from the left this week.', anim: 'appear', itemIds: ['chicken'] },
    { id: 's3', caption: 'Starch (potato) sits on the guest’s left, opposite the protein.', anim: 'appear', itemIds: ['starch'] },
    { id: 's4', caption: 'Vegetables at 5 o’clock. Sauce at 12. Garnish last, never covering the protein.', anim: 'appear', itemIds: ['veg', 'sauce', 'garnish'] },
    { id: 's5', caption: 'This is the standard for every banquet cover tonight. Same plate, every server, every room.', anim: 'highlight', itemIds: ['chicken', 'starch', 'veg'] },
  ],
  checks: [
    {
      id: 'place-protein',
      kind: 'place',
      prompt: 'Build the plate. Drag each item onto the correct spot — chicken on the right.',
      itemIds: ['chicken', 'starch', 'veg', 'sauce', 'garnish'],
      start: {
        chicken: { x: 16, y: 88 },
        starch: { x: 34, y: 88 },
        veg: { x: 52, y: 88 },
        sauce: { x: 70, y: 88 },
        garnish: { x: 86, y: 88 },
      },
    },
  ],
  changeNotes: [
    {
      version: 2,
      date: '2026-10-08',
      summary: 'Chicken moved from the left side of the plate to the right. Potato swaps to the left.',
      itemIds: ['chicken', 'starch'],
    },
  ],
};
