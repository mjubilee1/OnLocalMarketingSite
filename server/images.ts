/**
 * Course cover photos. AI reads the course and writes photo search queries; the server searches a
 * library whose license allows commercial use, and returns results with the credit each one needs.
 *
 * Providers (first one configured wins), set in .env.local:
 *   Pexels:    PEXELS_API_KEY        (free, https://www.pexels.com/api/)
 *   Unsplash:  UNSPLASH_ACCESS_KEY   (free, https://unsplash.com/developers)
 *   Openverse: no key needed         (Creative Commons images; always the fallback)
 *
 * Google Images is deliberately not used: most results are copyrighted, and scraping it breaks
 * Google's terms.
 */
import { callWithFallback, resolveModels, type AIEvent } from './ai';

export interface ImageEnv {
  PEXELS_API_KEY?: string;
  UNSPLASH_ACCESS_KEY?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODELS?: string;
}

export type ImageProvider = 'pexels' | 'unsplash' | 'openverse';

export interface CoverResult {
  id: string;
  provider: ImageProvider;
  url: string;
  thumb: string;
  alt?: string;
  credit: string;
  creditUrl?: string;
  sourceUrl?: string;
  license?: string;
  /** Unsplash asks apps to ping this when a photo is chosen. */
  track?: string;
}

export const imageProvider = (env: ImageEnv): ImageProvider => (env.PEXELS_API_KEY ? 'pexels' : env.UNSPLASH_ACCESS_KEY ? 'unsplash' : 'openverse');

const str = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);

// ---------- Queries ----------

const QUERY_SCHEMA = {
  type: 'object',
  properties: { queries: { type: 'array', items: { type: 'string' } } },
  required: ['queries'],
  additionalProperties: false,
};

const FILLER = /\b(awareness|essentials|basics|introduction|intro|training|course|policy|your|the|and|for|of|to|at|in|a|us|state|card|law)\b/gi;

/** Used when AI isn't configured or every model is busy. */
function fallbackQueries(title: string, category: string): string[] {
  const core = title.replace(/[&:()/,.-]+/g, ' ').replace(FILLER, ' ').replace(/\s+/g, ' ').trim();
  const out = [core ? `${core} event staff` : '', core, category ? `${category} event crew` : 'event crew working'];
  return [...new Set(out.map((q) => q.trim()).filter(Boolean))].slice(0, 3);
}

const STOP = new Set(['the', 'and', 'with', 'for', 'at', 'in', 'on', 'of', 'a', 'an', 'to', 'event', 'staff']);
const stems = (t: string) =>
  t
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => w.replace(/(ing|ers|er|es|s)$/, ''));

/** Photo libraries rank loosely; prefer photos whose description mentions the query's words. */
function relevance(r: CoverResult, query: string): number {
  const have = new Set(stems(r.alt ?? ''));
  const want = stems(query);
  // The first word carries the subject ("bartender ..."), so it counts double.
  return want.reduce((n, w, i) => n + (have.has(w) ? (i === 0 ? 2 : 1) : 0), 0);
}

