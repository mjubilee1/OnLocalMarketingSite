import type { Course, DocTemplate, Role } from '../types';
import type { LibraryCourse, LibraryDoc, RoleTag } from '../data/library/types';
import { useStore } from '../store';
import { uid } from './utils';

/** Map a template's recommended role tags onto the roles this company actually has. */
export function recommendedRoleIds(tags: RoleTag[], roles: Role[]): string[] {
  if (tags.includes('all')) return roles.map((r) => r.id);
  return roles.filter((r) => (tags as string[]).includes(r.id)).map((r) => r.id);
}

/** A fresh copy with new ids, so edits never touch the library original and progress tracks per company. */
export function cloneTemplateCourse(t: LibraryCourse, published: boolean): Course {
  const c = structuredClone(t.course);
  return {
    ...c,
    id: uid('c-'),
    templateId: t.course.id,
    published,
    lessons: c.lessons.map((l) => ({ ...l, id: uid('l'), questions: l.questions?.map((q) => ({ ...q, id: uid('q') })) })),
  };
}

export const installedCourse = (templateId: string) => useStore.getState().courses.find((c) => c.templateId === templateId);
export const installedDoc = (templateId: string) => useStore.getState().docs.find((d) => d.templateId === templateId);

/** Adds a course template (or reuses the copy already added) and attaches it to the given roles. */
export function addCourseTemplate(t: LibraryCourse, roleIds: string[], published: boolean): { course: Course; isNew: boolean } {
  const st = useStore.getState();
  const existing = installedCourse(t.course.id);
  const course = existing ?? cloneTemplateCourse(t, published);
  if (!existing) st.upsertCourse(course);
  for (const r of useStore.getState().roles.filter((x) => roleIds.includes(x.id) && !x.courseIds.includes(course.id))) {
    useStore.getState().upsertRole({ ...r, courseIds: [...r.courseIds, course.id] });
  }
  return { course, isNew: !existing };
}

export function addDocTemplate(t: LibraryDoc, roleIds: string[]): { doc: DocTemplate; isNew: boolean } {
  const st = useStore.getState();
  const existing = installedDoc(t.doc.id);
  const doc: DocTemplate = existing ?? { ...structuredClone(t.doc), id: uid('d-'), templateId: t.doc.id };
  if (!existing) st.upsertDoc(doc);
  for (const r of useStore.getState().roles.filter((x) => roleIds.includes(x.id) && !x.docIds.includes(doc.id))) {
    useStore.getState().upsertRole({ ...r, docIds: [...r.docIds, doc.id] });
  }
  return { doc, isNew: !existing };
}
