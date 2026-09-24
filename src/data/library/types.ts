import type { Course, DocTemplate } from '../../types';

/** The library currently targets US event companies only. */
export type Region = 'US';
export type TemplateKind = 'legal' | 'safety' | 'welfare' | 'service' | 'operations';

/** Seed role ids a template is recommended for, or 'all' crew. */
export type RoleTag = 'all' | 'r-bar' | 'r-server' | 'r-usher' | 'r-ticket' | 'r-security' | 'r-setup';

export interface Source {
  label: string;
  url: string;
}

export interface LibraryCourse {
  course: Course;
  kind: TemplateKind;
  regions: Region[];
  roles: RoleTag[];
  /** Plain statement of where this training is a legal requirement, if anywhere. */
  legal?: string;
  /** What a manager must localise before publishing (e.g. radio codes, supervisor names). */
  customise?: string;
  sources: Source[];
}

export interface LibraryDoc {
  doc: DocTemplate;
  regions: Region[];
  roles: RoleTag[];
  why: string;
  sources: Source[];
}

export interface Bundle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  courseIds: string[];
  docIds?: string[];
}

export const KIND_LABEL: Record<TemplateKind, string> = {
  legal: 'Legal & compliance',
  safety: 'Health & safety',
  welfare: 'Welfare & safeguarding',
  service: 'Guest service',
  operations: 'Operations',
};


/** When the research behind the library was last checked. Shown in the UI so managers know its age. */
export const RESEARCHED = '2026-09-23';
