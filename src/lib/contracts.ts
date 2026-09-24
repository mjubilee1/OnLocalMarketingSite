import type { Contract, ContractParty, ContractTerms, EventItem, Role, Staff } from '../types';
import { fmtDate, toDateISO, todayISO, uid } from './utils';

export const TEMPLATE_URL = '/contracts/event-planning-service-contract.pdf';
export const TEMPLATE_NAME = 'Event Planning Service Contract';

export type ContractStage = 'draft' | 'awaiting_both' | 'awaiting_staff' | 'awaiting_employer' | 'completed' | 'void';

export function stage(c: Contract): ContractStage {
  if (c.status === 'void') return 'void';
  if (c.employer.signedAt && c.staff.signedAt) return 'completed';
  if (c.status === 'draft' && !c.employer.signedAt) return 'draft';
  if (c.staff.signedAt) return 'awaiting_employer';
  if (c.employer.signedAt) return c.status === 'draft' ? 'draft' : 'awaiting_staff';
  return 'awaiting_both';
}

export const STAGE_LABEL: Record<ContractStage, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600' },
  awaiting_both: { label: 'Awaiting both signatures', cls: 'bg-amber-50 text-amber-700' },
  awaiting_staff: { label: 'Awaiting crew signature', cls: 'bg-amber-50 text-amber-700' },
  awaiting_employer: { label: 'Awaiting your signature', cls: 'bg-violet-50 text-violet-700' },
  completed: { label: 'Signed by both', cls: 'bg-emerald-50 text-emerald-700' },
  void: { label: 'Void', cls: 'bg-rose-50 text-rose-600' },
};

/** Terms can change only until someone signs: a signature is an agreement to specific terms. */
export const termsLocked = (c: Contract) => !!(c.employer.signedAt || c.staff.signedAt) || c.status === 'void';

export function draftContract(opts: { staff: Staff; event?: EventItem; role?: Role; orgName: string; orgAddress: string; orgEmail?: string; signatory: string }): Contract {
  const { staff, event, role } = opts;
  const today = todayISO();
  const start = event?.date ?? today;
  const services = event
    ? `${role?.name ?? 'Event crew'} at ${event.name}, ${event.venue} (${event.address}) on ${fmtDate(event.date)}. ${role?.description ?? ''}`.trim()
    : role
      ? `${role.name}: ${role.description}`
      : '';
  const terms: ContractTerms = {
    effectiveDate: today,
    startDate: start,
    endType: event ? 'Date' : 'Services',
    endDate: event?.date ?? '',
    endOther: '',
    services,
    payHourly: true,
    hourlyRate: role ? String(role.hourlyRate) : '',
    payPerJob: false,
    jobAmount: '',
    payOther: false,
    payOtherText: '',
    paymentPlan: 'Recurring Basis',
    frequency: 'Weekly',
    planStart: start,
    planOther: '',
    retainer: 'Not Required',
    retainerAmount: '',
    retainerRefundable: 'Refundable',
    noticeDays: '7',
    governingState: '',
    additionalTerms: '',
  };
  const now = new Date().toISOString();
  return {
    id: uid('k-'),
    title: event ? `${event.name} · ${staff.name}` : `Services agreement · ${staff.name}`,
    staffId: staff.id,
    eventId: event?.id,
    status: 'draft',
    createdAt: now,
    terms,
    employer: { name: opts.orgName, email: opts.orgEmail ?? '', address: opts.orgAddress },
    staff: { name: staff.name, email: staff.email, address: '' },
    audit: [{ at: now, text: `Draft created by ${opts.signatory}` }],
  };
}

