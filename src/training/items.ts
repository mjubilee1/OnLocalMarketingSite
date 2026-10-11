export interface ItemStyle {
  fill: string;
  stroke?: string;
  w: number;
  h: number;
  shape: 'circle' | 'ellipse' | 'rect' | 'diamond';
  rx?: number;
  /** Optional photo. When set, the board shows this instead of a flat shape. */
  image?: string;
}

/** Visuals for scene items. Add a kind here when a department needs a new object. */
export const ITEM_STYLE: Record<string, ItemStyle> = {
  plate: { fill: '#f8fafc', stroke: '#cbd5e1', w: 56, h: 56, shape: 'circle' },
  rim: { fill: 'transparent', stroke: '#e2e8f0', w: 62, h: 62, shape: 'circle' },
  chicken: { fill: '#d97706', stroke: '#b45309', w: 16, h: 12, shape: 'ellipse' },
  starch: { fill: '#fde68a', stroke: '#d97706', w: 12, h: 12, shape: 'circle' },
  veg: { fill: '#16a34a', stroke: '#15803d', w: 14, h: 10, shape: 'ellipse' },
  sauce: { fill: '#7f1d1d', stroke: '#450a0a', w: 8, h: 8, shape: 'circle' },
  garnish: { fill: '#4ade80', stroke: '#16a34a', w: 6, h: 6, shape: 'circle' },
  table: { fill: '#e2e8f0', stroke: '#94a3b8', w: 78, h: 78, shape: 'circle' },
  cloth: { fill: '#fff7ed', stroke: '#fdba74', w: 72, h: 72, shape: 'circle' },
  charger: { fill: '#e2e8f0', stroke: '#94a3b8', w: 11, h: 11, shape: 'circle' },
  setting: { fill: '#f8fafc', stroke: '#94a3b8', w: 8, h: 8, shape: 'circle' },
  glass: { fill: '#bae6fd', stroke: '#0284c7', w: 4.5, h: 6, shape: 'ellipse' },
  wine: { fill: '#fecaca', stroke: '#b91c1c', w: 4, h: 6, shape: 'ellipse' },
  napkin: { fill: '#fecdd3', stroke: '#e11d48', w: 5, h: 7, shape: 'rect', rx: 1 },
  centerpiece: { fill: '#f59e0b', stroke: '#b45309', w: 10, h: 10, shape: 'circle' },
  urn: { fill: '#1e293b', stroke: '#0f172a', w: 12, h: 18, shape: 'rect', rx: 2 },
  cups: { fill: '#fff7ed', stroke: '#c2410c', w: 10, h: 10, shape: 'rect', rx: 1.5 },
  lids: { fill: '#cbd5e1', stroke: '#64748b', w: 10, h: 6, shape: 'rect', rx: 1 },
  milk: { fill: '#f8fafc', stroke: '#94a3b8', w: 8, h: 12, shape: 'rect', rx: 2 },
  sugar: { fill: '#e2e8f0', stroke: '#64748b', w: 8, h: 8, shape: 'rect', rx: 1 },
  stirrers: { fill: '#fdba74', stroke: '#c2410c', w: 8, h: 4, shape: 'rect', rx: 1 },
  pastry: { fill: '#f59e0b', stroke: '#b45309', w: 10, h: 7, shape: 'ellipse' },
  drip: { fill: '#334155', stroke: '#0f172a', w: 22, h: 4, shape: 'rect', rx: 1 },
  fish: { fill: '#38bdf8', stroke: '#0284c7', w: 16, h: 9, shape: 'ellipse' },
  beef: { fill: '#991b1b', stroke: '#7f1d1d', w: 15, h: 11, shape: 'ellipse' },
  rice: { fill: '#f8fafc', stroke: '#cbd5e1', w: 11, h: 11, shape: 'circle' },
  bread: { fill: '#f4d03f', stroke: '#b45309', w: 12, h: 7, shape: 'ellipse' },
  lemon: { fill: '#facc15', stroke: '#ca8a04', w: 6, h: 6, shape: 'circle' },
  fork: { fill: '#cbd5e1', stroke: '#64748b', w: 3, h: 12, shape: 'rect', rx: 1 },
  knife: { fill: '#e2e8f0', stroke: '#64748b', w: 3, h: 12, shape: 'rect', rx: 1 },
  spoon: { fill: '#cbd5e1', stroke: '#64748b', w: 4, h: 11, shape: 'ellipse' },
  tea: { fill: '#0f766e', stroke: '#115e59', w: 10, h: 14, shape: 'rect', rx: 2 },
  water: { fill: '#e0f2fe', stroke: '#0284c7', w: 8, h: 14, shape: 'rect', rx: 2 },
  tongs: { fill: '#94a3b8', stroke: '#475569', w: 14, h: 5, shape: 'rect', rx: 1 },
};

export type ItemGroup = 'plate' | 'table' | 'station';

