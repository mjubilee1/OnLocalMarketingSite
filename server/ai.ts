/**
 * AI training-material generation via OpenRouter free models.
 *
 * Runs server-side only (the API key must never reach the browser). Framework-agnostic:
 * `handleAI` takes a parsed body and an `emit` callback, so it can sit behind the Vite dev
 * middleware today and a serverless function in production.
 *
 * Free models are frequently rate-limited upstream, so every request walks an ordered
 * fallback list until one returns valid, well-formed content.
 */
import { randomUUID } from 'node:crypto';
import type { Course, Lesson, Question } from '../src/types';

// ---------- Models ----------

export interface ModelSpec {
  id: string;
  label: string;
  /** Provider-enforced JSON schema. Some models loop when forced, so it's per-model. */
  schema?: boolean;
  jsonMode?: boolean;
  lowReasoning?: boolean;
}

/**
 * Ordered by benchmarked quality × speed on the course-generation task (Sep 2026):
 * Nex Mini wrote the most practical content fastest; Nemotron Super is a strong second.
 * Override with OPENROUTER_MODELS="id1,id2" when the free lineup changes.
 */
export const DEFAULT_MODELS: ModelSpec[] = [
  { id: 'nex-agi/nex-n2.5-mini:free', label: 'Nex N2.5 Mini', schema: true, lowReasoning: true },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super 120B', lowReasoning: true },
  { id: 'qwen/qwen3.8-27b:free', label: 'Qwen 3.8 27B', schema: true, lowReasoning: true },
  { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B', jsonMode: true },
  { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots 3 Note', schema: true, lowReasoning: true },
  { id: 'openrouter/free', label: 'OpenRouter free router', jsonMode: true },
];

export function resolveModels(override?: string): ModelSpec[] {
  if (!override?.trim()) return DEFAULT_MODELS;
  return override
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => DEFAULT_MODELS.find((m) => m.id === id) ?? { id, label: id });
}

// ---------- Events streamed back to the client ----------

export type AIEvent =
  | { type: 'attempt'; label: string; n: number; of: number }
  | { type: 'failed'; label: string; reason: string }
  | { type: 'done'; label: string; seconds: number; data: unknown }
  | { type: 'error'; message: string };

// ---------- Requests ----------

export interface CourseRequest {
  request: string;
  roles?: string[];
  source?: string;
  cards?: number;
  questions?: number;
  language?: string;
  orgName?: string;
  categories?: string[];
}

export interface LessonRequest {
  mode: 'new' | 'rewrite';
  kind: 'card' | 'quiz';
  instruction?: string;
  language?: string;
  orgName?: string;
  course: { title: string; description: string; lessons: { title: string; kind: string; body?: string }[] };
  lesson?: Lesson;
}

const clampInt = (v: unknown, min: number, max: number, dflt: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt;
};
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// ---------- Prompts ----------

const STYLE = `STYLE
- Readers are casual event crew reading on a phone between shifts. Plain words (reading age ~12), second person, practical and concrete. No fluff, no filler intros.
- One idea per card, 50-110 words.
- Card body markup: put each "- " bullet on its OWN line; blank line between a paragraph and a list; **bold** the key action; optional "## " subheading that does NOT repeat the card title.
- Quizzes: realistic on-shift scenarios, 3-4 options, exactly one correct, plausible wrong options, vary the correct position, one-sentence explanation.
- Never invent specific laws, legal limits, fines or phone numbers. If needed use placeholders like [venue emergency number] or [your supervisor].`;

const LESSON_SHAPE = `{"kind":"card"|"quiz","title":string,"body":string,"questions":[{"prompt":string,"options":string[],"correct":number,"explanation":string}]}
(for a card: questions = []; for a quiz: body = "" ; "correct" is the 0-based index)`;

function coursePrompt(r: CourseRequest) {
  const cards = clampInt(r.cards, 2, 10, 5);
  const qs = clampInt(r.questions, 1, 10, 4);
  const lang = str(r.language, 30) || 'English';
  const system = `You are an instructional designer for ${str(r.orgName, 80) || 'an event staffing company'}. You create short, mobile-first microlearning courses for event crew.

${STYLE}
- Write everything in ${lang}.

OUTPUT: ONLY a JSON object, no markdown fences, no commentary:
{"title":string,"description":string (one sentence),"emoji":string (one emoji),"category":string,"lessons":[lesson,...]}
where each lesson is ${LESSON_SHAPE}`;

  const parts = [
    `Request from the crew manager: ${str(r.request, 2000)}`,
    r.roles?.length ? `Audience roles: ${r.roles.map((x) => str(x, 60)).join(', ')}` : '',
    `Structure: exactly ${cards} card lessons, then exactly ONE quiz lesson with ${qs} questions.`,
    r.categories?.length ? `Category: prefer one of ${r.categories.map((x) => str(x, 40)).join(', ')} (or a short new one).` : '',
    r.source?.trim()
      ? `SOURCE MATERIAL — base the course on this and never contradict it:\n<<<\n${str(r.source, 20000)}\n>>>`
      : '',
  ];
  return { system, user: parts.filter(Boolean).join('\n\n'), maxTokens: 12000 };
}

function lessonPrompt(r: LessonRequest) {
  const lang = str(r.language, 30) || 'English';
  const system = `You are an instructional designer for ${str(r.orgName, 80) || 'an event staffing company'}, editing a mobile microlearning course for event crew.

${STYLE}
- Write in ${lang}.

OUTPUT: ONLY one lesson as a JSON object, no markdown fences: ${LESSON_SHAPE}`;

  const ctx = r.course.lessons
    .filter((l) => l.kind !== 'quiz')
    .map((l) => `### ${str(l.title, 120)}\n${str(l.body, 700)}`)
    .join('\n\n')
    .slice(0, 8000);
  const instruction = str(r.instruction, 1500);
  let task: string;
  if (r.mode === 'rewrite' && r.lesson) {
    task = `Rewrite this ${r.lesson.kind} lesson. Keep "kind" as "${r.lesson.kind}". Instruction: ${instruction || 'improve clarity'}\n\nCurrent lesson JSON:\n${JSON.stringify(
      { kind: r.lesson.kind, title: r.lesson.title, body: r.lesson.body ?? '', questions: r.lesson.questions ?? [] },
    ).slice(0, 6000)}`;
  } else if (r.kind === 'quiz') {
    task = `Write ONE new quiz lesson (kind "quiz") with 4 questions${instruction ? `. Focus: ${instruction}` : ' testing the most important points of the cards above'}.`;
  } else {
    task = `Write ONE new card lesson (kind "card") covering: ${instruction || 'the next logical topic for this course'}. Don't repeat what existing cards already say.`;
  }
  const user = `Course: ${str(r.course.title, 120)} — ${str(r.course.description, 300)}\n\nExisting cards:\n${ctx || '(none yet)'}\n\nTASK: ${task}`;
  return { system, user, maxTokens: 6000 };
}

// ---------- JSON schemas for providers that enforce them ----------

const LESSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'title', 'body', 'questions'],
  properties: {
    kind: { type: 'string', enum: ['card', 'quiz'] },
    title: { type: 'string' },
    body: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['prompt', 'options', 'correct', 'explanation'],
        properties: { prompt: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, correct: { type: 'integer' }, explanation: { type: 'string' } },
      },
    },
  },
};
const COURSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'emoji', 'category', 'lessons'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    emoji: { type: 'string' },
    category: { type: 'string' },
    lessons: { type: 'array', items: LESSON_SCHEMA },
  },
};

