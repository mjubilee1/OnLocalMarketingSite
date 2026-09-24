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

/**
 * Center-crops and shrinks a photo to a small square JPEG data URL (~10–20 KB), so it can be stored
 * with the crew profile. Throws a readable error for anything that isn't a usable image.
 */
export async function resizePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo (JPG, PNG or HEIC).');
  if (file.size > MAX_INPUT_BYTES) throw new Error('That photo is too large. Choose one under 15 MB.');
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("That photo couldn't be read. Try a JPG or PNG.");
  }
  const side = Math.min(bmp.width, bmp.height);
  if (side < 64) throw new Error('That photo is too small. Use one at least 64 pixels wide.');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bmp.close();
  return canvas.toDataURL('image/jpeg', 0.82);
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
