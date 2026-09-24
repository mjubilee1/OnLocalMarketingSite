import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CircleCheck, Circle, Copy, Info, Lock, Save, Send, Trash2 } from 'lucide-react';
import { Button, Card, Empty, Field, Input, PageHeader, Select, Textarea } from '../../components/ui';
import { ContractPdfActions, ContractStagePill, SignContractModal } from '../../components/contract';
import { missingTerms, stage, termsLocked, TEMPLATE_NAME } from '../../lib/contracts';
import { cn, fmtDate, fmtTime, uid } from '../../lib/utils';
import { useStore } from '../../store';
import type { Contract, ContractTerms } from '../../types';

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-baseline gap-2 font-semibold text-slate-900">
        <span className="text-sm font-bold text-indigo-600">{n}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Choice<T extends string>({ value, options, onChange, disabled }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm ring-1 transition cursor-pointer disabled:cursor-not-allowed',
            value === o.id ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 disabled:hover:bg-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, label, onChange, disabled, children }: { on: boolean; label: string; onChange: (v: boolean) => void; disabled?: boolean; children?: ReactNode }) {
  return (
    <div className="rounded-lg p-3 ring-1 ring-slate-200">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={on} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
      {on && children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ContractEditor() {
  const { id } = useParams();
  const original = useStore((s) => s.contracts.find((c) => c.id === id));
  const staffMember = useStore((s) => s.staff.find((x) => x.id === original?.staffId));
  const event = useStore((s) => s.events.find((e) => e.id === original?.eventId));
  const store = useStore();
  const nav = useNavigate();
  const [c, setC] = useState<Contract | undefined>(original && structuredClone(original));
  const [signing, setSigning] = useState(false);

  // Pick up signatures/sends that happen elsewhere (e.g. the crew member signing on their phone).
  useEffect(() => {
    if (original && (!c || original.audit.length !== c.audit.length || original.status !== c.status)) setC(structuredClone(original));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  if (!c || !original) return <Empty title="Contract not found" />;
  const locked = termsLocked(original);
  const st = stage(original);
  const dirty = JSON.stringify(c) !== JSON.stringify(original);
  const missing = missingTerms(c);
  const t = c.terms;
  const setT = (patch: Partial<ContractTerms>) => setC({ ...c, terms: { ...t, ...patch } });
  const setParty = (party: 'employer' | 'staff', patch: Partial<Contract['employer']>) => setC({ ...c, [party]: { ...c[party], ...patch } });

  const save = (note = 'Terms updated') => {
    store.saveContract(c, dirty ? note : undefined);
    if (dirty) store.toast('Contract saved', '✅');
  };

  return (
    <>
      <Link to="/admin/contracts" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Contracts
      </Link>
      <PageHeader
        title={c.title}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            <ContractStagePill c={original} /> {TEMPLATE_NAME}
            {event && (
              <Link to={`/admin/events/${event.id}`} className="text-indigo-600 hover:underline">
                · {event.name}
              </Link>
            )}
          </span>
        }
        actions={
          <>
            <ContractPdfActions c={dirty ? c : original} />
            {!locked && (
              <Button disabled={!dirty} onClick={() => save()}>
                <Save size={16} /> Save
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {locked && st !== 'void' && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
              <Lock size={16} className="mt-0.5 shrink-0" />
              The terms are locked because the contract has been signed. To change anything, void it and create a duplicate, which both parties will need to sign again.
            </div>
          )}
          <Field label="Contract title (for your records)">
            <Input value={c.title} disabled={locked} onChange={(e) => setC({ ...c, title: e.target.value })} />
          </Field>

          <Section n="1." title="The parties">
            <Field label="Effective date">
              <Input type="date" disabled={locked} value={t.effectiveDate} onChange={(e) => setT({ effectiveDate: e.target.value })} className="max-w-48" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Client (employer)
                  <Link to="/admin/settings" className="font-medium normal-case tracking-normal text-indigo-600 hover:underline">
                    From company profile
                  </Link>
                </div>
                <Input disabled={locked} value={c.employer.name} onChange={(e) => setParty('employer', { name: e.target.value })} placeholder="Company legal name" />
                <Input disabled={locked} value={c.employer.address} onChange={(e) => setParty('employer', { address: e.target.value })} placeholder="Mailing address" />
                <Input disabled={locked} type="email" value={c.employer.email} onChange={(e) => setParty('employer', { email: e.target.value })} placeholder="Email for signature receipts" />
              </div>
              <div className="space-y-3 rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service Provider (crew member)</div>
                <Input disabled={locked} value={c.staff.name} onChange={(e) => setParty('staff', { name: e.target.value })} placeholder="Full legal name" />
                <Input disabled={locked} value={c.staff.address} onChange={(e) => setParty('staff', { address: e.target.value })} placeholder="Mailing address (the crew member can fill this in)" />
                <div className="text-xs text-slate-500">
                  {staffMember ? (
                    <Link to={`/admin/crew/${staffMember.id}`} className="hover:underline">
                      {staffMember.email} · {staffMember.phone}
                    </Link>
                  ) : (
                    c.staff.email
                  )}
                </div>
              </div>
            </div>
          </Section>

          <Section n="2." title="Term">
            <Field label="Starts on">
              <Input type="date" disabled={locked} value={t.startDate} onChange={(e) => setT({ startDate: e.target.value })} className="max-w-48" />
            </Field>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Ends</span>
              <Choice
                disabled={locked}
                value={t.endType}
                onChange={(endType) => setT({ endType })}
                options={[
                  { id: 'Date', label: 'On a date' },
                  { id: 'Services', label: 'When the services are complete' },
                  { id: 'Other', label: 'Other' },
                ]}
              />
              {t.endType === 'Date' && <Input type="date" disabled={locked} value={t.endDate} onChange={(e) => setT({ endDate: e.target.value })} className="mt-2 max-w-48" />}
              {t.endType === 'Other' && <Input disabled={locked} value={t.endOther} onChange={(e) => setT({ endOther: e.target.value })} className="mt-2" placeholder="How will the agreement end?" />}
            </div>
          </Section>

          <Section n="3." title="Services">
            <Textarea disabled={locked} rows={4} value={t.services} onChange={(e) => setT({ services: e.target.value })} placeholder="What will the service provider do?" />
          </Section>

          <Section n="4." title="Payment amount">
            <Toggle disabled={locked} on={t.payHourly} label="Per hour" onChange={(payHourly) => setT({ payHourly })}>
              <div className="flex items-center gap-2 text-sm">
                $ <Input disabled={locked} inputMode="decimal" value={t.hourlyRate} onChange={(e) => setT({ hourlyRate: e.target.value })} className="w-28" /> / hour
              </div>
            </Toggle>
            <Toggle disabled={locked} on={t.payPerJob} label="Per job" onChange={(payPerJob) => setT({ payPerJob })}>
              <div className="flex items-center gap-2 text-sm">
                $ <Input disabled={locked} inputMode="decimal" value={t.jobAmount} onChange={(e) => setT({ jobAmount: e.target.value })} className="w-36" /> for completing the services
              </div>
            </Toggle>
            <Toggle disabled={locked} on={t.payOther} label="Other" onChange={(payOther) => setT({ payOther })}>
              <Input disabled={locked} value={t.payOtherText} onChange={(e) => setT({ payOtherText: e.target.value })} placeholder="e.g. Plus $20 per diem for meals" />
            </Toggle>
          </Section>

          <Section n="5." title="Payment method">
            <Choice
              disabled={locked}
              value={t.paymentPlan}
              onChange={(paymentPlan) => setT({ paymentPlan })}
              options={[
                { id: 'Recurring Basis', label: 'On a schedule' },
                { id: 'Completion', label: 'When services are complete' },
                { id: 'Invoice', label: 'On receipt of invoice' },
                { id: 'Other', label: 'Other' },
              ]}
            />
            {t.paymentPlan === 'Recurring Basis' && (
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Every">
                  <Select disabled={locked} value={t.frequency} onChange={(e) => setT({ frequency: e.target.value as ContractTerms['frequency'] })} className="w-36">
                    <option value="Weekly">Week</option>
                    <option value="Monthly">Month</option>
                    <option value="Quarterly">Quarter</option>
                  </Select>
                </Field>
                <Field label="Beginning on">
                  <Input type="date" disabled={locked} value={t.planStart} onChange={(e) => setT({ planStart: e.target.value })} className="w-48" />
                </Field>
              </div>
            )}
            {t.paymentPlan === 'Other' && <Input disabled={locked} value={t.planOther} onChange={(e) => setT({ planOther: e.target.value })} placeholder="How will payment be made?" />}
          </Section>

          <Section n="6." title="Retainer">
            <Choice
              disabled={locked}
              value={t.retainer}
              onChange={(retainer) => setT({ retainer })}
              options={[
                { id: 'Not Required', label: 'Not required' },
                { id: 'Required', label: 'Required' },
              ]}
            />
            {t.retainer === 'Required' && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                $ <Input disabled={locked} inputMode="decimal" value={t.retainerAmount} onChange={(e) => setT({ retainerAmount: e.target.value })} className="w-32" />
                <Choice
                  disabled={locked}
                  value={t.retainerRefundable}
                  onChange={(retainerRefundable) => setT({ retainerRefundable })}
                  options={[
                    { id: 'Refundable', label: 'Refundable' },
                    { id: 'Non-Refundable', label: 'Non-refundable' },
                  ]}
                />
              </div>
            )}
          </Section>

          <Section n="7." title="Termination">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              Either party may end early for a material breach with
              <Input disabled={locked} inputMode="numeric" value={t.noticeDays} onChange={(e) => setT({ noticeDays: e.target.value.replace(/[^\d]/g, '') })} className="w-16 text-center" />
              days' written notice.
            </div>
          </Section>

          <Section n="20." title="Governing law">
            <Field label="State whose laws govern this agreement">
              <Input disabled={locked} value={t.governingState} onChange={(e) => setT({ governingState: e.target.value })} placeholder="e.g. California" className="max-w-xs" />
            </Field>
          </Section>

          <Section n="22." title="Additional terms and conditions">
            <Textarea disabled={locked} rows={4} value={t.additionalTerms} onChange={(e) => setT({ additionalTerms: e.target.value })} placeholder="Optional" />
          </Section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="p-5">
            <h3 className="mb-3 font-semibold">Signatures</h3>
            {(['employer', 'staff'] as const).map((p) => {
              const party = original[p];
              return (
                <div key={p} className="mb-3 flex items-start gap-2 text-sm last:mb-0">
                  {party.signedAt ? <CircleCheck size={18} className="shrink-0 text-emerald-500" /> : <Circle size={18} className="shrink-0 text-slate-300" />}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p === 'employer' ? 'Client (employer)' : 'Service Provider (crew)'}</div>
                    <div className="text-xs text-slate-500">{party.signedAt ? `${party.signatory ? `${party.signatory} for ` : ''}${party.name} · ${fmtDate(party.signedAt)} ${fmtTime(party.signedAt)}` : party.name || '—'}</div>
                    {party.signedAt &&
                      (party.typed ? (
                        <div className="font-script text-2xl text-indigo-900">{party.signature}</div>
                      ) : (
                        <img src={party.signature} alt="Signature" className="mt-1 h-10 rounded bg-slate-50" />
                      ))}
                  </div>
                </div>
              );
            })}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {st === 'draft' && (
                <Button
                  className="w-full"
                  disabled={missing.length > 0}
                  onClick={() => {
                    if (dirty) store.saveContract(c, 'Terms updated');
                    store.sendContract(c.id);
                    store.toast(`Sent: it's now in ${c.staff.name.split(' ')[0]}'s crew app to review and sign`, '📨');
                  }}
                >
                  <Send size={16} /> Send to {c.staff.name.split(' ')[0]} to sign
                </Button>
              )}
              {!original.employer.signedAt && st !== 'void' && (
                <Button
                  variant={st === 'awaiting_employer' ? 'primary' : 'secondary'}
                  className="w-full"
                  disabled={missing.length > 0}
                  onClick={() => {
                    if (dirty) store.saveContract(c, 'Terms updated');
                    setSigning(true);
                  }}
                >
                  Sign as employer
                </Button>
              )}
              {missing.length > 0 && st !== 'void' && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <div className="mb-1 font-medium">Fill in before sending or signing:</div>
                  <ul className="list-disc pl-4">
                    {missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-semibold">History</h3>
            <ol className="space-y-2 text-xs">
              {original.audit.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-slate-400">
                    {fmtDate(a.at, { month: 'short', day: 'numeric' })} {fmtTime(a.at)}
                  </span>
                  <span className="text-slate-700">{a.text}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="space-y-2 p-5">
            {st !== 'void' && st !== 'draft' && (
              <Button
                variant="ghost"
                className="w-full justify-start text-rose-600"
                onClick={() => {
                  if (confirm('Void this contract? It stays on record but is no longer valid. You can duplicate it to start again.')) {
                    store.voidContract(c.id);
                    store.toast('Contract voided', '🚫');
                  }
                }}
              >
                <Ban size={16} /> Void contract
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                const now = new Date().toISOString();
                const copy: Contract = {
                  ...structuredClone(original),
                  id: uid('k-'),
                  title: `${original.title} (copy)`,
                  status: 'draft',
                  createdAt: now,
                  sentAt: undefined,
                  employer: { name: original.employer.name, email: original.employer.email, address: original.employer.address },
                  staff: { name: original.staff.name, email: original.staff.email, address: original.staff.address },
                  audit: [{ at: now, text: `Duplicated from "${original.title}"` }],
                };
                store.saveContract(copy);
                nav(`/admin/contracts/${copy.id}`);
              }}
            >
              <Copy size={16} /> Duplicate as new draft
            </Button>
            {st === 'draft' && !original.employer.signedAt && (
              <Button
                variant="ghost"
                className="w-full justify-start text-rose-600"
                onClick={() => {
                  if (confirm('Delete this draft?')) {
                    store.deleteContract(c.id);
                    nav('/admin/contracts');
                  }
                }}
              >
                <Trash2 size={16} /> Delete draft
              </Button>
            )}
          </Card>

          <div className="flex gap-2 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              This template is an <strong>independent contractor</strong> agreement (see §14 of the PDF). If you set their schedule, require uniforms or provide training, get legal advice on whether an employment agreement fits better.
            </span>
          </div>
        </div>
      </div>

      <SignContractModal open={signing} onClose={() => setSigning(false)} c={useStore.getState().contracts.find((x) => x.id === c.id) ?? original} party="employer" />
    </>
  );
}
