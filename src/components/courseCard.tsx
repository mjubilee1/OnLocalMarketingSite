import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, Play } from 'lucide-react';
import { parseVideo } from '../lib/video';
import { cn } from '../lib/utils';
import type { Course, CoverImage } from '../types';

/** Cover gradients per category, so a library of courses reads like a catalog rather than a list. */
const THEMES: Record<string, string> = {
  'Health & Safety': 'from-rose-500 via-orange-500 to-amber-400',
  Compliance: 'from-[#01175E] via-indigo-700 to-indigo-500',
  'Customer Service': 'from-sky-600 via-sky-500 to-cyan-400',
  Operations: 'from-emerald-600 via-emerald-500 to-teal-400',
  Welfare: 'from-violet-600 via-purple-500 to-fuchsia-400',
  Onboarding: 'from-amber-500 via-orange-500 to-rose-400',
};
const FALLBACK = ['from-indigo-600 via-indigo-500 to-sky-400', 'from-teal-600 via-teal-500 to-lime-400', 'from-slate-700 via-slate-600 to-slate-400', 'from-pink-600 via-rose-500 to-orange-400'];

/** Text color matching each category's cover, for section headings. */
const ACCENTS: Record<string, string> = {
  'Health & Safety': 'text-rose-600',
  Compliance: 'text-[#01175E]',
  'Customer Service': 'text-sky-700',
  Operations: 'text-emerald-700',
  Welfare: 'text-violet-700',
  Onboarding: 'text-amber-700',
};
const FALLBACK_ACCENTS = ['text-indigo-700', 'text-teal-700', 'text-slate-700', 'text-pink-700'];

export function courseAccent(category: string) {
  if (ACCENTS[category]) return ACCENTS[category];
  const i = [...category].reduce((a, ch) => a + ch.charCodeAt(0), 0) % FALLBACK_ACCENTS.length;
  return FALLBACK_ACCENTS[i]!;
}

export function courseTheme(category: string) {
  if (THEMES[category]) return THEMES[category];
  const i = [...category].reduce((a, ch) => a + ch.charCodeAt(0), 0) % FALLBACK.length;
  return FALLBACK[i]!;
}

/** First video lesson with a real thumbnail (YouTube), used as the cover photo. */
function coverImage(c: Course): string | undefined {
  for (const l of c.lessons) {
    if (l.kind !== 'video') continue;
    const t = parseVideo(l.videoUrl)?.thumbnail;
    if (t) return t;
  }
}

export function CourseCover({ c, className, badges, corner, progress }: { c: Course; className?: string; badges?: ReactNode; corner?: ReactNode; progress?: number }) {
  const img = c.cover?.url ?? coverImage(c);
  const [broken, setBroken] = useState<string | null>(null);
  const hasVideo = c.lessons.some((l) => l.kind === 'video');
  return (
    <div className={cn('relative aspect-[16/9] overflow-hidden bg-gradient-to-br', courseTheme(c.category), className)}>
      {img && broken !== img ? (
        <>
          <img src={img} alt={c.cover?.alt ?? ''} loading="lazy" onError={() => setBroken(img)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          {c.cover && (
            // The photo license requires crediting the photographer.
            <span className="absolute bottom-2 left-2.5 max-w-[60%] truncate text-[10px] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">Photo: {c.cover.credit}</span>
          )}
        </>
      ) : (
        <>
          {/* Decorative shapes */}
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15" />
          <div className="absolute -bottom-14 -left-6 h-32 w-32 rounded-full bg-black/10" />
          <div
            className="absolute inset-0 opacity-25"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-lg ring-1 ring-white/30 backdrop-blur-sm transition duration-300 group-hover:scale-110">
              {c.emoji}
            </div>
          </div>
        </>
      )}
      {hasVideo && (
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <Play size={10} className="fill-white" /> Video
        </span>
      )}
      {badges && <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">{badges}</div>}
      {corner && <div className="absolute right-2.5 top-2.5">{corner}</div>}
      {progress !== undefined && progress > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
          <div className={cn('h-full', progress >= 1 ? 'bg-emerald-400' : 'bg-white')} style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

/** A card's photo with the photographer credit its license requires. */
export function LessonPhoto({ image, className }: { image: CoverImage; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <figure className={className}>
      <img src={image.url} alt={image.alt ?? ''} loading="lazy" onError={() => setBroken(true)} className="aspect-[16/9] w-full rounded-xl bg-slate-100 object-cover shadow-sm" />
      <figcaption className="mt-1 text-right text-[10px] text-slate-400">
        Photo:{' '}
        {image.sourceUrl ? (
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 hover:underline">
            {image.credit}
          </a>
        ) : (
          image.credit
        )}
      </figcaption>
    </figure>
  );
}

/** Small pill that sits on the cover image. */
export function CoverBadge({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' | 'green' | 'red' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold shadow-sm',
        tone === 'light' && 'bg-white/95 text-slate-800',
        tone === 'dark' && 'bg-slate-900/80 text-white backdrop-blur-sm',
        tone === 'green' && 'bg-emerald-500 text-white',
        tone === 'red' && 'bg-rose-600 text-white',
      )}
    >
      {children}
    </span>
  );
}

export function CourseCard({
  c,
  provider,
  to,
  onClick,
  badges,
  corner,
  progress,
  stat,
  footer,
  className,
}: {
  c: Course;
  /** Who the course is from, shown with the logo mark (e.g. the company name). */
  provider: string;
  to?: string;
  onClick?: () => void;
  badges?: ReactNode;
  corner?: ReactNode;
  progress?: number;
  /** A highlighted line under the title, like Coursera's rating row. */
  stat?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const skills = c.lessons.filter((l) => l.kind !== 'quiz').map((l) => l.title);
  const body = (
    <div
      onClick={onClick}
      className={cn(
        'group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-slate-300',
        className,
      )}
    >
      <CourseCover c={c} badges={badges} corner={corner} progress={progress} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-slate-200">
            <img src="/brand/onlocalai-mark.svg" alt="" className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-xs text-slate-600">{provider}</span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">{c.title}</h3>
        {skills.length > 0 && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-700">Skills you'll gain:</span> {skills.join(', ')}
          </p>
        )}
        <div className="flex-1" />
        {stat && <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">{stat}</div>}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <span>{c.category}</span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Layers size={12} /> {c.lessons.length} lessons
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {c.estMinutes} min
          </span>
        </div>
        {footer && <div className="mt-3 border-t border-slate-100 pt-3">{footer}</div>}
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
