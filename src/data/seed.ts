import type { Activity, CertType, Contract, DocTemplate, EventItem, Role, Staff, StaffStatus } from '../types';
import { COURSES } from './courses';
import { addDays, addMonths, toDateISO, uid } from '../lib/utils';
import { draftContract } from '../lib/contracts';
import { demoPhone, demoPhoto } from '../lib/profile';
import { BUILT_IN_EVENT_TEMPLATES } from './eventTemplates';

export const DOCS: DocTemplate[] = [
  {
    id: 'd-agreement',
    title: 'Casual Staff Agreement',
    description: 'Your terms of engagement as a casual event crew member.',
    body: `This agreement is between {{company}} of {{company_address}} ("the Company") and you ("the Crew Member").

1. Engagement. You are engaged on a casual, shift-by-shift basis. There is no guarantee of minimum hours. You may accept or decline any shift offered.

2. Pay. You will be paid the hourly rate shown for the role on each shift, weekly in arrears, for all hours worked from check-in to sign-out.

3. Cancellations. If you need to cancel an accepted shift, you must release it in the app at least 24 hours before call time, except in an emergency.

4. Conduct. You agree to follow the Code of Conduct and all reasonable directions from supervisors.

5. Confidentiality. You will not share confidential information about clients, artists, guests or event operations.

6. Termination. Either party may end this agreement at any time with notice through the app.`,
  },
  {
    id: 'd-conduct',
    title: 'Code of Conduct',
    description: 'How we treat guests, clients and each other.',
    body: `As a member of the {{company}} crew, I will:

• Treat every guest, client and colleague with respect, regardless of background.
• Never work under the influence of alcohol or drugs.
• Not consume alcohol while in uniform, including on breaks.
• Not post photos or videos of back-of-house areas, artists or guests on social media.
• Report any harassment, discrimination or unsafe behaviour to a supervisor.
• Wear my uniform and ID visibly at all times on shift.

Breaches of this code may result in removal from shifts.`,
  },
  {
    id: 'd-health',
    title: 'Health & Safety Declaration',
    description: 'Confirm you understand your safety responsibilities.',
    body: `I declare that:

• I am fit to perform the duties of my role, and I will tell my supervisor if that changes.
• I will follow all safety instructions, signage and briefings.
• I will report any hazard, incident, near miss or injury immediately.
• I will wear any PPE provided for my role.
• I know how to find my event's emergency exits and assembly point in the briefing.`,
  },
  {
    id: 'd-media',
    title: 'Photo & Media Release',
    description: 'Permission to appear in event photography and video.',
    body: `Our events are regularly photographed and filmed.

I consent to {{company}} ("the Company") and its clients using photographs and video in which I may appear, for marketing and promotional purposes, without payment.

I understand I can withdraw this consent for future use at any time by contacting {{company}}.`,
  },
];

export const CERT_TYPES: CertType[] = [
  { id: 'ct-rsa', name: 'Alcohol Service Certificate', description: 'Responsible service of alcohol (RSA / TIPS / equivalent).', validMonths: 36 },
  { id: 'ct-food', name: 'Food Handler Certificate', description: 'Basic food safety & hygiene.', validMonths: 36 },
  { id: 'ct-security', name: 'Security Licence', description: 'State/Government-issued security or crowd controller licence.', validMonths: 12 },
  { id: 'ct-firstaid', name: 'First Aid Certificate', description: 'Recognised first aid qualification.', validMonths: 36 },
];

