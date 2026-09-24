/**
 * Transactional email for crew invites and reminders.
 *
 * Providers (first one configured wins), set in .env.local:
 *   Resend:  RESEND_API_KEY, EMAIL_FROM
 *   SMTP:    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM  (e.g. Google Workspace, Microsoft 365, SendGrid SMTP)
 *
 * The server builds every message from a fixed template. Callers only pass names, addresses and an
 * invite link that must point at this app's /join page, so the endpoint can't be used to send
 * arbitrary mail from the company's domain.
 */
import nodemailer from 'nodemailer';

export interface EmailEnv {
  RESEND_API_KEY?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_SECURE?: string;
  EMAIL_FROM?: string;
}

export type Provider = 'resend' | 'smtp' | null;

export function provider(env: EmailEnv): Provider {
  if (env.RESEND_API_KEY && env.EMAIL_FROM) return 'resend';
  if (env.SMTP_HOST && env.EMAIL_FROM) return 'smtp';
  return null;
}

export function emailStatus(env: EmailEnv) {
  const p = provider(env);
  // Names (never values) of settings still needed when setup is half done.
  const missing: string[] = [];
  if (!p && (env.RESEND_API_KEY || env.SMTP_HOST || env.SMTP_USER || env.SMTP_PASS)) missing.push('EMAIL_FROM');
  if (!p && env.EMAIL_FROM && !env.RESEND_API_KEY && !env.SMTP_HOST) missing.push('RESEND_API_KEY or SMTP_HOST');
  if (p === 'smtp' && env.SMTP_USER && !env.SMTP_PASS) missing.push('SMTP_PASS');
  return { configured: !!p, provider: p, from: p ? env.EMAIL_FROM : null, missing };
}

// ---------- Validation ----------

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
export const isEmail = (s: string) => EMAIL_RE.test(s.trim()) && s.length <= 254;

const clean = (s: unknown, max: number) =>
  String(s ?? '')
    .replace(/[\r\n]+/g, ' ') // no header injection via names
    .trim()
    .slice(0, max);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Invite links must be this app's own sign-up page. */
function safeLink(link: unknown, origin: string): string | null {
  const s = String(link ?? '');
  try {
    const u = new URL(s);
    if (u.origin !== origin) return null;
    if (!/^\/join\/[A-Za-z0-9-]{3,40}$/.test(u.pathname)) return null;
    const allowed = [...u.searchParams.keys()].every((k) => k === 'invite');
    if (!allowed || (u.searchParams.get('invite') && !/^[\w-]{6,64}$/.test(u.searchParams.get('invite')!))) return null;
    return u.toString();
  } catch {
    return null;
  }
}

// ---------- Simple abuse guard: per-process hourly cap ----------

const HOURLY_CAP = 300;
let windowStart = Date.now();
let sentThisHour = 0;
function takeQuota(n: number) {
  if (Date.now() - windowStart > 3600_000) {
    windowStart = Date.now();
    sentThisHour = 0;
  }
  if (sentThisHour + n > HOURLY_CAP) return false;
  sentThisHour += n;
  return true;
}

// ---------- Templates ----------

export interface Company {
  name: string;
  email?: string;
  managerName?: string;
}

