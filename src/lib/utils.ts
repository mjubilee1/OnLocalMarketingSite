export const uid = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const todayISO = () => toDateISO(new Date());

export const toDateISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (days: number, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
};

export const addMonths = (iso: string, months: number) => {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return toDateISO(d);
};

/** Whole days from today until the given YYYY-MM-DD (negative = past). */
export const daysUntil = (iso: string) => {
  const target = new Date(iso.slice(0, 10) + 'T00:00:00').getTime();
  const now = new Date(todayISO() + 'T00:00:00').getTime();
  return Math.round((target - now) / 86_400_000);
};

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString(undefined, opts);

export const fmtDay = (iso: string) => fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' });

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
};

export const countdown = (iso: string) => {
  const d = daysUntil(iso);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d < 0) return `${-d} days ago`;
  return `In ${d} days`;
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

export const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

/** Full literal class names so Tailwind can see them. */
export const COLOR: Record<string, { bg: string; text: string; soft: string; ring: string; bar: string }> = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-700', soft: 'bg-indigo-50', ring: 'ring-indigo-200', bar: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-700', soft: 'bg-violet-50', ring: 'ring-violet-200', bar: 'bg-violet-500' },
  sky: { bg: 'bg-sky-600', text: 'text-sky-700', soft: 'bg-sky-50', ring: 'ring-sky-200', bar: 'bg-sky-500' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-700', soft: 'bg-emerald-50', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-700', soft: 'bg-amber-50', ring: 'ring-amber-200', bar: 'bg-amber-500' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-700', soft: 'bg-rose-50', ring: 'ring-rose-200', bar: 'bg-rose-500' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', soft: 'bg-orange-50', ring: 'ring-orange-200', bar: 'bg-orange-500' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-700', soft: 'bg-teal-50', ring: 'ring-teal-200', bar: 'bg-teal-500' },
  slate: { bg: 'bg-slate-600', text: 'text-slate-700', soft: 'bg-slate-100', ring: 'ring-slate-200', bar: 'bg-slate-500' },
};
export const COLOR_KEYS = Object.keys(COLOR);
export const color = (key: string) => COLOR[key] ?? COLOR.indigo!;

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Hindi', 'Vietnamese', 'Mandarin', 'Portuguese'];
