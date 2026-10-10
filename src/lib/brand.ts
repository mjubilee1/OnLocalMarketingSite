/** Turns a company's colors into the indigo/violet scales the rest of the UI already uses. */

export const DEFAULT_PRIMARY = '#4f46e5';
export const DEFAULT_ACCENT = '#7c3aed';

export const BRAND_PRESETS: { name: string; primary: string; accent: string }[] = [
  { name: 'Indigo', primary: '#4f46e5', accent: '#7c3aed' },
  { name: 'Navy', primary: '#01175e', accent: '#2563eb' },
  { name: 'Ocean', primary: '#0369a1', accent: '#0d9488' },
  { name: 'Forest', primary: '#047857', accent: '#65a30d' },
  { name: 'Crimson', primary: '#be123c', accent: '#c2410c' },
  { name: 'Plum', primary: '#7e22ce', accent: '#db2777' },
  { name: 'Slate', primary: '#334155', accent: '#0f766e' },
  { name: 'Amber', primary: '#b45309', accent: '#ea580c' },
];

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
type Shade = (typeof SHADES)[number];
type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];
const INK: RGB = [2, 6, 23];

export interface BrandPalette {
  /** Button color. Deepened when the chosen color would hide white text. */
  primary: string;
  accent: string;
  ink: string;
  picked: string;
  adjusted: boolean;
  indigo: Record<Shade, string>;
  violet: Record<Shade, string>;
}

export function normalizeHex(input: string | undefined): string | null {
  const s = String(input ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) return '#' + [...s].map((c) => c + c).join('').toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s.toLowerCase();
  return null;
}

function parse(input: string): RGB | null {
  const hex = normalizeHex(input);
  if (!hex) return null;
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hex(rgb: RGB): string {
  return '#' + rgb.map((n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')).join('');
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function luminance(rgb: RGB): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

/** Darken until white text clears WCAG AA, so a pale brand color still works on buttons. */
function readable(rgb: RGB): RGB {
  let cur = rgb;
  for (let i = 0; i < 14 && (1.05) / (luminance(cur) + 0.05) < 4.5; i++) cur = mix(cur, INK, 0.14);
  return cur;
}

function scale(base: RGB): Record<Shade, string> {
  const button = readable(base);
  const light: [Shade, number][] = [
    ['50', 0.92],
    ['100', 0.84],
    ['200', 0.7],
    ['300', 0.52],
    ['400', 0.3],
    ['500', 0.14],
  ];
  const dark: [Shade, number][] = [
    ['700', 0.16],
    ['800', 0.32],
    ['900', 0.5],
    ['950', 0.66],
  ];
  const out = {} as Record<Shade, string>;
  for (const [k, t] of light) out[k] = hex(mix(base, WHITE, t));
  out['600'] = hex(button);
  for (const [k, t] of dark) out[k] = hex(mix(button, INK, t));
  return out;
}

export function brandPalette(primary: string, accent: string): BrandPalette {
  const base = parse(primary) ?? parse(DEFAULT_PRIMARY)!;
  const alt = parse(accent) ?? parse(DEFAULT_ACCENT)!;
  const indigo = scale(base);
  const violet = scale(alt);
  const picked = hex(base);
  return {
    primary: indigo['600'],
    accent: violet['600'],
    ink: hex(mix(readable(base), INK, 0.78)),
    picked,
    adjusted: indigo['600'] !== picked,
    indigo,
    violet,
  };
}

/** Writes the palette onto the document so every existing indigo/violet class follows the brand. */
export function applyBrand(p: BrandPalette) {
  const root = document.documentElement;
  root.style.setProperty('--brand', p.primary);
  root.style.setProperty('--brand-accent', p.accent);
  root.style.setProperty('--brand-ink', p.ink);
  for (const shade of SHADES) {
    root.style.setProperty(`--color-indigo-${shade}`, p.indigo[shade]);
    root.style.setProperty(`--color-violet-${shade}`, p.violet[shade]);
  }
}

/** Fit a logo into a small PNG (or keep a plain SVG) so it can live with the company profile. */
export async function resizeLogo(file: File): Promise<string> {
  if (file.type === 'image/svg+xml') {
    if (file.size > 300_000) throw new Error('That logo is too large. Use one under 300 KB.');
    const text = await file.text();
    if (/<script/i.test(text)) throw new Error("That SVG isn't a plain logo. Export it without scripts.");
    return `data:image/svg+xml,${encodeURIComponent(text)}`;
  }
  if (!file.type.startsWith('image/')) throw new Error('Choose a PNG, JPG, or SVG logo.');
  if (file.size > 15 * 1024 * 1024) throw new Error('That file is too large. Choose one under 15 MB.');
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("That image couldn't be read. Try a PNG or JPG.");
  }
  const scale = Math.min(480 / bmp.width, 160 / bmp.height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas.toDataURL('image/png');
}
