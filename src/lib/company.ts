/** The crew manager's company: legal details on documents, and the brand crew actually see. */
export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  managerName: string;
  managerTitle: string;
  /** What the crew sees in the app, on invites, and on the sign-up page. */
  teamName: string;
  /** Button and link color, as #rrggbb. */
  primaryColor: string;
  /** Second color for headers and gradients, as #rrggbb. */
  accentColor: string;
  /** Optional logo as a data URL. Empty uses initials and the team name. */
  logo: string;
}

/** Name printed in the product chrome. Falls back to the legal company name. */
export function displayName(c: Pick<CompanyProfile, 'name' | 'teamName'>): string {
  return (c.teamName ?? '').trim() || (c.name ?? '').trim() || 'Your team';
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
