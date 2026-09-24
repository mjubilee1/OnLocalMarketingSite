import { demoPhone, demoPhoto, phoneOk } from './lib/profile';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Activity,
  Contract,
  AssignmentStatus,
  CertType,
  Course,
  DocTemplate,
  EventItem,
  EventTemplate,
  HeldCert,
  ID,
  Role,
  Staff,
} from './types';
import { buildSeed } from './data/seed';
import { BUILT_IN_EVENT_TEMPLATES } from './data/eventTemplates';
import { readiness, requirements } from './lib/readiness';
import { badge } from './lib/badges';
import { uid } from './lib/utils';
import type { CompanyProfile } from './lib/company';

type Data = ReturnType<typeof buildSeed>;

export interface Toast {
  id: string;
  text: string;
  emoji?: string;
}

interface Actions {
  // session
  currentStaffId: ID;
  setCurrentStaff: (id: ID) => void;
  toasts: Toast[];
  toast: (text: string, emoji?: string) => void;
  dismissToast: (id: string) => void;
  resetDemo: () => void;

  // learner progress
  completeLesson: (staffId: ID, courseId: ID, lessonId: ID, quizScore?: number) => { courseCompleted: boolean; newBadges: string[] };
  signDoc: (staffId: ID, docId: ID, signature: string, typed: boolean) => void;
  addCert: (staffId: ID, cert: HeldCert) => void;
  verifyCert: (staffId: ID, certId: ID) => void;
  removeCert: (staffId: ID, certId: ID) => void;

  // people
  createStaff: (p: Pick<Staff, 'name' | 'email' | 'phone' | 'photo' | 'roleIds' | 'language'> & { status?: Staff['status'] }) => ID;
  updateStaff: (id: ID, patch: Partial<Staff>) => void;
  nudge: (ids: ID[]) => void;
  /** Records real email outcomes (from /api/email/send) on each person and in the activity feed. */
  logEmails: (kind: 'invite' | 'reminder', results: { id: ID; ok: boolean; error?: string }[]) => void;
  /** A person accepts their personal invite: fill in their details and start onboarding. */
  acceptInvite: (id: ID, p: Pick<Staff, 'name' | 'email' | 'phone' | 'photo' | 'roleIds' | 'language'>) => void;

  // content
  upsertCourse: (c: Course) => void;
  deleteCourse: (id: ID) => void;
  upsertRole: (r: Role) => void;
  deleteRole: (id: ID) => void;
  upsertDoc: (d: DocTemplate) => void;
  deleteDoc: (id: ID) => void;
  upsertCertType: (c: CertType) => void;

  // events
  upsertEvent: (e: EventItem) => void;
  deleteEvent: (id: ID) => void;
  cloneEvent: (id: ID) => ID;
  assign: (eventId: ID, staffId: ID, shiftId: ID) => void;
  unassign: (eventId: ID, staffId: ID) => void;
  setAssignmentStatus: (eventId: ID, staffId: ID, status: AssignmentStatus) => void;
  rate: (eventId: ID, staffId: ID, rating: number) => void;
  completeEvent: (eventId: ID) => void;

  // event templates
  upsertEventTemplate: (t: EventTemplate) => void;
  deleteEventTemplate: (id: ID) => void;
  /** Reset a built-in template to the version shipped with the app. */
  restoreEventTemplate: (id: ID) => void;
  noteTemplateUsed: (id: ID) => void;

  // company
  /** Saves the company profile and refreshes every contract nobody has signed yet. Returns how many changed. */
  updateCompany: (p: CompanyProfile) => number;

  // contracts
  saveContract: (c: Contract, note?: string) => void;
  sendContract: (id: ID) => void;
  signContract: (id: ID, party: 'employer' | 'staff', signature: string, typed: boolean, termsHash: string, signatory?: string) => void;
  voidContract: (id: ID) => void;
  deleteContract: (id: ID) => void;
}

export type State = Data & Actions;

const act = (kind: Activity['kind'], text: string): Activity => ({ id: uid('a'), at: new Date().toISOString(), kind, text });