/** What still has to be filled in before the contract can be sent. Empty list = ready. */
export function missingTerms(c: Contract): string[] {
  const t = c.terms;
  const m: string[] = [];
  if (!c.employer.name.trim()) m.push('Employer name');
  if (!c.employer.address.trim()) m.push('Employer mailing address');
  if (!t.effectiveDate) m.push('Effective date');
  if (!t.startDate) m.push('Start date');
  if (t.endType === 'Date' && !t.endDate) m.push('End date');
  if (t.endType === 'Other' && !t.endOther.trim()) m.push('How the agreement ends');
  if (!t.services.trim()) m.push('Services');
  if (!t.payHourly && !t.payPerJob && !t.payOther) m.push('At least one payment amount');
  if (t.payHourly && !t.hourlyRate.trim()) m.push('Hourly rate');
  if (t.payPerJob && !t.jobAmount.trim()) m.push('Per-job amount');
  if (t.payOther && !t.payOtherText.trim()) m.push('Other compensation details');
  if (t.paymentPlan === 'Recurring Basis' && !t.planStart) m.push('Payment start date');
  if (t.paymentPlan === 'Other' && !t.planOther.trim()) m.push('Other payment method');
  if (t.retainer === 'Required' && !t.retainerAmount.trim()) m.push('Retainer amount');
  if (!t.noticeDays.trim()) m.push('Notice period');
  if (!t.governingState.trim()) m.push('Governing state');
  return m;
}

/** Stable SHA-256 over the terms and both parties' identity details (not signatures). */
export async function termsFingerprint(c: Contract): Promise<string> {
  const party = (p: ContractParty) => ({ name: p.name.trim(), address: p.address.trim() });
  const payload = JSON.stringify({ template: TEMPLATE_NAME, terms: c.terms, employer: party(c.employer), staff: { name: c.staff.name.trim() } });
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** YYYY-MM-DD or a full timestamp → mm/dd/yyyy, the format the PDF asks for. */
export const usDate = (iso?: string) => {
  if (!iso) return '';
  // Timestamps are UTC: use the signer's local calendar day, not the UTC one.
  const day = iso.length > 10 ? toDateISO(new Date(iso)) : iso;
  const [y, m, d] = day.split('-');
  return y && m && d ? `${m}/${d}/${y}` : '';
};

export const money = (v: string) => (v.trim() ? `$${v.trim().replace(/^\$/, '')}` : '');

/** Plain-language summary lines for the crew-facing review screen. */
export function summary(c: Contract) {
  const t = c.terms;
  const pay = [
    t.payHourly && `${money(t.hourlyRate)} per hour`,
    t.payPerJob && `${money(t.jobAmount)} for the whole job`,
    t.payOther && t.payOtherText,
  ].filter(Boolean) as string[];
  const when =
    t.paymentPlan === 'Recurring Basis'
      ? `Every ${t.frequency.replace('ly', '').toLowerCase()}, from ${fmtDate(t.planStart)}`
      : t.paymentPlan === 'Completion'
        ? 'When the work is finished'
        : t.paymentPlan === 'Invoice'
          ? 'When you send an invoice'
          : t.planOther;
  const ends = t.endType === 'Date' ? fmtDate(t.endDate) : t.endType === 'Services' ? 'When the work is finished' : t.endOther;
  return [
    { label: 'Between', value: `${c.employer.name} (Client) and ${c.staff.name} (Service Provider)` },
    { label: 'Starts', value: t.startDate ? fmtDate(t.startDate) : '—' },
    { label: 'Ends', value: ends || '—' },
    { label: 'Work', value: t.services || '—' },
    { label: 'Pay', value: pay.join(' + ') || '—' },
    { label: 'Paid', value: when || '—' },
    { label: 'Retainer', value: t.retainer === 'Required' ? `${money(t.retainerAmount)} (${t.retainerRefundable.toLowerCase()})` : 'None' },
    { label: 'Notice to end early', value: t.noticeDays ? `${t.noticeDays} days, in writing` : '—' },
    { label: 'Governing law', value: t.governingState || '—' },
    ...(t.additionalTerms.trim() ? [{ label: 'Additional terms', value: t.additionalTerms }] : []),
  ];
}