const byRelevance = (list: CoverResult[], query: string) =>
  list
    .map((r, i) => ({ r, i, score: relevance(r, query) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.r);

async function aiQueries(env: ImageEnv, course: { title: string; description: string; category: string; lessons: string[]; context: string }, purpose: 'cover' | 'lesson'): Promise<string[] | null> {
  if (!env.OPENROUTER_API_KEY) return null;
  let out: string[] | null = null;
  const emit = (e: AIEvent) => {
    if (e.type === 'done') out = e.data as string[];
  };
  try {
    await callWithFallback({
      key: env.OPENROUTER_API_KEY,
      models: resolveModels(env.OPENROUTER_MODELS),
      system:
        'You pick stock photos for staff training courses at live events (festivals, concerts, stadiums, conferences, galas). Reply with JSON only: {"queries": [...]}.',
      user: `Write 3 stock-photo search queries for ${purpose === 'lesson' ? `a photo illustrating one training card in the course "${str(course.context, 120)}"` : "this course's cover image"}.
Rules: 2-4 words each, most important word first; describe a concrete, photographable scene with people or objects (e.g. "bartender pouring cocktail", "security guard checking bags at festival gate"); no abstract words, no text, logos, brands or named people; the first query is the best match.

${purpose === 'lesson' ? 'Card' : 'Course'}: ${str(course.title, 120)}
Category: ${str(course.category, 60)}
${purpose === 'lesson' ? 'Card text' : 'About'}: ${str(course.description, 400)}
Lessons: ${course.lessons.slice(0, 8).map((l) => str(l, 80)).join('; ')}`,
      maxTokens: 400,
      schema: QUERY_SCHEMA,
      schemaName: 'queries',
      perModelMs: 25_000,
      totalMs: 60_000,
      emit,
      convert: (raw) => {
        const q = (Array.isArray(raw?.queries) ? raw.queries : [])
          .map((x: unknown) => str(x, 60).replace(/["']/g, ''))
          .filter((x: string) => x.split(' ').length <= 8 && x.length >= 3);
        if (!q.length) throw new Error('no queries');
        return q.slice(0, 3);
      },
    });
  } catch {
    return null;
  }
  return out;
}

// ---------- Search ----------

async function getJSON(url: string, headers: Record<string, string> = {}) {
  const r = await fetch(url, { headers: { Accept: 'application/json', ...headers }, signal: AbortSignal.timeout(12_000) });
  if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'image library rejected the API key' : r.status === 429 ? 'image library rate limit reached, try again later' : `image search failed (${r.status})`);
  return r.json() as Promise<any>;
}

async function search(env: ImageEnv, provider: ImageProvider, q: string, n: number): Promise<CoverResult[]> {
  const query = encodeURIComponent(q);
  if (provider === 'pexels') {
    const j = await getJSON(`https://api.pexels.com/v1/search?query=${query}&per_page=${n}&orientation=landscape`, { Authorization: env.PEXELS_API_KEY! });
    return (j.photos ?? []).map((p: any) => ({
      id: `pexels-${p.id}`,
      provider,
      url: p.src?.large ?? p.src?.landscape,
      thumb: p.src?.medium ?? p.src?.small,
      alt: str(p.alt, 160) || undefined,
      credit: `${str(p.photographer, 80)} on Pexels`,
      creditUrl: p.photographer_url,
      sourceUrl: p.url,
      license: 'Pexels License',
    }));
  }
  if (provider === 'unsplash') {
    const j = await getJSON(`https://api.unsplash.com/search/photos?query=${query}&per_page=${n}&orientation=landscape&content_filter=high`, {
      Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
    });
    const utm = '?utm_source=onlocalai&utm_medium=referral';
    return (j.results ?? []).map((p: any) => ({
      id: `unsplash-${p.id}`,
      provider,
      url: `${p.urls?.raw}&w=1080&h=608&fit=crop&auto=format&q=75`,
      thumb: p.urls?.small,
      alt: str(p.alt_description, 160) || undefined,
      credit: `${str(p.user?.name, 80)} on Unsplash`,
      creditUrl: p.user?.links?.html ? p.user.links.html + utm : undefined,
      sourceUrl: p.links?.html ? p.links.html + utm : undefined,
      license: 'Unsplash License',
      track: p.links?.download_location,
    }));
  }
  // Openverse: only licenses that allow commercial use and cropping.
  const j = await getJSON(`https://api.openverse.org/v1/images/?q=${query}&page_size=${n}&license_type=commercial,modification&aspect_ratio=wide&mature=false`, {
    'User-Agent': 'onlocalAI/1.0 (https://onlocalai.com)',
  });
  const licenseName = (l: string, v?: string) => (l === 'cc0' ? 'CC0' : l === 'pdm' ? 'Public domain' : `CC ${l.toUpperCase()}${v ? ` ${v}` : ''}`);
  return (j.results ?? []).map((p: any) => ({
    id: `openverse-${p.id}`,
    provider,
    url: p.thumbnail,
    thumb: p.thumbnail,
    alt: str(p.title, 160) || undefined,
    credit: `${str(p.creator, 80) || 'Unknown'}, ${licenseName(String(p.license ?? ''), p.license_version)}`,
    creditUrl: p.creator_url || undefined,
    sourceUrl: p.foreign_landing_url || undefined,
    license: p.license_url || undefined,
  }));
}

export async function findCovers(env: ImageEnv, body: any): Promise<{ status: number; queries?: string[]; provider?: ImageProvider; results?: CoverResult[]; ai?: boolean; error?: string }> {
  const course = {
    title: str(body?.title, 120),
    description: str(body?.description, 600),
    category: str(body?.category, 60),
    lessons: Array.isArray(body?.lessons) ? body.lessons.slice(0, 12).map((l: unknown) => str(l, 80)) : [],
    context: str(body?.context, 120),
  };
  const purpose = body?.purpose === 'lesson' ? 'lesson' : 'cover';
  const manual = str(body?.query, 80);
  if (!manual && course.title.length < 3) return { status: 400, error: 'Give the course a title first.' };

  let queries: string[];
  let ai = false;
  if (manual) queries = [manual];
  else {
    const fromAI = await aiQueries(env, course, purpose);
    ai = !!fromAI;
    queries = fromAI ?? fallbackQueries(course.title, course.category);
  }

  const provider = imageProvider(env);
  const per = manual ? 12 : 6;
  const seen = new Set<string>();
  const results: CoverResult[] = [];
  let lastError = '';
  let calls = 0;
  const MAX_CALLS = 7; // stay well inside free-tier rate limits
  for (const q of queries) {
    // Openverse matches every word, so a specific query can return nothing: widen it by dropping
    // words from the end ("bartender checking customer ID" → "bartender checking" → "bartender").
    const words = q.split(/\s+/);
    for (let len = words.length; len >= 1 && calls < MAX_CALLS; len--) {
      const before = results.length;
      calls++;
      try {
        for (const r of byRelevance(await search(env, provider, words.slice(0, len).join(' '), per), q)) {
          if (!r.url || !r.thumb || seen.has(r.id)) continue;
          seen.add(r.id);
          results.push(r);
        }
      } catch (e) {
        lastError = (e as Error).message;
        break;
      }
      if (results.length > before) break;
    }
    if (results.length >= 12 || calls >= MAX_CALLS) break;
  }
  if (!results.length && lastError) return { status: 502, queries, provider, error: lastError };
  return { status: 200, queries, provider, results: results.slice(0, 12), ai };
}

// ---------- Photos for lesson cards ----------

const LESSON_QUERY_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, query: { type: 'string' } }, required: ['id', 'query'], additionalProperties: false },
    },
  },
  required: ['items'],
  additionalProperties: false,
};