export const ROLES: Role[] = [
  {
    id: 'r-bar',
    name: 'Bartender',
    color: 'violet',
    description: 'Serve drinks responsibly in bars and hospitality areas.',
    hourlyRate: 28,
    courseIds: ['c-welcome', 'c-safety', 'c-alcohol', 'c-food'],
    docIds: ['d-agreement', 'd-conduct', 'd-health', 'd-media'],
    certIds: ['ct-rsa'],
  },
  {
    id: 'r-server',
    name: 'Food & Beverage Server',
    color: 'orange',
    description: 'Serve food and drinks at conferences, galas and hospitality suites.',
    hourlyRate: 25,
    courseIds: ['c-welcome', 'c-safety', 'c-food', 'c-guest'],
    docIds: ['d-agreement', 'd-conduct', 'd-health'],
    certIds: ['ct-food'],
  },
  {
    id: 'r-usher',
    name: 'Usher / Guest Services',
    color: 'sky',
    description: 'Welcome guests, help with seating, wayfinding and info points.',
    hourlyRate: 24,
    courseIds: ['c-welcome', 'c-safety', 'c-guest', 'c-access'],
    docIds: ['d-agreement', 'd-conduct', 'd-health', 'd-media'],
    certIds: [],
  },
  {
    id: 'r-ticket',
    name: 'Ticket Scanner',
    color: 'teal',
    description: 'Run fast, friendly and secure entry gates.',
    hourlyRate: 24,
    courseIds: ['c-welcome', 'c-safety', 'c-ticket', 'c-guest'],
    docIds: ['d-agreement', 'd-conduct', 'd-health'],
    certIds: [],
  },
  {
    id: 'r-security',
    name: 'Security Steward',
    color: 'rose',
    description: 'Bag checks, crowd monitoring and incident response.',
    hourlyRate: 32,
    courseIds: ['c-welcome', 'c-safety', 'c-security'],
    docIds: ['d-agreement', 'd-conduct', 'd-health'],
    certIds: ['ct-security'],
  },
  {
    id: 'r-setup',
    name: 'Setup Crew',
    color: 'amber',
    description: 'Load-in, build and pack-down of staging, barriers and furniture.',
    hourlyRate: 27,
    courseIds: ['c-welcome', 'c-safety', 'c-manual'],
    docIds: ['d-agreement', 'd-conduct', 'd-health'],
    certIds: [],
  },
];

type Level = 'full' | 'partial' | 'started' | 'invited' | 'inactive';

interface PersonSeed {
  name: string;
  roles: string[];
  level: Level;
  lang?: string;
  events?: number;
  ratings?: number[];
  joinedDaysAgo: number;
  certExpiresInDays?: number;
  certUnverified?: boolean;
}

const PEOPLE: PersonSeed[] = [
  { name: 'Maya Chen', roles: ['r-bar', 'r-server'], level: 'partial', joinedDaysAgo: 2 },
  { name: 'Jordan Okafor', roles: ['r-security'], level: 'full', events: 14, ratings: [5, 5, 4, 5], joinedDaysAgo: 420 },
  { name: 'Priya Sharma', roles: ['r-usher', 'r-ticket'], level: 'full', events: 8, ratings: [5, 4, 5], joinedDaysAgo: 190 },
  { name: 'Lucas Martin', roles: ['r-bar'], level: 'full', events: 6, ratings: [4, 4, 5], joinedDaysAgo: 150, certExpiresInDays: 12 },
  { name: 'Sofia Rossi', roles: ['r-server'], level: 'full', events: 3, ratings: [4, 5], joinedDaysAgo: 60 },
  { name: 'Ethan Brooks', roles: ['r-setup'], level: 'full', events: 11, ratings: [5, 4, 4, 5], joinedDaysAgo: 300 },
  { name: 'Aisha Rahman', roles: ['r-ticket'], level: 'partial', joinedDaysAgo: 3, lang: 'Arabic' },
  { name: 'Diego Hernández', roles: ['r-bar', 'r-usher'], level: 'full', events: 5, ratings: [5, 5], joinedDaysAgo: 95, certUnverified: true, lang: 'Spanish' },
  { name: 'Hannah Kim', roles: ['r-usher'], level: 'started', joinedDaysAgo: 1 },
  { name: 'Tom Nguyen', roles: ['r-security'], level: 'partial', joinedDaysAgo: 4, lang: 'Vietnamese' },
  { name: 'Grace Wilson', roles: ['r-server', 'r-usher'], level: 'full', events: 9, ratings: [5, 5, 5], joinedDaysAgo: 240 },
  { name: 'Noah Fischer', roles: ['r-setup'], level: 'invited', joinedDaysAgo: 1, lang: 'German' },
  { name: 'Chloe Dubois', roles: ['r-ticket', 'r-usher'], level: 'invited', joinedDaysAgo: 0, lang: 'French' },
  { name: 'Samuel Adeyemi', roles: ['r-setup', 'r-security'], level: 'full', events: 7, ratings: [4, 5, 4], joinedDaysAgo: 210 },
  { name: 'Emma Johansson', roles: ['r-bar'], level: 'inactive', events: 12, ratings: [5, 5, 4, 5], joinedDaysAgo: 520 },
  { name: 'Ravi Patel', roles: ['r-usher', 'r-ticket'], level: 'started', joinedDaysAgo: 2, lang: 'Hindi' },
];

