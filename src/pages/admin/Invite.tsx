import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink, Printer, Upload } from 'lucide-react';
import { Button, Card, Field, PageHeader, Select, Textarea } from '../../components/ui';
import { useCatalog, useStore } from '../../store';

export default function Invite() {
  const code = useStore((s) => s.inviteCode);
  const orgName = useStore((s) => s.orgName);
  const createStaff = useStore((s) => s.createStaff);
  const nudge = useStore((s) => s.nudge);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const link = `${window.location.origin}/join/${code}`;
  const [bulk, setBulk] = useState('');
  const [defaultRole, setDefaultRole] = useState(cat.roles[0]?.id ?? '');

  const parsed = bulk
    .split('\n')
    .map((l) => l.split(',').map((x) => x.trim()))
    .filter((p) => p[0]);

  const importAll = () => {
    const ids = parsed.map(([name, email = '', phone = '', roleName]) => {
      const role = cat.roles.find((r) => roleName && r.name.toLowerCase().startsWith(roleName.toLowerCase()));
      return createStaff({ name: name!, email, phone, roleIds: [role?.id ?? defaultRole], language: 'English', status: 'invited' });
    });
    nudge(ids);
    toast(`${ids.length} invites sent by SMS & email`, '📨');
    setBulk('');
  };

  return (
    <>
      <PageHeader title="Invite & hire" sub="Get new crew from “yes” to shift-ready without a single form on paper." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">Your crew sign-up link</h2>
          <p className="mt-1 text-sm text-slate-500">Put the QR on a recruitment poster, a job ad, or show it at a job fair. New crew pick their roles and start onboarding immediately.</p>
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white print:bg-none print:text-black">
            <div className="text-center">
              <div className="text-sm opacity-80">Join the crew at</div>
              <div className="text-xl font-bold">{orgName}</div>
            </div>
            <div className="rounded-xl bg-white p-4">
              <QRCodeSVG value={link} size={180} fgColor="#1e1b4b" />
            </div>
            <div className="text-sm opacity-90">Scan to apply • takes 1 minute</div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-2 pl-3 text-sm">
            <span className="flex-1 truncate font-mono text-slate-600">{link}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(link);
                toast('Link copied', '📋');
              }}
            >
              <Copy size={14} /> Copy
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to={`/join/${code}`} target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink size={14} /> Open sign-up page
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer size={14} /> Print poster
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Bulk invite</h2>
          <p className="mt-1 text-sm text-slate-500">
            Paste from a spreadsheet or your ATS: <span className="font-mono text-xs">name, email, phone, role</span> — one person per line. Each gets a personal invite by SMS and email.
          </p>
          <div className="mt-4 space-y-4">
            <Textarea
              rows={8}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              className="font-mono text-xs"
              placeholder={'Jamie Lee, jamie@mail.com, +1 555 0123, Bartender\nAlex Kim, alex@mail.com, +1 555 0456, Usher'}
            />
            <Field label="Role when none is given">
              <Select value={defaultRole} onChange={(e) => setDefaultRole(e.target.value)}>
                {cat.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button disabled={!parsed.length} onClick={importAll}>
              <Upload size={16} /> Send {parsed.length || ''} invite{parsed.length === 1 ? '' : 's'}
            </Button>
          </div>
          <div className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Tip:</strong> Invited crew who haven't started after 24 hours show up on your dashboard under “Needs attention” so you can nudge them.
          </div>
        </Card>
      </div>
    </>
  );
}
