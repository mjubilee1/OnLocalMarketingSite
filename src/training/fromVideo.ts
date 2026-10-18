import type { TrainingSpec, VideoSource } from './types';

/** One spoken beat in the worked example. The film shows it; Alex says the caption. */
export interface VideoBeat {
  id: string;
  label: string;
  /** Seconds into the film. */
  at: number;
  /** Pause before the next beat, and before any frame that gives away the check. */
  until: number;
  caption: string;
}

export interface VideoMove {
  id: string;
  label: string;
  correct?: boolean;
  miss?: string;
}

/**
 * One hospitality workstation, built from a film the crew already has.
 * The next station is another one of these — not a new plate layout.
 */
export interface VideoWorkstation {
  id: string;
  role: string;
  department: string;
  title: string;
  venue?: string;
  job: string;
  /** Public URL of the film. */
  video: string;
  /** Do not play the worked example past this second. */
  holdBefore: number;
  beats: VideoBeat[];
  check: {
    id: string;
    prompt: string;
    choices: VideoMove[];
  };
  updatedAt: string;
}

const MAX_WORDS = 18;

function words(line: string) {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Turns one workstation film into a setup card.
 * Same bar as a plate: a short worked example, then the trainee has to do the move.
 */
export function practiceFromVideo(ws: VideoWorkstation): TrainingSpec {
  if (ws.beats.length < 2 || ws.beats.length > 5) {
    throw new Error(`${ws.id} needs 2–5 beats, got ${ws.beats.length}`);
  }
  for (const beat of ws.beats) {
    const n = words(beat.caption);
    if (n > MAX_WORDS) throw new Error(`${ws.id} beat “${beat.id}” is ${n} words`);
    if (beat.at < 0 || beat.until <= beat.at) throw new Error(`${ws.id} beat “${beat.id}” has a bad time range`);
    if (beat.until > ws.holdBefore) throw new Error(`${ws.id} beat “${beat.id}” plays into the check`);
  }
  const correct = ws.check.choices.filter((c) => c.correct);
  if (ws.check.choices.length < 2 || correct.length !== 1) {
    throw new Error(`${ws.id} check needs one correct move and at least one miss`);
  }
  for (const choice of ws.check.choices) {
    if (!choice.correct && !choice.miss?.trim()) throw new Error(`${ws.id} move “${choice.id}” needs a miss line`);
  }

  const source: VideoSource = {
    video: ws.video,
    workstationId: ws.id,
    role: ws.role,
    job: ws.job,
  };

  return {
    id: ws.id,
    department: ws.department,
    title: ws.title,
    venue: ws.venue,
    version: 1,
    updatedAt: ws.updatedAt,
    template: 'service',
    source,
    scene: {
      kind: 'service',
      items: ws.beats.map((beat, i) => ({
        id: beat.id,
        kind: 'cue',
        label: beat.label,
        x: 50,
        y: 22 + i * 16,
        z: i,
      })),
    },
    steps: ws.beats.map((beat, i) => ({
      id: beat.id,
      caption: beat.caption,
      anim: i === ws.beats.length - 1 ? ('highlight' as const) : ('appear' as const),
      itemIds: [beat.id],
      at: beat.at,
      until: beat.until,
    })),
    checks: [
      {
        id: ws.check.id,
        kind: 'move',
        prompt: ws.check.prompt,
        itemIds: ws.check.choices.map((c) => c.id),
        choices: ws.check.choices,
      },
    ],
    changeNotes: [],
  };
}
