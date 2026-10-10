import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Briefcase, Building2, ImagePlus, Mail, MapPin, Phone, UserRound, Users, X } from 'lucide-react';
import { Button, Card, IconInput } from '../../components/ui';
import { BRAND_PRESETS, brandPalette, normalizeHex, resizeLogo } from '../../lib/brand';
import { displayName, initialsOf, type CompanyProfile } from '../../lib/company';
import { cn } from '../../lib/utils';
import { useCompany, useStore } from '../../store';

function Row({ label, hint, required, error, children }: { label: string; hint?: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-rose-600">{error}</span> : hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function ColorField({ label, hint, value, invalid, onChange }: { label: string; hint: string; value: string; invalid?: boolean; onChange: (v: string) => void }) {
  const picker = normalizeHex(value) ?? '#4f46e5';
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className={cn('flex h-10 items-center gap-2 rounded-lg border bg-white px-2 shadow-sm', invalid ? 'border-rose-300' : 'border-slate-300')}>
        <input type="color" value={picker} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" aria-label={`${label} color`} />
        <input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="w-full bg-transparent font-mono text-sm uppercase outline-none" />
      </span>
      <span className="mt-1.5 block text-xs text-slate-500">{invalid ? 'Use a hex color like #0F766E.' : hint}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr] md:gap-10 md:p-8">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export default function CompanySettings() {
  const current = useCompany();
  const update = useStore((s) => s.updateCompany);
  const setPreview = useStore((s) => s.setBrandPreview);
  const toast = useStore((s) => s.toast);
  const [p, setP] = useState<CompanyProfile>(current);
  const [touched, setTouched] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<CompanyProfile>) => setP((prev) => ({ ...prev, ...patch }));
  const dirty = JSON.stringify(p) !== JSON.stringify(current);
  const emailOk = !p.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim());
  const primaryOk = !!normalizeHex(p.primaryColor);
  const accentOk = !!normalizeHex(p.accentColor);
  const valid = !!(p.name.trim() && p.address.trim() && p.managerName.trim() && emailOk && primaryOk && accentOk);
  const need = (v: string, msg: string) => (touched && !v.trim() ? msg : undefined);
  const palette = useMemo(() => brandPalette(p.primaryColor, p.accentColor), [p.primaryColor, p.accentColor]);

  useLayoutEffect(() => {
    const primary = normalizeHex(p.primaryColor);
    const accent = normalizeHex(p.accentColor);
    if (primary && accent) setPreview({ primary, accent, teamName: p.teamName, logo: p.logo });
  }, [p.primaryColor, p.accentColor, p.teamName, p.logo, setPreview]);
  useLayoutEffect(() => () => setPreview(null), [setPreview]);

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const trimmed: CompanyProfile = {
      name: p.name.trim(),
      address: p.address.trim(),
      email: p.email.trim(),
      phone: p.phone.trim(),
      managerName: p.managerName.trim(),
      managerTitle: p.managerTitle.trim(),
      teamName: p.teamName.trim(),
      primaryColor: normalizeHex(p.primaryColor)!,
      accentColor: normalizeHex(p.accentColor)!,
      logo: p.logo.trim(),
    };
    const n = update(trimmed);
    setP(trimmed);
    setTouched(false);
    toast(n ? `Saved — ${n} unsigned contract${n === 1 ? '' : 's'} updated` : 'Brand saved', '🏢');
  };

  const pickLogo = async (file: File | undefined) => {
    if (!file) return;
    setLogoError('');
    try {
      set({ logo: await resizeLogo(file) });
    } catch (e) {
      setLogoError((e as Error).message);
    } finally {
      if (logoRef.current) logoRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-24">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Brand & company</h1>

      <Card className="overflow-hidden">
        {/* Identity: a live preview of how the company reads on documents */}
        <div className="h-20" style={{ background: `linear-gradient(90deg, ${palette.ink}, ${palette.primary}, ${palette.accent})` }} />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-6 md:px-8">
          <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-2xl font-bold shadow-md ring-4 ring-white" style={{ color: palette.primary }}>
            {p.logo ? <img src={p.logo} alt="" className="h-full w-full object-contain p-2" /> : initialsOf(displayName(p))}
          </div>
          <div className="min-w-0 flex-1 pt-3">
            <div className="truncate text-lg font-semibold text-slate-900">{displayName(p)}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {p.address.trim() && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {p.address}
                </span>
              )}
              {p.email.trim() && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {p.email}
                </span>
              )}
              {p.phone.trim() && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {p.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100">
          <Section title="Your brand">
            <Row label="Team name" hint="Shown in the app, on the sign-up page, and in invite emails. Contracts keep using your legal company name.">
              <IconInput icon={Users} value={p.teamName} onChange={(e) => set({ teamName: e.target.value })} placeholder={p.name.trim() || 'Harbor Events'} />
            </Row>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Colors</span>
              <div className="flex flex-wrap gap-2">
                {BRAND_PRESETS.map((preset) => {
                  const on = normalizeHex(p.primaryColor) === preset.primary && normalizeHex(p.accentColor) === preset.accent;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => set({ primaryColor: preset.primary, accentColor: preset.accent })}
                      className={cn('flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-medium ring-1', on ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300')}
                    >
                      <span className="flex h-5 w-5 overflow-hidden rounded-full">
                        <span className="h-full w-1/2" style={{ background: preset.primary }} />
                        <span className="h-full w-1/2" style={{ background: preset.accent }} />
                      </span>
                      {preset.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ColorField label="Primary" hint="Buttons, links, and the sidebar." value={p.primaryColor} invalid={!primaryOk} onChange={(primaryColor) => set({ primaryColor })} />
                <ColorField label="Accent" hint="Headers and gradients." value={p.accentColor} invalid={!accentOk} onChange={(accentColor) => set({ accentColor })} />
              </div>
              {palette.adjusted && <p className="mt-2 text-xs text-slate-500">The primary color was deepened so white text stays readable on buttons.</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-lg px-3 py-2 text-sm font-medium text-white" style={{ background: palette.primary }}>
                  Primary button
                </span>
                <span className="rounded-lg px-3 py-2 text-sm font-medium text-white" style={{ background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})` }}>
                  Crew header
                </span>
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Logo</span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 hover:ring-slate-300"
                >
                  {p.logo ? <img src={p.logo} alt="" className="h-full w-full object-contain p-1.5" /> : <ImagePlus size={18} className="text-slate-400" />}
                </button>
                <div>
                  <Button type="button" variant="secondary" onClick={() => logoRef.current?.click()}>
                    {p.logo ? 'Replace logo' : 'Upload logo'}
                  </Button>
                  {p.logo && (
                    <button type="button" className="ml-2 cursor-pointer text-sm text-slate-500 hover:text-slate-800" onClick={() => set({ logo: '' })}>
                      <X size={14} className="mr-0.5 inline" /> Remove
                    </button>
                  )}
                  <p className="mt-1.5 text-xs text-slate-500">PNG, JPG, or SVG. Shown beside the team name. Without one, the app uses your initials.</p>
                  {logoError && <p className="mt-1 text-xs text-rose-600">{logoError}</p>}
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => pickLogo(e.target.files?.[0])} />
            </div>
          </Section>

          <Section title="Company details">
            <Row label="Legal company name" required error={need(p.name, 'Enter your legal company name.')}>
              <IconInput icon={Building2} value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your Company LLC" invalid={!!need(p.name, 'x')} />
            </Row>
            <Row label="Mailing address" required error={need(p.address, 'Enter a mailing address.')}>
              <IconInput icon={MapPin} value={p.address} onChange={(e) => set({ address: e.target.value })} placeholder="Street, city, state, ZIP" invalid={!!need(p.address, 'x')} />
            </Row>
            <div className="grid gap-5 sm:grid-cols-2">
              <Row label="Contact email" error={emailOk ? undefined : 'Enter a valid email address.'}>
                <IconInput icon={Mail} type="email" value={p.email} onChange={(e) => set({ email: e.target.value })} placeholder="crew@yourcompany.com" invalid={!emailOk} />
              </Row>
              <Row label="Contact phone">
                <IconInput icon={Phone} type="tel" value={p.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+1 555 000 0000" />
              </Row>
            </div>
          </Section>

          <Section title="Crew manager">
            <div className="grid gap-5 sm:grid-cols-2">
              <Row label="Full name" required error={need(p.managerName, 'Enter the manager’s name.')}>
                <IconInput icon={UserRound} value={p.managerName} onChange={(e) => set({ managerName: e.target.value })} placeholder="Alex Rivera" invalid={!!need(p.managerName, 'x')} />
              </Row>
              <Row label="Job title">
                <IconInput icon={Briefcase} value={p.managerTitle} onChange={(e) => set({ managerTitle: e.target.value })} placeholder="Crew Manager" />
              </Row>
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 md:px-8">
          <Button
            variant="ghost"
            disabled={!dirty}
            onClick={() => {
              setP(current);
              setTouched(false);
            }}
          >
            Discard
          </Button>
          <Button disabled={!dirty} onClick={save}>
            Save changes
          </Button>
        </div>
      </Card>

      {/* Floating reminder so changes aren't lost when the form is scrolled */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-6 z-30 flex justify-center px-4 transition-all duration-200',
          dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <div className="flex items-center gap-4 rounded-xl bg-slate-900 py-2.5 pl-4 pr-2.5 text-sm text-white shadow-xl">
          <span>You have unsaved changes</span>
          <button
            className="cursor-pointer rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => {
              setP(current);
              setTouched(false);
            }}
          >
            Discard
          </button>
          <button className="cursor-pointer rounded-lg bg-white px-3 py-1.5 font-medium text-slate-900 hover:bg-slate-100" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
