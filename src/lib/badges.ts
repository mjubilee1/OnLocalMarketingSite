export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-course', emoji: '🎯', name: 'First Steps', description: 'Completed your first course' },
  { id: 'quiz-ace', emoji: '🧠', name: 'Quiz Ace', description: 'Scored 100% on a quiz' },
  { id: 'paperwork-pro', emoji: '✍️', name: 'Paperwork Pro', description: 'Signed all your paperwork' },
  { id: 'event-ready', emoji: '🚀', name: 'Event Ready', description: 'Reached 100% readiness' },
  { id: 'fast-starter', emoji: '⚡', name: 'Fast Starter', description: 'Ready within 48 hours of joining' },
  { id: 'veteran', emoji: '🏅', name: 'Veteran', description: 'Worked 5 or more events' },
  { id: 'five-star', emoji: '⭐', name: 'Five Star', description: 'Received a 5-star shift rating' },
];

export const badge = (id: string) => BADGES.find((b) => b.id === id);

export const LEVELS = [
  { min: 0, name: 'Rookie' },
  { min: 150, name: 'Crew' },
  { min: 400, name: 'Pro' },
  { min: 800, name: 'Lead' },
  { min: 1400, name: 'Legend' },
];

export function level(points: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (points >= l.min) idx = i;
  });
  const cur = LEVELS[idx]!;
  const next = LEVELS[idx + 1];
  return {
    name: cur.name,
    next: next?.name,
    progress: next ? (points - cur.min) / (next.min - cur.min) : 1,
    toNext: next ? next.min - points : 0,
  };
}
