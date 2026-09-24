import type { Course, Lesson, Question } from '../../types';
import type { LibraryCourse } from './types';

// Deterministic ids so a template keeps its identity across releases (templateId matching relies on it).
let n = 0;
const next = (p: string) => `${p}${++n}`;

export const card = (title: string, body: string): Lesson => ({ id: next('tl'), title, kind: 'card', body });

export const q = (prompt: string, options: string[], correct: number, explanation?: string): Omit<Question, 'id'> => ({ prompt, options, correct, explanation });

export const quiz = (title: string, questions: Omit<Question, 'id'>[]): Lesson => ({
  id: next('tl'),
  title,
  kind: 'quiz',
  questions: questions.map((x) => ({ ...x, id: next('tq') })),
});

type CourseSpec = Pick<Course, 'id' | 'title' | 'description' | 'category' | 'emoji' | 'estMinutes'> & { lessons: Lesson[]; points?: number };

/** Build a library entry. Points default to 10 per minute, pass mark 80%. */
export function template(spec: CourseSpec, meta: Omit<LibraryCourse, 'course'>): LibraryCourse {
  return {
    ...meta,
    course: {
      id: spec.id,
      title: spec.title,
      description: spec.description,
      category: spec.category,
      emoji: spec.emoji,
      estMinutes: spec.estMinutes,
      points: spec.points ?? spec.estMinutes * 10,
      passingScore: 80,
      published: true,
      lessons: spec.lessons,
    },
  };
}
