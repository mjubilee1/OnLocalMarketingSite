export type ID = string;

// ---------- Training ----------
export interface Question {
  id: ID;
  prompt: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export type LessonKind = 'card' | 'video' | 'quiz';

export interface Lesson {
  id: ID;
  title: string;
  kind: LessonKind;
  /** Lightweight markup: blank-line paragraphs, "- " bullets, "## " headings, **bold** */
  body?: string;
  videoUrl?: string;
  questions?: Question[];
}

export interface Course {
  id: ID;
  title: string;
  description: string;
  category: string;
  emoji: string;
  estMinutes: number;
  passingScore: number; // percent
  points: number;
  published: boolean;
  lessons: Lesson[];
  /** Set when the course was added from the template library. */
  templateId?: string;
}

// ---------- Paperwork & compliance ----------
export interface DocTemplate {
  id: ID;
  title: string;
  description: string;
  body: string;
  /** Set when the document was added from the template library. */
  templateId?: string;
}

export interface CertType {
  id: ID;
  name: string;
  description: string;
  validMonths: number;
}

/** A role is also an onboarding "flow": everything someone must finish before they can work it. */
export interface Role {
  id: ID;
  name: string;
  color: string; // tailwind color key, e.g. "indigo"
  description: string;
  hourlyRate: number;
  courseIds: ID[];
  docIds: ID[];
  certIds: ID[];
}

// ---------- People ----------
export interface CourseProgress {
  startedAt: string;
  completedLessonIds: ID[];
  quizScores: Record<ID, number>;
  completedAt?: string;
}

export interface SignedDoc {
  signedAt: string;
  /** Company name as it appeared on the document when it was signed. */
  company?: string;
  signature: string; // data URL (drawn) or typed name
  typed: boolean;
}

export interface HeldCert {
  certId: ID;
  number: string;
  issuedAt: string;
  expiresAt: string;
  fileName?: string;
  verified: boolean;
}

export type StaffStatus = 'invited' | 'onboarding' | 'active' | 'inactive';

export interface Staff {
  id: ID;
  name: string;
  email: string;
  phone: string;
  language: string;
  roleIds: ID[];
  status: StaffStatus;
  createdAt: string;
  readyAt?: string;
  points: number;
  badges: string[];
  courses: Record<ID, CourseProgress>;
  docs: Record<ID, SignedDoc>;
  certs: HeldCert[];
  ratings: number[];
  eventsWorked: number;
  lastNudgedAt?: string;
  notes?: string;
}

// ---------- Events ----------
export interface Shift {
  id: ID;
  roleId: ID;
  headcount: number;
  start: string; // HH:mm
  end: string;
}

export type AssignmentStatus = 'assigned' | 'confirmed' | 'checked_in' | 'no_show';

export interface Assignment {
  staffId: ID;
  shiftId: ID;
  status: AssignmentStatus;
  checkedInAt?: string;
  rating?: number;
}

export interface Contact {
  name: string;
  title: string;
  phone: string;
}

export interface ScheduleItem {
  time: string;
  label: string;
}

export type EventStatus = 'draft' | 'published' | 'completed';

export interface EventItem {
  id: ID;
  name: string;
  venue: string;
  address: string;
  date: string; // YYYY-MM-DD
  callTime: string;
  description: string;
  dressCode: string;
  parking: string;
  color: string;
  status: EventStatus;
  courseIds: ID[]; // event-specific training on top of role training
  contacts: Contact[];
  schedule: ScheduleItem[];
  shifts: Shift[];
  assignments: Assignment[];
}

export interface Activity {
  id: ID;
  at: string;
  kind: 'course' | 'doc' | 'cert' | 'event' | 'staff' | 'nudge' | 'badge';
  text: string;
}

// ---------- Contracts ----------
/** Mirrors the fillable fields of the Event Planning Service Contract PDF. Dates are YYYY-MM-DD. */
export interface ContractTerms {
  effectiveDate: string;
  startDate: string;
  endType: 'Date' | 'Services' | 'Other';
  endDate: string;
  endOther: string;
  services: string;
  payHourly: boolean;
  hourlyRate: string;
  payPerJob: boolean;
  jobAmount: string;
  payOther: boolean;
  payOtherText: string;
  paymentPlan: 'Recurring Basis' | 'Completion' | 'Invoice' | 'Other';
  frequency: 'Weekly' | 'Monthly' | 'Quarterly';
  planStart: string;
  planOther: string;
  retainer: 'Required' | 'Not Required';
  retainerAmount: string;
  retainerRefundable: 'Refundable' | 'Non-Refundable';
  noticeDays: string;
  governingState: string;
  additionalTerms: string;
}

export interface ContractParty {
  name: string;
  email: string;
  address: string;
  /** PNG data URL when drawn, the typed name otherwise. */
  signature?: string;
  typed?: boolean;
  signedAt?: string;
  /** For a company party: the person who signed on its behalf. */
  signatory?: string;
  /** SHA-256 of the terms at the moment this party signed. */
  termsHash?: string;
}

export type ContractStatus = 'draft' | 'sent' | 'completed' | 'void';

export interface Contract {
  id: ID;
  title: string;
  staffId: ID;
  eventId?: ID;
  status: ContractStatus;
  createdAt: string;
  sentAt?: string;
  terms: ContractTerms;
  /** The PDF's "Client": the company engaging the crew member. */
  employer: ContractParty;
  /** The PDF's "Service Provider / Event Planner": the crew member. */
  staff: ContractParty;
  audit: { at: string; text: string }[];
}
