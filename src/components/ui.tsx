import { useEffect, type ComponentType, type Ref, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Star, X } from 'lucide-react';
import { cn, color, initials } from '../lib/utils';
import { useStore } from '../store';
import type { Role, StaffStatus } from '../types';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        size === 'sm' && 'px-2.5 py-1.5 text-xs',
        size === 'md' && 'px-3.5 py-2 text-sm',
        size === 'lg' && 'px-5 py-3 text-base',
        variants[variant],
        className,
      )}
    />
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn('rounded-xl bg-white ring-1 ring-slate-200/80 shadow-sm', onClick && 'cursor-pointer hover:ring-indigo-300 transition', className)}>
      {children}
    </div>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', className)}>{children}</span>;
}

export function RolePill({ role }: { role?: Role }) {
  if (!role) return null;
  const c = color(role.color);
  return <Pill className={cn(c.soft, c.text)}>{role.name}</Pill>;
}

const statusStyle: Record<StaffStatus, string> = {
  invited: 'bg-slate-100 text-slate-600',
  onboarding: 'bg-amber-50 text-amber-700',
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-400',
};
const statusLabel: Record<StaffStatus, string> = { invited: 'Invited', onboarding: 'Onboarding', active: 'Ready', inactive: 'Alumni' };
export function StatusPill({ status }: { status: StaffStatus }) {
  return <Pill className={statusStyle[status]}>{statusLabel[status]}</Pill>;
}

export function Progress({ value, className, barClass }: { value: number; className?: string; barClass?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', barClass ?? (v === 100 ? 'bg-emerald-500' : v >= 50 ? 'bg-indigo-500' : 'bg-amber-500'))}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const col = value === 100 ? '#10b981' : value >= 50 ? '#6366f1' : '#f59e0b';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={col}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

const AVATAR_COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-orange-500'];
export function Avatar({ name, photo, size = 'md' }: { name: string; photo?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const idx = [...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const dims = cn(size === 'sm' && 'h-7 w-7 text-[11px]', size === 'md' && 'h-9 w-9 text-sm', size === 'lg' && 'h-12 w-12 text-base', size === 'xl' && 'h-16 w-16 text-xl');
  if (photo) return <img src={photo} alt={name} className={cn('shrink-0 rounded-full bg-slate-100 object-cover', dims)} />;
  return <div className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', AVATAR_COLORS[idx], dims)}>{initials(name)}</div>;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className={cn('max-h-[90vh] w-full overflow-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl anim-pop', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
/** Input with a leading icon. `!` overrides are needed because cn() doesn't merge conflicting classes. */
export function IconInput({ icon: I, invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: ComponentType<{ size?: number; className?: string }>; invalid?: boolean }) {
  return (
    <div className="relative">
      <I size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input {...props} className={cn(inputCls, 'h-10 pl-9!', invalid && 'border-rose-300! focus:border-rose-500! focus:ring-rose-100!', className)} />
    </div>
  );
}
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) => <textarea {...p} className={cn(inputCls, p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, p.className)} />;

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition cursor-pointer',
            value === t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800',
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
        </div>
        {icon && <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">{icon}</div>}
      </div>
    </Card>
  );
}

export function Empty({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-10 text-center">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <div className="font-medium text-slate-700">{title}</div>
      {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
    </div>
  );
}

export function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i)} className={cn('p-0.5', onChange && 'cursor-pointer hover:scale-110 transition')}>
          <Star size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
}

/** Renders the lightweight lesson markup: paragraphs, "- " bullets, "## " headings, **bold**. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const bold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') ? <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong> : part));
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={cn('space-y-3 text-slate-700 leading-relaxed', className)}>
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*[-•]\s/.test(l)))
          return (
            <ul key={i} className="space-y-2">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  <span>{bold(l.replace(/^\s*[-•]\s/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        if (lines[0]!.startsWith('## '))
          return (
            <div key={i}>
              <h4 className="mb-1 font-semibold text-slate-900">{lines[0]!.slice(3)}</h4>
              {lines.slice(1).length > 0 && <RichText text={lines.slice(1).join('\n')} />}
            </div>
          );
        return (
          <p key={i} className="whitespace-pre-line">
            {bold(b)}
          </p>
        );
      })}
    </div>
  );
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg anim-pop cursor-pointer"
        >
          {t.emoji && <span>{t.emoji}</span>}
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function DateBadge({ date, colorKey = 'indigo', size = 'md' }: { date: string; colorKey?: string; size?: 'md' | 'lg' }) {
  const c = color(colorKey);
  const d = new Date(date + 'T00:00:00');
  return (
    <div className={cn('flex shrink-0 flex-col items-center justify-center rounded-lg', c.soft, c.text, size === 'md' ? 'h-12 w-12' : 'h-14 w-14')}>
      <span className="text-[10px] font-semibold uppercase">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
      <span className={cn('font-bold leading-none', size === 'md' ? 'text-lg' : 'text-xl')}>{d.getDate()}</span>
    </div>
  );
}
