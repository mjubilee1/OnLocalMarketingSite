import { useEffect, useState } from 'react';
import { Download, Eye, FileSignature, Loader2, Lock } from 'lucide-react';
import { Button, Input, Modal, Pill } from './ui';
import { SignaturePad } from './extras';
import { STAGE_LABEL, stage, summary, termsFingerprint } from '../lib/contracts';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import type { Contract } from '../types';

export function ContractStagePill({ c }: { c: Contract }) {
  const s = STAGE_LABEL[stage(c)];
  return <Pill className={s.cls}>{s.label}</Pill>;
}

export function ContractSummary({ c, className }: { c: Contract; className?: string }) {
  return (
    <dl className={cn('divide-y divide-slate-100 text-sm', className)}>
      {summary(c).map((row) => (
        <div key={row.label} className="grid grid-cols-[110px_1fr] gap-3 py-2.5">
          <dt className="text-slate-500">{row.label}</dt>
          <dd className="whitespace-pre-line text-slate-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Download + inline preview of the filled PDF. pdf-lib only loads when one is clicked. */
export function ContractPdfActions({ c, size = 'md', preview = true }: { c: Contract; size?: 'sm' | 'md'; preview?: boolean }) {
  const toast = useStore((s) => s.toast);
  const [busy, setBusy] = useState<'dl' | 'pv' | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  const done = stage(c) === 'completed';

  const run = async (kind: 'dl' | 'pv') => {
    setBusy(kind);
    try {
      const m = await import('../lib/contractPdf');
      if (kind === 'dl') await m.downloadContract(c);
      else setUrl(await m.contractPreviewUrl(c));
    } catch (e) {
      toast(`Couldn't build the PDF: ${(e as Error).message}`, '⚠️');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {preview && (
        <Button size={size === 'sm' ? 'sm' : 'md'} variant="secondary" onClick={() => run('pv')} disabled={!!busy}>
          {busy === 'pv' ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Preview PDF
        </Button>
      )}
      <Button size={size === 'sm' ? 'sm' : 'md'} variant={done ? 'primary' : 'secondary'} onClick={() => run('dl')} disabled={!!busy}>
        {busy === 'dl' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {done ? 'Download signed PDF' : 'Download draft PDF'}
      </Button>
      <Modal open={!!url} onClose={() => setUrl(null)} title={c.title} wide>
        {url && (
          <>
            <iframe src={url} title="Contract preview" className="h-[70vh] w-full rounded-lg ring-1 ring-slate-200" />
            <p className="mt-2 text-xs text-slate-500">
              Preview blank? Some browsers can't show PDFs inline.{' '}
              <a href={url} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">
                Open it in a new tab
              </a>{' '}
              or use Download.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}

/**
 * Collects one party's signature. The terms fingerprint is taken at this moment so the certificate
 * can prove both sides agreed to the same wording.
 */
export function SignContractModal({ open, onClose, c, party, onSigned }: { open: boolean; onClose: () => void; c: Contract; party: 'employer' | 'staff'; onSigned?: () => void }) {
  const sign = useStore((s) => s.signContract);
  const save = useStore((s) => s.saveContract);
  const toast = useStore((s) => s.toast);
  const managerName = useStore((s) => s.managerName);
  const who = c[party];
  const isCompany = party === 'employer';
  // A company can't sign for itself: a named person signs on its behalf.
  const defaultName = isCompany ? (who.signatory ?? managerName) : who.name;
  const [name, setName] = useState(defaultName);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [drawn, setDrawn] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setTyped(defaultName);
      setAgree(false);
      setDrawn(null);
    }
  }, [open, defaultName]);

  const signature = mode === 'draw' ? drawn : typed.trim() || null;
  const roleLabel = party === 'employer' ? 'Client (employer)' : 'Service Provider';

  const submit = async () => {
    if (!signature || !agree || !name.trim()) return;
    setBusy(true);
    try {
      // The printed name is part of what's signed, so persist it first.
      const updated: Contract = isCompany ? c : { ...c, staff: { ...who, name: name.trim() } };
      if (!isCompany && name.trim() !== who.name) save(updated, `${roleLabel} name confirmed as ${name.trim()}`);
      const hash = await termsFingerprint(updated);
      sign(c.id, party, signature, mode === 'type', hash, isCompany ? name.trim() : undefined);
      toast(stage({ ...updated, [party]: { ...updated[party], signedAt: 'now' } }) === 'completed' ? 'Signed — contract complete!' : 'Signed', '✍️');
      onClose();
      onSigned?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Sign as ${roleLabel}`}>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{isCompany ? `Your full name (signing on behalf of ${who.name})` : 'Full legal name (printed on the contract)'}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Signature</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
              {(['draw', 'type'] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={cn('rounded-md px-3 py-1 capitalize cursor-pointer', mode === m ? 'bg-white shadow-sm' : 'text-slate-500')}>
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
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I have read the full {`"${c.title}"`} contract and agree to sign it electronically as the {roleLabel}{isCompany ? ` and confirm I'm authorised to sign for ${who.name}` : ''}. I understand my electronic signature is as binding as a handwritten one.
          </span>
        </label>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} /> Your name, the time, and a fingerprint of the exact terms are recorded on the signature certificate.
        </p>
        <Button size="lg" className="w-full" disabled={!signature || !agree || !name.trim() || busy} onClick={submit}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />} Sign contract
        </Button>
      </div>
    </Modal>
  );
}
