import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Check, CircleCheck, CircleX, Clock, Copy, ExternalLink, Loader2, Mail, Phone, Printer, RefreshCw, Send, TriangleAlert, UserPlus, UserRound, Users } from 'lucide-react';
import { Avatar, Button, Card, IconInput, Input, Pill, Select } from '../../components/ui';
import { fetchEmailStatus, inviteLink, inviteText, mailtoInvite, useCrewEmail, type EmailResult, type EmailStatus } from '../../lib/email';
import { relTime } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { Staff } from '../../types';

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

function EmailSetup({ status, onRecheck }: { status: EmailStatus | null; onRecheck: () => void }) {
  // Only shown when something needs fixing.
  if (!status || status.configured) return null;
  return (
    <div className="mb-6 rounded-xl bg-amber-50 p-5 text-sm text-amber-950 ring-1 ring-amber-200">
      <div className="flex items-start gap-3">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <div className="font-semibold">Email isn't set up, so invites can't be emailed yet</div>
          <p className="mt-1 text-amber-900">
            Until it is, people are still added to your crew, and you can send each person their link with <strong>Copy link</strong> or <strong>Open in email app</strong>. To send
            automatically, add one of these to <code className="rounded bg-white/70 px-1">.env.local</code> in the project folder, save the file, then click{' '}
            <strong>Check again</strong> (no restart needed):
          </p>
          {!!status.missing?.length && (
            <p className="mt-2 rounded-lg bg-white/80 p-2 font-medium text-amber-900">
              Almost there. Your .env.local is still missing: {status.missing.map((m) => <code key={m} className="mx-0.5 rounded bg-amber-100 px-1">{m}</code>)}
            </p>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800">Option A: Resend (easiest)</div>
              <pre className="overflow-x-auto rounded-lg bg-white/80 p-3 text-xs text-slate-700">{`RESEND_API_KEY=re_...\nEMAIL_FROM="Your Company <crew@yourdomain.com>"`}</pre>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800">Option B: your mailbox (SMTP)</div>
              <pre className="overflow-x-auto rounded-lg bg-white/80 p-3 text-xs text-slate-700">{`SMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=crew@yourdomain.com\nSMTP_PASS=your-app-password\nEMAIL_FROM="Your Company <crew@yourdomain.com>"`}</pre>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="mt-3" onClick={onRecheck}>
            <RefreshCw size={14} /> Check again
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
      {children}
      {optional && <span className="text-xs font-normal text-slate-400">Optional</span>}
    </span>
  );
}

/** What happened to each invite, with manual fallbacks for anyone who wasn't emailed. */
function Results({ ids, results, onClose }: { ids: string[]; results: EmailResult[] | null; onClose: () => void }) {
  const staff = useStore((s) => s.staff);
  const toast = useStore((s) => s.toast);
  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{results ? 'Last send' : 'Added, not emailed'}</span>
        <button onClick={onClose} className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
          Dismiss
        </button>
      </div>
      <div className="space-y-1.5">
        {ids.map((id) => {
          const s = staff.find((x) => x.id === id);
          if (!s) return null;
          const r = results?.find((x) => x.id === id);
          return (
            <div key={id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
              {r?.ok ? <CircleCheck size={16} className="text-emerald-500" /> : <CircleX size={16} className={results ? 'text-rose-500' : 'text-slate-300'} />}
              <span className="font-medium text-slate-900">{s.name}</span>
              <span className="text-xs text-slate-500">{r?.ok ? `Emailed to ${s.email}` : r?.error ? r.error : 'Send them their link yourself'}</span>
              {!r?.ok && (
                <span className="ml-auto flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard?.writeText(inviteText(s));
                      toast('Invite message copied', '📋');
                    }}
                  >
                    <Copy size={12} /> Copy invite
                  </Button>
                  {s.email && (
                    <a href={mailtoInvite(s)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
                      <Mail size={12} /> Email app
                    </a>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailState({ s }: { s: Staff }) {
  if (!s.email) return <Pill className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">No email</Pill>;
  if (!s.lastEmail) return <Pill className="bg-slate-100 text-slate-600">Not emailed</Pill>;
  if (!s.lastEmail.ok)
    return (
      <span title={s.lastEmail.error}>
        <Pill className="bg-rose-50 text-rose-700 ring-1 ring-rose-200">Email failed</Pill>
      </span>
    );
  return (
    <Pill className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      <Check size={12} /> {s.lastEmail.kind === 'invite' ? 'Invited' : 'Reminded'} {relTime(s.lastEmail.at)}
    </Pill>
  );
}

function PendingRow({ s, busy, onSend }: { s: Staff; busy: boolean; onSend: () => void }) {
  const toast = useStore((st) => st.toast);
  const updateStaff = useStore((st) => st.updateStaff);
  // Someone who signed up with an email typed into the name field: offer to fix it in one click.
  const nameIsEmail = !s.email && EMAIL_RE.test(s.name.trim());
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(nameIsEmail ? s.name.trim() : '');

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3.5 transition hover:bg-slate-50/70">
      <Avatar name={s.name} photo={s.photo} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-slate-900">{s.name}</span>
          <EmailState s={s} />
        </div>
        {editing ? (
          <form
            className="mt-1.5 flex max-w-sm gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!EMAIL_RE.test(email.trim())) return;
              updateStaff(s.id, { email: email.trim() });
              setEditing(false);
              toast('Email added', '✉️');
            }}
          >
            <Input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mail.com" className="h-8 py-1! text-xs" />
            <Button size="sm" type="submit" disabled={!EMAIL_RE.test(email.trim())}>
              Save
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <div className="mt-0.5 truncate text-xs text-slate-500">
            {s.email || (
              <button onClick={() => setEditing(true)} className="cursor-pointer font-medium text-indigo-600 hover:underline">
                Add email address
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {s.email && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={onSend}>
            <Send size={12} /> {s.lastEmail?.ok ? 'Resend' : 'Send'}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          title="Copy personal invite link"
          onClick={() => {
            navigator.clipboard?.writeText(inviteLink(s.id));
            toast(`${s.name.split(' ')[0]}'s invite link copied`, '📋');
          }}
        >
          <Copy size={12} /> Link
        </Button>
      </div>
    </div>
  );
}

export default function Invite() {
  const code = useStore((s) => s.inviteCode);
  const orgName = useStore((s) => s.orgName);
  const staff = useStore((s) => s.staff);
  const createStaff = useStore((s) => s.createStaff);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const { status, send } = useCrewEmail();
  const [statusOverride, setStatusOverride] = useState<EmailStatus | null>(null);
  const shownStatus = statusOverride ?? status;
  const link = `${window.location.origin}/join/${code}`;

  const [one, setOne] = useState({ name: '', email: '', phone: '', roleId: cat.roles[0]?.id ?? '' });
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<{ ids: string[]; results: EmailResult[] | null } | null>(null);

  const existingByEmail = useMemo(() => new Map(staff.filter((s) => s.email).map((s) => [s.email.trim().toLowerCase(), s])), [staff]);
  const existing = one.email ? existingByEmail.get(one.email.trim().toLowerCase()) : undefined;
  const canSend = !!one.name.trim() && EMAIL_RE.test(one.email.trim());

  const invite = async () => {
    setBusy(true);
    try {
      // People already on the crew get their invite re-sent instead of a duplicate profile.
      const id = existing?.id ?? createStaff({ name: one.name.trim(), email: one.email.trim(), phone: one.phone.trim(), roleIds: [one.roleId], language: 'English', status: 'invited' });
      setLast({ ids: [id], results: await send('invite', [id]) });
      setOne({ ...one, name: '', email: '', phone: '' });
    } finally {
      setBusy(false);
    }
  };

  const pending = staff.filter((s) => s.status === 'invited');
  const emailed = pending.filter((s) => s.lastEmail?.ok).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invite & hire</h1>
        <div className="flex gap-2 text-sm">
          <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-slate-600 shadow-sm ring-1 ring-slate-200">
            <Clock size={14} className="text-amber-500" /> <strong className="text-slate-900">{pending.length}</strong> waiting
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-slate-600 shadow-sm ring-1 ring-slate-200">
            <Mail size={14} className="text-emerald-500" /> <strong className="text-slate-900">{emailed}</strong> emailed
          </span>
        </div>
      </div>

      <EmailSetup status={shownStatus} onRecheck={async () => setStatusOverride(await fetchEmailStatus(true))} />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-6 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserPlus size={20} />
              </div>
              <h2 className="font-semibold text-slate-900">Invite someone by email</h2>
            </div>
            <form
              className="px-6 pb-6 pt-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (canSend && !busy) await invite();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <Label>Full name</Label>
                  <IconInput icon={UserRound} value={one.name} onChange={(e) => setOne({ ...one, name: e.target.value })} placeholder="Jamie Lee" />
                </label>
                <label className="block">
                  <Label>Email</Label>
                  <IconInput icon={Mail} type="email" value={one.email} onChange={(e) => setOne({ ...one, email: e.target.value })} placeholder="jamie@mail.com" />
                </label>
                <label className="block">
                  <Label optional>Mobile</Label>
                  <IconInput icon={Phone} type="tel" value={one.phone} onChange={(e) => setOne({ ...one, phone: e.target.value })} placeholder="+1 555 000 0000" />
                </label>
                <label className="block">
                  <Label>Role</Label>
                  <Select className="h-10" value={one.roleId} onChange={(e) => setOne({ ...one, roleId: e.target.value })}>
                    {cat.roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              {existing && (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
                  <TriangleAlert size={14} /> {existing.name} is already on your crew with this email. Their invite will be re-sent.
                </p>
              )}
              <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
                <Button type="submit" disabled={busy || !canSend} className="min-w-36">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {shownStatus?.configured ? 'Send invite' : 'Add & get link'}
                </Button>
              </div>
            </form>
            {last && <Results ids={last.ids} results={last.results} onClose={() => setLast(null)} />}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                Waiting to accept <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{pending.length}</span>
              </h2>
            </div>
            {pending.length ? (
              <div className="divide-y divide-slate-100">
                {pending.map((s) => (
                  <PendingRow key={s.id} s={s} busy={busy} onSend={async () => setLast({ ids: [s.id], results: await send('invite', [s.id]) })} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Users size={20} />
                </div>
                <div className="mt-3 text-sm font-medium text-slate-700">No pending invites</div>
                <div className="mt-0.5 text-xs text-slate-500">Everyone you've invited has signed up.</div>
              </div>
            )}
          </Card>
        </div>

        <Card className="overflow-hidden lg:sticky lg:top-6 lg:col-span-2">
          <div className="bg-gradient-to-br from-[#01175E] via-indigo-900 to-indigo-700 px-6 py-7 text-center text-white print:bg-none print:text-black">
            <div className="text-xs font-medium uppercase tracking-widest text-indigo-200">Join the crew at</div>
            <div className="mt-1 text-xl font-bold">{orgName}</div>
            <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3.5 shadow-lg">
              <QRCodeSVG value={link} size={156} fgColor="#01175E" />
            </div>
            <div className="mt-4 text-sm text-indigo-100">Scan to apply · takes 1 minute</div>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-1.5 pl-3 ring-1 ring-slate-200">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-600">{link}</span>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(link);
                  toast('Link copied', '📋');
                }}
              >
                <Copy size={14} /> Copy
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to={`/join/${code}`} target="_blank">
                <Button variant="secondary" size="sm" className="w-full">
                  <ExternalLink size={14} /> Open page
                </Button>
              </Link>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => window.print()}>
                <Printer size={14} /> Print poster
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
