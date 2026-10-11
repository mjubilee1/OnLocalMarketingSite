import type { Staff } from '../types';

/** 10–15 digits once spaces, dashes, brackets and the leading + are ignored. */
export const phoneOk = (p: string | undefined) => {
  const digits = (p ?? '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && /^[\d\s()+.-]+$/.test((p ?? '').trim());
};

/** Crew need a photo (so supervisors can recognise them at check-in) and a mobile number before they can work. */
export const profileMissing = (s: Pick<Staff, 'phone' | 'photo'>) => [!s.photo && 'photo', !phoneOk(s.phone) && 'mobile number'].filter(Boolean) as string[];
export const profileComplete = (s: Pick<Staff, 'phone' | 'photo'>) => profileMissing(s).length === 0;

const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const SIZE = 256;

async function readImageBitmap(file: File): Promise<ImageBitmap> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo (JPG, PNG or HEIC).');
  if (file.size > MAX_INPUT_BYTES) throw new Error('That photo is too large. Choose one under 15 MB.');
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error("That photo couldn't be read. Try a JPG or PNG.");
  }
}

/**
 * Center-crops and shrinks a photo to a small square JPEG data URL (~10–20 KB), so it can be stored
 * with the crew profile. Throws a readable error for anything that isn't a usable image.
 */
export async function resizePhoto(file: File): Promise<string> {
  const bmp = await readImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  if (side < 64) {
    bmp.close();
    throw new Error('That photo is too small. Use one at least 64 pixels wide.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bmp.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

/**
 * Fits any photo into a square for the training board — whole item visible, padded, no manual crop.
 * White padding keeps pack shots / phone photos readable inside round or box shapes.
 */
export async function fitBoardPhoto(file: File, size = 320): Promise<string> {
  const bmp = await readImageBitmap(file);
  try {
    return await cutoutFromBitmap(bmp, size);
  } finally {
    bmp.close();
  }
}

/** Re-run cutout on an already-saved library photo (data URL). */
export async function cutoutBoardDataUrl(src: string, size = 320): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(blob);
  } catch {
    throw new Error("That photo couldn't be cleaned. Try uploading again.");
  }
  try {
    return await cutoutFromBitmap(bmp, size);
  } finally {
    bmp.close();
  }
}

/**
 * Magic-eraser style: knock out empty / near-white backdrop connected to the edges,
 * then crop tight to the item (transparent PNG, no leftover white box).
 */
async function cutoutFromBitmap(bmp: ImageBitmap, size: number): Promise<string> {
  if (Math.min(bmp.width, bmp.height) < 48) {
    throw new Error('That photo is too small. Use one at least 48 pixels wide.');
  }

  const maxEdge = 720;
  const scaleDown = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scaleDown));
  const h = Math.max(1, Math.round(bmp.height * scaleDown));
  const work = document.createElement('canvas');
  work.width = w;
  work.height = h;
  const wctx = work.getContext('2d', { willReadFrequently: true })!;
  wctx.drawImage(bmp, 0, 0, w, h);

  const img = wctx.getImageData(0, 0, w, h);
  const { data } = img;
  const bg = sampleEdgeBackground(data, w, h);
  eraseEdgeBackground(data, w, h, bg);
  // Second pass catches leftover pale fringe after the flood fill.
  erasePaleFringe(data, w, h, bg);
  wctx.putImageData(img, 0, 0);

  const box = opaqueBounds(data, w, h);
  if (!box) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    const s = Math.min(size / bmp.width, size / bmp.height);
    const dw = bmp.width * s;
    const dh = bmp.height * s;
    ctx.drawImage(bmp, (size - dw) / 2, (size - dh) / 2, dw, dh);
    return canvas.toDataURL('image/jpeg', 0.88);
  }

  const pad = Math.max(2, Math.round(Math.max(box.w, box.h) * 0.02));
  const sx = Math.max(0, box.x - pad);
  const sy = Math.max(0, box.y - pad);
  const sw = Math.min(w - sx, box.w + pad * 2);
  const sh = Math.min(h - sy, box.h + pad * 2);
  const aspect = sw / sh;
  const canvas = document.createElement('canvas');
  if (aspect >= 1) {
    canvas.width = size;
    canvas.height = Math.max(1, Math.round(size / aspect));
  } else {
    canvas.height = size;
    canvas.width = Math.max(1, Math.round(size * aspect));
  }
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(work, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

type Rgb = { r: number; g: number; b: number };

function sampleEdgeBackground(data: Uint8ClampedArray, w: number, h: number): Rgb {
  const pts = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
    [Math.floor(w / 2), h - 1],
    [0, Math.floor(h / 2)],
    [w - 1, Math.floor(h / 2)],
  ] as const;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const n = pts.length;
  return { r: r / n, g: g / n, b: b / n };
}

function nearBg(r: number, g: number, b: number, a: number, bg: Rgb): boolean {
  if (a < 28) return true;
  const dr = r - bg.r;
  const dg = g - bg.g;
  const db = b - bg.b;
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  // Empty studio / paper backdrop, or close to the sampled edge color.
  if (lum > 220 && sat < 36) return true;
  if (dist < 52 && lum > 190) return true;
  if (dist < 34) return true;
  return false;
}

/** Clear leftover pale pixels next to already-cleared ones (tightens the crop). */
function erasePaleFringe(data: Uint8ClampedArray, w: number, h: number, bg: Rgb) {
  for (let pass = 0; pass < 2; pass++) {
    const kill: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const p = i * 4;
        if (data[p + 3] === 0) continue;
        const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
        const sat = Math.max(data[p], data[p + 1], data[p + 2]) - Math.min(data[p], data[p + 1], data[p + 2]);
        if (!(lum > 210 && sat < 40) && !nearBg(data[p], data[p + 1], data[p + 2], data[p + 3], bg)) continue;
        let clear = 0;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [-1, -1],
          [1, -1],
          [-1, 1],
        ] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || data[(ny * w + nx) * 4 + 3] === 0) clear += 1;
        }
        if (clear >= 2) kill.push(p);
      }
    }
    for (const p of kill) data[p + 3] = 0;
  }
}

function eraseEdgeBackground(data: Uint8ClampedArray, w: number, h: number, bg: Rgb) {
  const seen = new Uint8Array(w * h);
  const queue: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    const p = i * 4;
    if (!nearBg(data[p], data[p + 1], data[p + 2], data[p + 3], bg)) return;
    seen[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (queue.length) {
    const i = queue.pop()!;
    const p = i * 4;
    data[p + 3] = 0;
    const x = i % w;
    const y = (i / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Soften hard cut edges a touch.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const p = i * 4;
      if (data[p + 3] === 0) continue;
      if (!nearBg(data[p], data[p + 1], data[p + 2], data[p + 3], bg)) continue;
      let clear = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        if (data[((y + dy) * w + (x + dx)) * 4 + 3] === 0) clear += 1;
      }
      if (clear >= 2) data[p + 3] = 0;
    }
  }
}

function opaqueBounds(data: Uint8ClampedArray, w: number, h: number) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Fictional US number in the 555-0100–0199 range reserved for fiction. */
export const demoPhone = (idx: number) => `+1 415 555 01${String(10 + (idx % 90)).padStart(2, '0')}`;

const DEMO_BG = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#f97316'];

/** Illustrated head-and-shoulders placeholder for the demo crew (they're fictional, so no real photos). */
export function demoPhoto(seed: string): string {
  const i = [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const bg = DEMO_BG[i % DEMO_BG.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".9"/><path d="M12 64c1-12 9-19 20-19s19 7 20 19z" fill="#fff" fill-opacity=".9"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
