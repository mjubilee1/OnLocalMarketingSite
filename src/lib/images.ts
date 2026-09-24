import { useStore } from '../store';
import type { Course, CoverImage, Lesson } from '../types';

export interface CoverResult extends CoverImage {
  id: string;
  track?: string;
}

export interface CoverSearch {
  queries: string[];
  provider: CoverImage['provider'];
  results: CoverResult[];
  ai: boolean;
}

export const PROVIDER_NAME: Record<CoverImage['provider'], string> = { pexels: 'Pexels', unsplash: 'Unsplash', openverse: 'Openverse' };

/** What a photo search is about: a whole course (its cover) or one card inside it. */
export interface PhotoSubject {
  title: string;
  description: string;
  category: string;
  lessons: string[];
  /** For a card: the course it belongs to. */
  context?: string;
  purpose: 'cover' | 'lesson';
}

export const courseSubject = (c: Pick<Course, 'title' | 'description' | 'category' | 'lessons'>): PhotoSubject => ({
  title: c.title,
  description: c.description,
  category: c.category,
  lessons: c.lessons.map((l) => l.title),
  purpose: 'cover',
});

export const lessonSubject = (c: Pick<Course, 'title' | 'category'>, l: Lesson): PhotoSubject => ({
  title: l.title,
  description: plain(l.body ?? '').slice(0, 400),
  category: c.category,
  lessons: [],
  context: c.title,
  purpose: 'lesson',
});

/** Lesson markup to plain text, for prompts. */
const plain = (t: string) => t.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').replace(/^- /gm, '').replace(/\s+/g, ' ').trim();

/** AI picks search terms from the subject, the server searches a commercially licensed photo library. */
export async function findCovers(subject: PhotoSubject, query?: string, signal?: AbortSignal): Promise<CoverSearch> {
  const res = await fetch('/api/images/cover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...subject, query }),
    signal,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || `Image search failed (${res.status})`);
  return j as CoverSearch;
}

/**
 * Give a course the top AI-matched photo, in the background. Leaves it alone if it gets a cover
 * in the meantime (or was deleted). Returns whether a cover was added.
 */
export async function autoCover(courseId: string, signal?: AbortSignal): Promise<boolean> {
  const course = useStore.getState().courses.find((c) => c.id === courseId);
  if (!course || course.cover) return false;
  const { results } = await findCovers(courseSubject(course), undefined, signal);
  const latest = useStore.getState().courses.find((c) => c.id === courseId);
  if (!results[0] || !latest || latest.cover) return false;
  useStore.getState().upsertCourse({ ...latest, cover: toCover(results[0]) });
  return true;
}

/** Cards that can show a photo. Videos have their own picture and quizzes stay uncluttered. */
export const needsImage = (l: Lesson) => l.kind === 'card' && !l.image;

/** One request for every card: a single AI call writes all the searches, then one photo per card. */
export async function findLessonImages(c: Pick<Course, 'title' | 'category' | 'lessons' | 'cover'>, lessons: Lesson[], signal?: AbortSignal): Promise<{ images: Record<string, CoverImage>; error?: string }> {
  const exclude = [c.cover?.url, ...c.lessons.map((l) => l.image?.url)].filter(Boolean);
  const res = await fetch('/api/images/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course: { title: c.title, category: c.category }, lessons: lessons.map((l) => ({ id: l.id, title: l.title, body: plain(l.body ?? '').slice(0, 240) })), exclude }),
    signal,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || `Image search failed (${res.status})`);
  const images: Record<string, CoverImage> = {};
  for (const [id, r] of Object.entries((j.images ?? {}) as Record<string, CoverResult>)) images[id] = toCover(r);
  return { images, error: j.error };
}

/** Photos for the cards of a saved course that don't have one yet. Returns how many were added. */
export async function autoLessonImages(courseId: string, signal?: AbortSignal): Promise<number> {
  const course = useStore.getState().courses.find((c) => c.id === courseId);
  const todo = course?.lessons.filter(needsImage) ?? [];
  if (!course || !todo.length) return 0;
  const { images, error } = await findLessonImages(course, todo, signal);
  const latest = useStore.getState().courses.find((c) => c.id === courseId);
  if (!latest) return 0;
  let n = 0;
  const lessons = latest.lessons.map((l) => (needsImage(l) && images[l.id] ? (n++, { ...l, image: images[l.id] }) : l));
  if (n) useStore.getState().upsertCourse({ ...latest, lessons });
  if (!n && error) throw new Error(error);
  return n;
}

let queue: Promise<unknown> = Promise.resolve();
/** Background photos (cover, then cards) for newly added courses, one course at a time so free rate limits aren't hit. */
export function queueAutoCover(courseId: string) {
  queue = queue.then(async () => {
    await autoCover(courseId).catch(() => false);
    await autoLessonImages(courseId).catch(() => 0);
  });
}

/** Strip search-only fields and report the choice (Unsplash's API guidelines ask for this). */
export function toCover(r: CoverResult): CoverImage {
  if (r.track) fetch('/api/images/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ track: r.track }) }).catch(() => {});
  const { id: _id, track: _t, ...cover } = r;
  return cover;
}
