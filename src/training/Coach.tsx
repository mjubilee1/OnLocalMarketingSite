import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { aiStatus, askCoach } from '../lib/ai';
import { cn } from '../lib/utils';
import { canListen, hush, listen, speak, unlockAudio } from './voice';
import type { TrainingSpec } from './types';

export type CoachMood = 'idle' | 'talk' | 'listen' | 'think';

export interface LookingAt {
  phase: string;
  caption: string;
  highlights: string[];
}

interface CoachApi {
  mood: CoachMood;
  line: string;
  muted: boolean;
  listening: boolean;
  setLookingAt: (l: LookingAt) => void;
  toggleMute: () => void;
  toggleListen: () => void;
  ask: (text: string) => void;
}

const Ctx = createContext<CoachApi | null>(null);
export const useCoach = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('CoachProvider missing');
  return v;
};

function packSpec(spec: TrainingSpec) {
  return {
    title: spec.title,
    department: spec.department,
    version: spec.version,
    changeNotes: spec.changeNotes.map((n) => ({ summary: n.summary })),
    items: spec.scene.items.map((it) => ({ label: it.label, x: it.x, y: it.y })),
    steps: spec.steps.map((s) => ({ caption: s.caption })),
    checks: spec.checks.map((c) => ({ prompt: c.prompt })),
  };
}

function localReply(q: string, spec: TrainingSpec, look: LookingAt): string {
  const n = q.toLowerCase();
  const item = (id: string) => spec.scene.items.find((it) => it.id === id);
  const side = (x: number) => (x < 48 ? 'left' : x > 52 ? 'right' : 'center');
  const note = spec.changeNotes[spec.changeNotes.length - 1];
  if (/what.?s on|looking at|this plate|on the plate/.test(n)) {
    const names = spec.scene.items.filter((it) => it.kind !== 'plate' && it.kind !== 'table' && it.kind !== 'cloth').map((it) => it.label);
    return `You’re looking at ${spec.title}. On the plate: ${names.join(', ')}. ${look.caption}`;
  }
  if (/chicken|protein|meat/.test(n)) {
    const c = item('chicken');
    if (c) return `Chicken is the protein. It sits on the guest’s ${side(c.x)}. Don’t cover it with garnish.`;
  }
  if (/potato|starch/.test(n)) {
    const s = item('starch');
    if (s) return `Potato is the starch. It sits on the guest’s ${side(s.x)}, opposite the protein.`;
  }
  if (/veg|green/.test(n)) {
    const v = item('veg');
    if (v) return `Vegetables sit at about 5 o’clock on the plate.`;
  }
  if (/changed|different|new vers|update|move/.test(n) && note) return note.summary;
  if (/where|standard|tonight/.test(n)) return look.caption || spec.steps[spec.steps.length - 1]?.caption || 'Follow the highlighted spots — that’s tonight’s standard.';
  return '';
}

