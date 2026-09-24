import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Car, CircleCheck, Clock, MapPin, Phone, QrCode, Shirt } from 'lucide-react';
import { Card, Modal } from '../../components/ui';
import { eventReadiness } from '../../lib/readiness';
import { cn, color, countdown, fmtDate } from '../../lib/utils';
import { useCatalog, useCurrentStaff, useStore } from '../../store';
import { TodoRow } from './Home';

export default function Briefing() {
  const { id } = useParams();
  const me = useCurrentStaff();
  const ev = useStore((s) => s.events.find((e) => e.id === id));
  const setStatus = useStore((s) => s.setAssignmentStatus);
  const unassign = useStore((s) => s.unassign);
  const toast = useStore((s) => s.toast);
  const cat = useCatalog();
  const nav = useNavigate();
  const [pass, setPass] = useState(false);

  if (!ev) return <div className="p-8 text-center text-slate-500">Event not found.</div>;
  const a = ev.assignments.find((x) => x.staffId === me.id);
  const sh = ev.shifts.find((x) => x.id === a?.shiftId);
  const role = cat.roles.find((r) => r.id === sh?.roleId);
  const r = eventReadiness(me, cat, ev);
  const c = color(ev.color);

  return (
    <div>
      <div className={cn('px-5 pb-6 pt-4 text-white', c.bg)}>
        <Link to="/app/events" className="-ml-1 inline-flex items-center gap-1 text-sm opacity-90">
          <ArrowLeft size={16} /> Shifts
        </Link>
        <div className="mt-4 text-xs font-semibold uppercase opacity-80">{countdown(ev.date)}</div>
        <h1 className="text-2xl font-bold">{ev.name}</h1>
        <div className="mt-1 text-sm opacity-90">{fmtDate(ev.date, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        {a && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/15 p-3">
              <div className="text-xs opacity-80">Call time</div>
              <div className="text-lg font-bold">{ev.callTime}</div>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <div className="text-xs opacity-80">{role?.name}</div>
              <div className="text-lg font-bold">
                {sh?.start}–{sh?.end}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        {a && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setPass(true)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white">
              <QrCode size={18} /> Check-in pass
            </button>
            {a.status === 'assigned' ? (
              <button
                onClick={() => {
                  setStatus(ev.id, me.id, 'confirmed');
                  toast('Confirmed — see you there!', '🙌');
                }}
                className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
              >
                Confirm shift
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-700">
                <CircleCheck size={16} /> {a.status === 'checked_in' ? 'Checked in' : 'Confirmed'}
              </div>
            )}
          </div>
        )}

        {a && !r.ready && (
          <Card className="overflow-hidden ring-amber-300">
            <div className="bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">Finish before your shift ({r.pct}% ready)</div>
            <div className="divide-y divide-slate-100">
              {r.items
                .filter((i) => !i.done)
                .map((i) => (
                  <TodoRow key={i.kind + i.id} item={i} />
                ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <p className="text-sm text-slate-700">{ev.description}</p>
        </Card>

        <Card className="divide-y divide-slate-100 text-sm">
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue + ' ' + ev.address)}`} target="_blank" rel="noreferrer" className="flex gap-3 p-4">
            <MapPin size={18} className="shrink-0 text-slate-400" />
            <div className="flex-1">
              <div className="font-medium">{ev.venue}</div>
              <div className="text-slate-500">{ev.address}</div>
              <div className="mt-1 text-xs font-medium text-indigo-600">Open in Maps →</div>
            </div>
          </a>
          {ev.parking && (
            <div className="flex gap-3 p-4">
              <Car size={18} className="shrink-0 text-slate-400" />
              <div>
                <div className="font-medium">Getting there</div>
                <div className="text-slate-500">{ev.parking}</div>
              </div>
            </div>
          )}
          <div className="flex gap-3 p-4">
            <Shirt size={18} className="shrink-0 text-slate-400" />
            <div>
              <div className="font-medium">Dress code</div>
              <div className="text-slate-500">{ev.dressCode}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock size={16} /> Run sheet
          </div>
          <ol className="relative ml-2 border-l-2 border-slate-100">
            {ev.schedule.map((s, i) => (
              <li key={i} className="mb-3 ml-4 text-sm last:mb-0">
                <span className={cn('absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ring-2 ring-white', c.bar)} />
                <span className="font-mono text-xs text-slate-500">{s.time}</span>
                <div className="text-slate-800">{s.label}</div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="divide-y divide-slate-100">
          <div className="px-4 pt-4 pb-2 text-sm font-semibold">Contacts on the day</div>
          {ev.contacts.map((ct, i) => (
            <a key={i} href={`tel:${ct.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="flex-1">
                <div className="font-medium">{ct.name}</div>
                <div className="text-xs text-slate-500">{ct.title}</div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <Phone size={12} /> Call
              </span>
            </a>
          ))}
        </Card>

        {a && a.status !== 'checked_in' && (
          <button
            onClick={() => {
              if (confirm('Release this shift? Please only do this 24h+ before call time.')) {
                unassign(ev.id, me.id);
                toast('Shift released — thanks for letting us know', '👍');
                nav('/app/events');
              }
            }}
            className="w-full py-3 text-sm font-medium text-rose-600"
          >
            I can't make it — release shift
          </button>
        )}
      </div>

      <Modal open={pass} onClose={() => setPass(false)} title="Crew check-in pass">
        <div className="text-center">
          <div className="inline-block rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <QRCodeSVG value={`ONLOCALAI:${ev.id}:${me.id}`} size={200} />
          </div>
          <div className="mt-3 text-lg font-semibold">{me.name}</div>
          <div className="text-sm text-slate-500">
            {role?.name} • {ev.name}
          </div>
          <div className="mt-3 inline-block rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm">Pass code: {me.id.toUpperCase()}</div>
        </div>
      </Modal>
    </div>
  );
}
