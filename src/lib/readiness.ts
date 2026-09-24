import type { CertType, Course, DocTemplate, EventItem, HeldCert, ID, Role, Staff } from '../types';
import { daysUntil } from './utils';

export interface Catalog {
  roles: Role[];
  courses: Course[];
  docs: DocTemplate[];
  certTypes: CertType[];
}

export type ReqKind = 'doc' | 'course' | 'cert';

export interface ReqItem {
  kind: ReqKind;
  id: ID;
  label: string;
  done: boolean;
  /** 0..1 partial progress (courses) */
  progress: number;
  detail?: string;
  minutes: number;
}

export interface Readiness {
  items: ReqItem[];
  done: number;
  total: number;
  pct: number;
  ready: boolean;
  minutesLeft: number;
}

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export const certValid = (c: HeldCert | undefined) => !!c && daysUntil(c.expiresAt) >= 0;

export const courseDone = (s: Staff, courseId: ID) => !!s.courses[courseId]?.completedAt;

export const courseProgress = (s: Staff, course: Course) => {
  const p = s.courses[course.id];
  if (!p) return 0;
  if (p.completedAt) return 1;
  return course.lessons.length ? p.completedLessonIds.length / course.lessons.length : 0;
};

/** Requirements come from every role the person holds, plus optional extras (e.g. event-specific training). */
export function requirements(s: Staff, cat: Catalog, roleIds: ID[] = s.roleIds, extraCourseIds: ID[] = []) {
  const roles = cat.roles.filter((r) => roleIds.includes(r.id));
  return {
    docIds: uniq(roles.flatMap((r) => r.docIds)),
    courseIds: uniq([...roles.flatMap((r) => r.courseIds), ...extraCourseIds]),
    certIds: uniq(roles.flatMap((r) => r.certIds)),
  };
}

export function readiness(s: Staff, cat: Catalog, roleIds?: ID[], extraCourseIds: ID[] = []): Readiness {
  const req = requirements(s, cat, roleIds, extraCourseIds);
  const items: ReqItem[] = [];

  for (const id of req.docIds) {
    const d = cat.docs.find((x) => x.id === id);
    if (!d) continue;
    const done = !!s.docs[id];
    items.push({ kind: 'doc', id, label: d.title, done, progress: done ? 1 : 0, minutes: 2 });
  }
  for (const id of req.courseIds) {
    const c = cat.courses.find((x) => x.id === id);
    // Drafts (e.g. fresh AI courses) stay invisible to crew until a manager publishes them.
    if (!c || !c.published) continue;
    const prog = courseProgress(s, c);
    items.push({
      kind: 'course',
      id,
      label: c.title,
      done: prog === 1,
      progress: prog,
      minutes: Math.ceil(c.estMinutes * (1 - prog)),
      detail: `${c.estMinutes} min`,
    });
  }
  for (const id of req.certIds) {
    const ct = cat.certTypes.find((x) => x.id === id);
    if (!ct) continue;
    const held = s.certs.find((c) => c.certId === id);
    const valid = certValid(held);
    let detail = 'Upload required';
    if (held && !valid) detail = 'Expired — upload renewal';
    else if (held && !held.verified) detail = 'Awaiting verification';
    else if (held) detail = `Valid until ${held.expiresAt}`;
    // An uploaded-but-unverified cert counts as done for the worker; managers still see it flagged.
    items.push({ kind: 'cert', id, label: ct.name, done: valid, progress: valid ? 1 : 0, detail, minutes: 3 });
  }

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  return {
    items,
    done,
    total,
    pct: total ? Math.round((done / total) * 100) : 100,
    ready: done === total,
    minutesLeft: items.filter((i) => !i.done).reduce((a, i) => a + i.minutes, 0),
  };
}

/** Readiness for a specific event: only the roles they're rostered on, plus the event's own training. */
export function eventReadiness(s: Staff, cat: Catalog, ev: EventItem) {
  const shiftIds = ev.assignments.filter((a) => a.staffId === s.id).map((a) => a.shiftId);
  const roleIds = ev.shifts.filter((sh) => shiftIds.includes(sh.id)).map((sh) => sh.roleId);
  return readiness(s, cat, roleIds.length ? roleIds : s.roleIds, ev.courseIds);
}

export const avgRating = (s: Staff) => (s.ratings.length ? s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length : 0);

export const expiringCerts = (s: Staff, withinDays = 30) =>
  s.certs.filter((c) => {
    const d = daysUntil(c.expiresAt);
    return d <= withinDays;
  });

export function roleTimeToReady(role: Role, cat: Catalog) {
  const courseMin = role.courseIds.reduce((a, id) => a + (cat.courses.find((c) => c.id === id)?.estMinutes ?? 0), 0);
  return courseMin + role.docIds.length * 2 + role.certIds.length * 3;
}