export const ITEM_LIBRARY: { kind: string; label: string; group: ItemGroup }[] = [
  { kind: 'chicken', label: 'Chicken', group: 'plate' },
  { kind: 'fish', label: 'Fish', group: 'plate' },
  { kind: 'beef', label: 'Beef', group: 'plate' },
  { kind: 'starch', label: 'Potato', group: 'plate' },
  { kind: 'rice', label: 'Rice', group: 'plate' },
  { kind: 'veg', label: 'Vegetables', group: 'plate' },
  { kind: 'sauce', label: 'Sauce', group: 'plate' },
  { kind: 'garnish', label: 'Garnish', group: 'plate' },
  { kind: 'bread', label: 'Bread', group: 'plate' },
  { kind: 'lemon', label: 'Lemon', group: 'plate' },
  { kind: 'setting', label: 'Place setting', group: 'table' },
  { kind: 'charger', label: 'Charger', group: 'table' },
  { kind: 'glass', label: 'Water glass', group: 'table' },
  { kind: 'wine', label: 'Wine glass', group: 'table' },
  { kind: 'napkin', label: 'Napkin', group: 'table' },
  { kind: 'fork', label: 'Fork', group: 'table' },
  { kind: 'knife', label: 'Knife', group: 'table' },
  { kind: 'spoon', label: 'Spoon', group: 'table' },
  { kind: 'centerpiece', label: 'Centerpiece', group: 'table' },
  { kind: 'urn', label: 'Coffee urn', group: 'station' },
  { kind: 'tea', label: 'Tea urn', group: 'station' },
  { kind: 'cups', label: 'Cups', group: 'station' },
  { kind: 'lids', label: 'Lids', group: 'station' },
  { kind: 'milk', label: 'Milk', group: 'station' },
  { kind: 'sugar', label: 'Sugar', group: 'station' },
  { kind: 'stirrers', label: 'Stirrers', group: 'station' },
  { kind: 'water', label: 'Water', group: 'station' },
  { kind: 'pastry', label: 'Pastry', group: 'station' },
  { kind: 'tongs', label: 'Tongs', group: 'station' },
  { kind: 'napkin', label: 'Napkins', group: 'station' },
];

export const styleOf = (kind: string, look?: ItemStyle): ItemStyle =>
  look ?? ITEM_STYLE[kind] ?? { fill: '#6366f1', stroke: '#4338ca', w: 10, h: 10, shape: 'circle' };

export const lookFromColor = (fill: string, shape: ItemStyle['shape']): ItemStyle => {
  const stroke = fill;
  if (shape === 'ellipse') return { fill, stroke, w: 14, h: 10, shape };
  if (shape === 'rect') return { fill, stroke, w: 11, h: 11, shape, rx: 2 };
  return { fill, stroke, w: 11, h: 11, shape: 'circle' };
};

/** A photo piece. Optional aspect (w/h) keeps tall cups / flat forks from sitting in a white box. */
export const lookFromImage = (image: string, shape: ItemStyle['shape'], aspect = 1): ItemStyle => {
  const base = 14;
  const w = aspect >= 1 ? base : Math.max(6, base * aspect);
  const h = aspect >= 1 ? Math.max(6, base / aspect) : base;
  return { fill: 'transparent', w, h, shape: shape === 'ellipse' ? 'ellipse' : 'rect', rx: 1, image };
};

/** Measure a cutout PNG and build a look that hugs the item. */
export function lookFromCutout(image: string, shape: ItemStyle['shape'] = 'rect'): Promise<ItemStyle> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(lookFromImage(image, shape, img.naturalWidth / Math.max(1, img.naturalHeight)));
    img.onerror = () => reject(new Error("That photo couldn't be measured."));
    img.src = image;
  });
}

export const TEMPLATE_STARTERS: Record<string, { kind: string; label: string }[]> = {
  plate: [
    { kind: 'plate', label: 'Plate' },
    { kind: 'chicken', label: 'Chicken' },
    { kind: 'starch', label: 'Starch' },
    { kind: 'veg', label: 'Vegetable' },
    { kind: 'sauce', label: 'Sauce' },
    { kind: 'garnish', label: 'Garnish' },
  ],
  'round-table': [
    { kind: 'table', label: 'Table' },
    { kind: 'cloth', label: 'Cloth' },
    { kind: 'centerpiece', label: 'Centerpiece' },
  ],
  station: [
    { kind: 'drip', label: 'Drip tray' },
    { kind: 'urn', label: 'Coffee urn' },
    { kind: 'cups', label: 'Cups' },
    { kind: 'lids', label: 'Lids' },
    { kind: 'milk', label: 'Milk' },
    { kind: 'sugar', label: 'Sugar' },
    { kind: 'stirrers', label: 'Stirrers' },
    { kind: 'napkin', label: 'Napkins' },
    { kind: 'pastry', label: 'Pastry' },
  ],
};
