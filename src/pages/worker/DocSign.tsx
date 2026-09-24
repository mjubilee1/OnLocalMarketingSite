import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck, Lock } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { SignaturePad } from '../../components/extras';
import { badge } from '../../lib/badges';
import { cn, fmtDate, fmtTime } from '../../lib/utils';
import { useCatalog, useCompany, useCurrentStaff, useStore } from '../../store';
import { fillPlaceholders } from '../../lib/company';

export default function DocSign() {
  const { id } = useParams();
  const me = useCurrentStaff();
  const cat = useCatalog();
  const company = useCompany();
  const sign = useStore((s) => s.signDoc);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const doc = cat.docs.find((d) => d.id === id);
  const [agree, setAgree] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [drawn, setDrawn] = useState<string | null>(null);
  const [typed, setTyped] = useState('');

  if (!doc) return <div className="p-8 text-center text-slate-500">Document not found.</div>;
  const existing = me.docs[doc.id];
  // A signed document keeps the company name it was signed under.
  const shownCompany = existing?.company ? { ...company, name: existing.company } : company;
  const signature = mode === 'draw' ? drawn : typed.trim() ? typed.trim() : null;

  return (
    <div className="flex min-h-[calc(100vh-28px)] flex-col bg-white">
      <div className="sticky top-7 z-10 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link to="/app" className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="font-semibold">{doc.title}</div>
          <div className="text-xs text-slate-500">{doc.description}</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        <div className="max-h-[45vh] overflow-auto whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
          <div className="mb-3 border-b border-slate-200 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{shownCompany.name}</div>
          {fillPlaceholders(doc.body, shownCompany)}
        </div>

        {existing ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-center">
            <CircleCheck className="mx-auto text-emerald-500" size={32} />
            <div className="mt-2 font-semibold text-emerald-800">Signed</div>
            <div className="text-xs text-emerald-700">
              {fmtDate(existing.signedAt)} at {fmtTime(existing.signedAt)}
            </div>
            <div className="mt-3 flex justify-center">
              {existing.typed ? <span className="font-script text-3xl text-indigo-900">{existing.signature}</span> : <img src={existing.signature} alt="Your signature" className="h-16" />}
            </div>
          </div>
        ) : (
          <>
            <label className="mt-5 flex items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" className="mt-0.5 h-5 w-5 accent-indigo-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I, <strong>{me.name}</strong>, have read and agree to this document.
              </span>
            </label>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Your signature</span>
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
                  {(['draw', 'type'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={cn('rounded-md px-3 py-1 capitalize cursor-pointer', mode === m ? 'bg-white shadow-sm' : 'text-slate-500')}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {mode === 'draw' ? (
                <SignaturePad onChange={setDrawn} />
              ) : (
                <div>
                  <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your full name" />
                  <div className="mt-2 flex h-20 items-center justify-center rounded-lg bg-slate-50 font-script text-4xl text-indigo-900">{typed || ' '}</div>
                </div>
              )}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Lock size={12} /> Signed electronically with date, time and device recorded.
            </p>
          </>
        )}
      </div>

      {!existing && (
        <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4">
          <Button
            size="lg"
            className="w-full"
            disabled={!agree || !signature}
            onClick={() => {
              const before = me.badges;
              sign(me.id, doc.id, signature!, mode === 'type');
              const after = useStore.getState().staff.find((s) => s.id === me.id)!.badges;
              const fresh = after.find((b) => !before.includes(b));
              toast(fresh ? `Signed! Badge unlocked: ${badge(fresh)?.name}` : 'Signed — +10 pts', fresh ? badge(fresh)?.emoji : '✍️');
              nav('/app');
            }}
          >
            Sign & submit
          </Button>
        </div>
      )}
    </div>
  );
}
