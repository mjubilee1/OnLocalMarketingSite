export interface ItemStyle {
  fill: string;
  stroke?: string;
  w: number;
  h: number;
  shape: 'circle' | 'ellipse' | 'rect' | 'diamond';
  rx?: number;
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
};

export const styleOf = (kind: string): ItemStyle =>
  ITEM_STYLE[kind] ?? { fill: '#6366f1', stroke: '#4338ca', w: 10, h: 10, shape: 'circle' };

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