export function CoachProvider({ spec, children }: { spec: TrainingSpec; children: ReactNode }) {
  const [mood, setMood] = useState<CoachMood>('idle');
  const [line, setLine] = useState('Hold the mic and ask me anything about this setup.');
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const looking = useRef<LookingAt>({ phase: 'walk', caption: '', highlights: [] });
  const history = useRef<{ role: 'staff' | 'coach'; text: string }[]>([]);
  const listenCtl = useRef<{ stop: () => void } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const lastCaption = useRef('');
  const mutedRef = useRef(false);
  const listeningRef = useRef(false);
  mutedRef.current = muted;
  listeningRef.current = listening;
  const specRef = useRef(spec);
  specRef.current = spec;

  const say = (text: string) => {
    setLine(text);
    if (mutedRef.current) {
      setMood('idle');
      return;
    }
    setMood('talk');
    speak(
      text,
      () => setMood('talk'),
      () => setMood('idle'),
    );
  };

  const ask = (text: string) => {
    const q = text.trim();
    if (q.length < 2) return;
    unlockAudio();
    hush();
    listenCtl.current?.stop();
    setListening(false);
    history.current = [...history.current, { role: 'staff', text: q }].slice(-8);
    setMood('think');
    setLine('Let me check the standard…');
    abort.current?.abort();
    abort.current = new AbortController();
    const s = specRef.current;
    const fallback = localReply(q, s, looking.current);
    const finish = (reply: string) => {
      history.current = [...history.current, { role: 'coach', text: reply }].slice(-8);
      say(reply);
    };
    aiStatus().then((st) => {
      if (!st.configured) {
        finish(fallback || 'I can only coach from this standard. Ask where the protein, starch, or garnish goes.');
        return;
      }
      return askCoach(
        { question: q, history: history.current, lookingAt: looking.current, spec: packSpec(s) },
        () => {},
        abort.current?.signal,
      ).then((r) => finish(r.data.reply.trim()));
    }).catch(() => {
      finish(fallback || 'I can only coach from this standard. Ask where the protein, starch, or garnish goes.');
    });
  };

  const setLookingAt = (l: LookingAt) => {
    looking.current = l;
    if (l.caption && l.caption !== lastCaption.current) {
      lastCaption.current = l.caption;
      if (!listeningRef.current) say(l.caption);
    }
  };

  const toggleListen = () => {
    unlockAudio();
    if (listeningRef.current) {
      listenCtl.current?.stop();
      setListening(false);
      setMood('idle');
      return;
    }
    hush();
    setListening(true);
    setMood('listen');
    setLine('Listening… ask about the plate.');
    listenCtl.current = listen({
      onPartial: (t) => t && setLine(t),
      onFinal: (t) => {
        setListening(false);
        ask(t);
      },
      onError: (m) => {
        setListening(false);
        setMood('idle');
        setLine(m === 'not-allowed' ? 'Allow the mic to talk with me.' : 'Couldn’t hear that — tap the mic and try again.');
      },
    });
  };

  useEffect(
    () => () => {
      hush();
      listenCtl.current?.stop();
      abort.current?.abort();
    },
    [],
  );

  const api: CoachApi = {
    mood,
    line,
    muted,
    listening,
    setLookingAt,
    toggleMute: () => {
      setMuted((m) => {
        if (!m) hush();
        return !m;
      });
      setMood('idle');
    },
    toggleListen,
    ask,
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function CoachFigure({ className }: { className?: string }) {
  const { mood, line } = useCoach();
  const talking = mood === 'talk';
  const listen = mood === 'listen';
  const think = mood === 'think';

  return (
    <div className={cn('flex w-[6.5rem] shrink-0 flex-col items-center sm:w-32', className)}>
      <motion.div
        className="relative"
        animate={{ y: talking ? [0, -3, 0] : listen ? [0, -1, 0] : [0, 4, 0] }}
        transition={{ duration: talking ? 0.45 : listen ? 1.2 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {(listen || think) && (
          <span className={cn('absolute -inset-2 rounded-full border-2', listen ? 'animate-ping border-indigo-400/40' : 'border-indigo-200')} />
        )}
        <svg viewBox="0 0 88 150" className="h-auto w-full drop-shadow-md" aria-hidden>
          <ellipse cx="44" cy="144" rx="22" ry="5" fill="#c7d2fe" />
          <rect x="28" y="78" width="32" height="48" rx="10" fill="#1e293b" />
          <rect x="30" y="80" width="28" height="18" rx="4" fill="#f8fafc" />
          <path d="M44 80 v22" stroke="#4f46e5" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="44" cy="86" r="2.2" fill="#4f46e5" />
          <rect x="18" y="84" width="12" height="28" rx="6" fill="#1e293b" />
          <rect x="58" y="84" width="12" height="28" rx="6" fill="#1e293b" />
          <motion.g
            animate={{ rotate: talking ? [0, 8, 0, -6, 0] : 0 }}
            transition={{ duration: 0.7, repeat: talking ? Infinity : 0 }}
            style={{ originX: 0.78, originY: 0.6 }}
          >
            <rect x="62" y="84" width="11" height="27" rx="6" fill="#0f172a" />
            <rect x="63" y="108" width="9" height="8" rx="3" fill="#e8b894" />
          </motion.g>
          <rect x="32" y="122" width="10" height="22" rx="4" fill="#0f172a" />
          <rect x="46" y="122" width="10" height="22" rx="4" fill="#0f172a" />
          <circle cx="44" cy="52" r="22" fill="#e8b894" />
          <path d="M24 48c2-18 38-18 40 2-8-10-32-10-40-2z" fill="#3f2a1d" />
          <ellipse cx="36" cy="54" rx="2.2" ry={listen ? 2.8 : 2.2} fill="#1e293b" />
          <ellipse cx="52" cy="54" rx="2.2" ry={listen ? 2.8 : 2.2} fill="#1e293b" />
          <path d="M35 62c4 3 14 3 18 0" stroke="#c47c5a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <motion.ellipse
            cx="44"
            cy="70"
            rx="5"
            animate={{ ry: talking ? [1.2, 4.2, 1.4, 3.6, 1.2] : 1.1 }}
            transition={{ duration: 0.32, repeat: talking ? Infinity : 0, ease: 'easeInOut' }}
            fill="#7f1d1d"
          />
          <rect x="26" y="34" width="36" height="8" rx="3" fill="#111827" />
        </svg>
      </motion.div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Alex</p>
      <p className="mt-0.5 min-h-10 text-center text-[11px] leading-snug text-slate-600">{think ? '…' : line}</p>
    </div>
  );
}

export function CoachBar() {
  const { mood, listening, muted, toggleListen, toggleMute, ask, line } = useCoach();
  const [typed, setTyped] = useState('');
  const voice = canListen();

  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleListen}
          disabled={!voice}
          className={cn(
            'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
            listening ? 'bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-700',
            !voice && 'opacity-40',
          )}
          aria-label={listening ? 'Stop listening' : 'Talk to Alex'}
        >
          {mood === 'think' ? <Loader2 size={20} className="animate-spin" /> : listening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            unlockAudio();
            ask(typed);
            setTyped('');
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={voice ? 'Tap the mic, or type a question' : 'Type a question about the plate'}
            className="h-11 min-w-0 flex-1 rounded-xl bg-white px-3 text-sm ring-1 ring-slate-200 outline-none focus:ring-indigo-400"
          />
          <button type="submit" className="rounded-xl px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
            Ask
          </button>
        </form>
        <button type="button" onClick={toggleMute} className="rounded-lg p-2 text-slate-500 hover:bg-white" aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      {listening && <p className="mt-2 text-center text-xs text-rose-600">Listening — {line}</p>}
    </div>
  );
}

export function SceneRow({ lookingAt, children }: { lookingAt: LookingAt; children: ReactNode }) {
  const { setLookingAt } = useCoach();
  useEffect(() => {
    setLookingAt(lookingAt);
  }, [lookingAt.phase, lookingAt.caption, lookingAt.highlights.join('|'), setLookingAt]);
  return (
    <div className="flex items-end gap-2 sm:gap-4">
      <div className="min-w-0 flex-1">{children}</div>
      <CoachFigure />
    </div>
  );
}
