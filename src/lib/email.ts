import { useEffect, useState } from 'react';
import { readiness } from './readiness';
import { uid } from './utils';
import { useStore } from '../store';
import type { Staff } from '../types';

export interface EmailStatus {
  configured: boolean;
  provider: 'resend' | 'smtp' | null;
  from: string | null;
  missing?: string[];
}

export interface EmailResult {
  id: string;
  email: string;
  ok: boolean;
  error?: string;
}

let statusCache: Promise<EmailStatus> | null = null;
export function fetchEmailStatus(force = false): Promise<EmailStatus> {
  if (!statusCache || force)
    statusCache = fetch('/api/email/status')
      .then((r) => (r.ok ? r.json() : { configured: false, provider: null, from: null }))
      .catch(() => ({ configured: false, provider: null, from: null }));
  return statusCache;
}

export function useEmailStatus() {
  const [s, setS] = useState<EmailStatus | null>(null);
  useEffect(() => {
    fetchEmailStatus().then(setS);
  }, []);
  return s;
}

/** Personal sign-up link. Creates the person's invite token the first time it's needed. */
export function inviteLink(staffId: string): string {
  const st = useStore.getState();
  let s = st.staff.find((x) => x.id === staffId);
  if (s && !s.inviteToken) {
    st.updateStaff(staffId, { inviteToken: uid('inv-') + uid() });
    s = useStore.getState().staff.find((x) => x.id === staffId);
  }
  return `${window.location.origin}/join/${st.inviteCode}${s?.inviteToken ? `?invite=${s.inviteToken}` : ''}`;
}

/** Plain-text invite a manager can paste into their own email or messaging app. */
export function inviteText(s: Pick<Staff, 'name' | 'id'>): string {
  const st = useStore.getState();
  return `Hi ${s.name.split(' ')[0]}, you're invited to join the ${st.orgName} event crew! Sign up here (takes a minute): ${inviteLink(s.id)}`;
}

/** mailto: fallback when no email provider is set up. Opens the manager's own email app. */
export function mailtoInvite(s: Pick<Staff, 'name' | 'id' | 'email'>): string {
  const st = useStore.getState();
  const subject = `You're invited to join the ${st.orgName} crew`;
  return `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inviteText(s))}`;
}

/**
 * Sends real invite or reminder emails through the server and records the true outcome.
 * Never claims an email went out unless the provider accepted it.
 */
export function useCrewEmail() {
  const status = useEmailStatus();
  const toast = useStore((s) => s.toast);

  const send = async (kind: 'invite' | 'reminder', staffIds: string[]): Promise<EmailResult[] | null> => {
    const st = useStore.getState();
    if (kind === 'reminder') st.nudge(staffIds);
    const people = st.staff.filter((s) => staffIds.includes(s.id));
    const withEmail = people.filter((s) => s.email.trim());
    const noEmail = people.length - withEmail.length;

    const current = status ?? (await fetchEmailStatus());
    if (!current.configured) {
      toast(`Email isn't set up yet, so nothing was sent. Set it up on the Invite & hire page, or copy each person's invite link.`, '✉️');
      return null;
    }
    if (!withEmail.length) {
      toast('Nobody selected has an email address.', '⚠️');
      return [];
    }

    const cat = { roles: st.roles, courses: st.courses, docs: st.docs, certTypes: st.certTypes };
    const recipients = withEmail.map((s) => {
      const r = readiness(s, cat);
      return { id: s.id, name: s.name, email: s.email.trim(), link: inviteLink(s.id), pending: r.total - r.done };
    });
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, company: { name: st.orgName, email: st.orgEmail, managerName: st.managerName }, recipients }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(j.results)) {
        toast(`Couldn't send: ${j.error ?? `server error ${res.status}`}`, '⚠️');
        return null;
      }
      const results = j.results as EmailResult[];
      useStore.getState().logEmails(kind, results);
      const ok = results.filter((r) => r.ok).length;
      const failed = results.length - ok;
      const what = kind === 'invite' ? 'invite' : 'reminder';
      toast(
        [ok && `${ok} ${what}${ok === 1 ? '' : 's'} emailed`, failed && `${failed} failed`, noEmail && `${noEmail} had no email address`].filter(Boolean).join(' · ') || 'Nothing sent',
        failed ? '⚠️' : '📨',
      );
      return results;
    } catch (e) {
      toast(`Couldn't reach the email service: ${(e as Error).message}`, '⚠️');
      return null;
    }
  };

  return { status, send };
}
