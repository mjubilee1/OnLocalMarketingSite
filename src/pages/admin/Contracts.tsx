import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, FilePlus2, FileSignature } from 'lucide-react';
import { Avatar, Button, Card, Empty, Field, Modal, PageHeader, Select, Tabs } from '../../components/ui';
import { ContractStagePill } from '../../components/contract';
import { draftContract, stage, TEMPLATE_NAME } from '../../lib/contracts';
import { fmtDate, relTime } from '../../lib/utils';
import { useCatalog, useCompany, useStore } from '../../store';

type Filter = 'open' | 'completed' | 'all';

export function NewContractModal({ open, onClose, staffId: presetStaff }: { open: boolean; onClose: () => void; staffId?: string }) {
  const staff = useStore((s) => s.staff);
  const events = useStore((s) => s.events);
  const company = useCompany();
  const save = useStore((s) => s.saveContract);
  const cat = useCatalog();
  const nav = useNavigate();
  const [staffId, setStaffId] = useState(presetStaff ?? '');
  const [eventId, setEventId] = useState('');
  const [roleId, setRoleId] = useState('');

  const person = staff.find((s) => s.id === (presetStaff ?? staffId));
  const theirEvents = events.filter((e) => e.status !== 'completed' && (!person || e.assignments.some((a) => a.staffId === person.id)));
  const ev = events.find((e) => e.id === eventId);
  const rosteredRole = ev && person ? ev.shifts.find((sh) => sh.id === ev.assignments.find((a) => a.staffId === person.id)?.shiftId)?.roleId : undefined;
  const effectiveRole = roleId || rosteredRole || person?.roleIds[0] || '';

  const create = () => {
    if (!person) return;
    const c = draftContract({ staff: person, event: ev, role: cat.roles.find((r) => r.id === effectiveRole), orgName: company.name, orgAddress: company.address, orgEmail: company.email, signatory: company.managerName });
    save(c);
    onClose();
    nav(`/admin/contracts/${c.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="New contract">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Uses your <strong>{TEMPLATE_NAME}</strong> template. Pick who it's for and we'll pre-fill the dates, services and pay. You can change everything before sending.
        </p>
        {!presetStaff && (
          <Field label="Crew member (Service Provider)">
            <Select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              <option value="">Choose…</option>
              {staff
                .filter((s) => s.status !== 'inactive')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </Select>
          </Field>
        )}
        <Field label="For an event (optional)" hint={person && !theirEvents.length ? `${person.name} isn't rostered on any upcoming events.` : 'Pre-fills the dates and services from the event and their shift.'}>
          <Select value={eventId} onChange={(e) => setEventId(e.target.value)} disabled={!person}>
            <option value="">General services agreement</option>
            {theirEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {fmtDate(e.date)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Role (sets the hourly rate)">
          <Select value={effectiveRole} onChange={(e) => setRoleId(e.target.value)} disabled={!person}>
            {cat.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · ${r.hourlyRate}/hr
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end">
          <Button disabled={!person} onClick={create}>
            <FilePlus2 size={16} /> Create draft
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function Contracts() {
  const contracts = useStore((s) => s.contracts);
  const staff = useStore((s) => s.staff);
  const events = useStore((s) => s.events);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Filter>('open');
  const [creating, setCreating] = useState(params.get('new') === '1');

  const open = contracts.filter((c) => !['completed', 'void'].includes(stage(c)));
  const completed = contracts.filter((c) => stage(c) === 'completed');
  const list = tab === 'open' ? open : tab === 'completed' ? completed : contracts;
  const needsMe = contracts.filter((c) => stage(c) === 'awaiting_employer').length;

  return (
    <>
      <PageHeader
        title="Contracts"
        sub={
          <>
            {TEMPLATE_NAME}: fill in the details, both parties sign online, and either side can download the PDF.
            {needsMe > 0 && <span className="ml-1 font-medium text-violet-700">{needsMe} waiting for your signature.</span>}
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={async () => {
                const m = await import('../../lib/contractPdf');
                await m.downloadContract(null, { blank: true });
                toast('Blank fillable template downloaded', '📄');
              }}
            >
              <Download size={16} /> Blank template
            </Button>
            <Button onClick={() => setCreating(true)}>
              <FilePlus2 size={16} /> New contract
            </Button>
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'open', label: 'In progress', count: open.length },
          { id: 'completed', label: 'Signed', count: completed.length },
          { id: 'all', label: 'All', count: contracts.length },
        ]}
      />
      <Card className="mt-6 overflow-x-auto">
        {list.length ? (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Contract</th>
                <th className="px-2 py-3">Crew member</th>
                <th className="px-2 py-3">Event</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((c) => {
                const s = staff.find((x) => x.id === c.staffId);
                const e = events.find((x) => x.id === c.eventId);
                return (
                  <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => nav(`/admin/contracts/${c.id}`)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <FileSignature size={16} className="text-slate-400" /> {c.title}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.staff.name} size="sm" /> {s?.name ?? c.staff.name}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-slate-600">{e ? e.name : '—'}</td>
                    <td className="px-2 py-3">
                      <ContractStagePill c={c} />
                    </td>
                    <td className="px-2 py-3 text-xs text-slate-500">{relTime(c.audit[c.audit.length - 1]?.at ?? c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <Empty icon={<FileSignature size={28} />} title="No contracts here">
              Create one from here or from a crew member's profile.
            </Empty>
          </div>
        )}
      </Card>
      <NewContractModal
        open={creating}
        onClose={() => {
          setCreating(false);
          if (params.get('new')) setParams({});
        }}
      />
    </>
  );
}