/** One AI call writes a photo search for every card, so a whole course costs one model request. */
async function aiLessonQueries(env: ImageEnv, course: { title: string; category: string }, lessons: { id: string; title: string; body: string }[]): Promise<Map<string, string> | null> {
  if (!env.OPENROUTER_API_KEY) return null;
  let out: Map<string, string> | null = null;
  try {
    await callWithFallback({
      key: env.OPENROUTER_API_KEY,
      models: resolveModels(env.OPENROUTER_MODELS),
      system: 'You pick stock photos to illustrate staff training cards for live events. Reply with JSON only: {"items": [{"id": "...", "query": "..."}]}.',
      user: `For each training card below, write ONE stock-photo search query that illustrates it.
Rules: 2-4 words, most important word first; a concrete, photographable scene with people or objects that matches the card's point (e.g. "bartender checking ID", "first aid kit", "crowd at festival gate"); no abstract words, text, logos, brands or named people; different cards should get different queries. Use the exact ids given.

Course: ${str(course.title, 120)} (${str(course.category, 60)})

${lessons.map((l) => `id: ${l.id}\ntitle: ${l.title}\ntext: ${l.body}`).join('\n\n')}`,
      maxTokens: 900,
      schema: LESSON_QUERY_SCHEMA,
      schemaName: 'lesson_queries',
      perModelMs: 30_000,
      totalMs: 75_000,
      emit: (e) => {
        if (e.type === 'done') out = e.data as Map<string, string>;
      },
      convert: (raw) => {
        const m = new Map<string, string>();
        for (const it of Array.isArray(raw?.items) ? raw.items : []) {
          const id = str(it?.id, 64);
          const q = str(it?.query, 60).replace(/["']/g, '');
          if (lessons.some((l) => l.id === id) && q.length >= 3) m.set(id, q);
        }
        if (!m.size) throw new Error('no queries');
        return m;
      },
    });
  } catch {
    return null;
  }
  return out;
}

export async function findLessonImages(env: ImageEnv, body: any): Promise<{ status: number; images?: Record<string, CoverResult>; queries?: Record<string, string>; error?: string }> {
  const course = { title: str(body?.course?.title, 120), category: str(body?.course?.category, 60) };
  const lessons = (Array.isArray(body?.lessons) ? body.lessons : [])
    .slice(0, 15)
    .map((l: any) => ({ id: str(l?.id, 64), title: str(l?.title, 100), body: str(l?.body, 240) }))
    .filter((l: { id: string; title: string }) => l.id && l.title);
  if (!lessons.length) return { status: 400, error: 'No cards to illustrate.' };

  const fromAI = await aiLessonQueries(env, course, lessons);
  const provider = imageProvider(env);
  const used = new Set<string>(Array.isArray(body?.exclude) ? body.exclude.map((x: unknown) => str(x, 200)) : []);
  const images: Record<string, CoverResult> = {};
  const queries: Record<string, string> = {};
  let lastError = '';

  for (const l of lessons) {
    const q = fromAI?.get(l.id) ?? (fallbackQueries(l.title, course.category)[0] || course.title);
    queries[l.id] = q;
    // Prefer a photo that shows the query's subject (its first word). If the full query has none,
    // retry with the subject alone, then settle for the best match seen. At most 2 searches a card.
    const words = q.split(/\s+/);
    const subject = stems(words[0] ?? '')[0];
    const shows = (r: CoverResult) => !subject || stems(r.alt ?? '').includes(subject);
    let fallback: CoverResult | undefined;
    for (const attempt of [...new Set([q, words[0] ?? q])]) {
      try {
        const ranked = byRelevance(await search(env, provider, attempt, 12), `${q} ${l.title}`).filter((r) => r.url && r.thumb && !used.has(r.url));
        fallback ??= ranked[0];
        const hit = ranked.find(shows);
        if (hit) {
          images[l.id] = hit;
          break;
        }
      } catch (e) {
        lastError = (e as Error).message;
        break;
      }
    }
    images[l.id] ??= fallback!;
    if (images[l.id]) used.add(images[l.id]!.url);
    else delete images[l.id];
    // A rate limit or bad key won't fix itself on the next card.
    if (/rate limit|rejected/.test(lastError)) break;
  }
  if (!Object.keys(images).length && lastError) return { status: 502, queries, error: lastError };
  return { status: 200, images, queries, ...(lastError ? { error: lastError } : {}) };
}

/** Unsplash API guideline: report when a photo is used. Only Unsplash's own URL is accepted. */
export async function trackCover(env: ImageEnv, body: any) {
  const url = str(body?.track, 500);
  if (!env.UNSPLASH_ACCESS_KEY || !/^https:\/\/api\.unsplash\.com\/photos\/[\w-]+\/download(\?|$)/.test(url)) return;
  await fetch(url, { headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` }, signal: AbortSignal.timeout(8000) }).catch(() => {});
}
