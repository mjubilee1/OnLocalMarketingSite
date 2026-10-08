import type { SceneItem, TrainingSpec } from '../../training/types';

function seats(n: number): SceneItem[] {
  const items: SceneItem[] = [
    { id: 'table', kind: 'table', label: 'Table', x: 50, y: 46, z: 0 },
    { id: 'cloth', kind: 'cloth', label: 'Cloth', x: 50, y: 46, z: 1 },
    { id: 'center', kind: 'centerpiece', label: 'Centerpiece', x: 50, y: 46, z: 4 },
  ];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const cx = 50 + Math.cos(a) * 30;
    const cy = 46 + Math.sin(a) * 30;
    const gx = 50 + Math.cos(a) * 36;
    const gy = 46 + Math.sin(a) * 36;
    const nx = 50 + Math.cos(a + 0.18) * 30;
    const ny = 46 + Math.sin(a + 0.18) * 30;
    items.push(
      { id: `p${i}`, kind: 'setting', label: `Cover ${i + 1}`, x: cx, y: cy, z: 2 },
      { id: `g${i}`, kind: 'glass', label: `Water ${i + 1}`, x: gx, y: gy, z: 3 },
      { id: `n${i}`, kind: 'napkin', label: `Napkin ${i + 1}`, x: nx, y: ny, z: 3, rotation: (a * 180) / Math.PI },
    );
  }
  return items;
}

const scene = { kind: 'round-table' as const, items: seats(10) };

export const roundTable: TrainingSpec = {
  id: 'banquet-round-table',
  department: 'banquets',
  title: 'Round table of 10 — banquet set',
  version: 1,
  updatedAt: '2026-10-01',
  template: 'round-table',
  scene,
  steps: [
    { id: 's1', caption: 'Drop a 72" round, linen to the floor, centerpiece dead center.', anim: 'appear', itemIds: ['table', 'cloth', 'center'] },
    { id: 's2', caption: 'Ten covers, even around the table. Plate first, then glass at 1 o’clock of each cover.', anim: 'appear', itemIds: scene.items.filter((i) => i.kind === 'setting' || i.kind === 'glass').map((i) => i.id) },
    { id: 's3', caption: 'Napkin at each cover, folded, never on the centerpiece.', anim: 'appear', itemIds: scene.items.filter((i) => i.kind === 'napkin').map((i) => i.id) },
    { id: 's4', caption: 'Walk the table: 10 plates, 10 waters, 10 napkins, one center. Same at every property.', anim: 'highlight', itemIds: ['center'] },
  ],
  checks: [
    {
      id: 'spot-center',
      kind: 'spot',
      prompt: 'Tap the centerpiece — it never sits on a cover.',
      itemIds: ['center', 'p0', 'p3', 'p7'],
      correctId: 'center',
    },
    {
      id: 'place-one',
      kind: 'place',
      prompt: 'Place cover 1, its water glass, and napkin on the empty seats.',
      itemIds: ['p0', 'g0', 'n0'],
      start: {
        p0: { x: 18, y: 90 },
        g0: { x: 50, y: 90 },
        n0: { x: 82, y: 90 },
      },
    },
  ],
  changeNotes: [],
};
