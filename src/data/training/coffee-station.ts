import type { TrainingSpec } from '../../training/types';

export const coffeeStation: TrainingSpec = {
  id: 'banquet-coffee-station',
  department: 'banquets',
  title: 'Coffee station — guest line',
  version: 1,
  updatedAt: '2026-09-20',
  template: 'station',
  scene: {
    kind: 'station',
    items: [
      { id: 'drip', kind: 'drip', label: 'Drip tray', x: 28, y: 48, z: 0 },
      { id: 'urn', kind: 'urn', label: 'Coffee urn', x: 28, y: 36, z: 1 },
      { id: 'cups', kind: 'cups', label: 'Cups', x: 46, y: 40, z: 1 },
      { id: 'lids', kind: 'lids', label: 'Lids', x: 58, y: 38, z: 1 },
      { id: 'milk', kind: 'milk', label: 'Milk', x: 70, y: 40, z: 1 },
      { id: 'sugar', kind: 'sugar', label: 'Sugar', x: 80, y: 42, z: 1 },
      { id: 'stirrers', kind: 'stirrers', label: 'Stirrers', x: 88, y: 36, z: 1 },
      { id: 'naps', kind: 'napkin', label: 'Napkins', x: 46, y: 58, z: 1 },
      { id: 'pastry', kind: 'pastry', label: 'Pastry', x: 70, y: 60, z: 1 },
    ],
  },
  steps: [
    { id: 's1', caption: 'Urn first, on a drip tray, guest’s left as they walk the line.', anim: 'appear', itemIds: ['drip', 'urn'] },
    { id: 's2', caption: 'Cups then lids — they grab a cup before they pour.', anim: 'appear', itemIds: ['cups', 'lids'] },
    { id: 's3', caption: 'Milk, sugar, stirrers in that order so the line never doubles back.', anim: 'appear', itemIds: ['milk', 'sugar', 'stirrers'] },
    { id: 's4', caption: 'Napkins and pastry at the end. Offer to pour for the guest; never leave an empty urn.', anim: 'appear', itemIds: ['naps', 'pastry'] },
    { id: 's5', caption: 'Left to right: urn → cup → lid → milk → sugar → stirrer → napkin.', anim: 'highlight', itemIds: ['urn', 'cups', 'lids', 'milk', 'sugar', 'stirrers'] },
  ],
  checks: [
    {
      id: 'place-line',
      kind: 'place',
      prompt: 'Set the line: urn, cups, lids, milk. Left to right, the way a guest walks.',
      itemIds: ['urn', 'cups', 'lids', 'milk'],
      start: {
        urn: { x: 20, y: 88 },
        cups: { x: 40, y: 88 },
        lids: { x: 60, y: 88 },
        milk: { x: 80, y: 88 },
      },
    },
  ],
  changeNotes: [],
};
