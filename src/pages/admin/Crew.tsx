import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Megaphone, Search, ShieldAlert, UserPlus } from 'lucide-react';
import { Avatar, Button, Card, Input, PageHeader, Progress, RolePill, Select, StatusPill, Stars, Tabs } from '../../components/ui';
import { avgRating, expiringCerts, readiness } from '../../lib/readiness';
import { relTime } from '../../lib/utils';
import { useCatalog, useStore } from '../../store';
import type { StaffStatus } from '../../types';

type Filter = 'all' | StaffStatus | 'pool';

export default function Crew() {
  const staff = useStore((s) => s.staff);
  const nudge = useStore((s) => s.nudge);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const nav = useNavigate();
  const [tab, setTab] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [sel, setSel] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      staff
        .map((s) => ({ s, r: readiness(s, cat) }))
        .filter(({ s }) => {
          if (tab === 'pool') return avgRating(s) >= 4.5 && s.eventsWorked >= 3;
          return tab === 'all' ? s.status !== 'inactive' : s.status === tab;
        })
        .filter(({ s }) => !role || s.roleIds.includes(role))
        .filter(({ s }) => !q || `${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(q.toLowerCase())),
    [staff, cat, tab, role, q],
  );

  const count = (f: Filter) =>
    f === 'all' ? staff.filter((s) => s.status !== 'inactive').length : f === 'pool' ? staff.filter((s) => avgRating(s) >= 4.5 && s.eventsWorked >= 3).length : staff.filter((s) => s.status === f).length;

  return (
    <>
      <PageHeader
        title="Crew"
        sub="Everyone who works your events, and exactly how ready they are."
        actions={
          <Link to="/admin/invite">
            <Button>
              <UserPlus size={16} /> Invite crew
            </Button>
          </Link>
        }
      />
      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          setSel([]);
        }}
        tabs={[
          { id: 'all', label: 'All current', count: count('all') },
          { id: 'invited', label: 'Invited', count: count('invited') },
          { id: 'onboarding', label: 'Onboarding', count: count('onboarding') },
          { id: 'active', label: 'Ready', count: count('active') },
          { id: 'pool', label: '⭐ Rehire pool', count: count('pool') },
          { id: 'inactive', label: 'Alumni', count: count('inactive') },
        ]}
      />
      <div className="my-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <Input className="pl-9" placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select className="w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {cat.roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        {sel.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              nudge(sel);
              toast(`Reminders sent to ${sel.length} crew`, '📣');
              setSel([]);
            }}
          >
            <Megaphone size={16} /> Send reminder ({sel.length})
          </Button>
        )}
      </div>
      {tab === 'pool' && (
        <p className="mb-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800">
          Your proven performers (4.5★+ over 3+ events). Re-engaging alumni is the fastest way to staff up — their training history is kept, so they only need to renew anything that's expired.
        </p>
      )}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={sel.length > 0 && sel.length === rows.length}
                  onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.s.id) : [])}
                />
              </th>
              <th className="px-2 py-3">Name</th>
              <th className="px-2 py-3">Roles</th>
              <th className="px-2 py-3">Status</th>
              <th className="w-44 px-2 py-3">Onboarding</th>
              <th className="px-2 py-3">Rating</th>
              <th className="px-2 py-3">Events</th>
              <th className="px-2 py-3">Last reminder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ s, r }) => {
              const exp = expiringCerts(s, 30);
              return (
                <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => nav(`/admin/crew/${s.id}`)}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={sel.includes(s.id)} onChange={(e) => setSel(e.target.checked ? [...sel, s.id] : sel.filter((x) => x !== s.id))} />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          {s.name}
                          {exp.length > 0 && <ShieldAlert size={14} className="text-rose-500" />}
                        </div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.roleIds.map((rid) => (
                        <RolePill key={rid} role={cat.roles.find((x) => x.id === rid)} />
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <StatusPill status={s.status} />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={r.pct} />
                      <span className="w-9 text-right text-xs text-slate-500">{r.pct}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">{s.ratings.length ? <Stars value={avgRating(s)} size={13} /> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-2 py-3 text-slate-600">{s.eventsWorked}</td>
                  <td className="px-2 py-3 text-xs text-slate-500">{s.lastNudgedAt ? relTime(s.lastNudgedAt) : '—'}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No crew match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
