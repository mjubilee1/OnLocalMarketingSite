import type { Course, Lesson } from '../types';

export type AIEvent =
  | { type: 'attempt'; label: string; n: number; of: number }
  | { type: 'failed'; label: string; reason: string }
  | { type: 'done'; label: string; seconds: number; data: unknown }
  | { type: 'error'; message: string };

export interface AIStatus {
  configured: boolean;
  models: string[];
}

export async function aiStatus(): Promise<AIStatus> {
  try {
    const r = await fetch('/api/ai/status');
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    return { configured: false, models: [] };
  }
}

/** POSTs to an /api/ai route and reports each NDJSON progress event. Resolves with the final data. */
async function stream<T>(path: string, body: unknown, onEvent: (e: AIEvent) => void, signal?: AbortSignal): Promise<{ data: T; label: string }> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
  if (!res.ok || !res.body) throw new Error(res.status === 404 ? 'AI service not found — is the dev server running?' : await res.text());
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let result: { data: T; label: string } | null = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      const ev = JSON.parse(line) as AIEvent;
      onEvent(ev);
      if (ev.type === 'error') throw new Error(ev.message);
      if (ev.type === 'done') result = { data: ev.data as T, label: ev.label };
    }
  }
  if (!result) throw new Error('The AI service stopped without a result. Try again.');
  return result;
}

export interface CourseAIRequest {
  request: string;
  roles: string[];
  source: string;
  cards: number;
  questions: number;
  language: string;
  orgName: string;
  categories: string[];
}

export const generateCourse = (req: CourseAIRequest, onEvent: (e: AIEvent) => void, signal?: AbortSignal) =>
  stream<Course>('/api/ai/course', req, onEvent, signal);

export interface LessonAIRequest {
  mode: 'new' | 'rewrite';
  kind: 'card' | 'quiz';
  instruction: string;
  language: string;
  orgName: string;
  course: Pick<Course, 'title' | 'description' | 'lessons'>;
  lesson?: Lesson;
}

export interface RoleAIRequest {
  description: string;
  orgName: string;
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

export const generateRole = (req: RoleAIRequest, onEvent: (e: AIEvent) => void, signal?: AbortSignal) =>
  stream<RoleSuggestion>('/api/ai/role', req, onEvent, signal);

export const generateLesson =(req: LessonAIRequest, onEvent: (e: AIEvent) => void, signal?: AbortSignal) =>
  stream<Lesson>('/api/ai/lesson', req, onEvent, signal);