interface Message {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

function layout(company: Company, heading: string, paragraphs: string[], cta: { label: string; url: string }, footer: string) {
  const c = esc(company.name);
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#01175E;padding:20px 28px;color:#ffffff;font-weight:700;font-size:18px">${c}</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px">${esc(heading)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155">${p}</p>`).join('')}
<p style="margin:24px 0"><a href="${esc(cta.url)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px">${esc(cta.label)}</a></p>
<p style="margin:0;font-size:12px;color:#64748b">Or open this link: <a href="${esc(cta.url)}" style="color:#4f46e5;word-break:break-all">${esc(cta.url)}</a></p>
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function inviteMessage(to: string, name: string, link: string, company: Company): Message {
  const first = name.split(' ')[0] || 'there';
  const from = company.managerName ? `${company.managerName} at ${company.name}` : company.name;
  const subject = `You're invited to join the ${company.name} crew`;
  const text = `Hi ${first},

${from} has invited you to join their event crew.

Sign up here (takes about a minute): ${link}

After signing up you'll finish your paperwork and short training on your phone, then you can pick shifts.

If you weren't expecting this, you can ignore this email.`;
  const html = layout(
    company,
    `Hi ${first}, you're invited!`,
    [
      `${esc(from)} has invited you to join their event crew.`,
      'Signing up takes about a minute. Then you finish your paperwork and short training on your phone, and you can start picking shifts.',
    ],
    { label: 'Join the crew', url: link },
    `You received this because ${esc(company.name)} added your email to invite you. If you weren't expecting it, you can ignore this email.`,
  );
  return { to, subject, text, html, replyTo: company.email || undefined };
}

function reminderMessage(to: string, name: string, link: string, company: Company, pending: number): Message {
  const first = name.split(' ')[0] || 'there';
  const subject = `Reminder: finish getting shift-ready with ${company.name}`;
  const left = pending > 0 ? `You have ${pending} step${pending === 1 ? '' : 's'} left before you're ready to work.` : 'You have a few steps left before you are ready to work.';
  const text = `Hi ${first},

${left} It only takes a few minutes on your phone.

Continue here: ${link}

— ${company.managerName || company.name}`;
  const html = layout(
    company,
    `Almost there, ${first}`,
    [esc(left), 'It only takes a few minutes on your phone. Finishing now means you can be rostered on upcoming events.'],
    { label: 'Continue onboarding', url: link },
    `Sent by ${esc(company.managerName || company.name)} at ${esc(company.name)}.`,
  );
  return { to, subject, text, html, replyTo: company.email || undefined };
}

// ---------- Delivery ----------

async function deliver(env: EmailEnv, m: Message): Promise<void> {
  const p = provider(env);
  if (p === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const j: any = await res.json().catch(() => ({}));
      throw new Error(j?.message || `Resend error ${res.status}`);
    }
    return;
  }
  if (p === 'smtp') {
    const port = Number(env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      connectionTimeout: 15000,
    });
    const info = await transport.sendMail({ from: env.EMAIL_FROM, to: m.to, subject: m.subject, text: m.text, html: m.html, replyTo: m.replyTo });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[email] test preview:', preview);
    return;
  }
  throw new Error('Email is not configured');
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  link: string;
  pending?: number;
}

export interface SendResult {
  id: string;
  email: string;
  ok: boolean;
  error?: string;
}

/** Sends one message per recipient. Never throws: every recipient gets its own result. */
export async function sendCrewEmails(
  env: EmailEnv,
  body: { kind?: string; company?: Company; recipients?: Recipient[] },
  origin: string,
): Promise<{ status: number; results?: SendResult[]; error?: string }> {
  if (!provider(env)) return { status: 503, error: 'Email is not configured. Add RESEND_API_KEY or SMTP settings plus EMAIL_FROM to .env.local.' };
  const kind = body.kind === 'reminder' ? 'reminder' : 'invite';
  const company: Company = { name: clean(body.company?.name, 120) || 'Your event company', email: isEmail(body.company?.email ?? '') ? body.company!.email : undefined, managerName: clean(body.company?.managerName, 80) };
  const list = Array.isArray(body.recipients) ? body.recipients.slice(0, 100) : [];
  if (!list.length) return { status: 400, error: 'No recipients' };
  if (!takeQuota(list.length)) return { status: 429, error: `Hourly email limit (${HOURLY_CAP}) reached. Try again later.` };

  const results: SendResult[] = [];
  for (const r of list) {
    const id = clean(r.id, 64);
    const email = clean(r.email, 254);
    const name = clean(r.name, 80);
    if (!isEmail(email)) {
      results.push({ id, email, ok: false, error: 'Invalid email address' });
      continue;
    }
    const link = safeLink(r.link, origin);
    if (!link) {
      results.push({ id, email, ok: false, error: 'Invalid invite link' });
      continue;
    }
    try {
      const m = kind === 'invite' ? inviteMessage(email, name, link, company) : reminderMessage(email, name, link, company, Math.max(0, Math.min(99, Number(r.pending) || 0)));
      await deliver(env, m);
      results.push({ id, email, ok: true });
    } catch (e) {
      results.push({ id, email, ok: false, error: (e as Error).message.slice(0, 160) });
    }
  }
  return { status: 200, results };
}
