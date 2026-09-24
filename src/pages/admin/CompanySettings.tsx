import { useState, type ReactNode } from 'react';
import { Briefcase, Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { Button, Card, IconInput } from '../../components/ui';
import { initialsOf, type CompanyProfile } from '../../lib/company';
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
  const toast = useStore((s) => s.toast);
  const [p, setP] = useState<CompanyProfile>(current);
  const [touched, setTouched] = useState(false);
  const set = (patch: Partial<CompanyProfile>) => setP({ ...p, ...patch });
  const dirty = JSON.stringify(p) !== JSON.stringify(current);
  const emailOk = !p.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim());
  const valid = !!(p.name.trim() && p.address.trim() && p.managerName.trim() && emailOk);
  const need = (v: string, msg: string) => (touched && !v.trim() ? msg : undefined);

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const trimmed = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.trim()])) as unknown as CompanyProfile;
    const n = update(trimmed);
    setP(trimmed);
    setTouched(false);
    toast(n ? `Saved — ${n} unsigned contract${n === 1 ? '' : 's'} updated` : 'Company profile saved', '🏢');
  };

  return (
    <div className="mx-auto max-w-4xl pb-24">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Company profile</h1>

      <Card className="overflow-hidden">
        {/* Identity: a live preview of how the company reads on documents */}
        <div className="h-20 bg-gradient-to-r from-[#01175E] via-indigo-800 to-indigo-600" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-6 md:px-8">
          <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#01175E] shadow-md ring-4 ring-white">
            {initialsOf(p.name)}
          </div>
          <div className="min-w-0 flex-1 pt-3">
            <div className="truncate text-lg font-semibold text-slate-900">{p.name.trim() || 'Your company name'}</div>
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
