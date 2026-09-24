import type { Contact, Course, EventBody, EventItem, EventTemplate, Role } from '../types';
import { addDays, toDateISO, uid } from './utils';

export const BLANK_BODY = (manager: Contact): EventBody => ({
  venue: '',
  address: '',
  callTime: '09:00',
  description: '',
  dressCode: 'All black, closed-toe shoes. Crew shirt provided at check-in.',
  parking: '',
  color: 'indigo',
  courseIds: [],
  contacts: [manager],
  schedule: [
    { time: '09:00', label: 'Crew check-in' },
    { time: '09:30', label: 'Team briefing' },
  ],
  shifts: [],
});

/** Copy a body with fresh shift ids, dropping roles and courses that no longer exist. */
function cleanBody(body: EventBody, roles: Role[], courses: Course[], manager: Contact): EventBody {
  const c = structuredClone(body);
  return {
    ...c,
    shifts: c.shifts.filter((s) => roles.some((r) => r.id === s.roleId)).map((s) => ({ ...s, id: uid('sh-') })),
    courseIds: c.courseIds.filter((id) => courses.some((x) => x.id === id)),
    contacts: c.contacts.length ? c.contacts : [manager],
  };
}

/** A new draft event from a template (or blank when no template is given). */
export function eventFromTemplate(t: EventTemplate | undefined, ctx: { roles: Role[]; courses: Course[]; manager: Contact }): EventItem {
  const body = t ? cleanBody(t.body, ctx.roles, ctx.courses, ctx.manager) : BLANK_BODY(ctx.manager);
  return {
    id: uid('e-'),
    name: '',
    date: toDateISO(addDays(14)),
    status: 'draft',
    assignments: [],
    ...body,
  };
}

export function bodyOf(ev: EventBody): EventBody {
  const { venue, address, callTime, description, dressCode, parking, color, courseIds, contacts, schedule, shifts } = structuredClone(ev);
  return { venue, address, callTime, description, dressCode, parking, color, courseIds, contacts, schedule, shifts };
}

/** Save an event's reusable parts as a new template (the roster, date and name are left behind). */
export function templateFromEvent(ev: EventItem, name: string): EventTemplate {
  const now = new Date().toISOString();
  return {
    id: uid('et-'),
    name,
    summary: ev.description.split('. ')[0]?.slice(0, 120) ?? '',
    emoji: '📋',
    body: { ...bodyOf(ev), shifts: ev.shifts.map((s) => ({ ...s, id: uid('tsh-') })) },
    builtIn: false,
    createdAt: now,
    updatedAt: now,
    timesUsed: 0,
  };
}

export const crewCount = (b: EventBody) => b.shifts.reduce((a, s) => a + (Number(s.headcount) || 0), 0);

/** Problems a template has with the current catalog (deleted roles or courses). */
export function templateIssues(t: EventTemplate, roles: Role[], courses: Course[]): string[] {
  const out: string[] = [];
  const missingRoles = t.body.shifts.filter((s) => !roles.some((r) => r.id === s.roleId)).length;
  const missingCourses = t.body.courseIds.filter((id) => !courses.some((c) => c.id === id)).length;
  if (missingRoles) out.push(missingRoles === 1 ? '1 shift uses a role that no longer exists' : `${missingRoles} shifts use roles that no longer exist`);
  if (missingCourses) out.push(missingCourses === 1 ? '1 training course no longer exists' : `${missingCourses} training courses no longer exist`);
  return out;
}
