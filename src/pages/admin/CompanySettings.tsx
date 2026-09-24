import { useState } from 'react';
import { Building2, FileSignature, Save, ScrollText } from 'lucide-react';
import { Button, Card, Field, Input, PageHeader } from '../../components/ui';
import { fillPlaceholders, type CompanyProfile } from '../../lib/company';
import { useCompany, useStore } from '../../store';

export default function CompanySettings() {
  const current = useCompany();
  const update = useStore((s) => s.updateCompany);
  const toast = useStore((s) => s.toast);
  const docs = useStore((s) => s.docs);
  const unsigned = useStore((s) => s.contracts.filter((c) => c.status !== 'void' && c.status !== 'completed' && !c.employer.signedAt && !c.staff.signedAt).length);
  const [p, setP] = useState<CompanyProfile>(current);
  const set = (patch: Partial<CompanyProfile>) => setP({ ...p, ...patch });
  const dirty = JSON.stringify(p) !== JSON.stringify(current);
  const valid = p.name.trim() && p.address.trim() && p.managerName.trim();
  const sample = docs.find((d) => d.body.includes('{{company}}')) ?? docs[0];

  return (
    <>
      <PageHeader
        title="Company profile"
        sub="Your company's details appear on every document your crew signs and on every contract."
        actions={
          <Button
            disabled={!dirty || !valid}
            onClick={() => {
              const trimmed = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.trim()])) as unknown as CompanyProfile;
              const n = update(trimmed);
              setP(trimmed);
              toast(n ? `Saved — ${n} unsigned contract${n === 1 ? '' : 's'} updated` : 'Company profile saved', '🏢');
            }}
          >
            <Save size={16} /> Save
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Building2 size={18} /> Company
            </h2>
            <Field label="Legal company name" hint="Exactly as it should appear on contracts, e.g. “Harbor Events Pty Ltd”.">
              <Input value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your Company LLC" />
            </Field>
            <Field label="Mailing address">
              <Input value={p.address} onChange={(e) => set({ address: e.target.value })} placeholder="Street, city, state, ZIP" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email">
                <Input type="email" value={p.email} onChange={(e) => set({ email: e.target.value })} placeholder="crew@yourcompany.com" />
              </Field>
              <Field label="Contact phone">
                <Input type="tel" value={p.phone} onChange={(e) => set({ phone: e.target.value })} />
              </Field>
            </div>
          </Card>
          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Crew manager</h2>
            <p className="-mt-2 text-sm text-slate-500">The person who signs contracts on the company's behalf.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={p.managerName} onChange={(e) => set({ managerName: e.target.value })} />
              </Field>
              <Field label="Job title">
                <Input value={p.managerTitle} onChange={(e) => set({ managerTitle: e.target.value })} />
              </Field>
            </div>
          </Card>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Saving updates the {unsigned} contract{unsigned === 1 ? '' : 's'} nobody has signed yet. Signed contracts keep the details they were signed with, because they're a legal record.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</div>
          <Card className="p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
              <ScrollText size={14} /> Contract header, every page
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
              <div className="text-sm font-bold text-[#01175E]">{p.name || 'Your company name'}</div>
              <div className="text-[11px] text-slate-500">{[p.address, p.email, p.phone].filter(Boolean).join(' · ') || 'Address · email · phone'}</div>
              <div className="mt-3 text-center text-sm font-bold tracking-wide text-slate-800">EVENT PLANNING SERVICE CONTRACT</div>
              <div className="mt-2 text-[11px] text-slate-600">
                Client: <span className="border-b border-slate-400 font-medium">{p.name || '________'}</span>, with a mailing address of{' '}
                <span className="border-b border-slate-400">{p.address || '________'}</span> (the “Client”).
              </div>
            </div>
          </Card>
          {sample && (
            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <FileSignature size={14} /> {sample.title}, as crew see it
              </div>
              <div className="max-h-56 overflow-auto whitespace-pre-line rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                {fillPlaceholders(sample.body, p)}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
