/** The crew manager's company, as it appears on documents and contracts. */
export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  managerName: string;
  managerTitle: string;
}

/** Tokens managers can put in document text; filled in with the current company profile. */
export const PLACEHOLDERS: { token: string; label: string; pick: (c: CompanyProfile) => string }[] = [
  { token: '{{company}}', label: 'Company name', pick: (c) => c.name },
  { token: '{{company_address}}', label: 'Company address', pick: (c) => c.address },
  { token: '{{company_email}}', label: 'Company email', pick: (c) => c.email },
  { token: '{{company_phone}}', label: 'Company phone', pick: (c) => c.phone },
  { token: '{{manager}}', label: 'Manager name', pick: (c) => c.managerName },
];

export function fillPlaceholders(text: string, c: CompanyProfile): string {
  return PLACEHOLDERS.reduce((t, p) => t.split(p.token).join(p.pick(c) || `[${p.label.toLowerCase()}]`), text);
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';