/** Re-evaluate status + badges after any progress change. Mutates the given staff clone. */
function refresh(s: Staff, data: Data): string[] {
  const earned: string[] = [];
  const give = (id: string) => {
    if (!s.badges.includes(id)) {
      s.badges.push(id);
      earned.push(id);
    }
  };
  const r = readiness(s, data);
  const req = requirements(s, data);
  if (Object.values(s.courses).some((c) => c.completedAt)) give('first-course');
  if (Object.values(s.courses).some((c) => Object.values(c.quizScores).some((v) => v === 100))) give('quiz-ace');
  if (req.docIds.length && req.docIds.every((d) => s.docs[d])) give('paperwork-pro');
  if (r.ready && r.total > 0) {
    give('event-ready');
    if (!s.readyAt) {
      s.readyAt = new Date().toISOString();
      if (Date.now() - new Date(s.createdAt).getTime() < 48 * 3600_000) give('fast-starter');
    }
    if (s.status === 'onboarding' || s.status === 'invited') s.status = 'active';
  } else if (s.status === 'invited' && (Object.keys(s.docs).length || Object.keys(s.courses).length)) {
    s.status = 'onboarding';
  }
  if (s.eventsWorked >= 5) give('veteran');
  if (s.ratings.includes(5)) give('five-star');
  return earned;
}

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const patchStaff = (id: ID, fn: (s: Staff) => void, activity?: Activity[]) => {
        const earned: string[] = [];
        set((st) => {
          const staff = st.staff.map((s) => {
            if (s.id !== id) return s;
            const c = structuredClone(s);
            fn(c);
            earned.push(...refresh(c, st));
            return c;
          });
          const person = staff.find((s) => s.id === id);
          const badgeActs = earned.map((b) => act('badge', `${person?.name} earned ${badge(b)?.emoji} ${badge(b)?.name}`));
          return { staff, activity: [...badgeActs, ...(activity ?? []), ...st.activity].slice(0, 80) };
        });
        return earned;
      };
      const patchEvent = (id: ID, fn: (e: EventItem) => void) =>
        set((st) => ({
          events: st.events.map((e) => {
            if (e.id !== id) return e;
            const c = structuredClone(e);
            fn(c);
            return c;
          }),
        }));
      const nameOf = (id: ID) => get().staff.find((s) => s.id === id)?.name ?? 'Someone';

      return {
        ...buildSeed(),
        currentStaffId: 's-1',
        toasts: [],

        setCurrentStaff: (id) => set({ currentStaffId: id }),
        toast: (text, emoji) => {
          const t = { id: uid('t'), text, emoji };
          set((s) => ({ toasts: [...s.toasts, t] }));
          setTimeout(() => get().dismissToast(t.id), 3500);
        },
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        resetDemo: () => set({ ...buildSeed(), currentStaffId: 's-1', toasts: [] }),

        completeLesson: (staffId, courseId, lessonId, quizScore) => {
          const course = get().courses.find((c) => c.id === courseId);
          let courseCompleted = false;
          const acts: Activity[] = [];
          const newBadges = patchStaff(
            staffId,
            (s) => {
              const p = (s.courses[courseId] ??= { startedAt: new Date().toISOString(), completedLessonIds: [], quizScores: {} });
              if (!p.completedLessonIds.includes(lessonId)) {
                p.completedLessonIds.push(lessonId);
                s.points += 5;
              }
              if (quizScore !== undefined) p.quizScores[lessonId] = Math.max(p.quizScores[lessonId] ?? 0, quizScore);
              if (course && !p.completedAt && course.lessons.every((l) => p.completedLessonIds.includes(l.id))) {
                p.completedAt = new Date().toISOString();
                s.points += course.points;
                courseCompleted = true;
                acts.push(act('course', `${s.name} completed “${course.title}”`));
              }
            },
            acts,
          );
          return { courseCompleted, newBadges };
        },

        signDoc: (staffId, docId, signature, typed) => {
          const doc = get().docs.find((d) => d.id === docId);
          patchStaff(
            staffId,
            (s) => {
              if (!s.docs[docId]) s.points += 10;
              s.docs[docId] = { signedAt: new Date().toISOString(), signature, typed, company: get().orgName };
            },
            [act('doc', `${nameOf(staffId)} signed ${doc?.title}`)],
          );
        },

        addCert: (staffId, cert) => {
          const ct = get().certTypes.find((c) => c.id === cert.certId);
          patchStaff(
            staffId,
            (s) => {
              s.certs = [...s.certs.filter((c) => c.certId !== cert.certId), cert];
            },
            [act('cert', `${nameOf(staffId)} uploaded ${ct?.name}`)],
          );
        },
        verifyCert: (staffId, certId) =>
          patchStaff(staffId, (s) => {
            const c = s.certs.find((x) => x.certId === certId);
            if (c) c.verified = true;
          }),
        removeCert: (staffId, certId) => patchStaff(staffId, (s) => void (s.certs = s.certs.filter((c) => c.certId !== certId))),

        createStaff: (p) => {
          const id = uid('s-');
          const s: Staff = {
            id,
            ...p,
            status: p.status ?? 'onboarding',
            inviteToken: uid('inv-') + uid(),
            createdAt: new Date().toISOString(),
            points: 0,
            badges: [],
            courses: {},
            docs: {},
            certs: [],
            ratings: [],
            eventsWorked: 0,
          };
          set((st) => ({
            staff: [s, ...st.staff],
            activity: [act('staff', s.status === 'invited' ? `${s.name} was invited` : `${s.name} joined via invite link`), ...st.activity],
          }));
          return id;
        },
        updateStaff: (id, patch) => patchStaff(id, (s) => Object.assign(s, patch)),
        // Marks a reminder as attempted. Whether an email actually went out is recorded by logEmails.
        nudge: (ids) => {
          const now = new Date().toISOString();
          set((st) => ({ staff: st.staff.map((s) => (ids.includes(s.id) ? { ...s, lastNudgedAt: now } : s)) }));
        },
        logEmails: (kind, results) => {
          const at = new Date().toISOString();
          const byId = new Map(results.map((r) => [r.id, r]));
          const ok = results.filter((r) => r.ok);
          const failed = results.filter((r) => !r.ok);
          const noun = kind === 'invite' ? 'Invite' : 'Reminder';
          const acts: Activity[] = [];
          if (ok.length) acts.push(act(kind === 'invite' ? 'staff' : 'nudge', ok.length === 1 ? `${noun} emailed to ${nameOf(ok[0]!.id)}` : `${noun}s emailed to ${ok.length} crew`));
          if (failed.length) acts.push(act('nudge', `${noun} email failed for ${failed.length === 1 ? nameOf(failed[0]!.id) : `${failed.length} crew`}`));
          set((st) => ({
            staff: st.staff.map((s) => {
              const r = byId.get(s.id);
              return r ? { ...s, lastEmail: { kind, at, ok: r.ok, error: r.error } } : s;
            }),
            activity: [...acts, ...st.activity].slice(0, 80),
          }));
        },
        acceptInvite: (id, p) => {
          patchStaff(id, (s) => Object.assign(s, p, { status: 'onboarding' }), [act('staff', `${p.name} accepted their invite and joined`)]);
        },

        upsertCourse: (c) => set((st) => ({ courses: st.courses.some((x) => x.id === c.id) ? st.courses.map((x) => (x.id === c.id ? c : x)) : [...st.courses, c] })),
        deleteCourse: (id) =>
          set((st) => ({
            courses: st.courses.filter((c) => c.id !== id),
            roles: st.roles.map((r) => ({ ...r, courseIds: r.courseIds.filter((x) => x !== id) })),
            events: st.events.map((e) => ({ ...e, courseIds: e.courseIds.filter((x) => x !== id) })),
          })),
        upsertRole: (r) => set((st) => ({ roles: st.roles.some((x) => x.id === r.id) ? st.roles.map((x) => (x.id === r.id ? r : x)) : [...st.roles, r] })),
        deleteRole: (id) => set((st) => ({ roles: st.roles.filter((r) => r.id !== id), staff: st.staff.map((s) => ({ ...s, roleIds: s.roleIds.filter((x) => x !== id) })) })),
        upsertDoc: (d) => set((st) => ({ docs: st.docs.some((x) => x.id === d.id) ? st.docs.map((x) => (x.id === d.id ? d : x)) : [...st.docs, d] })),
        deleteDoc: (id) => set((st) => ({ docs: st.docs.filter((d) => d.id !== id), roles: st.roles.map((r) => ({ ...r, docIds: r.docIds.filter((x) => x !== id) })) })),
        upsertCertType: (c) =>
          set((st) => ({ certTypes: st.certTypes.some((x) => x.id === c.id) ? st.certTypes.map((x) => (x.id === c.id ? c : x)) : [...st.certTypes, c] })),

        upsertEvent: (e) => set((st) => ({ events: st.events.some((x) => x.id === e.id) ? st.events.map((x) => (x.id === e.id ? e : x)) : [e, ...st.events] })),
        deleteEvent: (id) => set((st) => ({ events: st.events.filter((e) => e.id !== id) })),
        cloneEvent: (id) => {
          const src = get().events.find((e) => e.id === id)!;
          const copy: EventItem = {
            ...structuredClone(src),
            id: uid('e-'),
            name: `${src.name} (copy)`,
            status: 'draft',
            assignments: [],
            shifts: src.shifts.map((s) => ({ ...s, id: uid('sh-') })),
          };
          set((st) => ({ events: [copy, ...st.events] }));
          return copy.id;
        },
        assign: (eventId, staffId, shiftId) => {
          patchEvent(eventId, (e) => {
            e.assignments = [...e.assignments.filter((a) => a.staffId !== staffId), { staffId, shiftId, status: 'assigned' }];
          });
          const ev = get().events.find((e) => e.id === eventId);
          set((st) => ({ activity: [act('event', `${nameOf(staffId)} rostered on ${ev?.name}`), ...st.activity] }));
        },
        unassign: (eventId, staffId) => patchEvent(eventId, (e) => void (e.assignments = e.assignments.filter((a) => a.staffId !== staffId))),
        setAssignmentStatus: (eventId, staffId, status) => {
          patchEvent(eventId, (e) => {
            const a = e.assignments.find((x) => x.staffId === staffId);
            if (!a) return;
            a.status = status;
            a.checkedInAt = status === 'checked_in' ? new Date().toISOString() : undefined;
          });
          const ev = get().events.find((e) => e.id === eventId);
          const verb = { assigned: 'was re-rostered on', confirmed: 'confirmed', checked_in: 'checked in at', no_show: 'marked no-show at' }[status];
          set((st) => ({ activity: [act('event', `${nameOf(staffId)} ${verb} ${ev?.name}`), ...st.activity] }));
        },
        rate: (eventId, staffId, rating) =>
          patchEvent(eventId, (e) => {
            const a = e.assignments.find((x) => x.staffId === staffId);
            if (a) a.rating = rating;
          }),
        completeEvent: (eventId) => {
          const ev = get().events.find((e) => e.id === eventId);
          if (!ev) return;
          patchEvent(eventId, (e) => void (e.status = 'completed'));
          for (const a of ev.assignments) {
            if (a.status !== 'checked_in') continue;
            patchStaff(a.staffId, (s) => {
              s.eventsWorked += 1;
              s.points += 25;
              if (a.rating) s.ratings.push(a.rating);
            });
          }
          set((st) => ({ activity: [act('event', `${ev.name} wrapped — ratings saved to crew profiles`), ...st.activity] }));
        },

        upsertEventTemplate: (t) =>
          set((st) => {
            const next = { ...t, updatedAt: new Date().toISOString() };
            return { eventTemplates: st.eventTemplates.some((x) => x.id === t.id) ? st.eventTemplates.map((x) => (x.id === t.id ? next : x)) : [next, ...st.eventTemplates] };
          }),
        deleteEventTemplate: (id) => set((st) => ({ eventTemplates: st.eventTemplates.filter((t) => t.id !== id) })),
        restoreEventTemplate: (id) =>
          set((st) => {
            const original = BUILT_IN_EVENT_TEMPLATES.find((t) => t.id === id);
            if (!original) return {};
            const current = st.eventTemplates.find((t) => t.id === id);
            const restored = { ...structuredClone(original), timesUsed: current?.timesUsed ?? 0 };
            return { eventTemplates: current ? st.eventTemplates.map((t) => (t.id === id ? restored : t)) : [...st.eventTemplates, restored] };
          }),
        noteTemplateUsed: (id) => set((st) => ({ eventTemplates: st.eventTemplates.map((t) => (t.id === id ? { ...t, timesUsed: t.timesUsed + 1 } : t)) })),

        updateCompany: (p) => {
          const at = new Date().toISOString();
          let changed = 0;
          set((st) => {
            const contracts = st.contracts.map((c) => {
              // Signed contracts are a legal record: never rewrite them.
              if (c.status === 'void' || c.status === 'completed' || c.employer.signedAt || c.staff.signedAt) return c;
              const e = c.employer;
              if (e.name === p.name && e.address === p.address && e.email === p.email) return c;
              changed++;
              return { ...c, employer: { ...e, name: p.name, address: p.address, email: p.email }, audit: [...c.audit, { at, text: `Company details updated to ${p.name}` }] };
            });
            return {
              orgName: p.name,
              orgAddress: p.address,
              orgEmail: p.email,
              orgPhone: p.phone,
              managerName: p.managerName,
              managerTitle: p.managerTitle,
              orgConfigured: true,
              contracts,
            };
          });
          return changed;
        },

        saveContract: (c, note) => {
          const at = new Date().toISOString();
          set((st) => {
            const exists = st.contracts.some((x) => x.id === c.id);
            const next = note ? { ...c, audit: [...c.audit, { at, text: note }] } : c;
            return {
              contracts: exists ? st.contracts.map((x) => (x.id === c.id ? next : x)) : [next, ...st.contracts],
              // Remember the company address for the next contract.
              orgAddress: c.employer.address.trim() || st.orgAddress,
            };
          });
        },
        sendContract: (id) => {
          const at = new Date().toISOString();
          set((st) => ({
            contracts: st.contracts.map((c) => (c.id === id ? { ...c, status: 'sent', sentAt: at, audit: [...c.audit, { at, text: `Sent to ${c.staff.name} for signature` }] } : c)),
            activity: [act('doc', `Contract sent to ${st.contracts.find((c) => c.id === id)?.staff.name}`), ...st.activity],
          }));
        },
        signContract: (id, party, signature, typed, termsHash, signatory) => {
          const at = new Date().toISOString();
          set((st) => {
            let signer = '';
            let completed = false;
            const contracts = st.contracts.map((c) => {
              if (c.id !== id || c.status === 'void') return c;
              const p = { ...c[party], signature, typed, signedAt: at, termsHash, ...(signatory ? { signatory } : {}) };
              signer = p.signatory ? `${p.signatory} for ${p.name}` : p.name;
              const next: Contract = { ...c, [party]: p };
              const audit = [...c.audit, { at, text: `${party === 'employer' ? 'Client (employer)' : 'Service Provider (crew)'} ${signer} signed (${typed ? 'typed name' : 'drawn signature'}) · terms ${termsHash.slice(0, 12)}…` }];
              completed = !!(next.employer.signedAt && next.staff.signedAt);
              if (completed) audit.push({ at, text: 'Contract completed: signed by both parties' });
              return { ...next, audit, status: completed ? 'completed' : c.status === 'draft' && party === 'staff' ? 'sent' : c.status };
            });
            return {
              contracts,
              activity: [act('doc', completed ? `Contract fully signed: ${contracts.find((c) => c.id === id)?.title}` : `${signer} signed a contract`), ...st.activity],
            };
          });
        },
        voidContract: (id) => {
          const at = new Date().toISOString();
          set((st) => ({ contracts: st.contracts.map((c) => (c.id === id ? { ...c, status: 'void', audit: [...c.audit, { at, text: 'Contract voided' }] } : c)) }));
        },
        deleteContract: (id) => set((st) => ({ contracts: st.contracts.filter((c) => c.id !== id) })),
      };
    },
    {
      name: 'onlocalai-v1',
      version: 3,
      migrate: (persisted: any, version) => {
        // v1 stored document text with the demo company name baked in; switch it to the placeholder.
        if (version < 2 && persisted?.docs) {
          const old = persisted.orgName || 'onlocalAI Events';
          persisted.docs = persisted.docs.map((d: DocTemplate) => ({ ...d, body: d.body.split(old).join('{{company}}') }));
        }
        // v3 made a photo and a valid mobile required. Fix up the fictional demo crew (ids s-1, s-2, …);
        // real crew added since are left alone, so the app asks them for what's missing.
        if (version < 3 && Array.isArray(persisted?.staff)) {
          persisted.staff = persisted.staff.map((s: Staff) => {
            const m = /^s-(\d{1,3})$/.exec(s.id);
            if (!m) return s;
            const n = Number(m[1]) - 1;
            return { ...s, phone: phoneOk(s.phone) ? s.phone : demoPhone(n), photo: s.photo ?? (s.status !== 'invited' ? demoPhoto(s.name) : undefined) };
          });
        }
        return persisted;
      },
      partialize: ({ toasts, ...rest }) => rest,
    },
  ),
);

export const useCatalog = () => {
  const roles = useStore((s) => s.roles);
  const courses = useStore((s) => s.courses);
  const docs = useStore((s) => s.docs);
  const certTypes = useStore((s) => s.certTypes);
  return { roles, courses, docs, certTypes };
};

export const useCompany = (): CompanyProfile => {
  const name = useStore((s) => s.orgName);
  const address = useStore((s) => s.orgAddress);
  const email = useStore((s) => s.orgEmail);
  const phone = useStore((s) => s.orgPhone);
  const managerName = useStore((s) => s.managerName);
  const managerTitle = useStore((s) => s.managerTitle);
  return { name, address, email, phone, managerName, managerTitle };
};

export const useCurrentStaff = () => {
  const id = useStore((s) => s.currentStaffId);
  const staff = useStore((s) => s.staff);
  return staff.find((s) => s.id === id) ?? staff[0]!;
};