// ---------- JSON extraction & repair ----------

/** Best-effort repair of near-valid model JSON: fences, raw newlines in strings, missing/mismatched closers. */
export function repairJSON(text: string): string {
  let t = text.replace(/```(?:json)?/gi, '');
  const start = t.indexOf('{');
  if (start === -1) return t;
  t = t.slice(start);
  let out = '';
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (const ch of t) {
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      else if (ch === '\n') {
        out += '\\n';
        continue;
      } else if (ch === '\r' || ch === '\t') {
        out += ch === '\t' ? '\\t' : '';
        continue;
      }
      out += ch;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
    else if (ch === '}' || ch === ']') {
      // Close anything the model forgot before this closer.
      while (stack.length && stack[stack.length - 1] !== ch) out += stack.pop();
      stack.pop();
      out += ch;
      if (!stack.length) return out; // ignore trailing commentary
      continue;
    }
    out += ch;
  }
  if (inStr) out += '"';
  out = out.replace(/,\s*$/, '');
  while (stack.length) out += stack.pop();
  return out.replace(/,\s*([}\]])/g, '$1');
}

export function parseModelJSON(text: string): any {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      /* fall through to repair */
    }
  }
  return JSON.parse(repairJSON(text));
}

// ---------- Normalisation into app types ----------

const id = (p: string) => p + randomUUID().replace(/-/g, '').slice(0, 10);
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Fix the markup quirks free models produce so RichText renders cleanly. */
export function cleanBody(raw: string, title: string): string {
  let b = String(raw ?? '').replace(/\r/g, '').replace(/\\n/g, '\n');
  // Bullets crammed onto one line: "…gently. - **Do this**: … - **Then**". Needs 2+ so a lone dash in prose survives.
  const inline = /[ \t]+[-•][ \t]+(?=\*\*|\p{Lu})/gu;
  b = b
    .split('\n')
    .map((l) => ((l.match(inline)?.length ?? 0) >= 2 ? l.replace(inline, '\n- ') : l))
    .join('\n');
  const lines = b.split('\n').map((l) =>
    l
      .replace(/^\s*(?:[•*]|\d+[.)])\s+/, '- ')
      .replace(/^\s*-\s+/, '- ')
      .replace(/^#{1,6}\s+/, '## ')
      .trimEnd(),
  );
  // Drop a leading heading that just repeats the card title.
  while (lines.length && !lines[0]!.trim()) lines.shift();
  const first = lines[0]?.replace(/^## /, '').replace(/^\*\*(.*)\*\*$/, '$1') ?? '';
  if (lines.length > 1 && norm(first) === norm(title)) lines.shift();
  // Blank line between prose and lists so each renders as its own block.
  const out: string[] = [];
  let prevKind: 'bullet' | 'text' | 'blank' = 'blank';
  for (const l of lines) {
    const kind = !l.trim() ? 'blank' : l.startsWith('- ') ? 'bullet' : 'text';
    if (kind !== 'blank' && prevKind !== 'blank' && kind !== prevKind) out.push('');
    if (kind === 'text' && prevKind === 'text' && l.startsWith('## ')) out.push('');
    out.push(l);
    prevKind = kind;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function toQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((q: any) => {
      const options = Array.isArray(q?.options) ? q.options.map((o: unknown) => String(o).trim()).filter(Boolean).slice(0, 5) : [];
      let correct = Math.round(Number(q?.correct));
      // Some models answer with the option text or a 1-based index.
      if (!Number.isFinite(correct) && typeof q?.correct === 'string') correct = options.indexOf(q.correct.trim());
      return { id: id('q'), prompt: String(q?.prompt ?? '').trim(), options, correct, explanation: String(q?.explanation ?? '').trim() || undefined };
    })
    .filter((q) => q.prompt && q.options.length >= 2 && q.correct >= 0 && q.correct < q.options.length);
}

export function toLesson(raw: any): Lesson | null {
  const title = String(raw?.title ?? '').trim().slice(0, 100);
  if (raw?.kind === 'quiz' || (Array.isArray(raw?.questions) && raw.questions.length && !String(raw?.body ?? '').trim())) {
    const questions = toQuestions(raw?.questions);
    return questions.length ? { id: id('l'), kind: 'quiz', title: title || 'Quick check', questions } : null;
  }
  const body = cleanBody(raw?.body ?? '', title);
  return body ? { id: id('l'), kind: 'card', title: title || 'Untitled card', body } : null;
}

const firstEmoji = (s: unknown) => {
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const { segment } of seg.segment(String(s ?? ''))) if (/\p{Extended_Pictographic}/u.test(segment)) return segment;
  return '📘';
};

export function toCourse(raw: any): Course {
  const lessons = (Array.isArray(raw?.lessons) ? raw.lessons : []).map(toLesson).filter(Boolean) as Lesson[];
  const cards = lessons.filter((l) => l.kind === 'card');
  if (cards.length < 2) throw new Error('too few usable cards');
  const words = cards.reduce((a, l) => a + (l.body ?? '').split(/\s+/).length, 0);
  const qCount = lessons.reduce((a, l) => a + (l.questions?.length ?? 0), 0);
  const estMinutes = Math.max(2, Math.round(words / 130 + qCount * 0.4));
  return {
    id: id('c-'),
    title: String(raw?.title ?? '').trim().slice(0, 80) || 'New course',
    description: String(raw?.description ?? '').trim().slice(0, 240),
    category: String(raw?.category ?? '').trim().slice(0, 40) || 'General',
    emoji: firstEmoji(raw?.emoji),
    estMinutes,
    passingScore: 80,
    points: estMinutes * 10,
    published: false,
    // Quizzes last, whatever order the model used.
    lessons: [...cards, ...lessons.filter((l) => l.kind === 'quiz')],
  };
}

// ---------- OpenRouter with fallback ----------

interface CallOpts {
  key: string;
  models: ModelSpec[];
  system: string;
  user: string;
  maxTokens: number;
  schema: object;
  schemaName: string;
  perModelMs: number;
  totalMs: number;
  signal?: AbortSignal;
  emit: (e: AIEvent) => void;
  convert: (raw: any) => unknown;
}

function reasonFrom(status: number, j: any): string {
  const raw = String(j?.error?.metadata?.raw ?? j?.error?.message ?? '');
  if (status === 429 || /rate.?limit/i.test(raw)) return 'busy (free-tier rate limit)';
  if (status === 503 || /overload|unavailable/i.test(raw)) return 'overloaded';
  if (status === 401) return 'API key rejected';
  if (status === 402) return 'account needs credits';
  return (raw || `HTTP ${status}`).slice(0, 120);
}

export async function callWithFallback(o: CallOpts) {
  const t0 = Date.now();
  for (const [i, m] of o.models.entries()) {
    if (o.signal?.aborted) throw new Error('cancelled');
    if (Date.now() - t0 > o.totalMs) break;
    o.emit({ type: 'attempt', label: m.label, n: i + 1, of: o.models.length });
    const started = Date.now();
    try {
      const timeout = AbortSignal.timeout(o.perModelMs);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${o.key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://onlocalai.com',
          'X-Title': 'onlocalAI',
        },
        body: JSON.stringify({
          model: m.id,
          messages: [
            { role: 'system', content: o.system },
            { role: 'user', content: o.user },
          ],
          temperature: 0.4,
          max_tokens: o.maxTokens,
          ...(m.schema ? { response_format: { type: 'json_schema', json_schema: { name: o.schemaName, strict: true, schema: o.schema } } } : {}),
          ...(m.jsonMode ? { response_format: { type: 'json_object' } } : {}),
          ...(m.lowReasoning ? { reasoning: { effort: 'low' } } : {}),
        }),
        signal: o.signal ? AbortSignal.any([o.signal, timeout]) : timeout,
      });
      const j: any = await res.json().catch(() => ({}));
      if (!res.ok || j.error) {
        const reason = reasonFrom(res.status, j);
        o.emit({ type: 'failed', label: m.label, reason });
        if (res.status === 401) throw new Error('OpenRouter rejected the API key. Check OPENROUTER_API_KEY in .env.local.');
        continue;
      }
      const choice = j.choices?.[0];
      const text: string = choice?.message?.content ?? '';
      if (!text.trim()) {
        o.emit({ type: 'failed', label: m.label, reason: choice?.finish_reason === 'length' ? 'ran out of tokens while thinking' : 'empty reply' });
        continue;
      }
      let data: unknown;
      try {
        data = o.convert(parseModelJSON(text));
      } catch (e) {
        o.emit({ type: 'failed', label: m.label, reason: `unusable output (${(e as Error).message.slice(0, 60)})` });
        continue;
      }
      o.emit({ type: 'done', label: m.label, seconds: Math.round((Date.now() - started) / 1000), data });
      return;
    } catch (e) {
      const err = e as Error;
      if (err.message.startsWith('OpenRouter rejected')) throw err;
      if (o.signal?.aborted) throw new Error('cancelled');
      o.emit({ type: 'failed', label: m.label, reason: err.name === 'TimeoutError' ? `timed out after ${Math.round(o.perModelMs / 1000)}s` : err.message.slice(0, 100) });
    }
  }
  throw new Error('All free models are busy right now. Wait a minute and try again.');
}

// ---------- Role design ----------

export const ROLE_COLORS = ['indigo', 'violet', 'sky', 'emerald', 'amber', 'rose', 'orange', 'teal', 'slate'];

export interface RoleRequest {
  description: string;
  orgName?: string;
  catalog: {
    docs: { id: string; title: string; description: string }[];
    courses: { id: string; title: string; description: string; category: string; estMinutes: number }[];
    certTypes: { id: string; name: string; description: string }[];
    roles: { name: string; hourlyRate: number; docIds: string[]; courseIds: string[]; certIds: string[] }[];
  };
}

export interface RoleSuggestion {
  name: string;
  description: string;
  color: string;
  hourlyRate: number;
  rateNote: string;
  docIds: string[];
  courseIds: string[];
  certIds: string[];
  reasons: Record<string, string>;
  newCourses: { title: string; why: string }[];
  newCerts: { name: string; description: string; validMonths: number; why: string }[];
}

const ROLE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'color', 'hourlyRate', 'rateNote', 'docIds', 'courseIds', 'certIds', 'reasons', 'newCourses', 'newCerts'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    color: { type: 'string', enum: ROLE_COLORS },
    hourlyRate: { type: 'number' },
    rateNote: { type: 'string' },
    docIds: { type: 'array', items: { type: 'string' } },
    courseIds: { type: 'array', items: { type: 'string' } },
    certIds: { type: 'array', items: { type: 'string' } },
    reasons: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['id', 'why'], properties: { id: { type: 'string' }, why: { type: 'string' } } },
    },
    newCourses: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['title', 'why'], properties: { title: { type: 'string' }, why: { type: 'string' } } },
    },
    newCerts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description', 'validMonths', 'why'],
        properties: { name: { type: 'string' }, description: { type: 'string' }, validMonths: { type: 'integer' }, why: { type: 'string' } },
      },
    },
  },
};

/** Items every existing role shares — the house baseline a new role should follow. */
function baseline(roles: RoleRequest['catalog']['roles'], key: 'docIds' | 'courseIds') {
  if (!roles.length) return [];
  return roles[0]![key].filter((id) => roles.every((r) => r[key].includes(id)));
}

function rolePrompt(r: RoleRequest) {
  const cat = r.catalog;
  const title = (list: { id: string; title?: string; name?: string }[], ids: string[]) => ids.map((id) => list.find((x) => x.id === id)).filter(Boolean).map((x) => x!.title ?? x!.name);
  const system = `You design onboarding for new roles at ${str(r.orgName, 80) || 'an event staffing company'}, which hires short-term casual crew for events.
Given a role description, propose the role and its onboarding checklist, choosing ONLY from the catalog ids provided.

RULES
- name: short job title (2-4 words). description: one plain sentence of what they do on shift.
- color: one of ${ROLE_COLORS.join(', ')}.
- docIds / courseIds / certIds: ids from the catalog only. Always include the house baseline. Add role-specific items only when they clearly apply — keep onboarding short, crew are casual.
- certIds: only when the role legally or operationally needs that licence (e.g. serving alcohol, handling food, security work).
- reasons: one short "why" (max 12 words) for every non-baseline id you chose.
- hourlyRate: suggest a number in line with the existing roles' rates below (similar responsibility → similar pay). rateNote: one short sentence explaining it.
- newCourses: 0-3 training topics this role needs that NO catalog course covers (title + why). Don't suggest topics the catalog already covers.
- newCerts: 0-2 licences the role needs that are NOT in the catalog. Use generic names; never invent legal requirements you're unsure of — omit instead.

OUTPUT: ONLY a JSON object, no markdown fences:
{"name":string,"description":string,"color":string,"hourlyRate":number,"rateNote":string,"docIds":[id],"courseIds":[id],"certIds":[id],"reasons":[{"id":string,"why":string}],"newCourses":[{"title":string,"why":string}],"newCerts":[{"name":string,"description":string,"validMonths":number,"why":string}]}`;

  const user = [
    `ROLE DESCRIPTION from the crew manager: ${str(r.description, 1500)}`,
    `HOUSE BASELINE (every role has these): docs ${JSON.stringify(baseline(cat.roles, 'docIds'))}, courses ${JSON.stringify(baseline(cat.roles, 'courseIds'))}`,
    `CATALOG — documents:\n${cat.docs.map((d) => `- ${d.id}: ${str(d.title, 80)} — ${str(d.description, 120)}`).join('\n')}`,
    `CATALOG — courses:\n${cat.courses.map((c) => `- ${c.id}: ${str(c.title, 80)} (${str(c.category, 30)}, ${c.estMinutes} min) — ${str(c.description, 140)}`).join('\n')}`,
    `CATALOG — certifications:\n${cat.certTypes.map((c) => `- ${c.id}: ${str(c.name, 80)} — ${str(c.description, 120)}`).join('\n') || '(none)'}`,
    `EXISTING ROLES for reference:\n${cat.roles.map((x) => `- ${str(x.name, 60)}: $${x.hourlyRate}/hr; courses: ${title(cat.courses, x.courseIds).join(', ')}; certs: ${title(cat.certTypes, x.certIds).join(', ') || 'none'}`).join('\n')}`,
  ].join('\n\n');
  return { system, user, maxTokens: 8000 };
}

/** Keep only real catalog ids, enforce the baseline, and bound everything the model can influence. */
export function toRole(raw: any, r: RoleRequest): RoleSuggestion {
  const cat = r.catalog;
  const docSet = new Set(cat.docs.map((d) => d.id));
  const courseSet = new Set(cat.courses.map((c) => c.id));
  const certSet = new Set(cat.certTypes.map((c) => c.id));
  const ids = (v: unknown, set: Set<string>) => Array.from(new Set((Array.isArray(v) ? v : []).map(String).filter((id) => set.has(id))));
  const name = String(raw?.name ?? '').trim().slice(0, 50);
  if (!name) throw new Error('no role name');

  const docIds = Array.from(new Set([...baseline(cat.roles, 'docIds'), ...ids(raw?.docIds, docSet)]));
  const courseIds = Array.from(new Set([...baseline(cat.roles, 'courseIds'), ...ids(raw?.courseIds, courseSet)]));
  const certIds = ids(raw?.certIds, certSet);

  const reasons: Record<string, string> = {};
  const reasonList = Array.isArray(raw?.reasons) ? raw.reasons : raw?.reasons && typeof raw.reasons === 'object' ? Object.entries(raw.reasons).map(([id, why]) => ({ id, why })) : [];
  for (const x of reasonList) {
    const id = String(x?.id ?? '');
    if (docSet.has(id) || courseSet.has(id) || certSet.has(id)) reasons[id] = String(x?.why ?? '').trim().slice(0, 120);
  }

  // Pay: stay within a sane band of what the company already pays.
  const rates = cat.roles.map((x) => x.hourlyRate).filter((n) => n > 0);
  const lo = rates.length ? Math.min(...rates) * 0.8 : 10;
  const hi = rates.length ? Math.max(...rates) * 1.5 : 150;
  const median = rates.length ? [...rates].sort((a, b) => a - b)[Math.floor(rates.length / 2)]! : 25;
  let rate = Number(raw?.hourlyRate);
  if (!Number.isFinite(rate) || rate <= 0) rate = median;
  rate = Math.round(Math.min(hi, Math.max(lo, rate)));

  const known = [...cat.courses.map((c) => norm(c.title))];
  const newCourses = (Array.isArray(raw?.newCourses) ? raw.newCourses : [])
    .map((c: any) => ({ title: String(c?.title ?? '').trim().slice(0, 80), why: String(c?.why ?? '').trim().slice(0, 140) }))
    .filter((c: { title: string }) => c.title && !known.includes(norm(c.title)))
    .slice(0, 3);
  const knownCerts = cat.certTypes.map((c) => norm(c.name));
  const newCerts = (Array.isArray(raw?.newCerts) ? raw.newCerts : [])
    .map((c: any) => ({
      name: String(c?.name ?? '').trim().slice(0, 60),
      description: String(c?.description ?? '').trim().slice(0, 140),
      validMonths: clampInt(c?.validMonths, 1, 120, 12),
      why: String(c?.why ?? '').trim().slice(0, 140),
    }))
    .filter((c: { name: string }) => c.name && !knownCerts.includes(norm(c.name)))
    .slice(0, 2);

  return {
    name,
    description: String(raw?.description ?? '').trim().slice(0, 160),
    color: ROLE_COLORS.includes(raw?.color) ? raw.color : 'indigo',
    hourlyRate: rate,
    rateNote: String(raw?.rateNote ?? '').trim().slice(0, 160),
    docIds,
    courseIds,
    certIds,
    reasons,
    newCourses,
    newCerts,
  };
}

// ---------- Entry point ----------

export async function handleAI(
  route: 'course' | 'lesson' | 'role',
  body: any,
  env: { key: string; models?: string },
  emit: (e: AIEvent) => void,
  signal?: AbortSignal,
) {
  if (!env.key) return emit({ type: 'error', message: 'AI is not configured. Add OPENROUTER_API_KEY to .env.local and restart the dev server.' });
  const models = resolveModels(env.models);
  try {
    if (route === 'course') {
      if (str(body?.request, 2000).length < 3) return emit({ type: 'error', message: 'Describe what the course should teach.' });
      const p = coursePrompt(body as CourseRequest);
      await callWithFallback({ ...p, key: env.key, models, schema: COURSE_SCHEMA, schemaName: 'course', perModelMs: 110_000, totalMs: 300_000, signal, emit, convert: toCourse });
    } else if (route === 'role') {
      const r = body as RoleRequest;
      if (str(r?.description, 1500).length < 3) return emit({ type: 'error', message: 'Describe the role first.' });
      if (!r.catalog || !Array.isArray(r.catalog.docs) || !Array.isArray(r.catalog.courses) || !Array.isArray(r.catalog.certTypes) || !Array.isArray(r.catalog.roles))
        return emit({ type: 'error', message: 'Bad request.' });
      const p = rolePrompt(r);
      await callWithFallback({ ...p, key: env.key, models, schema: ROLE_SCHEMA, schemaName: 'role', perModelMs: 80_000, totalMs: 220_000, signal, emit, convert: (raw) => toRole(raw, r) });
    } else {
      const r = body as LessonRequest;
      if (!r?.course || !['new', 'rewrite'].includes(r.mode)) return emit({ type: 'error', message: 'Bad request.' });
      const p = lessonPrompt(r);
      const want = r.mode === 'rewrite' ? r.lesson?.kind : r.kind;
      await callWithFallback({
        ...p,
        key: env.key,
        models,
        schema: LESSON_SCHEMA,
        schemaName: 'lesson',
        perModelMs: 75_000,
        totalMs: 200_000,
        signal,
        emit,
        convert: (raw) => {
          const l = toLesson({ ...raw, kind: raw?.kind ?? want });
          if (!l) throw new Error('empty lesson');
          if (want && l.kind !== want) throw new Error(`expected a ${want}`);
          return l;
        },
      });
    }
  } catch (e) {
    emit({ type: 'error', message: (e as Error).message });
  }
}
