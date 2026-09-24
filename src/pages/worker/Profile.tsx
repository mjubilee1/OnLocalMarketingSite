import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, CircleCheck, Clock, ScrollText, ShieldCheck, Upload } from 'lucide-react';
import { ContractStagePill } from '../../components/contract';
import { Avatar, Button, Card, Field, Input, Modal, Pill, RolePill, Select, Stars } from '../../components/ui';
import { BADGES, level } from '../../lib/badges';
import { avgRating, certValid, requirements } from '../../lib/readiness';
import { addMonths, cn, daysUntil, fmtDate, todayISO, LANGUAGES } from '../../lib/utils';
import { useCatalog, useCurrentStaff, useStore } from '../../store';


export default function Profile() {
  const me = useCurrentStaff();
  const cat = useCatalog();
  const addCert = useStore((s) => s.addCert);
  const updateStaff = useStore((s) => s.updateStaff);
  const toast = useStore((s) => s.toast);
  const contracts = useStore((s) => s.contracts);
  const myContracts = contracts.filter((c) => c.staffId === me.id && c.status !== 'draft');
  const [params, setParams] = useSearchParams();
  const uploadFor = params.get('upload');
  const lvl = level(me.points);
  const reqCerts = requirements(me, cat).certIds;
  const certIds = Array.from(new Set([...reqCerts, ...me.certs.map((c) => c.certId)]));

  const [form, setForm] = useState({ number: '', issuedAt: todayISO(), fileName: '' });
  const uploadType = cat.certTypes.find((c) => c.id === uploadFor);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar name={me.name} size="xl" />
        <div>
          <h1 className="text-xl font-bold">{me.name}</h1>
          <div className="mt-1 flex flex-wrap gap-1">
            {me.roleIds.map((r) => (
              <RolePill key={r} role={cat.roles.find((x) => x.id === r)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Card className="p-3">
          <div className="text-xl font-bold">{me.points}</div>
          <div className="text-[11px] text-slate-500">Points</div>
        </Card>
        <Card className="p-3">
          <div className="text-xl font-bold">{me.eventsWorked}</div>
          <div className="text-[11px] text-slate-500">Events</div>
        </Card>
        <Card className="p-3">
          <div className="flex h-7 items-center justify-center">{me.ratings.length ? <Stars value={avgRating(me)} size={12} /> : <span className="text-xl font-bold">—</span>}</div>
          <div className="text-[11px] text-slate-500">Rating</div>
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Level: {lvl.name}</span>
          {lvl.next && <span className="text-xs text-slate-500">{lvl.toNext} pts to {lvl.next}</span>}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${lvl.progress * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Higher levels get early access to shifts and lead roles.</p>
      </Card>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Certificates & licences</h2>
        <div className="space-y-2">
          {certIds.map((cid) => {
            const ct = cat.certTypes.find((c) => c.id === cid);
            const held = me.certs.find((c) => c.certId === cid);
            const valid = certValid(held);
            const days = held ? daysUntil(held.expiresAt) : 0;
            return (
              <Card key={cid} className="flex items-center gap-3 p-4">
                <div className={cn('rounded-xl p-2', valid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{ct?.name}</div>
                  <div className="text-xs text-slate-500">
                    {!held && 'Required for your role'}
                    {held && `#${held.number} • ${valid ? `expires ${fmtDate(held.expiresAt)}` : 'expired'}`}
                  </div>
                  {held && !held.verified && <Pill className="mt-1 bg-amber-50 text-amber-700"><Clock size={10} /> Awaiting verification</Pill>}
                  {held?.verified && valid && days <= 30 && <Pill className="mt-1 bg-rose-50 text-rose-700">Renew soon — {days} days left</Pill>}
                </div>
                {(!valid || days <= 30) && (
                  <Button size="sm" onClick={() => setParams({ upload: cid })}>
                    <Upload size={14} /> {held ? 'Renew' : 'Upload'}
                  </Button>
                )}
                {valid && days > 30 && <CircleCheck className="text-emerald-500" size={20} />}
              </Card>
            );
          })}
          {certIds.length === 0 && <Card className="p-4 text-center text-sm text-slate-500">Your roles don't need any certificates. 🎉</Card>}
        </div>
      </section>

      {myContracts.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">My contracts</h2>
          <div className="space-y-2">
            {myContracts.map((c) => (
              <Link key={c.id} to={`/app/contracts/${c.id}`}>
                <Card className="flex items-center gap-3 p-4 active:bg-slate-50">
                  <ScrollText size={20} className="shrink-0 text-violet-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="mt-1">
                      <ContractStagePill c={c} />
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Badges</h2>
        <div className="grid grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const got = me.badges.includes(b.id);
            return (
              <div key={b.id} className="flex flex-col items-center text-center" title={b.description}>
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-full text-2xl', got ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-slate-100 opacity-40 grayscale')}>{b.emoji}</div>
                <span className={cn('mt-1 text-[10px] leading-tight', got ? 'text-slate-700' : 'text-slate-400')}>{b.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Settings</h2>
        <Card className="space-y-3 p-4">
          <Field label="Preferred language" hint="Training and notifications use this language where available.">
            <Select value={me.language} onChange={(e) => updateStaff(me.id, { language: e.target.value })}>
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mobile">
            <Input defaultValue={me.phone} onBlur={(e) => updateStaff(me.id, { phone: e.target.value })} />
          </Field>
        </Card>
      </section>

      <Modal open={!!uploadType} onClose={() => setParams({})} title={`Upload ${uploadType?.name ?? ''}`}>
        {uploadType && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addCert(me.id, {
                certId: uploadType.id,
                number: form.number,
                issuedAt: form.issuedAt,
                expiresAt: addMonths(form.issuedAt, uploadType.validMonths),
                fileName: form.fileName || undefined,
                verified: false,
              });
              toast('Uploaded — a manager will verify it shortly', '📄');
              setForm({ number: '', issuedAt: todayISO(), fileName: '' });
              setParams({});
            }}
          >
            <p className="text-sm text-slate-500">{uploadType.description}</p>
            <Field label="Certificate / licence number">
              <Input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </Field>
            <Field label="Issue date" hint={`Valid for ${uploadType.validMonths} months — expires ${fmtDate(addMonths(form.issuedAt, uploadType.validMonths))}`}>
              <Input type="date" required max={todayISO()} value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} />
            </Field>
            <Field label="Photo or PDF of certificate">
              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 hover:bg-slate-50">
                <Upload size={20} />
                {form.fileName || 'Tap to take a photo or choose a file'}
                <input type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={(e) => setForm({ ...form, fileName: e.target.files?.[0]?.name ?? '' })} />
              </label>
            </Field>
            <Button type="submit" size="lg" className="w-full">
              Submit for verification
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