const iso = (daysAgo: number, hour = 10) => {
  const d = addDays(-daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

function buildStaff(): Staff[] {
  return PEOPLE.map((p, idx) => {
    const id = `s-${idx + 1}`;
    const roles = ROLES.filter((r) => p.roles.includes(r.id));
    const courseIds = Array.from(new Set(roles.flatMap((r) => r.courseIds)));
    const docIds = Array.from(new Set(roles.flatMap((r) => r.docIds)));
    const certIds = Array.from(new Set(roles.flatMap((r) => r.certIds)));
    const joined = iso(p.joinedDaysAgo, 9);

    const s: Staff = {
      id,
      name: p.name,
      email: p.name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '') + '@mail.com',
      phone: demoPhone(idx),
      language: p.lang ?? 'English',
      roleIds: p.roles,
      status: 'onboarding' as StaffStatus,
      createdAt: joined,
      points: 0,
      badges: [],
      courses: {},
      docs: {},
      certs: [],
      ratings: p.ratings ?? [],
      eventsWorked: p.events ?? 0,
    };

    const completeCourse = (cid: string, dayOffset: number) => {
      const c = COURSES.find((x) => x.id === cid)!;
      const scores: Record<string, number> = {};
      c.lessons.filter((l) => l.kind === 'quiz').forEach((l, i) => (scores[l.id] = (idx + i) % 3 === 0 ? 100 : 85));
      s.courses[cid] = {
        startedAt: iso(Math.max(p.joinedDaysAgo - dayOffset, 0), 11),
        completedLessonIds: c.lessons.map((l) => l.id),
        quizScores: scores,
        completedAt: iso(Math.max(p.joinedDaysAgo - dayOffset, 0), 12),
      };
      s.points += c.points;
    };
    const signDoc = (did: string) => {
      s.docs[did] = { signedAt: iso(p.joinedDaysAgo, 10), signature: p.name, typed: true };
      s.points += 10;
    };

    if (p.level === 'full' || p.level === 'inactive') {
      docIds.forEach(signDoc);
      courseIds.forEach((cid, i) => completeCourse(cid, i > 1 ? 1 : 0));
      certIds.forEach((cid) => {
        const ct = CERT_TYPES.find((c) => c.id === cid)!;
        const expires = p.certExpiresInDays !== undefined ? toDateISO(addDays(p.certExpiresInDays)) : toDateISO(addDays(200 + idx * 20));
        s.certs.push({
          certId: cid,
          number: `${cid.slice(3).toUpperCase()}-${48210 + idx * 37}`,
          issuedAt: addMonths(expires, -ct.validMonths),
          expiresAt: expires,
          fileName: `${cid.slice(3)}-certificate.pdf`,
          verified: !p.certUnverified,
        });
      });
      s.status = p.level === 'inactive' ? 'inactive' : 'active';
      s.readyAt = iso(Math.max(p.joinedDaysAgo - 1, 0), 15);
      s.badges = ['first-course', 'paperwork-pro', 'event-ready'];
      if (Object.values(s.courses).some((c) => Object.values(c.quizScores).some((v) => v === 100))) s.badges.push('quiz-ace');
      if (p.joinedDaysAgo > 1) s.badges.push('fast-starter');
      if (s.eventsWorked >= 5) s.badges.push('veteran');
      if (s.ratings.includes(5)) s.badges.push('five-star');
      s.points += s.eventsWorked * 25;
    } else if (p.level === 'partial') {
      docIds.slice(0, docIds.length - 1).forEach(signDoc);
      completeCourse(courseIds[0]!, 0);
      if (courseIds[1]) completeCourse(courseIds[1], 0);
      const third = courseIds[2];
      if (third) {
        const c = COURSES.find((x) => x.id === third)!;
        s.courses[third] = { startedAt: iso(0, 8), completedLessonIds: c.lessons.slice(0, 1).map((l) => l.id), quizScores: {} };
      }
      s.badges = ['first-course'];
      if (Object.values(s.courses).some((c) => Object.values(c.quizScores).some((v) => v === 100))) s.badges.push('quiz-ace');
    } else if (p.level === 'started') {
      signDoc(docIds[0]!);
    } else {
      s.status = 'invited';
    }
    // Everyone who has signed up has a photo. The demo crew are fictional, so they get illustrations.
    if (s.status !== 'invited') s.photo = demoPhoto(p.name);
    return s;
  });
}

function buildEvents(): EventItem[] {
  const d = (n: number) => toDateISO(addDays(n));
  const festival: EventItem = {
    id: 'e-festival',
    name: 'Harborfront Music Festival',
    venue: 'Harborfront Park',
    address: '1 Pier Road, Harbor District',
    date: d(5),
    callTime: '11:00',
    description: 'Two-stage outdoor festival, 12,000 guests. Headliners from 6pm. Hot weather expected — hydrate!',
    dressCode: 'Black crew tee (provided at check-in), black shorts or pants, closed-toe shoes, cap recommended.',
    parking: 'Crew parking at Lot C (enter via Dock St). Shuttle every 10 minutes to the crew gate.',
    color: 'violet',
    status: 'published',
    courseIds: [],
    contacts: [
      { name: 'Alex Rivera', title: 'Crew Manager', phone: '+1 555 0100' },
      { name: 'Sam Lee', title: 'Bar Supervisor', phone: '+1 555 0101' },
      { name: 'Control Room', title: 'Security & Safety', phone: '+1 555 0199' },
    ],
    schedule: [
      { time: '11:00', label: 'Crew check-in at Gate C' },
      { time: '11:30', label: 'Team briefings by zone' },
      { time: '12:30', label: 'Gates open' },
      { time: '18:00', label: 'Headliners — peak crowd' },
      { time: '22:30', label: 'Curfew — egress begins' },
      { time: '23:30', label: 'Sign-out with supervisor' },
    ],
    shifts: [
      { id: 'sh-f1', roleId: 'r-bar', headcount: 4, start: '12:00', end: '23:00' },
      { id: 'sh-f2', roleId: 'r-security', headcount: 3, start: '11:00', end: '23:30' },
      { id: 'sh-f3', roleId: 'r-usher', headcount: 3, start: '12:00', end: '22:30' },
      { id: 'sh-f4', roleId: 'r-ticket', headcount: 3, start: '11:30', end: '19:00' },
    ],
    assignments: [
      { staffId: 's-1', shiftId: 'sh-f1', status: 'assigned' },
      { staffId: 's-4', shiftId: 'sh-f1', status: 'confirmed' },
      { staffId: 's-8', shiftId: 'sh-f1', status: 'confirmed' },
      { staffId: 's-2', shiftId: 'sh-f2', status: 'confirmed' },
      { staffId: 's-10', shiftId: 'sh-f2', status: 'assigned' },
      { staffId: 's-3', shiftId: 'sh-f3', status: 'confirmed' },
      { staffId: 's-9', shiftId: 'sh-f3', status: 'assigned' },
      { staffId: 's-7', shiftId: 'sh-f4', status: 'assigned' },
    ],
  };
  const summit: EventItem = {
    id: 'e-summit',
    name: 'TechSummit 2026',
    venue: 'Grand Convention Centre',
    address: '200 Exhibition Ave, Hall B',
    date: d(12),
    callTime: '07:00',
    description: '3,000-delegate conference with keynote hall, expo floor and networking lunch.',
    dressCode: 'Smart black: black shirt/blouse, black trousers or skirt, polished black shoes. Lanyard provided.',
    parking: 'No crew parking. Metro: Exhibition station (2 min walk). Crew entrance at Loading Dock 2.',
    color: 'sky',
    status: 'published',
    courseIds: ['c-access'],
    contacts: [
      { name: 'Alex Rivera', title: 'Crew Manager', phone: '+1 555 0100' },
      { name: 'Jess Tan', title: 'Client Event Lead', phone: '+1 555 0142' },
    ],
    schedule: [
      { time: '07:00', label: 'Crew check-in, Loading Dock 2' },
      { time: '07:30', label: 'Briefing in Room 101' },
      { time: '08:00', label: 'Registration opens' },
      { time: '09:00', label: 'Opening keynote' },
      { time: '12:30', label: 'Networking lunch service' },
      { time: '17:00', label: 'Close & sign-out' },
    ],
    shifts: [
      { id: 'sh-s1', roleId: 'r-usher', headcount: 3, start: '07:00', end: '17:00' },
      { id: 'sh-s2', roleId: 'r-ticket', headcount: 2, start: '07:00', end: '12:00' },
      { id: 'sh-s3', roleId: 'r-server', headcount: 3, start: '10:30', end: '15:00' },
      { id: 'sh-s4', roleId: 'r-setup', headcount: 2, start: '06:00', end: '10:00' },
    ],
    assignments: [
      { staffId: 's-11', shiftId: 'sh-s1', status: 'confirmed' },
      { staffId: 's-16', shiftId: 'sh-s2', status: 'assigned' },
      { staffId: 's-5', shiftId: 'sh-s3', status: 'confirmed' },
      { staffId: 's-1', shiftId: 'sh-s3', status: 'assigned' },
      { staffId: 's-6', shiftId: 'sh-s4', status: 'confirmed' },
    ],
  };
  const marathon: EventItem = {
    id: 'e-marathon',
    name: 'City Marathon Expo',
    venue: 'Riverside Pavilion',
    address: '55 Riverside Drive',
    date: d(20),
    callTime: '06:00',
    description: 'Race-pack collection expo and finish-line village build.',
    dressCode: 'Hi-vis provided. Comfortable closed-toe shoes, weather-appropriate layers.',
    parking: 'Crew parking in Pavilion basement (level B2).',
    color: 'emerald',
    status: 'draft',
    courseIds: [],
    contacts: [{ name: 'Alex Rivera', title: 'Crew Manager', phone: '+1 555 0100' }],
    schedule: [
      { time: '06:00', label: 'Load-in & build' },
      { time: '10:00', label: 'Expo opens' },
    ],
    shifts: [
      { id: 'sh-m1', roleId: 'r-setup', headcount: 4, start: '06:00', end: '12:00' },
      { id: 'sh-m2', roleId: 'r-usher', headcount: 2, start: '09:30', end: '18:00' },
    ],
    assignments: [
      { staffId: 's-14', shiftId: 'sh-m1', status: 'assigned' },
      { staffId: 's-12', shiftId: 'sh-m1', status: 'assigned' },
    ],
  };
  const wine: EventItem = {
    id: 'e-wine',
    name: 'Autumn Wine & Food Fair',
    venue: 'Botanic Gardens Lawn',
    address: '8 Garden Terrace',
    date: d(-10),
    callTime: '10:00',
    description: 'Tasting marquees with 40 producers.',
    dressCode: 'Black apron (provided), white shirt, black pants.',
    parking: 'Street parking only.',
    color: 'rose',
    status: 'completed',
    courseIds: [],
    contacts: [{ name: 'Alex Rivera', title: 'Crew Manager', phone: '+1 555 0100' }],
    schedule: [{ time: '10:00', label: 'Check-in' }],
    shifts: [
      { id: 'sh-w1', roleId: 'r-bar', headcount: 2, start: '11:00', end: '19:00' },
      { id: 'sh-w2', roleId: 'r-server', headcount: 2, start: '11:00', end: '19:00' },
    ],
    assignments: [
      { staffId: 's-4', shiftId: 'sh-w1', status: 'checked_in', checkedInAt: iso(10, 10), rating: 4 },
      { staffId: 's-15', shiftId: 'sh-w1', status: 'checked_in', checkedInAt: iso(10, 10), rating: 5 },
      { staffId: 's-11', shiftId: 'sh-w2', status: 'checked_in', checkedInAt: iso(10, 10), rating: 5 },
      { staffId: 's-5', shiftId: 'sh-w2', status: 'checked_in', checkedInAt: iso(10, 10), rating: 5 },
    ],
  };
  return [festival, summit, marathon, wine];
}

function buildActivity(): Activity[] {
  const a = (minsAgo: number, kind: Activity['kind'], text: string): Activity => ({
    id: uid('a'),
    at: new Date(Date.now() - minsAgo * 60000).toISOString(),
    kind,
    text,
  });
  return [
    a(12, 'course', 'Maya Chen completed “Crowd Safety & Emergencies”'),
    a(40, 'doc', 'Aisha Rahman signed Code of Conduct'),
    a(95, 'staff', 'Hannah Kim joined via invite link'),
    a(180, 'cert', 'Diego Hernández uploaded Alcohol Service Certificate'),
    a(300, 'event', 'Jordan Okafor confirmed Harborfront Music Festival'),
    a(600, 'staff', 'Chloe Dubois was invited'),
    a(1440, 'badge', 'Grace Wilson earned ⭐ Five Star'),
  ];
}

const ORG_NAME = 'onlocalAI Events';
const ORG_ADDRESS = '200 Harbor Street, Suite 4, Harbor District';
const MANAGER = 'Alex Rivera';

/** One contract sent to Maya for the festival, waiting on her signature first. */
function buildContracts(staff: Staff[], events: EventItem[]): Contract[] {
  const maya = staff.find((s) => s.id === 's-1')!;
  const fest = events.find((e) => e.id === 'e-festival')!;
  const bar = ROLES.find((r) => r.id === 'r-bar')!;
  const c = draftContract({ staff: maya, event: fest, role: bar, orgName: ORG_NAME, orgAddress: ORG_ADDRESS, signatory: MANAGER });
  c.id = 'k-demo-maya';
  c.terms.governingState = 'California';
  c.terms.additionalTerms = 'Crew check-in, schedule and site rules are provided in the event briefing in the onlocalAI app.';
  c.status = 'sent';
  c.sentAt = new Date(Date.now() - 3 * 3600_000).toISOString();
  c.createdAt = new Date(Date.now() - 4 * 3600_000).toISOString();
  c.audit = [
    { at: c.createdAt, text: 'Draft created by Alex Rivera' },
    { at: c.sentAt, text: 'Sent to Maya Chen for signature' },
  ];
  return [c];
}

export function buildSeed() {
  const staff = buildStaff();
  const events = buildEvents();
  return {
    courses: structuredClone(COURSES),
    docs: structuredClone(DOCS),
    certTypes: structuredClone(CERT_TYPES),
    roles: structuredClone(ROLES),
    staff,
    events,
    activity: buildActivity(),
    contracts: buildContracts(staff, events),
    eventTemplates: structuredClone(BUILT_IN_EVENT_TEMPLATES),
    inviteCode: 'CREW2026',
    // The crew manager's company profile: printed on every document and contract.
    orgName: ORG_NAME,
    orgAddress: ORG_ADDRESS,
    orgEmail: '',
    orgPhone: '+1 555 0100',
    managerName: MANAGER,
    managerTitle: 'Crew Manager',
    /** False until the manager saves their own company details. */
    orgConfigured: false,
  };
}
